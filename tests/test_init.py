"""Tests for the top-level ``custom_components.nextbike_austria`` setup.

Covers the surface ``__init__.py`` exposes that isn't exercised by the
config-flow or coordinator tests:

* the ``nextbike_austria/card_version`` WebSocket command,
* ``async_unload_entry`` happy path,
* ``_async_register_card`` static-path + Lovelace-resource branches.
"""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.nextbike_austria import (
    _async_register_card,
    _websocket_card_version,
)
from custom_components.nextbike_austria.const import (
    CARD_URL,
    CARD_VERSION,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    DOMAIN,
)

from ._fakes import FakeClient

_BASE_DATA = {
    CONF_SYSTEM_ID: "nextbike_wr",
    CONF_STATION_ID: "68577989",
    CONF_STATION_NAME: "Hoher Markt",
    CONF_SCAN_INTERVAL: 60,
}

_STATION_SNAPSHOT = {
    "station_id": "68577989",
    "name": "Hoher Markt",
    "capacity": 25,
    "num_bikes_available": 5,
    "num_docks_available": 20,
    "is_installed": True,
    "is_renting": True,
    "is_returning": True,
    "last_reported": 1_776_780_838,
    "vehicle_types_available": [],
}


def _make_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data=_BASE_DATA,
        options={},
        title="Hoher Markt",
        unique_id="nextbike_wr_68577989",
    )


def _patch_client() -> Any:
    fake = FakeClient()
    fake.set_stations({"68577989": _STATION_SNAPSHOT})
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


# ---------------------------------------------------------------------
# _async_register_card
# ---------------------------------------------------------------------


def _stub_static(hass: HomeAssistant) -> AsyncMock:
    """Replace ``hass.http.async_register_static_paths`` with an AsyncMock."""
    static = AsyncMock()
    hass.http = MagicMock(spec_set=("async_register_static_paths",))
    hass.http.async_register_static_paths = static
    return static


def _build_lovelace(items: list[dict[str, Any]], mode: str = "storage") -> MagicMock:
    """Build a fake Lovelace store exposing the surface ``_async_register_card`` needs."""
    resources = MagicMock()
    resources.async_load = AsyncMock()
    resources.async_items = MagicMock(return_value=list(items))
    resources.async_create_item = AsyncMock()
    resources.async_update_item = AsyncMock()
    resources.async_delete_item = AsyncMock()
    lovelace = MagicMock()
    lovelace.mode = mode
    lovelace.resources = resources
    return lovelace


async def test_register_card_creates_resource_when_absent(hass: HomeAssistant) -> None:
    """Storage-mode + no existing resource → async_create_item is called once."""
    static = _stub_static(hass)
    lovelace = _build_lovelace([])
    hass.data["lovelace"] = lovelace

    await _async_register_card(hass)

    static.assert_awaited_once()
    lovelace.resources.async_create_item.assert_awaited_once()
    created = lovelace.resources.async_create_item.await_args.args[0]
    assert created["url"] == f"{CARD_URL}?v={CARD_VERSION}"
    assert created["res_type"] == "module"


async def test_register_card_updates_outdated_resource(hass: HomeAssistant) -> None:
    """An existing resource with a stale ?v=… is upserted to the current version."""
    _stub_static(hass)
    stale = {"id": "abc", "url": f"{CARD_URL}?v=0.0.0", "res_type": "module"}
    lovelace = _build_lovelace([stale])
    hass.data["lovelace"] = lovelace

    await _async_register_card(hass)

    lovelace.resources.async_update_item.assert_awaited_once_with(
        "abc",
        {"res_type": "module", "url": f"{CARD_URL}?v={CARD_VERSION}"},
    )
    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_card_skips_when_already_current(hass: HomeAssistant) -> None:
    """Existing resource matching ``CARD_URL?v=CARD_VERSION`` → no writes."""
    _stub_static(hass)
    current = {
        "id": "abc",
        "url": f"{CARD_URL}?v={CARD_VERSION}",
        "res_type": "module",
    }
    lovelace = _build_lovelace([current])
    hass.data["lovelace"] = lovelace

    await _async_register_card(hass)

    lovelace.resources.async_update_item.assert_not_awaited()
    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_card_noop_in_yaml_mode(hass: HomeAssistant) -> None:
    """YAML-mode Lovelace must not be mutated — user manages the resource."""
    _stub_static(hass)
    lovelace = _build_lovelace([], mode="yaml")
    hass.data["lovelace"] = lovelace

    await _async_register_card(hass)

    lovelace.resources.async_create_item.assert_not_awaited()
    lovelace.resources.async_update_item.assert_not_awaited()


async def test_register_card_warns_when_card_missing(
    hass: HomeAssistant, tmp_path: Any, caplog: pytest.LogCaptureFixture
) -> None:
    """A missing card JS path logs a warning instead of raising."""
    bad_path = tmp_path / "missing.js"

    # Make the chained ``Path(__file__).parent / "www" / CARD_FILENAME`` end
    # at a real ``pathlib.Path`` that doesn't exist on disk.
    with patch("custom_components.nextbike_austria.Path") as path_cls:
        path_cls.return_value.parent.__truediv__.return_value.__truediv__.return_value = (
            bad_path
        )
        caplog.clear()
        with caplog.at_level("WARNING"):
            await _async_register_card(hass)

    assert any(
        "Card JS not found" in rec.message for rec in caplog.records
    ), "expected warning when card JS file is missing"
