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
    CONF_STATION_ID,
    CONF_SYSTEM_ID,
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
        self._last_fetch: float = 0.0
        self._stations_by_id: dict[str, dict[str, Any]] = {}
        # vehicle_types_available in station_status returns vehicle_type_id
        # strings; vehicle_types.json tells us their propulsion. Built once
        # on first fetch (nearly static) and refreshed on catalogue changes.
        self._vehicle_types: dict[str, dict[str, Any]] = {}
        self._ebike_type_ids: frozenset[str] = frozenset()

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
