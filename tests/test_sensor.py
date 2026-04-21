"""Tests for the Nextbike Austria sensor platform."""
from __future__ import annotations

from typing import Any
from unittest.mock import patch

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.nextbike_austria.const import (
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    DOMAIN,
)

BASE_DATA = {
    CONF_SYSTEM_ID: "nextbike_wr",
    CONF_STATION_ID: "68586882",
    CONF_STATION_NAME: "Hauptbahnhof S U",
    CONF_SCAN_INTERVAL: 60,
}


def _station_with_capacity() -> dict[str, Any]:
    """A station whose upstream record includes capacity (well-published)."""
    return {
        "station_id": "68586882",
        "name": "Hauptbahnhof S U",
        "capacity": 54,
        "num_bikes_available": 48,
        "num_docks_available": 6,
        "vehicle_types_available": [
            {"vehicle_type_id": "183", "count": 17},
            {"vehicle_type_id": "192", "count": 31},
        ],
        "is_installed": True,
        "is_renting": True,
        "is_returning": True,
        "last_reported": 1_776_782_762,
    }


def _station_without_capacity() -> dict[str, Any]:
    """A Niederösterreich-style station: no capacity, no dock data."""
    return {
        "station_id": "244370510",
        "name": "St. Pölten / Bildungscampus",
        "num_bikes_available": 0,
        "vehicle_types_available": [],
        "num_docks_available": 0,
        "is_installed": True,
        "is_renting": True,
        "is_returning": True,
        "last_reported": 1_776_782_762,
    }


class _FakeClient:
    """Minimal stand-in for SharedSystemClient in integration tests."""

    def __init__(self, station: dict[str, Any], system_id: str = "nextbike_wr") -> None:
        self.system_id = system_id
        self._station = station
        self._ebike_ids: frozenset[str] = frozenset({"183"})

    async def async_fetch(self, *, force: bool = False) -> None:
        return None

    def station(self, station_id: str) -> dict[str, Any] | None:
        return self._station if station_id == self._station["station_id"] else None

    def is_ebike_type(self, tid: str) -> bool:
        return tid in self._ebike_ids


def _make_entry(station_id: str, station_name: str, system_id: str) -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data={
            CONF_SYSTEM_ID: system_id,
            CONF_STATION_ID: station_id,
            CONF_STATION_NAME: station_name,
            CONF_SCAN_INTERVAL: 60,
        },
        options={},
        title=station_name,
        unique_id=f"{system_id}_{station_id}",
    )


async def test_all_three_sensors_populated_when_capacity_known(
    hass: HomeAssistant,
) -> None:
    """Vienna-style station: all three sensors publish real values."""
    station = _station_with_capacity()
    entry = _make_entry("68586882", "Hauptbahnhof S U", "nextbike_wr")
    entry.add_to_hass(hass)

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=_FakeClient(station),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    bikes = hass.states.get("sensor.hauptbahnhof_s_u_bikes_available")
    docks = hass.states.get("sensor.hauptbahnhof_s_u_docks_available")
    ebikes = hass.states.get("sensor.hauptbahnhof_s_u_e_bikes_available")

    assert bikes is not None and bikes.state == "48"
    assert docks is not None and docks.state == "6"
    assert ebikes is not None and ebikes.state == "17"
    # The docks sensor now surfaces capacity as an attribute
    assert docks.attributes.get("capacity") == 54


async def test_options_update_reloads_entry(hass: HomeAssistant) -> None:
    """Changing options fires the update-listener → async_reload runs."""
    station = _station_with_capacity()
    entry = _make_entry("68586882", "Hauptbahnhof S U", "nextbike_wr")
    entry.add_to_hass(hass)

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=_FakeClient(station),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

        # Trigger the update listener by mutating options. async_update_entry
        # calls every registered listener — _async_reload_entry is one of them.
        hass.config_entries.async_update_entry(entry, options={"scan_interval": 300})
        await hass.async_block_till_done()

    # Entry must survive the reload cleanly.
    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.options == {"scan_interval": 300}


async def test_docks_unavailable_when_capacity_unpublished(
    hass: HomeAssistant,
) -> None:
    """NÖ-style station: docks reads 'unknown', bikes stays at 0."""
    station = _station_without_capacity()
    entry = _make_entry(
        "244370510", "St. Pölten / Bildungscampus", "nextbike_la"
    )
    entry.add_to_hass(hass)

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=_FakeClient(station, system_id="nextbike_la"),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    bikes = hass.states.get("sensor.st_polten_bildungscampus_bikes_available")
    docks = hass.states.get("sensor.st_polten_bildungscampus_docks_available")
    ebikes = hass.states.get("sensor.st_polten_bildungscampus_e_bikes_available")

    assert bikes is not None and bikes.state == "0"
    assert docks is not None and docks.state == "unknown"
    assert ebikes is not None and ebikes.state == "0"
