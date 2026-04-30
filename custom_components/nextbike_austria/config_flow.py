"""Config flow for Nextbike Austria.

Three-step flow:
  1. `user`            — user picks one of the Austrian nextbike systems
                         (Vienna, NÖ, Innsbruck, Tirol, Linz, Klagenfurt).
  2. `search_station`  — user types a fragment of the station name.
  3. `select_station`  — dropdown of matches; picking one creates the entry.

`async_step_reconfigure` re-enters the scan-interval form for an existing
entry, preserving unique_id. The options flow tweaks the scan interval too.

No credentials involved — nextbike's GBFS is unauthenticated — so there is
no `async_step_reauth`, and `reauthentication-flow` is marked exempt in
the quality scale.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    AUSTRIAN_SYSTEMS,
    CONF_SEARCH_QUERY,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    CONF_TRACK_E_BIKE_RANGE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_POLL_SECONDS,
    MIN_POLL_SECONDS,
    SYSTEM_IDS,
    USER_AGENT,
    gbfs_feed_url,
)

_LOGGER = logging.getLogger(__name__)

# Minimum fragment length for the station search. Station names are short
# ("Oper", "Hoher Markt") so 2 chars already narrows the list usefully.
_MIN_QUERY_LENGTH = 2
_HTTP_TIMEOUT = aiohttp.ClientTimeout(total=10)


def _scan_interval_field(default: int) -> dict[Any, Any]:
    """Return the voluptuous schema fragment for the scan-interval field.

    Both the create-entry path (``async_step_select_station``) and the
    options flow (``async_step_init``) need the same Number selector
    bounded by ``MIN_POLL_SECONDS`` / ``MAX_POLL_SECONDS``. Hoisting it
    keeps the two definitions byte-identical so a bound change moves
    both at once.
    """
    return {
        vol.Required(CONF_SCAN_INTERVAL, default=default): NumberSelector(
            NumberSelectorConfig(
                min=MIN_POLL_SECONDS,
                max=MAX_POLL_SECONDS,
                step=15,
                unit_of_measurement="s",
                mode=NumberSelectorMode.BOX,
            )
        ),
    }


async def _fetch_stations(hass: HomeAssistant, system_id: str) -> list[dict[str, Any]]:
    """Fetch the station catalogue for a system.

    Returns the list of station dicts as delivered by GBFS. Empty list on
    any failure — the caller surfaces a `cannot_connect` error in the UI.
    """
    session = async_get_clientsession(hass)
    url = gbfs_feed_url(system_id, "station_information")
    try:
        async with session.get(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
            },
            timeout=_HTTP_TIMEOUT,
        ) as resp:
            resp.raise_for_status()
            body = await resp.json(content_type=None)
    except (asyncio.TimeoutError, aiohttp.ClientError, ValueError) as err:
        _LOGGER.warning("Station-catalogue fetch failed for %s: %s", system_id, err)
        return []
    if not isinstance(body, dict):
        return []
    stations = body.get("data", {}).get("stations") or []
    return [s for s in stations if isinstance(s, dict) and s.get("station_id")]


def _match_stations(stations: list[dict[str, Any]], query: str) -> list[dict[str, Any]]:
    """Return stations whose name contains ``query`` (case-insensitive).

    Prefix matches rank above substring matches; within each group names
    stay alphabetically sorted so the dropdown is stable across reloads.
    """
    q = query.lower().strip()
    prefix: list[dict[str, Any]] = []
    contains: list[dict[str, Any]] = []
    for s in stations:
        name = str(s.get("name") or "").lower()
        if not name:
            continue
        if name.startswith(q):
            prefix.append(s)
        elif q in name:
            contains.append(s)
    prefix.sort(key=lambda s: str(s.get("name") or ""))
    contains.sort(key=lambda s: str(s.get("name") or ""))
    return prefix + contains


def _station_label(station: dict[str, Any]) -> str:
    """Render a dropdown label: "Oper / Karlsplatz U (capacity 21)"."""
    name = str(station.get("name") or station.get("station_id") or "—")
    capacity = station.get("capacity")
    if isinstance(capacity, int) and capacity > 0:
        return f"{name} (capacity {capacity})"
    return name


class NextbikeAustriaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the multi-step config flow for Nextbike Austria."""

    # Bump + add async_migrate_entry when entry.data shape changes.
    # Tracks the config-entry schema, NOT the integration release version.
    VERSION = 1

    def __init__(self) -> None:
        """Init in-flight selections."""
        self._system_id: str | None = None
        self._query: str = ""
        self._matches: list[dict[str, Any]] = []
        self._reconfigure_entry: ConfigEntry | None = None

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> NextbikeAustriaOptionsFlow:
        """Return the options flow handler."""
        return NextbikeAustriaOptionsFlow()

    # ------------------------------------------------------------------
    # Step 1 — user: pick which Austrian system
    # ------------------------------------------------------------------

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Let the user pick one of the supported Austrian nextbike systems."""
        errors: dict[str, str] = {}
        if user_input is not None:
            system_id = user_input.get(CONF_SYSTEM_ID)
            # Defence-in-depth: ``SelectSelector(options=options)`` already
            # validates against the SYSTEM_IDS allowlist at the voluptuous
            # layer, so this branch is unreachable in normal operation.
            # Kept (with the matching ``invalid_system`` translation key)
            # so a future refactor that loosens the selector — or wires a
            # new entry point — surfaces a localised error instead of an
            # unguarded exception.
            if system_id not in SYSTEM_IDS:
                errors[CONF_SYSTEM_ID] = "invalid_system"
            else:
                self._system_id = system_id
                return await self.async_step_search_station()

        options = [
            SelectOptionDict(value=sys["id"], label=sys["name"])
            for sys in AUSTRIAN_SYSTEMS
        ]
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SYSTEM_ID): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.LIST,
                        )
                    )
                }
            ),
            errors=errors,
        )

    # ------------------------------------------------------------------
    # Step 2 — search_station: name fragment
    # ------------------------------------------------------------------

    async def async_step_search_station(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Prompt for a station-name fragment."""
        assert self._system_id is not None
        errors: dict[str, str] = {}
        if user_input is not None:
            self._query = str(user_input.get(CONF_SEARCH_QUERY, "")).strip()
            if len(self._query) < _MIN_QUERY_LENGTH:
                errors[CONF_SEARCH_QUERY] = "query_too_short"
            else:
                stations = await _fetch_stations(self.hass, self._system_id)
                if not stations:
                    errors["base"] = "cannot_connect"
                else:
                    self._matches = _match_stations(stations, self._query)
                    if not self._matches:
                        errors[CONF_SEARCH_QUERY] = "no_matches"
                    else:
                        return await self.async_step_select_station()

        return self.async_show_form(
            step_id="search_station",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SEARCH_QUERY, default=self._query
                    ): TextSelector(),
                }
            ),
            errors=errors,
            description_placeholders={"system_name": self._system_name_for_description()},
        )

    # ------------------------------------------------------------------
    # Step 3 — select_station: dropdown of matches
    # ------------------------------------------------------------------

    async def async_step_select_station(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Let the user pick one station from the search hits."""
        assert self._system_id is not None
        errors: dict[str, str] = {}
        if user_input is not None:
            choice = user_input.get(CONF_STATION_ID)
            if choice == "__search_again__":
                self._matches = []
                return await self.async_step_search_station()
            # SelectSelector validates the choice against `options` at the
            # voluptuous layer, so the resolved station is guaranteed to
            # be in `self._matches` — no further defensive lookup needed.
            station = next(
                s for s in self._matches if str(s.get("station_id")) == str(choice)
            )
            interval = int(
                user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            )
            station_id = str(station.get("station_id"))
            station_name = str(station.get("name") or station_id)
            data: dict[str, Any] = {
                CONF_SYSTEM_ID: self._system_id,
                CONF_STATION_ID: station_id,
                CONF_STATION_NAME: station_name,
                CONF_SCAN_INTERVAL: interval,
            }

            if self._reconfigure_entry is not None:
                await self.async_set_unique_id(
                    f"{self._system_id}_{station_id}"
                )
                self._abort_if_unique_id_mismatch()
                return self.async_update_reload_and_abort(
                    self._reconfigure_entry,
                    data=data,
                )

            await self.async_set_unique_id(
                f"{self._system_id}_{station_id}"
            )
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=station_name, data=data)

        options: list[SelectOptionDict] = [
            SelectOptionDict(
                value=str(s.get("station_id")),
                label=_station_label(s),
            )
            for s in self._matches
        ]
        options.append(
            SelectOptionDict(value="__search_again__", label="↩ Search again")
        )
        return self.async_show_form(
            step_id="select_station",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_STATION_ID): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
                    **_scan_interval_field(DEFAULT_SCAN_INTERVAL),
                }
            ),
            errors=errors,
            description_placeholders={
                "query": self._query,
                "system_name": self._system_name_for_description(),
            },
        )

    # ------------------------------------------------------------------
    # Reconfigure
    # ------------------------------------------------------------------

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Re-enter the station search for an existing entry."""
        entry = self._get_reconfigure_entry()
        self._reconfigure_entry = entry
        current = {**entry.data, **entry.options}
        self._system_id = str(current[CONF_SYSTEM_ID])
        return await self.async_step_search_station()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _system_name_for_description(self) -> str:
        """Return the human-readable system name for placeholders."""
        for sys in AUSTRIAN_SYSTEMS:
            if sys["id"] == self._system_id:
                return sys["name"]
        return self._system_id or ""


class NextbikeAustriaOptionsFlow(OptionsFlow):
    """Options flow: scan interval + optional e-bike battery tracking.

    Station / system changes go through `async_step_reconfigure` in the
    main flow so the entry's unique_id stays stable and entities are
    preserved.
    """

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle options."""
        config = {**self.config_entry.data, **self.config_entry.options}
        if user_input is not None:
            interval = int(
                user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            )
            return self.async_create_entry(
                data={
                    CONF_SCAN_INTERVAL: interval,
                    CONF_TRACK_E_BIKE_RANGE: bool(
                        user_input.get(CONF_TRACK_E_BIKE_RANGE, False)
                    ),
                }
            )

        default_interval = int(
            config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )
        default_track = bool(config.get(CONF_TRACK_E_BIKE_RANGE, False))
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    **_scan_interval_field(default_interval),
                    vol.Required(
                        CONF_TRACK_E_BIKE_RANGE, default=default_track
                    ): bool,
                }
            ),
        )
