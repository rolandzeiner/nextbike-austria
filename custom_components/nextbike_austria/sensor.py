"""Sensor platform for Nextbike Austria.

Each config entry (one station) exposes three sensors:

* ``bikes_available`` — total bikes currently parked at the station.
* ``docks_available`` — empty docks (inverse of bikes; useful for
  automations that trigger when you can return a bike).
* ``ebikes_available`` — subset of bikes whose vehicle type is pedelec or
  throttle-electric. 0 when the system has no e-bikes.

Richer per-vehicle data (coords of every floating bike, rental URIs, etc.)
is available via the shared client but would inflate the entity count and
attribute size. If a user needs it, they can template against
``extra_state_attributes["rental_uri"]`` or query the diagnostics dump.
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, DOMAIN
from .coordinator import NextbikeAustriaConfigEntry, NextbikeStationCoordinator

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: NextbikeAustriaConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor entities from a config entry."""
    coordinator = entry.runtime_data
    async_add_entities(
        [
            _BikesAvailableSensor(coordinator, entry),
            _DocksAvailableSensor(coordinator, entry),
            _EbikesAvailableSensor(coordinator, entry),
        ]
    )


class _BaseStationSensor(
    CoordinatorEntity[NextbikeStationCoordinator], SensorEntity
):
    """Shared scaffolding for all per-station sensors."""

    _attr_has_entity_name = True
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "bikes"

    # Subclasses set these:
    _translation_key: str
    _unique_key: str

    def __init__(
        self,
        coordinator: NextbikeStationCoordinator,
        entry: NextbikeAustriaConfigEntry,
    ) -> None:
        """Initialise the sensor."""
        super().__init__(coordinator)
        self._entry = entry
        # KEEP STABLE — changing the unique_id format wipes existing
        # entity registry rows for all users.
        self._attr_unique_id = f"{entry.entry_id}_{self._unique_key}"
        self._attr_translation_key = self._translation_key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="nextbike GmbH",
            model="Bike Sharing Station",
            configuration_url="https://www.nextbike.at/",
        )


class _BikesAvailableSensor(_BaseStationSensor):
    """Total bikes available at the station."""

    _translation_key = "bikes_available"
    _unique_key = "bikes"

    @property
    def native_value(self) -> int | None:
        """Return the bike count from the latest coordinator snapshot."""
        data = self.coordinator.data or {}
        value = data.get("num_bikes_available")
        return int(value) if isinstance(value, int) else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Station metadata, per-type breakdown, and rental links.

        ``num_docks_available`` and ``is_virtual_station`` are mirrored
        here (also on the dedicated docks sensor) so the bundled card
        can paint the full station view from a single fingerprint entity
        — no sibling-sensor lookup through the entity registry.
        """
        data = self.coordinator.data or {}
        return {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            "station_id": self.coordinator.station_id,
            "system_id": self.coordinator.system_id,
            "capacity": data.get("capacity"),
            "num_docks_available": data.get("num_docks_available"),
            "is_virtual_station": data.get("is_virtual_station"),
            "latitude": data.get("lat"),
            "longitude": data.get("lon"),
            "is_installed": data.get("is_installed"),
            "is_renting": data.get("is_renting"),
            "is_returning": data.get("is_returning"),
            "last_reported": data.get("last_reported"),
            "vehicle_types_available": data.get("vehicle_types_available"),
            "rental_uri": (data.get("rental_uris") or {}).get("web"),
        }


class _DocksAvailableSensor(_BaseStationSensor):
    """Empty docks at the station.

    GBFS sets ``num_docks_available`` to 0 at virtual stations. Some
    Austrian systems (nextbike Niederösterreich in particular) also
    omit the ``capacity`` field for most stations *and* report a
    permanent ``num_docks_available: 0`` — which would read as "station
    is full" when it actually means "upstream doesn't track docks
    here". We treat a missing capacity as "docks unknown" so the sensor
    renders as ``unknown`` instead of lying with 0.

    Use ``is_virtual_station`` from the bikes sensor if you need to
    distinguish "geofence with no physical docks" from "station is
    full".
    """

    _translation_key = "docks_available"
    _unique_key = "docks"
    _attr_native_unit_of_measurement = "docks"

    @property
    def native_value(self) -> int | None:
        """Return the dock count, or None when upstream doesn't publish it."""
        data = self.coordinator.data or {}
        # Upstream signal: stations that carry real dock metadata always
        # include ``capacity``. Systems that omit capacity also report
        # 0 for num_docks_available regardless of the true state — so
        # we return None ("unknown") rather than a misleading zero.
        if "capacity" not in data:
            return None
        value = data.get("num_docks_available")
        return int(value) if isinstance(value, int) else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Attribution + virtual-station flag + capacity if known."""
        data = self.coordinator.data or {}
        return {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            "is_virtual_station": data.get("is_virtual_station"),
            "capacity": data.get("capacity"),
        }


class _EbikesAvailableSensor(_BaseStationSensor):
    """E-bikes available at the station.

    Counts by resolving each ``vehicle_types_available`` entry against the
    shared client's e-bike type id set, which was populated from
    ``vehicle_types.json`` on first fetch. Returns 0 when the system has
    no e-bikes or when vehicle_types hasn't loaded yet.
    """

    _translation_key = "ebikes_available"
    _unique_key = "ebikes"

    @property
    def native_value(self) -> int:
        """Sum counts for vehicle types flagged as e-bike in this system."""
        data = self.coordinator.data or {}
        breakdown = data.get("vehicle_types_available") or []
        total = 0
        client = self.coordinator.client
        for row in breakdown:
            if not isinstance(row, dict):
                continue
            tid = str(row.get("vehicle_type_id") or "")
            count = row.get("count")
            if tid and isinstance(count, int) and client.is_ebike_type(tid):
                total += count
        return total

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Attribution only; richer detail lives on the bikes sensor."""
        return {ATTR_ATTRIBUTION: ATTRIBUTION}
