"""Nextbike Austria integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .card_registration import JSModuleRegistration
from .const import CARD_VERSION, DOMAIN
from .coordinator import NextbikeAustriaConfigEntry, NextbikeStationCoordinator

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]


@websocket_command(
    {vol.Required("type"): "nextbike_austria/card_version"}
)
@async_response
async def _websocket_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the bundled card version so the frontend can detect mismatches.

    The frontend bundle hard-codes ``CARD_VERSION`` at build time. When HA
    updates the integration but the user is still running a tab that
    cached the old bundle, this probe lets the card surface a reload
    banner instead of silently misbehaving.
    """
    connection.send_result(msg["id"], {"version": CARD_VERSION})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Nextbike Austria component (domain-level init).

    Card registration runs once per HA process — not per config entry. We
    defer it to ``EVENT_HOMEASSISTANT_STARTED`` if HA is still starting up
    so the Lovelace resources are loaded by the time we touch them.
    """
    hass.data.setdefault(DOMAIN, {})

    # WS commands registered here survive integration removal — HA's
    # websocket_api has no public deregister hook. Same caveat as the
    # static path registration in card_registration.py: pragmatic given
    # the API surface, harmless in practice (a stray handler that no
    # caller invokes once the bundle is gone). Behaviour on duplicate
    # registration is HA core internal; we never reach that branch
    # since `async_setup` only runs once per HA startup.
    async_register_command(hass, _websocket_card_version)

    registration = JSModuleRegistration(hass)

    async def _register_card(_event: Event | None = None) -> None:
        await registration.async_register()

    if hass.state == CoreState.running:
        await _register_card()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_card)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: NextbikeAustriaConfigEntry) -> bool:
    """Set up Nextbike Austria from a config entry."""
    coordinator = NextbikeStationCoordinator(hass, entry)
    # HA auto-invokes coordinator._async_setup() inside this call before the
    # first fetch; it also raises ConfigEntryNotReady on fetch failure.
    await coordinator.async_config_entry_first_refresh()

    # Register teardown only after first_refresh succeeded — running it on
    # a half-initialised coordinator that raised ConfigEntryNotReady leaks
    # listeners.
    entry.async_on_unload(coordinator.async_teardown)

    entry.runtime_data = coordinator

    # Register a device explicitly so the Devices panel shows the entry
    # even before any entity reports state.
    dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="nextbike GmbH",
        model="Bike Sharing Station",
        configuration_url="https://www.nextbike.at/",
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: NextbikeAustriaConfigEntry) -> None:
    """Reload the config entry when options are updated."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: NextbikeAustriaConfigEntry) -> bool:
    """Unload a config entry.

    Drops the per-system ``SharedSystemClient`` from ``hass.data`` only
    when no other entries for the same system remain — multiple entries
    for the same Austrian system share one client to collapse GBFS
    fetches, so removing it while siblings still need it would cost a
    fresh fetch on every poll.
    """
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unloaded:
        return False
    # The about-to-be-unloaded coordinator carries the system_id we own.
    system_id = entry.runtime_data.system_id
    other_entries_for_system = [
        e
        for e in hass.config_entries.async_entries(DOMAIN)
        if e.entry_id != entry.entry_id
        and e.runtime_data is not None
        and e.runtime_data.system_id == system_id
    ]
    if not other_entries_for_system:
        systems: dict[str, Any] = (
            hass.data.get(DOMAIN, {}).get("systems") or {}
        )
        systems.pop(system_id, None)
    return True


async def async_remove_entry(
    hass: HomeAssistant, entry: NextbikeAustriaConfigEntry
) -> None:
    """Drop the Lovelace resource when the LAST config entry is removed.

    The card resource is registered once globally per integration, so
    reloading or removing a single entry must not remove it. Only when
    no other entries of this domain remain do we unregister.
    """
    remaining = [
        e
        for e in hass.config_entries.async_entries(DOMAIN)
        if e.entry_id != entry.entry_id
    ]
    if remaining:
        return
    registration = JSModuleRegistration(hass)
    await registration.async_unregister()
