"""Shared pytest fixtures for Nextbike Austria tests."""
from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from homeassistant.const import CONF_SCAN_INTERVAL
from pytest_homeassistant_custom_component.syrupy import HomeAssistantSnapshotExtension
from syrupy.assertion import SnapshotAssertion

from custom_components.nextbike_austria.const import (
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
)

pytest_plugins = "pytest_homeassistant_custom_component"

# Canonical entry-data shape — Hoher Markt in Wien. Tests that need a
# different station (e.g. test_sensor.py's Hauptbahnhof) splat overrides
# via ``{**BASE_ENTRY_DATA, ...}`` rather than redeclaring the dict.
BASE_ENTRY_DATA: dict[str, Any] = {
    CONF_SYSTEM_ID: "nextbike_wr",
    CONF_STATION_ID: "68577989",
    CONF_STATION_NAME: "Hoher Markt",
    CONF_SCAN_INTERVAL: 60,
}


def station_snapshot(
    station_id: str = "68577989",
    **overrides: Any,
) -> dict[str, Any]:
    """Build a representative merged station_information+station_status row.

    Three test modules need the same Hoher Markt baseline (init,
    diagnostics, coordinator); they were all carrying private copies
    that drifted on lat/lon and last_reported. This factory is the
    single source — tests that need lat/lon redaction coverage splat
    `lat=..., lon=...` overrides; coordinator tests pass a different
    `station_id`. Sensor tests stay local since they need a different
    station + entity-id slug.
    """
    snap: dict[str, Any] = {
        "station_id": station_id,
        "name": "Hoher Markt",
        "capacity": 25,
        "num_bikes_available": 29,
        "num_docks_available": 0,
        "is_installed": True,
        "is_renting": True,
        "is_returning": True,
        "last_reported": 1_776_780_838,
        "vehicle_types_available": [
            {"vehicle_type_id": "192", "count": 23},
            {"vehicle_type_id": "183", "count": 2},
        ],
    }
    snap.update(overrides)
    return snap


@pytest.fixture
def snapshot(snapshot: SnapshotAssertion) -> SnapshotAssertion:
    """Use the HA snapshot extension so diagnostics / state dumps diff cleanly.

    Create/update snapshots with: pytest --snapshot-update
    Stored under tests/snapshots/ next to the test module.
    """
    return snapshot.use_extension(HomeAssistantSnapshotExtension)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests in this package."""
    yield


def _trip_session(*args: Any, **kwargs: Any) -> MagicMock:
    """Sentinel session — using it should fail the test, not silently succeed.

    Tests that legitimately need to exercise an HTTP path must override
    ``async_get_clientsession`` themselves (via a nested ``patch`` or by
    assigning ``client._session``). Anything else means production code
    is escaping to a fake that doesn't behave like ``aiohttp`` — the
    previous fixture made that look like a pass-with-warnings, so this
    sentinel turns the leak into a failure at the moment of use.
    """
    sentinel = MagicMock(name="UNPATCHED_SESSION")

    def _explode(*_a: Any, **_k: Any) -> None:
        pytest.fail(
            "Unpatched aiohttp session was used inside a test. "
            "Override `async_get_clientsession` (or `client._session`) "
            "with a recording fake before exercising HTTP paths."
        )

    sentinel.get.side_effect = _explode
    return sentinel


@pytest.fixture(autouse=True)
def mock_aiohttp_session():
    """Replace ``async_get_clientsession`` with a tripwire by default.

    Tests that genuinely want a session must opt in by re-patching the
    same target with their own recording fake (see ``_fakes.RecordingSession``).
    """
    with (
        patch(
            "custom_components.nextbike_austria.coordinator.async_get_clientsession",
            side_effect=_trip_session,
        ),
        patch(
            "custom_components.nextbike_austria.config_flow.async_get_clientsession",
            side_effect=_trip_session,
        ),
    ):
        yield
