"""Tests for the top-level ``custom_components.nextbike_austria`` setup.

Covers the surface ``__init__.py`` exposes that isn't exercised by the
config-flow, coordinator, or card_registration tests:

* the ``nextbike_austria/card_version`` WebSocket command,
* ``async_unload_entry`` happy path + per-system client cleanup,
* ``async_remove_entry`` honouring the LAST-entry guard.
"""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.nextbike_austria import (
    _websocket_card_version,
    async_remove_entry,
)
from custom_components.nextbike_austria.const import (
    CARD_VERSION,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    DOMAIN,
)

from ._fakes import FakeClient
from .conftest import BASE_ENTRY_DATA, station_snapshot

# Setup-path tests don't care about per-vehicle counts — pin to the
# baseline factory with a non-empty bikes count + capacity overrides
# so the entity reaches LOADED state without coordinator complaints.
_STATION_SNAPSHOT = station_snapshot(
    num_bikes_available=5,
    num_docks_available=20,
    vehicle_types_available=[],
)


def _make_entry(
    *,
    station_id: str = "68577989",
    station_name: str = "Hoher Markt",
    system_id: str = "nextbike_wr",
) -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data={
            **BASE_ENTRY_DATA,
            CONF_SYSTEM_ID: system_id,
            CONF_STATION_ID: station_id,
            CONF_STATION_NAME: station_name,
        },
        options={},
        title=station_name,
        unique_id=f"{system_id}_{station_id}",
    )


def _patch_client(station_id: str = "68577989") -> Any:
    fake = FakeClient()
    fake.set_stations({station_id: _STATION_SNAPSHOT})
    return patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    )


# ---------------------------------------------------------------------
# WebSocket command
# ---------------------------------------------------------------------


async def test_websocket_card_version_returns_const(hass: HomeAssistant) -> None:
    """The WebSocket command echoes the bundled card version.

    Calls the underlying coroutine via ``__wrapped__`` (set by
    ``functools.wraps`` inside ``websocket_api.async_response``) so we
    avoid spinning up the http + websocket_api stack in a unit test —
    that stack registers the ``_run_safe_shutdown_loop`` daemon thread
    that p-h-c-c's ``verify_cleanup`` fixture treats as a leak on some
    versions, turning a passing test into a teardown ERROR on CI.
    """
    connection = MagicMock()
    msg = {"id": 42, "type": "nextbike_austria/card_version"}

    await _websocket_card_version.__wrapped__(hass, connection, msg)

    connection.send_result.assert_called_once_with(42, {"version": CARD_VERSION})


# ---------------------------------------------------------------------
# async_unload_entry
# ---------------------------------------------------------------------


async def test_async_unload_entry_returns_true(hass: HomeAssistant) -> None:
    """Setup → unload leaves the entry NOT_LOADED, no exceptions."""
    from homeassistant.config_entries import ConfigEntryState

    entry = _make_entry()
    entry.add_to_hass(hass)

    with _patch_client():
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.LOADED

        assert await hass.config_entries.async_unload(entry.entry_id)
        await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_unload_drops_shared_client_when_last_entry_for_system(
    hass: HomeAssistant,
) -> None:
    """Per-system shared client is dropped when the LAST entry for that system unloads."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    with _patch_client():
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        # Simulate a real shared-client cache entry so we can assert it
        # gets cleaned up. (The patched _get_shared_client bypasses the
        # `systems` dict during setup, so seed it now.)
        hass.data.setdefault(DOMAIN, {}).setdefault("systems", {})[
            "nextbike_wr"
        ] = object()

        assert await hass.config_entries.async_unload(entry.entry_id)
        await hass.async_block_till_done()

    assert "nextbike_wr" not in hass.data.get(DOMAIN, {}).get("systems", {})


# ---------------------------------------------------------------------
# async_remove_entry — LAST-entry guard
# ---------------------------------------------------------------------


async def test_remove_entry_unregisters_card_when_last(hass: HomeAssistant) -> None:
    """Removing the LAST entry unregisters the Lovelace resource."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake_unregister = AsyncMock()
    with patch(
        "custom_components.nextbike_austria.JSModuleRegistration"
    ) as cls:
        cls.return_value.async_unregister = fake_unregister
        await async_remove_entry(hass, entry)

    fake_unregister.assert_awaited_once()


async def test_remove_entry_keeps_card_when_others_remain(
    hass: HomeAssistant,
) -> None:
    """Removing one of two entries must NOT unregister the resource."""
    entry_a = _make_entry()
    entry_a.add_to_hass(hass)
    entry_b = _make_entry(
        station_id="68586882",
        station_name="Hauptbahnhof S U",
    )
    entry_b.add_to_hass(hass)

    fake_unregister = AsyncMock()
    with patch(
        "custom_components.nextbike_austria.JSModuleRegistration"
    ) as cls:
        cls.return_value.async_unregister = fake_unregister
        # Remove entry_a; entry_b remains.
        await async_remove_entry(hass, entry_a)

    fake_unregister.assert_not_awaited()
