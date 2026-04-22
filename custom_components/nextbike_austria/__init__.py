"""Nextbike Austria integration."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.websocket_api import ActiveConnection  # type: ignore[attr-defined]
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import CARD_FILENAME, CARD_URL, CARD_VERSION, DOMAIN
from .coordinator import NextbikeAustriaConfigEntry, NextbikeStationCoordinator

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]


@websocket_api.websocket_command(  # type: ignore[attr-defined]
    {vol.Required("type"): "nextbike_austria/card_version"}
)
@websocket_api.async_response  # type: ignore[attr-defined]
async def _websocket_card_version(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the bundled card version so the frontend can detect mismatches."""
    connection.send_result(msg["id"], {"version": CARD_VERSION})


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Nextbike Austria component.

    Also registers the bundled Lovelace card once when the domain is loaded
    — serving the JS file via static path and upserting the Lovelace
    resource pointing at it with a ``?v={CARD_VERSION}`` cache-buster.
    """
    hass.data.setdefault(DOMAIN, {})

    websocket_api.async_register_command(hass, _websocket_card_version)

    async def _register_frontend(_event: Event | None = None) -> None:
        await _async_register_card(hass)

    if hass.state == CoreState.running:
        await _register_frontend()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_frontend)

    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the card JS and upsert its Lovelace resource with ?v=version.

    Pulled in-line rather than via a separate card_registration module so
    the control flow is visible where async_setup lives. Storage-mode
    users get the resource auto-registered; YAML-mode users see a debug
    log and need to add the resource manually (documented in README).
    """
    card_path = Path(__file__).parent / "www" / CARD_FILENAME
    if not card_path.is_file():
        _LOGGER.warning("Card JS not found at %s", card_path)
        return

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, str(card_path), False)]
        )
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Static path already registered or unavailable: %s", CARD_URL)

    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is None:
            _LOGGER.debug(
                "Lovelace not yet available in hass.data — resource URL "
                "not updated. The WebSocket version check will notify "
                "the user if the card JS is stale."
            )
            return

        # HA <2024.x exposed .mode directly; newer versions use LovelaceData
        # where mode lives on .config. Fall back gracefully.
        mode = getattr(lovelace, "mode", None) or getattr(
            getattr(lovelace, "config", None), "mode", None
        )
        if mode is not None and mode != "storage":
            _LOGGER.debug(
                "Lovelace is in %s mode — resource URL must be managed manually",
                mode,
            )
            return

        resources = getattr(lovelace, "resources", None)
        if resources is None:
            _LOGGER.debug("Lovelace resources not accessible on this HA version")
            return
        await resources.async_load()

        versioned_url = f"{CARD_URL}?v={CARD_VERSION}"

        for item in resources.async_items():
            existing_base = item.get("url", "").split("?")[0]
            if existing_base == CARD_URL:
                if item.get("url") == versioned_url:
                    return  # already up to date
                try:
                    await resources.async_update_item(
                        item["id"],
                        {"res_type": "module", "url": versioned_url},
                    )
                except Exception as update_err:  # noqa: BLE001
                    _LOGGER.debug(
                        "async_update_item failed (%s), trying delete+recreate",
                        update_err,
                    )
                    await resources.async_delete_item(item["id"])
                    await resources.async_create_item(
                        {"res_type": "module", "url": versioned_url}
                    )
                _LOGGER.info("Updated Lovelace resource to %s", versioned_url)
                return

        await resources.async_create_item(
            {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Registered Lovelace resource %s", versioned_url)

    except Exception:  # noqa: BLE001
        _LOGGER.warning(
            "Could not register Lovelace resource – add manually: "
            "Settings → Dashboards → Resources → %s (JavaScript module)",
            CARD_URL,
            exc_info=True,
        )


async def async_setup_entry(hass: HomeAssistant, entry: NextbikeAustriaConfigEntry) -> bool:
    """Set up Nextbike Austria from a config entry."""
    coordinator = NextbikeStationCoordinator(hass, entry)
    # HA auto-invokes coordinator._async_setup() inside this call before the
    # first fetch; it also raises ConfigEntryNotReady on fetch failure.
    await coordinator.async_config_entry_first_refresh()

    # Register teardown only after first_refresh succeeded — avoids running
    # teardown on a half-initialized coordinator if setup raised.
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
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
