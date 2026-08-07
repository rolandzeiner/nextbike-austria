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

Fan-out on fetch
----------------
GBFS feeds are whole-system documents: one `station_status` fetch already
carries every station in the system. The client therefore does not just
*deduplicate* requests, it **publishes** each fresh snapshot to every
registered coordinator (`_publish_snapshot`), and every fetch failure to
every registered coordinator (`_publish_error`).

This matters because per-entry `DataUpdateCoordinator` timers are
phase-shifted — each entry starts its interval at a different instant. Without
the fan-out, an entry whose tick lands mid-TTL reads the cached snapshot and
serves data up to `_GBFS_TTL_SECONDS` older than its sibling's, purely as an
artifact of when its timer happened to start. With it, every station in a
system reflects the same fetch at the same moment, at identical request cost.

The same argument drives the failure fan-out: the request is shared, so the
outage is shared. Backing off only the coordinator that happened to own the
failing tick would leave its siblings hammering a down CDN at full cadence.

GBFS has no credentials; the `reauthentication-flow` quality-scale rule is
therefore exempt and there is no 401/403 branch here.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    BACKOFF_CAP_SECONDS,
    BATTERY_FETCH_TTL_SECONDS,
    CONF_STATION_ID,
    CONF_SYSTEM_ID,
    CONF_TRACK_E_BIKE_RANGE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    EBIKE_PROPULSIONS,
    STATION_INFO_TTL_SECONDS,
    SYSTEM_IDS,
    USER_AGENT,
    gbfs_feed_url,
)
from .http import base_request_headers

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

    Note on what this is and isn't:
    - This is NOT a custom aiohttp session — that's already provided by
      ``aiohttp_client.async_get_clientsession(hass)`` (see ``self._session``
      below) and reused process-wide by HA core. The shared session by
      itself is not the value-add here.
    - The novel primitives this class provides are:
      (a) **Cross-entry request coalescing** via ``self._lock`` — N
          station coordinators in the same GBFS system share ONE fetch
          per cooldown window; concurrent callers all await the same
          in-flight task and get the cached result.
      (b) **TTL-collapsed staleness** — we serve from the cached snapshot
          while ``now - self._last_fetch < _GBFS_TTL_SECONDS`` and only
          re-fetch on TTL expiry.
      (c) **Last-reference cleanup ordering** in ``__init__.py``'s
          ``async_unload_entry`` — pop this client from
          ``hass.data[DOMAIN]["systems"]`` only on the
          ``non-zero → zero`` entry-count transition, and pop *before*
          platform-unload so a sibling's in-flight refresh can't
          re-create it.
    See the portfolio-liftables reference, item 14, for the
    lift-this-pattern shape (maintainer note; not in this repo).
    """

    def __init__(self, hass: HomeAssistant, system_id: str) -> None:
        self._hass = hass
        self._system_id = system_id
        self._session = async_get_clientsession(hass)
        self._lock = asyncio.Lock()
        self._battery_lock = asyncio.Lock()
        self._last_fetch: float = 0.0
        # Coordinators subscribed to this system's snapshots, keyed by
        # entry_id. Every successful fetch is fanned out to all of them so
        # sibling entries never serve a staler snapshot than the one that
        # happened to own the tick. See the module docstring.
        self._members: dict[str, NextbikeStationCoordinator] = {}
        self._stations_by_id: dict[str, dict[str, Any]] = {}
        # `station_information` is refreshed on its own long TTL — see
        # STATION_INFO_TTL_SECONDS. Cached separately from the merged
        # snapshot so a status-only tick can re-merge without a refetch.
        self._info_by_id: dict[str, dict[str, Any]] = {}
        self._info_last_fetch: float = 0.0
        # Station ids the status feed reports but a freshly-pulled
        # information feed still doesn't describe. Tracked so persistent
        # upstream drift doesn't re-trigger the self-heal refetch forever.
        self._unresolved_ids: set[str] = set()
        # vehicle_types_available in station_status returns vehicle_type_id
        # strings; vehicle_types.json tells us their propulsion. Built once
        # on first fetch (nearly static) and kept for the process lifetime —
        # an HA restart picks up an upstream catalogue change.
        self._vehicle_types: dict[str, dict[str, Any]] = {}
        self._ebike_type_ids: frozenset[str] = frozenset()
        # Per-station battery aggregates computed from free_bike_status.
        # Populated only when at least one entry has track_e_bike_range.
        # Shape: {station_id: {"avg_pct": float, "min_pct": float,
        # "max_pct": float, "samples": int}}.
        self._battery_by_station: dict[str, dict[str, Any]] = {}
        self._battery_last_fetch: float = 0.0
        # Per-feed `Last-Modified` strings, sent back as `If-Modified-Since`
        # on the next request. nextbike honours conditional GETs and
        # answers 304 when nothing changed — saves the body transfer
        # entirely on quiet feeds (vehicle_types in particular).
        self._last_modified: dict[str, str] = {}
        # Last successfully-parsed JSON body per feed. We hand the cached
        # copy back when the upstream returns 304 Not Modified.
        self._payload_cache: dict[str, dict[str, Any]] = {}

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

    def ebike_type_ids(self) -> list[str]:
        """Return the resolved e-bike vehicle-type id set, sorted.

        Single source of truth for the bundled card so a new pedelec
        id upstream is counted on the rack render without a JS bundle
        bump.
        """
        return sorted(self._ebike_type_ids)

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
        """Refresh the per-bike battery cache on the ``BATTERY_FETCH_TTL_SECONDS`` cadence."""
        async with self._battery_lock:
            now = time.monotonic()
            if (
                not force
                and self._battery_last_fetch > 0.0
                and (now - self._battery_last_fetch) < BATTERY_FETCH_TTL_SECONDS
            ):
                return

            # vehicle_types provides the friendly type name used in
            # tooltips. Battery % comes straight from
            # `current_fuel_percent`, so a missing catalogue is no
            # longer a hard blocker — try to load it once, but fall
            # back to a generic "Bike" label if it's unavailable.
            if not self._vehicle_types:
                await self._refresh_vehicle_types()

            try:
                payload = await self._fetch_json("free_bike_status")
            except GBFSError as err:
                # free_bike_status being unavailable isn't fatal — station
                # data is still usable. Log, keep the previous cache, and
                # bump the timestamp so we honour the TTL backoff instead
                # of hammering a failing upstream every coordinator tick.
                _LOGGER.debug(
                    "free_bike_status feed unavailable for %s: %s",
                    self._system_id,
                    err.translation_key,
                )
                self._battery_last_fetch = now
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

                # Prefer `current_fuel_percent` (direct 0–1 value) over
                # dividing `current_range_meters` by `vehicle_types.
                # max_range_meters` — same coverage upstream, no
                # max-range lookup, no division-by-zero risk.
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

    def register(self, coordinator: NextbikeStationCoordinator) -> None:
        """Subscribe a coordinator to this system's snapshot fan-out."""
        self._members[coordinator.entry_id] = coordinator

    def unregister(self, entry_id: str) -> bool:
        """Unsubscribe a coordinator; return True if no members remain."""
        self._members.pop(entry_id, None)
        return not self._members

    def _publish_snapshot(self, initiator: str | None) -> None:
        """Push the fresh snapshot to every member except the initiator.

        The initiator is skipped because it is mid-``_async_update_data``
        and will return the snapshot through HA's normal refresh path;
        pushing to it as well would write its state twice per tick.
        """
        for entry_id, coordinator in list(self._members.items()):
            if entry_id == initiator:
                continue
            coordinator.apply_shared_snapshot()

    def _publish_error(self, err: GBFSError, initiator: str | None) -> None:
        """Mark every member except the initiator as failed.

        Same reasoning as ``_publish_snapshot``: the initiator raises
        ``UpdateFailed`` out of its own refresh and HA records the failure
        for it. The siblings never saw the exception, so without this they
        would keep polling a known-down feed at full cadence.
        """
        for entry_id, coordinator in list(self._members.items()):
            if entry_id == initiator:
                continue
            coordinator.apply_shared_error(err)

    async def async_fetch(
        self, *, force: bool = False, initiator: str | None = None
    ) -> None:
        """Refresh the cached snapshot, respecting the TTL window.

        Fans the outcome out to sibling members (see the module docstring).
        The fan-out runs outside the fetch lock so a member's synchronous
        state write can never re-enter a held lock.
        """
        try:
            fetched = await self._fetch_locked(force=force)
        except GBFSError as err:
            self._publish_error(err, initiator)
            raise
        if fetched:
            self._publish_snapshot(initiator)

    async def _fetch_locked(self, *, force: bool) -> bool:
        """Do the actual conditional refresh. True if the network was hit."""
        async with self._lock:
            now = time.monotonic()
            if (
                not force
                and self._last_fetch > 0.0
                and (now - self._last_fetch) < _GBFS_TTL_SECONDS
            ):
                return False

            # vehicle_types rarely changes; fetch once and keep unless empty.
            if not self._vehicle_types:
                await self._refresh_vehicle_types()

            # `station_information` is near-static — refresh it on its own
            # long TTL instead of on every status tick.
            if not self._info_by_id or (
                (now - self._info_last_fetch) >= STATION_INFO_TTL_SECONDS
            ):
                await self._refresh_station_information(now)

            statuses = await self._fetch_json("station_status")
            status_rows = statuses.get("data", {}).get("stations") or []

            # Self-heal the long info TTL: a station id that the status feed
            # knows but the cached information feed doesn't means a rack was
            # installed (or un-retired) upstream since the last info refresh.
            # Re-pull immediately rather than leaving it invisible for hours.
            unknown = {
                sid
                for row in status_rows
                if (sid := str(row.get("station_id") or ""))
                and sid not in self._info_by_id
            }
            # Only ids we have never resolved before justify a refetch. The
            # two feeds do drift permanently for a handful of stations (a
            # status row whose information row was withdrawn), and without
            # this filter each one would force an extra request every tick —
            # exactly the cost this TTL exists to remove.
            if unknown - self._unresolved_ids and self._info_last_fetch < now:
                _LOGGER.debug(
                    "Unknown station id in %s status feed — refreshing information feed",
                    self._system_id,
                )
                await self._refresh_station_information(now)
                unknown = {sid for sid in unknown if sid not in self._info_by_id}
            # Whatever a fresh information feed still can't explain is
            # upstream drift, not staleness. Remember it so it stays quiet.
            self._unresolved_ids = unknown

            merged: dict[str, dict[str, Any]] = {}
            for st in status_rows:
                sid = str(st.get("station_id") or "")
                if not sid or sid not in self._info_by_id:
                    continue
                merged[sid] = {**self._info_by_id[sid], **st}

            self._stations_by_id = merged
            self._last_fetch = now
            return True

    async def _refresh_station_information(self, now: float) -> None:
        """Re-pull the near-static `station_information` feed."""
        stations = await self._fetch_json("station_information")
        info_by_id: dict[str, dict[str, Any]] = {}
        for s in stations.get("data", {}).get("stations") or []:
            sid = str(s.get("station_id") or "")
            if sid:
                info_by_id[sid] = s
        self._info_by_id = info_by_id
        self._info_last_fetch = now

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

        Sends ``If-Modified-Since`` based on the last seen ``Last-Modified``
        for this feed; on a 304 the cached body is returned without
        re-parsing.

        GBFS bodies from nextbike occasionally include stray control
        characters (e.g. raw CRLF in vehicle-type descriptions). We parse
        with ``strict=False`` to survive those — the alternative is the
        whole feed being unusable for a single escaping bug.
        """
        url = gbfs_feed_url(self._system_id, feed)
        # `base_request_headers` provides UA + Accept + Accept-Encoding gzip
        # (verified 2026-05-08: GBFS station_status 66 KB → 3 KB compressed,
        # 21x reduction). The conditional-GET `If-Modified-Since` header is
        # added on top per-feed so a 304 short-circuits to the cached payload.
        headers = base_request_headers(USER_AGENT)
        cached = self._payload_cache.get(feed)
        if (
            last_mod := self._last_modified.get(feed)
        ) is not None and cached is not None:
            headers["If-Modified-Since"] = last_mod
        status: int | None = None
        text: str | None = None
        new_last_mod: str | None = None
        try:
            async with self._session.get(
                url, headers=headers, timeout=_HTTP_TIMEOUT
            ) as resp:
                status = resp.status
                if status == 304 and cached is not None:
                    return cached
                resp.raise_for_status()
                text = await resp.text()
                new_last_mod = resp.headers.get("Last-Modified")
        except TimeoutError as err:
            raise GBFSError("api_timeout", seconds="15") from err
        except aiohttp.ClientResponseError as err:
            raise GBFSError(
                "api_http_error", status=str(err.status), reason=err.message or ""
            ) from err
        except aiohttp.ClientError as err:
            # Covers ClientPayloadError / ClientConnectionError raised
            # mid-body as well as connect-time failures.
            raise GBFSError(
                "api_connection_error",
                error_type=type(err).__name__,
                error=str(err),
            ) from err

        try:
            parsed = json.loads(text, strict=False)
        except ValueError as err:
            raise GBFSError(
                "api_invalid_response", status=str(status), error=str(err)
            ) from err
        if not isinstance(parsed, dict):
            raise GBFSError(
                "api_invalid_response",
                status=str(status),
                error=f"expected dict, got {type(parsed).__name__}",
            )
        if new_last_mod:
            self._last_modified[feed] = new_last_mod
        self._payload_cache[feed] = parsed
        return parsed


def _get_shared_client(hass: HomeAssistant, system_id: str) -> SharedSystemClient:
    """Return (and memoize) the SharedSystemClient for a system.

    The cache lives in ``hass.data[DOMAIN]["systems"]``. Clients are
    cleaned up by ``__init__.py::async_unload_entry`` when the LAST
    config entry referencing a given system unloads — multiple entries
    for the same system share one client to collapse GBFS fetches, so
    removal is gated on the unload of the final reference.
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
        # Opt-in per entry. When enabled, the coordinator also triggers
        # the shared client's separate battery-cache refresh (20 min TTL)
        # on each station poll and exposes per-station battery aggregates.
        self._track_battery: bool = bool(data.get(CONF_TRACK_E_BIKE_RANGE, False))

        scan = int(data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
        normal_interval = timedelta(seconds=scan)

        # Exponential-backoff state. `_normal_interval` is immutable as the
        # user-configured cadence; `self.update_interval` is what HA
        # actually reads on each tick, and we mutate that one to slow down
        # during sustained outages. See `_note_failure` / `_note_success`.
        self._consecutive_failures = 0
        self._normal_interval = normal_interval

        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{self._station_id}",
            update_interval=normal_interval,
            # Absorb request storms (options-flow save, manual reload,
            # dashboard edit-mode flip) so the GBFS feed isn't pulled
            # multiple times in quick succession during routine UI activity.
            request_refresh_debouncer=Debouncer(
                hass,
                _LOGGER,
                cooldown=15,
                immediate=False,
            ),
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

    async def async_teardown(self) -> None:
        """Coordinator teardown hook.

        Wired via ``entry.async_on_unload`` after first_refresh succeeds.
        Nothing per-coordinator to cancel today (no custom listeners,
        no debounced background tasks beyond the one HA owns), but the
        method documents the contract for future per-entry resources.
        Per-system ``SharedSystemClient`` cleanup is the
        ``async_unload_entry``'s job since the client is shared across
        coordinators for the same system.
        """
        return

    @property
    def entry_id(self) -> str:
        """Return the config-entry id — the key in the client's member map."""
        return self._entry.entry_id

    def apply_shared_snapshot(self) -> None:
        """Adopt a snapshot fetched by a sibling coordinator.

        Called by ``SharedSystemClient`` on every member but the one that
        owned the fetch. Drives the entity update directly through
        ``async_set_updated_data`` — there is no request to await, the data
        is already in the shared client.
        """
        try:
            station = self._extract_station()
        except UpdateFailed as err:
            self.async_set_update_error(err)
            return
        self.async_set_updated_data(station)

    def apply_shared_error(self, err: GBFSError) -> None:
        """Adopt a fetch failure observed by a sibling coordinator."""
        self._note_failure()
        self.async_set_update_error(
            UpdateFailed(
                translation_domain=DOMAIN,
                translation_key=err.translation_key,
                translation_placeholders=err.placeholders,
            )
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch fresh data via the shared client and extract our station."""
        try:
            await self._client.async_fetch(initiator=self.entry_id)
        except GBFSError as err:
            self._note_failure()
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key=err.translation_key,
                translation_placeholders=err.placeholders,
            ) from err

        # Opt-in: pull per-bike battery state on the separate 20-min cadence.
        # Errors here are swallowed inside `async_fetch_battery` — missing
        # battery data is an attribute absence, not an integration failure.
        if self._track_battery:
            await self._client.async_fetch_battery()

        return self._extract_station()

    def _extract_station(self) -> dict[str, Any]:
        """Build this entry's slice of the shared snapshot.

        Shared by the timer path (``_async_update_data``) and the fan-out
        path (``apply_shared_snapshot``) so both surface identical data,
        identical Repairs behaviour, and identical failure semantics.
        """
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
            self._note_failure()
            raise UpdateFailed(
                translation_domain=DOMAIN,
                translation_key="station_gone",
                translation_placeholders={
                    "station_id": self._station_id,
                    "system_id": self._system_id,
                },
            )

        self._clear_degraded_issue("station_gone")
        self._note_success()

        # Always carry the live e-bike type-id set. The card mirrors
        # this onto its rack render so a new pedelec id upstream is
        # counted correctly without bumping the JS bundle. Cheap to
        # include — the set is small (3-5 ids per Austrian system) and
        # the resolution already happened during async_fetch.
        ebike_ids = self._client.ebike_type_ids()
        if ebike_ids:
            station = {**station, "_ebike_type_ids": ebike_ids}

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

    def _note_success(self) -> None:
        """Reset the consecutive-failure counter and restore normal cadence."""
        if self._consecutive_failures == 0:
            return
        self._consecutive_failures = 0
        if self.update_interval != self._normal_interval:
            self.update_interval = self._normal_interval

    def _note_failure(self) -> None:
        """Bump the consecutive-failure counter and apply exponential backoff.

        First failure stays at the user-configured cadence (transient
        hiccups shouldn't slow down the loop). From the second failure
        onwards the update interval doubles each tick, capped at
        BACKOFF_CAP_SECONDS (1 h) so a sustained GBFS outage settles
        into a slow poll instead of hammering nextbike's CDN every
        60 s — i.e. 60 retries/h. The next successful tick resets it.
        """
        self._consecutive_failures += 1
        if self._consecutive_failures < 2:
            return
        normal_secs = self._normal_interval.total_seconds()
        backoff_secs = min(
            normal_secs * (2 ** (self._consecutive_failures - 1)),
            BACKOFF_CAP_SECONDS,
        )
        new_interval = timedelta(seconds=backoff_secs)
        if self.update_interval != new_interval:
            self.update_interval = new_interval
