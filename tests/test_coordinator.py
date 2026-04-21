"""Tests for the Nextbike Austria coordinator."""
from __future__ import annotations

import asyncio
from typing import Any
from unittest.mock import patch

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import UpdateFailed
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.nextbike_austria.const import (
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    DOMAIN,
)
from custom_components.nextbike_austria.coordinator import (
    GBFSError,
    NextbikeStationCoordinator,
    SharedSystemClient,
)

BASE_ENTRY_DATA = {
    CONF_SYSTEM_ID: "nextbike_wr",
    CONF_STATION_ID: "68577989",
    CONF_STATION_NAME: "Hoher Markt",
    CONF_SCAN_INTERVAL: 60,
}


def _make_entry(data: dict[str, Any] | None = None) -> MockConfigEntry:
    entry_data = {**BASE_ENTRY_DATA, **(data or {})}
    return MockConfigEntry(
        domain=DOMAIN,
        data=entry_data,
        options={},
        title=entry_data[CONF_STATION_NAME],
        unique_id=f"{entry_data[CONF_SYSTEM_ID]}_{entry_data[CONF_STATION_ID]}",
    )


def _station_snapshot(sid: str = "68577989") -> dict[str, Any]:
    """A representative merged station_information + station_status row."""
    return {
        "station_id": sid,
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
        "vehicle_types_available": [
            {"vehicle_type_id": "192", "count": 23},
            {"vehicle_type_id": "183", "count": 2},
        ],
    }


class _FakeClient:
    """Minimal in-memory SharedSystemClient replacement used by tests."""

    def __init__(self, system_id: str = "nextbike_wr") -> None:
        self.system_id = system_id
        self._stations: dict[str, dict[str, Any]] = {}
        self._raise: Exception | None = None
        self._ebike_ids: frozenset[str] = frozenset({"183"})

    def set_stations(self, stations: dict[str, dict[str, Any]]) -> None:
        self._stations = stations

    def set_error(self, err: Exception | None) -> None:
        self._raise = err

    async def async_fetch(self, *, force: bool = False) -> None:
        if self._raise is not None:
            raise self._raise

    def station(self, station_id: str) -> dict[str, Any] | None:
        return self._stations.get(station_id)

    def is_ebike_type(self, tid: str) -> bool:
        return tid in self._ebike_ids


async def test_fetch_success(hass: HomeAssistant) -> None:
    """Coordinator returns the single station's snapshot on refresh."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_stations({"68577989": _station_snapshot()})
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        await coordinator.async_refresh()
    assert coordinator.last_update_success
    assert coordinator.data is not None
    assert coordinator.data["num_bikes_available"] == 29


async def test_station_missing_raises_update_failed(hass: HomeAssistant) -> None:
    """A station that isn't in the feed produces UpdateFailed + repair issue."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_stations({})  # configured station isn't present
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        with pytest.raises(UpdateFailed):
            await coordinator._async_update_data()

    registry = ir.async_get(hass)
    issue = registry.async_get_issue(DOMAIN, f"station_gone_{entry.entry_id}")
    assert issue is not None


async def test_transport_error_raises_update_failed(hass: HomeAssistant) -> None:
    """A GBFSError from the client becomes UpdateFailed with translation keys."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_error(GBFSError("api_timeout", seconds="15"))
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        with pytest.raises(UpdateFailed) as excinfo:
            await coordinator._async_update_data()
    assert excinfo.value.translation_key == "api_timeout"


async def test_setup_retry_on_first_refresh_failure(hass: HomeAssistant) -> None:
    """First-refresh failure leaves the entry in SETUP_RETRY."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_error(GBFSError("api_connection_error", error_type="ClientError", error="boom"))
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_repair_issue_lifecycle(hass: HomeAssistant) -> None:
    """Degraded-condition issue raises once and clears on recovery."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)

    coordinator._raise_degraded_issue(
        "station_gone", station_id="x", system_id="nextbike_wr"
    )
    coordinator._raise_degraded_issue(
        "station_gone", station_id="x", system_id="nextbike_wr"
    )  # idempotent

    registry = ir.async_get(hass)
    assert registry.async_get_issue(DOMAIN, f"station_gone_{entry.entry_id}") is not None

    coordinator._clear_degraded_issue("station_gone")
    assert registry.async_get_issue(DOMAIN, f"station_gone_{entry.entry_id}") is None


async def test_shared_client_translates_timeout(hass: HomeAssistant) -> None:
    """asyncio.TimeoutError inside the HTTP fetch becomes GBFSError(api_timeout)."""
    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeSession:
        async def get(self, *args: Any, **kwargs: Any) -> Any:
            raise asyncio.TimeoutError()

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_timeout"


async def test_shared_client_translates_http_error(hass: HomeAssistant) -> None:
    """A 500 response becomes GBFSError(api_http_error) with status placeholder."""
    import aiohttp as _aiohttp

    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeResp:
        status = 500

        def raise_for_status(self) -> None:
            raise _aiohttp.ClientResponseError(
                request_info=None,  # type: ignore[arg-type]
                history=(),
                status=500,
                message="Internal Server Error",
            )

    class _FakeSession:
        async def get(self, *args: Any, **kwargs: Any) -> _FakeResp:
            return _FakeResp()

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_http_error"
    assert excinfo.value.placeholders.get("status") == "500"


async def test_shared_client_translates_client_error(hass: HomeAssistant) -> None:
    """A generic aiohttp.ClientError becomes GBFSError(api_connection_error)."""
    import aiohttp as _aiohttp

    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeSession:
        async def get(self, *args: Any, **kwargs: Any) -> Any:
            raise _aiohttp.ClientError("dns lookup failed")

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_connection_error"


async def test_shared_client_translates_invalid_json(hass: HomeAssistant) -> None:
    """A non-JSON body becomes GBFSError(api_invalid_response)."""
    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeResp:
        status = 200

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:
            return "this is not json"

    class _FakeSession:
        async def get(self, *args: Any, **kwargs: Any) -> _FakeResp:
            return _FakeResp()

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_invalid_response"


async def test_shared_client_rejects_non_dict_body(hass: HomeAssistant) -> None:
    """A JSON array body becomes GBFSError(api_invalid_response) too."""
    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeResp:
        status = 200

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:
            return "[1, 2, 3]"

    class _FakeSession:
        async def get(self, *args: Any, **kwargs: Any) -> _FakeResp:
            return _FakeResp()

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_invalid_response"


async def test_refresh_vehicle_types_populates_ebike_ids(hass: HomeAssistant) -> None:
    """vehicle_types feed with propulsion_type=electric_assist marks e-bike ids."""
    client = SharedSystemClient(hass, "nextbike_wr")

    async def fake_fetch(feed: str) -> dict[str, Any]:
        assert feed == "vehicle_types"
        return {
            "data": {
                "vehicle_types": [
                    {"vehicle_type_id": "192", "propulsion_type": "human"},
                    {"vehicle_type_id": "183", "propulsion_type": "electric_assist"},
                    {"vehicle_type_id": "", "propulsion_type": "electric"},  # skipped
                    {"vehicle_type_id": "200", "propulsion_type": "electric"},
                ]
            }
        }

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client._refresh_vehicle_types()
    assert client.is_ebike_type("183")
    assert client.is_ebike_type("200")
    assert not client.is_ebike_type("192")
    assert not client.is_ebike_type("")


async def test_refresh_vehicle_types_swallows_gbfs_error(hass: HomeAssistant) -> None:
    """If vehicle_types is down, the client logs and carries on."""
    client = SharedSystemClient(hass, "nextbike_wr")

    async def fake_fetch(feed: str) -> dict[str, Any]:
        raise GBFSError("api_http_error", status="404", reason="Not Found")

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        # Should NOT raise — vehicle_types is optional.
        await client._refresh_vehicle_types()
    assert client._vehicle_types == {}


async def test_shared_client_raises_for_unknown_system(hass: HomeAssistant) -> None:
    """_get_shared_client guards against system ids outside the registry."""
    from custom_components.nextbike_austria.coordinator import _get_shared_client

    with pytest.raises(ValueError, match="Unknown nextbike system"):
        _get_shared_client(hass, "nextbike_bogus")


async def test_shared_client_ttl_collapses_fetches(hass: HomeAssistant) -> None:
    """Two calls inside the TTL window hit the network once."""
    client = SharedSystemClient(hass, "nextbike_wr")

    calls: list[str] = []

    async def fake_fetch(feed: str) -> dict[str, Any]:
        calls.append(feed)
        if feed == "vehicle_types":
            return {"data": {"vehicle_types": []}}
        if feed == "station_information":
            return {"data": {"stations": [_station_snapshot()]}}
        if feed == "station_status":
            return {
                "data": {
                    "stations": [
                        {
                            "station_id": "68577989",
                            "num_bikes_available": 29,
                            "num_docks_available": 0,
                            "is_installed": True,
                            "is_renting": True,
                            "is_returning": True,
                            "last_reported": 1_776_780_838,
                            "vehicle_types_available": [],
                        }
                    ]
                }
            }
        return {"data": {}}

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch()
        first_call_count = len(calls)
        await client.async_fetch()  # within TTL → should not hit network again
    # Exactly three fetches on the first call (vehicle_types, info, status)
    # and zero on the second call.
    assert first_call_count == 3
    assert len(calls) == 3
