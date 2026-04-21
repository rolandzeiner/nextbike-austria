"""Diagnostics support for Nextbike Austria."""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import ATTRIBUTION
from .coordinator import NextbikeAustriaConfigEntry

# Nextbike's GBFS is unauthenticated, so there are no credentials to
# redact. We still strip coordinates — they identify a specific station
# which, combined with the HA install ID, could be used to infer the
# user's rough location.
TO_REDACT = {"lat", "lon", "latitude", "longitude"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: NextbikeAustriaConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator = entry.runtime_data
    data = coordinator.data or {}
    return {
        "attribution": ATTRIBUTION,
        "entry": {
            "title": entry.title,
            "version": entry.version,
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": async_redact_data(dict(entry.options), TO_REDACT),
        },
        "coordinator": {
            "last_update_success": coordinator.last_update_success,
            "update_interval": str(coordinator.update_interval),
            "station_id": coordinator.station_id,
            "system_id": coordinator.system_id,
            "station_snapshot": async_redact_data(dict(data), TO_REDACT)
            if isinstance(data, dict)
            else None,
        },
    }
