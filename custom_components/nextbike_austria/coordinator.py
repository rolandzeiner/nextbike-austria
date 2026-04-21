"""DataUpdateCoordinator + shared GBFS client for Nextbike Austria.

Architecture:

* One `SharedSystemClient` per GBFS system, memoized in
  `hass.data[DOMAIN]["systems"][system_id]`. Handles fetching + TTL-caching
  of the `station_information` and `station_status` feeds. Stations from
  every config entry for the same system share one HTTP request per poll.
* One `NextbikeStationCoordinator` per config entry. It owns the
  HA-visible refresh cadence and raises `UpdateFailed` on missing data.
  Its ``_async_update_data`` goes through the shared client so the
  per-system feed fetches collapse when many stations are tracked.

GBFS has no credentials; the `reauthentication-flow` quality-scale rule is
therefore exempt and there is no 401/403 branch here.
"""
from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Callable
from datetime import timedelta
from typing import Any

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    BATTERY_FETCH_TTL_SECONDS,
    CONF_STATION_ID,
    CONF_SYSTEM_ID,
    CONF_TRACK_E_BIKE_RANGE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    EBIKE_PROPULSIONS,
    SYSTEM_IDS,
    USER_AGENT,
    gbfs_feed_url,
)

_LOGGER = logging.getLogger(__name__)

type NextbikeAustriaConfigEntry = ConfigEntry["NextbikeStationCoordinator"]

# Below the GBFS-advertised TTL the upstream returns the same cached body,
# so polling faster wastes bandwidth for zero freshness gain. We still
# honor the coordinator's own scan interval as the upper bound — this is
# just the inner collapse window.
_GBFS_TTL_SECONDS = 60.0
_HTTP_TIMEOUT = aiohttp.ClientTimeout(total=15)


class GBFSError(RuntimeError):
    """Raised by SharedSystemClient when the upstream is unusable.

    Carries a translation key so `NextbikeStationCoordinator._async_update_data`
    can lift the error into an `UpdateFailed` with the right placeholders.
    """

    def __init__(self, translation_key: str, **placeholders: str) -> None:
        self.translation_key = translation_key
        self.placeholders = placeholders
        super().__init__(f"{translation_key}: {placeholders}")


class SharedSystemClient:
    """Cached GBFS fetcher for a single nextbike system.

    Multiple station coordinators per system share one instance; each call
    to ``async_fetch()`` returns the current merged snapshot, hitting the
    network at most once per `_GBFS_TTL_SECONDS` regardless of how many
    coordinators call.
    """

    def __init__(self, hass: HomeAssistant, system_id: str) -> None:
        self._hass = hass
        self._system_id = system_id
        self._session = async_get_clientsession(hass)
        self._lock = asyncio.Lock()
        self._battery_lock = asyncio.Lock()
        self._last_fetch: float = 0.0
        self._stations_by_id: dict[str, dict[str, Any]] = {}
        # vehicle_types_available in station_status returns vehicle_type_id
        # strings; vehicle_types.json tells us their propulsion. Built once
        # on first fetch (nearly static) and refreshed on catalogue changes.
        self._vehicle_types: dict[str, dict[str, Any]] = {}
        self._ebike_type_ids: frozenset[str] = frozenset()
        # Per-station battery aggregates computed from free_bike_status.
        # Populated only when at least one entry has track_e_bike_range.
        # Shape: {station_id: {"avg_pct": float, "min_pct": float,
        # "max_pct": float, "samples": int}}.
        self._battery_by_station: dict[str, dict[str, Any]] = {}
        self._battery_last_fetch: float = 0.0

    @property
    def system_id(self) -> str:
        """Return the GBFS system id this client serves."""
        return self._system_id

    def station(self, station_id: str) -> dict[str, Any] | None:
        """Return the merged snapshot for a station, or None if unknown."""
        return self._stations_by_id.get(station_id)

    def is_ebike_type(self, vehicle_type_id: str) -> bool:
        """Return True if the vehicle type is pedelec / throttle-electric."""
        return vehicle_type_id in self._ebike_type_ids

    def vehicle_type_names(self) -> dict[str, str]:
        """Return a ``{vehicle_type_id: display_name}`` map.

        Used by the card to build per-slot tooltips — the card only
        sees the id in ``vehicle_types_available`` and needs a friendly
        label (e.g. "Classic Bike", "E-Bike", "+ Children's seat").
        """
        out: dict[str, str] = {}
        for tid, t in self._vehicle_types.items():
            name = str(t.get("name") or "").strip()
            if name:
                out[tid] = name
        return out

    def battery_stats(self, station_id: str) -> dict[str, Any] | None:
        """Return per-station battery aggregates, or None if not tracked."""
        return self._battery_by_station.get(station_id)

    async def async_fetch_battery(self, *, force: bool = False) -> None:
        """Refresh the per-bike battery cache, respecting a longer TTL.

        ``free_bike_status.json`` is ~1.3 MB for the biggest system (Wien)
        and battery state doesn't change by the second — polling every
        30 minutes (``BATTERY_FETCH_TTL_SECONDS``) keeps bandwidth modest
        while still catching the kind of change a dashboard cares about.
        Coverage is low on nextbike's side — currently ~8% of e-bikes
        report ``current_range_meters`` at all — so many stations may end
        up with zero battery samples.
        """
        async with self._battery_lock:
            now = time.monotonic()
            if (
                not force
                and self._battery_by_station
                and (now - self._battery_last_fetch) < BATTERY_FETCH_TTL_SECONDS
            ):
                return

            # vehicle_types tells us each type's max_range_meters. We
            # need it to convert current_range → battery %. If the
            # catalogue hasn't loaded yet, we can't compute anything.
            if not self._vehicle_types:
                await self._refresh_vehicle_types()
            if not self._vehicle_types:
                _LOGGER.debug(
                    "Skipping battery fetch: vehicle_types still unavailable"
                )
                return

            try:
                payload = await self._fetch_json("free_bike_status")
            except GBFSError as err:
                # free_bike_status being unavailable isn't fatal — station
                # data is still usable. Log and keep the previous cache.
                _LOGGER.debug(
                    "free_bike_status feed unavailable for %s: %s",
                    self._system_id,
                    err.translation_key,
                )
                return

            bikes = payload.get("data", {}).get("bikes") or []
            name_by_type = self.vehicle_type_names()

            battery_by_station: dict[str, list[dict[str, Any]]] = {}
            reserved_by_station: dict[str, list[str]] = {}
            disabled_by_station: dict[str, list[str]] = {}
            for b in bikes:
                if not isinstance(b, dict):
                    continue
                sid = str(b.get("station_id") or "")
                if not sid:
                    continue
                tid = str(b.get("vehicle_type_id") or "")
                type_name = name_by_type.get(tid, "Bike")

                # Disabled bikes are out of service (flat tire, broken
                # lock …). Upstream excludes them from
                # `num_bikes_available`, so they render as extra
                # "wrench" slots. A bike that's both disabled AND
                # reserved is counted here — broken trumps held.
                if b.get("is_disabled"):
                    disabled_by_station.setdefault(sid, []).append(type_name)
                    continue

                # Reserved (and not disabled) bikes are held by another
                # user — also excluded from `num_bikes_available`, so
                # they become extra "locked" slots in the rack.
                if b.get("is_reserved"):
                    reserved_by_station.setdefault(sid, []).append(type_name)

                # Battery level: prefer `current_fuel_percent` (direct
                # 0–1 value) over dividing `current_range_meters` by
                # `vehicle_types.max_range_meters`. Coverage is identical
                # (~8.6% on Wien) but this path needs no max-range
                # lookup and has no division-by-zero risk.
                fuel = b.get("current_fuel_percent")
                if isinstance(fuel, (int, float)) and 0.0 <= fuel <= 1.0:
                    battery_by_station.setdefault(sid, []).append(
                        {"pct": round(fuel * 100.0, 1), "type": type_name}
                    )

            aggregates: dict[str, dict[str, Any]] = {}
            all_sids = (
                set(battery_by_station)
                | set(reserved_by_station)
                | set(disabled_by_station)
            )
            for sid in all_sids:
                agg: dict[str, Any] = {}
                entries = battery_by_station.get(sid)
                if entries:
                    # Sort descending — max charge first. Card renders
                    # slots in this order so users can scan left-to-right
                    # and see highest-charged bikes at the head.
                    entries_sorted = sorted(entries, key=lambda e: -e["pct"])
                    pcts = [e["pct"] for e in entries_sorted]
                    agg["avg_pct"] = sum(pcts) / len(pcts)
                    agg["min_pct"] = min(pcts)
                    agg["max_pct"] = max(pcts)
                    agg["samples"] = len(pcts)
                    agg["per_bike"] = entries_sorted
                reserved = reserved_by_station.get(sid)
                if reserved:
                    agg["reserved_count"] = len(reserved)
                    agg["reserved_types"] = reserved
                disabled = disabled_by_station.get(sid)
                if disabled:
                    agg["disabled_count"] = len(disabled)
                    agg["disabled_types"] = disabled
                aggregates[sid] = agg
            self._battery_by_station = aggregates
            self._battery_last_fetch = now

    async def async_fetch(self, *, force: bool = False) -> None:
        """Refresh the cached snapshot, respecting the TTL window."""
        async with self._lock:
            now = time.monotonic()
            if not force and self._stations_by_id and (now - self._last_fetch) < _GBFS_TTL_SECONDS:
                return

            # vehicle_types rarely changes; fetch once and keep unless empty.
            if not self._vehicle_types:
                await self._refresh_vehicle_types()

            stations = await self._fetch_json("station_information")
            statuses = await self._fetch_json("station_status")

            info_by_id: dict[str, dict[str, Any]] = {}
            for s in stations.get("data", {}).get("stations") or []:
                sid = str(s.get("station_id") or "")
                if sid:
                    info_by_id[sid] = s

            merged: dict[str, dict[str, Any]] = {}
            for st in statuses.get("data", {}).get("stations") or []:
                sid = str(st.get("station_id") or "")
                if not sid or sid not in info_by_id:
                    continue
                merged[sid] = {**info_by_id[sid], **st}

            self._stations_by_id = merged
            self._last_fetch = now

    async def _refresh_vehicle_types(self) -> None:
        """Populate the vehicle-type lookup + e-bike type-id set."""
        try:
            payload = await self._fetch_json("vehicle_types")
        except GBFSError:
            # vehicle_types is not strictly required — without it the
            # e-bike count sensor is simply 0. Log and carry on; the next
            # successful fetch will populate it.
            _LOGGER.debug("vehicle_types feed unavailable for %s", self._system_id)
            return
        types = payload.get("data", {}).get("vehicle_types") or []
        by_id: dict[str, dict[str, Any]] = {}
        ebike_ids: set[str] = set()
        for t in types:
            tid = str(t.get("vehicle_type_id") or "")
            if not tid:
                continue
            by_id[tid] = t
            if str(t.get("propulsion_type") or "") in EBIKE_PROPULSIONS:
                ebike_ids.add(tid)
        self._vehicle_types = by_id
        self._ebike_type_ids = frozenset(ebike_ids)

    async def _fetch_json(self, feed: str) -> dict[str, Any]:
        """Fetch one sub-feed and return the parsed JSON body.

        GBFS bodies from nextbike occasionally include stray control
        characters (e.g. raw CRLF in vehicle-type descriptions). We parse
        with ``strict=False`` to survive those — the alternative is the
        whole feed being unusable for a single escaping bug.
        """
        url = gbfs_feed_url(self._system_id, feed)
        headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
        try:
            resp = await self._session.get(url, headers=headers, timeout=_HTTP_TIMEOUT)
            resp.raise_for_status()
        except asyncio.TimeoutError as err:
            raise GBFSError("api_timeout", seconds="15") from err
        except aiohttp.ClientResponseError as err:
            raise GBFSError(
                "api_http_error", status=str(err.status), reason=err.message or ""
            ) from err
        except aiohttp.ClientError as err:
            raise GBFSError(
                "api_connection_error",
                error_type=type(err).__name__,
                error=str(err),
            ) from err

        import json as _json  # local — json is stdlib and aiohttp's built-in is strict

        try:
            text = await resp.text()
            parsed = _json.loads(text, strict=False)
        except ValueError as err:
            raise GBFSError(
                "api_invalid_response", status=str(resp.status), error=str(err)
            ) from err
        if not isinstance(parsed, dict):
            raise GBFSError(
                "api_invalid_response",
                status=str(resp.status),
                error=f"expected dict, got {type(parsed).__name__}",
            )
        return parsed


def _get_shared_client(hass: HomeAssistant, system_id: str) -> SharedSystemClient:
    """Return (and memoize) the SharedSystemClient for a system.

    The cache lives in `hass.data[DOMAIN]["systems"]`. Clients are never
    removed — the cost is one session reference per Austrian system the
    user has configured, which is bounded by the short `SYSTEM_IDS` tuple.
    """
    if system_id not in SYSTEM_IDS:
        # Defensive: the config flow should never let an unknown system
        # through, but raising here is cheaper than a mysterious
        # station-missing error downstream.
        raise ValueError(f"Unknown nextbike system: {system_id}")
    root = hass.data.setdefault(DOMAIN, {})
    systems: dict[str, SharedSystemClient] = root.setdefault("systems", {})
    client = systems.get(system_id)
    if client is None:
        client = SharedSystemClient(hass, system_id)
        systems[system_id] = client
    return client


class NextbikeStationCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Per-entry coordinator. One station per config entry."""

    config_entry: NextbikeAustriaConfigEntry

    def __init__(self, hass: HomeAssistant, entry: NextbikeAustriaConfigEntry) -> None:
        """Initialise the coordinator."""
        data = {**entry.data, **entry.options}
        self._entry = entry
        self._system_id: str = str(data[CONF_SYSTEM_ID])
        self._station_id: str = str(data[CONF_STATION_ID])
        self._client = _get_shared_client(hass, self._system_id)
        self._issue_raised: bool = False
        self._unsub: list[Callable[[], None]] = []
        # Opt-in per entry. When enabled, the coordinator also triggers
        # the shared client's separate battery-cache refresh (30 min TTL)
        # on each station poll and exposes per-station battery aggregates.
        self._track_battery: bool = bool(data.get(CONF_TRACK_E_BIKE_RANGE, False))

        scan = int(data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{self._station_id}",
            update_interval=timedelta(seconds=scan),
        )

    @property
    def station_id(self) -> str:
        """Return the configured station id."""
        return self._station_id

    @property
    def system_id(self) -> str:
        """Return the configured GBFS system id."""
        return self._system_id

    @property
    def client(self) -> SharedSystemClient:
        """Return the shared GBFS client backing this coordinator."""
        return self._client

    async def _async_setup(self) -> None:
        """Nothing to do until the first refresh runs."""
        return None

    @callback
    def async_teardown(self) -> None:
        """Cancel listeners on unload."""
        for unsub in self._unsub:
            unsub()
        self._unsub.clear()

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch fresh data via the shared client and extract our station."""
        try:
            await self._client.async_fetch()
        except GBFSError as err:
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key=err.translation_key,
                translation_placeholders=err.placeholders,
            ) from err

        # Opt-in: pull per-bike battery state on the separate 30-min cadence.
        # Errors here are swallowed inside `async_fetch_battery` — missing
        # battery data is an attribute absence, not an integration failure.
        if self._track_battery:
            await self._client.async_fetch_battery()

        station = self._client.station(self._station_id)
        if station is None:
            # The configured station is not in the current feed. Could be
            # a transient drop, or the station was retired upstream. Raise
            # a repair issue the first time so the user notices — entries
            # for decommissioned stations should be removed, not silently
            # unavailable forever.
            self._raise_degraded_issue(
                "station_gone",
                station_id=self._station_id,
                system_id=self._system_id,
            )
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="station_gone",
                translation_placeholders={
                    "station_id": self._station_id,
                    "system_id": self._system_id,
                },
            )

        self._clear_degraded_issue("station_gone")

        # Merge battery aggregates into the returned dict so the sensor
        # can surface them without a second lookup through the client.
        # When tracking is off or no bikes reported, keys stay absent.
        if self._track_battery:
            stats = self._client.battery_stats(self._station_id) or {}
            extras: dict[str, Any] = {}
            if "samples" in stats:
                extras["_e_bike_avg_battery_pct"] = round(stats["avg_pct"], 1)
                extras["_e_bike_min_battery_pct"] = round(stats["min_pct"], 1)
                extras["_e_bike_max_battery_pct"] = round(stats["max_pct"], 1)
                extras["_e_bike_range_samples"] = stats["samples"]
                extras["_e_bike_battery_list"] = stats["per_bike"]
            if "reserved_count" in stats:
                extras["_bikes_reserved"] = stats["reserved_count"]
                extras["_bikes_reserved_types"] = stats["reserved_types"]
            if "disabled_count" in stats:
                extras["_bikes_disabled"] = stats["disabled_count"]
                extras["_bikes_disabled_types"] = stats["disabled_types"]
            if extras:
                station = {**station, **extras}
            # Always carry the vehicle-type name map when tracking is on
            # — the card needs it for slot tooltips even when battery
            # samples are still arriving. Safe to include unconditionally
            # because it's bounded (~5 entries per system).
            station = {
                **station,
                "_vehicle_type_names": self._client.vehicle_type_names(),
            }

        return station

    # ------------------------------------------------------------------
    # Repair-issue helpers
    # ------------------------------------------------------------------

    def _raise_degraded_issue(self, translation_key: str, **placeholders: str) -> None:
        """Raise a Repairs issue once for a user-actionable condition."""
        if self._issue_raised:
            return
        self._issue_raised = True
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            f"{translation_key}_{self._entry.entry_id}",
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=translation_key,
            translation_placeholders={
                **placeholders,
                "entry_title": self._entry.title,
            },
        )

    def _clear_degraded_issue(self, translation_key: str) -> None:
        """Clear a previously-raised Repairs issue."""
        if not self._issue_raised:
            return
        self._issue_raised = False
        ir.async_delete_issue(
            self.hass, DOMAIN, f"{translation_key}_{self._entry.entry_id}"
        )
