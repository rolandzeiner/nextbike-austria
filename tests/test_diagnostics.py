"""Tests for the Nextbike Austria diagnostics module."""
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
from custom_components.nextbike_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)

BASE_DATA = {
    CONF_SYSTEM_ID: "nextbike_wr",
    CONF_STATION_ID: "68577989",
    CONF_STATION_NAME: "Hoher Markt",
    CONF_SCAN_INTERVAL: 60,
}


class _FakeClient:
    """Minimal client stand-in for diagnostics setup."""

    def __init__(self) -> None:
        self.system_id = "nextbike_wr"
        self._station = {
            "station_id": "68577989",
            "name": "Hoher Markt",
            "lat": 48.210666,
            "lon": 16.372983,
            "capacity": 25,
            "num_bikes_available": 29,
            "num_docks_available": 0,
            "is_installed": True,
            "is_renting": True,
            "is_returning": True,
            "last_reported": 1_776_780_838,
            "vehicle_types_available": [],
        }

    async def async_fetch(self, *, force: bool = False) -> None:
        return None

    def station(self, station_id: str) -> dict[str, Any] | None:
        return self._station if station_id == "68577989" else None

    def is_ebike_type(self, tid: str) -> bool:
        return False


async def test_diagnostics_carries_attribution_and_redacts_coords(
    hass: HomeAssistant,
) -> None:
    """Diagnostics carries attribution and strips station coordinates."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=BASE_DATA,
        options={},
        title="Hoher Markt",
        unique_id="nextbike_wr_68577989",
    )
    entry.add_to_hass(hass)

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=_FakeClient(),
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["attribution"].startswith("Data: nextbike")
    assert diag["coordinator"]["system_id"] == "nextbike_wr"
    assert diag["coordinator"]["station_id"] == "68577989"
    snap = diag["coordinator"]["station_snapshot"]
    assert snap["lat"] == "**REDACTED**"
    assert snap["lon"] == "**REDACTED**"
    # Non-sensitive fields pass through
    assert snap["num_bikes_available"] == 29
