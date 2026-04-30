"""Diagnostics support for Nextbike Austria.

Diagnostics dumps end up pasted into public GitHub issues, so the rule
is **principle of least disclosure**: surface the metadata a maintainer
needs to triage (config shape, last-refresh status, counts), but NOT
the live coordinator payload by default. Live data is reproducible
from a one-shot debug log enable; over-publishing it via diagnostics
just leaks "user X tracks station Y, and station Y is currently
out-of-service" patterns into search-indexed issue bodies.

Same shape as linz-linien-austria's diagnostics for portfolio
consistency.
"""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import ATTRIBUTION
from .coordinator import NextbikeAustriaConfigEntry

# Defensive redaction set. Nextbike's GBFS is unauthenticated, so
# there are no credentials to redact today. We still strip coordinates
# (a specific station + the HA install ID could narrow the user's
# rough location) and keep the api_key / password / token names as
# future-proofing — diagnostics dumps end up in public GitHub issues,
# so over-redacting is essentially free and protects against a future
# contributor adding a generically-named credential field without
# remembering to update this set. Treat the set as monotonically
# growing — never shrink.
TO_REDACT = {
    "lat",
    "lon",
    "latitude",
    "longitude",
    "api_key",
    "password",
    "token",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: NextbikeAustriaConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry.

    Surfaces:
      * ``entry`` — title + version + redacted data/options.
      * ``coordinator`` — refresh status, update interval, station/
        system ids (user-chosen config, public-by-design), and counts
        derived from the live snapshot. The live snapshot itself stays
        out — a maintainer who needs it can flip the debug log for a
        single tick and reproduce. The exact attribute payload would
        leak the user's monitored station's current state (rentable?
        returnable? bikes parked?) into a public issue body.
    """
    coordinator = entry.runtime_data
    data = coordinator.data or {}

    # Counts derived from the live payload — safe to publish, no per-
    # bike or per-rack-state detail leaks. Order matters: a maintainer
    # reads this top-down to triage "is the integration even fetching?".
    bikes_count: int | None = None
    docks_count: int | None = None
    vehicle_types_count = 0
    battery_samples = 0
    if isinstance(data, dict):
        if isinstance(data.get("num_bikes_available"), int):
            bikes_count = data["num_bikes_available"]
        if isinstance(data.get("num_docks_available"), int):
            docks_count = data["num_docks_available"]
        vt_avail = data.get("vehicle_types_available")
        if isinstance(vt_avail, list):
            vehicle_types_count = len(vt_avail)
        if isinstance(data.get("_e_bike_range_samples"), int):
            battery_samples = data["_e_bike_range_samples"]

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
            # `last_exception` is the most useful triage signal when
            # `last_update_success=False`. `repr()` gives the class +
            # args without leaking response-body strings the way
            # `str()` of an aiohttp ClientResponseError does.
            "last_exception": repr(coordinator.last_exception),
            "update_interval": str(coordinator.update_interval),
            "station_id": coordinator.station_id,
            "system_id": coordinator.system_id,
            "bikes_available_count": bikes_count,
            "docks_available_count": docks_count,
            "vehicle_types_count": vehicle_types_count,
            "battery_samples_count": battery_samples,
        },
    }
