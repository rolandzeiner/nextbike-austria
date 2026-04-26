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


class _CtxResp:
    """Adapt a fake response (or raise) into an async context manager.

    The production code uses ``async with session.get(...) as resp``, so
    the fake ``session.get`` must return an object exposing
    ``__aenter__`` / ``__aexit__``. ``raise_on_enter`` simulates failures
    happening at the request layer (timeouts, connection errors).
    """

    def __init__(
        self,
        resp: Any | None = None,
        *,
        raise_on_enter: Exception | None = None,
    ) -> None:
        self._resp = resp
        self._raise_on_enter = raise_on_enter

    async def __aenter__(self) -> Any:
        if self._raise_on_enter is not None:
            raise self._raise_on_enter
        return self._resp

    async def __aexit__(self, *exc: Any) -> None:
        return None


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
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            return _CtxResp(raise_on_enter=asyncio.TimeoutError())

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
        headers: dict[str, str] = {}

        def raise_for_status(self) -> None:
            raise _aiohttp.ClientResponseError(
                request_info=None,  # type: ignore[arg-type]
                history=(),
                status=500,
                message="Internal Server Error",
            )

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            return _CtxResp(_FakeResp())

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
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            return _CtxResp(raise_on_enter=_aiohttp.ClientError("dns lookup failed"))

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_connection_error"


async def test_shared_client_translates_invalid_json(hass: HomeAssistant) -> None:
    """A non-JSON body becomes GBFSError(api_invalid_response)."""
    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeResp:
        status = 200
        headers: dict[str, str] = {}

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:
            return "this is not json"

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            return _CtxResp(_FakeResp())

    client._session = _FakeSession()  # type: ignore[assignment]
    with pytest.raises(GBFSError) as excinfo:
        await client._fetch_json("station_information")
    assert excinfo.value.translation_key == "api_invalid_response"


async def test_shared_client_rejects_non_dict_body(hass: HomeAssistant) -> None:
    """A JSON array body becomes GBFSError(api_invalid_response) too."""
    client = SharedSystemClient(hass, "nextbike_wr")

    class _FakeResp:
        status = 200
        headers: dict[str, str] = {}

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:
            return "[1, 2, 3]"

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            return _CtxResp(_FakeResp())

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


async def test_battery_fetch_aggregates_per_station(hass: HomeAssistant) -> None:
    """free_bike_status → per-station avg/min/max/samples + sorted per-bike list."""
    client = SharedSystemClient(hass, "nextbike_wr")
    # Vehicle types are only needed for the id→name map used in tooltips;
    # battery % now comes straight from `current_fuel_percent`, so
    # `max_range_meters` is no longer read.
    client._vehicle_types = {  # type: ignore[assignment]
        "183": {
            "vehicle_type_id": "183",
            "propulsion_type": "electric_assist",
            "name": "E-Bike",
        },
        "192": {
            "vehicle_type_id": "192",
            "propulsion_type": "human",
            "name": "Classic Bike",
        },
    }

    async def fake_fetch(feed: str) -> dict[str, Any]:
        assert feed == "free_bike_status"
        return {
            "data": {
                "bikes": [
                    # Station A: two e-bikes at 50% and 100%
                    {"station_id": "A", "vehicle_type_id": "183", "current_fuel_percent": 0.5},
                    {"station_id": "A", "vehicle_type_id": "183", "current_fuel_percent": 1.0},
                    # Station A: one classic bike without fuel info — ignored
                    {"station_id": "A", "vehicle_type_id": "192"},
                    # Station B: one e-bike at 25%
                    {"station_id": "B", "vehicle_type_id": "183", "current_fuel_percent": 0.25},
                    # Bike without station_id — skipped
                    {"vehicle_type_id": "183", "current_fuel_percent": 0.4},
                ]
            }
        }

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()

    a = client.battery_stats("A")
    b = client.battery_stats("B")
    assert a is not None
    assert a["samples"] == 2
    assert a["avg_pct"] == pytest.approx(75.0)
    assert a["min_pct"] == pytest.approx(50.0)
    assert a["max_pct"] == pytest.approx(100.0)
    # Sorted descending — max charge first.
    assert [e["pct"] for e in a["per_bike"]] == [100.0, 50.0]
    # Type name resolved from vehicle_types.
    assert all(e["type"] == "E-Bike" for e in a["per_bike"])
    assert b is not None
    assert b["samples"] == 1
    assert b["avg_pct"] == pytest.approx(25.0)
    assert b["per_bike"] == [{"pct": 25.0, "type": "E-Bike"}]

    # vehicle_type_names map exposes id→name for classic + e-bike types.
    names = client.vehicle_type_names()
    assert names["183"] == "E-Bike"
    assert names["192"] == "Classic Bike"


async def test_battery_fetch_tracks_disabled_bikes(hass: HomeAssistant) -> None:
    """Disabled bikes surface as disabled_count + types, regardless of reserved flag."""
    client = SharedSystemClient(hass, "nextbike_wr")
    client._vehicle_types = {  # type: ignore[assignment]
        "183": {"vehicle_type_id": "183", "propulsion_type": "electric_assist", "name": "E-Bike"},
        "192": {"vehicle_type_id": "192", "propulsion_type": "human", "name": "Classic Bike"},
    }

    async def fake_fetch(feed: str) -> dict[str, Any]:
        return {
            "data": {
                "bikes": [
                    # Station A: one disabled classic, one disabled e-bike,
                    # and a third disabled+reserved bike — the disabled
                    # flag wins, it counts as disabled only.
                    {"station_id": "A", "vehicle_type_id": "192", "is_disabled": True},
                    {"station_id": "A", "vehicle_type_id": "183", "is_disabled": True},
                    {"station_id": "A", "vehicle_type_id": "192", "is_reserved": True, "is_disabled": True},
                    # Station B: a reserved bike (counts as reserved, not disabled)
                    {"station_id": "B", "vehicle_type_id": "192", "is_reserved": True, "is_disabled": False},
                    # Disabled floating bike (no station_id) — skipped
                    {"vehicle_type_id": "192", "is_disabled": True},
                ]
            }
        }

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()

    a = client.battery_stats("A")
    b = client.battery_stats("B")
    assert a is not None
    assert a["disabled_count"] == 3
    assert sorted(a["disabled_types"]) == ["Classic Bike", "Classic Bike", "E-Bike"]
    # Disabled wins over reserved — no reserved bucket on station A.
    assert "reserved_count" not in a
    assert b is not None
    assert b["reserved_count"] == 1
    assert "disabled_count" not in b


async def test_battery_fetch_tracks_reserved_bikes(hass: HomeAssistant) -> None:
    """Reserved (and not disabled) bikes surface as reserved_count + types."""
    client = SharedSystemClient(hass, "nextbike_wr")
    client._vehicle_types = {  # type: ignore[assignment]
        "183": {"vehicle_type_id": "183", "propulsion_type": "electric_assist", "name": "E-Bike"},
        "192": {"vehicle_type_id": "192", "propulsion_type": "human", "name": "Classic Bike"},
    }

    async def fake_fetch(feed: str) -> dict[str, Any]:
        return {
            "data": {
                "bikes": [
                    # Station A: one reserved classic + one reserved e-bike
                    {"station_id": "A", "vehicle_type_id": "192", "is_reserved": True, "is_disabled": False},
                    {"station_id": "A", "vehicle_type_id": "183", "is_reserved": True, "is_disabled": False},
                    # Station A: a reserved AND disabled bike is skipped
                    {"station_id": "A", "vehicle_type_id": "192", "is_reserved": True, "is_disabled": True},
                    # Station B: just an available bike (not reserved)
                    {"station_id": "B", "vehicle_type_id": "192", "is_reserved": False, "is_disabled": False},
                    # Reserved floating bike (no station_id) — skipped
                    {"vehicle_type_id": "183", "is_reserved": True, "is_disabled": False},
                ]
            }
        }

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()

    a = client.battery_stats("A")
    b = client.battery_stats("B")
    assert a is not None
    assert a["reserved_count"] == 2
    assert sorted(a["reserved_types"]) == ["Classic Bike", "E-Bike"]
    # Reserved-only stations carry no battery keys.
    assert "samples" not in a
    # Station with no reserved and no battery samples isn't recorded.
    assert b is None


async def test_battery_fetch_respects_ttl(hass: HomeAssistant) -> None:
    """Within the 20-min TTL window, a second call doesn't re-fetch."""
    client = SharedSystemClient(hass, "nextbike_wr")
    client._vehicle_types = {  # type: ignore[assignment]
        "183": {"vehicle_type_id": "183", "propulsion_type": "electric_assist", "name": "E-Bike"},
    }
    calls = 0

    async def fake_fetch(feed: str) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {
            "data": {
                "bikes": [
                    {"station_id": "A", "vehicle_type_id": "183", "current_fuel_percent": 0.5},
                ]
            }
        }

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()
        await client.async_fetch_battery()  # within TTL — should collapse

    assert calls == 1


async def test_battery_fetch_backoff_on_upstream_failure(hass: HomeAssistant) -> None:
    """A failed free_bike_status fetch still arms the TTL — no hammering."""
    client = SharedSystemClient(hass, "nextbike_wr")
    client._vehicle_types = {  # type: ignore[assignment]
        "183": {"vehicle_type_id": "183", "propulsion_type": "electric_assist", "name": "E-Bike"},
    }
    calls = 0

    async def fake_fetch(feed: str) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        raise GBFSError("api_http_error", status="503", reason="Service Unavailable")

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()
        await client.async_fetch_battery()  # within TTL — must not retry

    assert calls == 1


async def test_battery_fetch_backoff_on_empty_result(hass: HomeAssistant) -> None:
    """Successful but empty fetch (no e-bikes/reserved/disabled) honours TTL."""
    client = SharedSystemClient(hass, "nextbike_wr")
    client._vehicle_types = {  # type: ignore[assignment]
        "192": {"vehicle_type_id": "192", "propulsion_type": "human", "name": "Classic Bike"},
    }
    calls = 0

    async def fake_fetch(feed: str) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        # All bikes lack station_id / battery / reserved / disabled —
        # aggregates dict ends up empty.
        return {"data": {"bikes": [{"vehicle_type_id": "192"}]}}

    with patch.object(SharedSystemClient, "_fetch_json", side_effect=fake_fetch):
        await client.async_fetch_battery()
        await client.async_fetch_battery()  # within TTL — must not retry

    assert calls == 1


async def test_fetch_json_uses_conditional_get(hass: HomeAssistant) -> None:
    """Last-Modified is captured and sent back as If-Modified-Since; 304 reuses cache."""
    client = SharedSystemClient(hass, "nextbike_wr")

    seen_headers: list[dict[str, str]] = []
    response_status = {"status": 200}

    class _FirstResp:
        status = 200
        headers = {"Last-Modified": "Wed, 21 Apr 2026 12:00:00 GMT"}

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:
            return '{"data": {"stations": [{"station_id": "1"}]}}'

    class _NotModifiedResp:
        status = 304
        headers: dict[str, str] = {}

        def raise_for_status(self) -> None:
            return None

        async def text(self) -> str:  # pragma: no cover — not reached on 304
            return ""

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
            seen_headers.append(dict(kwargs.get("headers") or {}))
            if response_status["status"] == 304:
                return _CtxResp(_NotModifiedResp())
            return _CtxResp(_FirstResp())

    client._session = _FakeSession()  # type: ignore[assignment]

    first = await client._fetch_json("station_information")
    assert first["data"]["stations"][0]["station_id"] == "1"
    # First request: no conditional header (no prior Last-Modified).
    assert "If-Modified-Since" not in seen_headers[0]

    response_status["status"] = 304
    second = await client._fetch_json("station_information")
    # Second request: conditional header sent, cached body returned verbatim.
    assert seen_headers[1]["If-Modified-Since"] == "Wed, 21 Apr 2026 12:00:00 GMT"
    assert second is first


async def test_coordinator_skips_battery_when_opt_off(hass: HomeAssistant) -> None:
    """With track_e_bike_range off, the coordinator doesn't hit the battery feed."""
    entry = _make_entry()
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_stations({"68577989": _station_snapshot()})
    fake.battery_calls = 0  # type: ignore[attr-defined]

    async def mock_fetch_battery(*args: Any, **kwargs: Any) -> None:
        fake.battery_calls += 1  # type: ignore[attr-defined]

    fake.async_fetch_battery = mock_fetch_battery  # type: ignore[attr-defined]

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        await coordinator.async_refresh()

    assert fake.battery_calls == 0  # type: ignore[attr-defined]


async def test_coordinator_merges_battery_when_opt_on(hass: HomeAssistant) -> None:
    """With track_e_bike_range on, the coordinator merges battery stats."""
    from custom_components.nextbike_austria.const import CONF_TRACK_E_BIKE_RANGE

    entry = _make_entry({CONF_TRACK_E_BIKE_RANGE: True})
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_stations({"68577989": _station_snapshot()})

    async def mock_fetch_battery(*args: Any, **kwargs: Any) -> None:
        return None

    per_bike_list = [
        {"pct": 95.0, "type": "E-Bike"},
        {"pct": 76.3, "type": "E-Bike"},
        {"pct": 60.0, "type": "E-Bike"},
        {"pct": 40.0, "type": "E-Bike"},
    ]

    def fake_battery_stats(station_id: str) -> dict[str, Any] | None:
        if station_id == "68577989":
            return {
                "avg_pct": 76.3,
                "min_pct": 40.0,
                "max_pct": 95.0,
                "samples": 4,
                "per_bike": per_bike_list,
            }
        return None

    def fake_vehicle_type_names() -> dict[str, str]:
        return {"183": "E-Bike", "192": "Classic Bike"}

    fake.async_fetch_battery = mock_fetch_battery  # type: ignore[attr-defined]
    fake.battery_stats = fake_battery_stats  # type: ignore[attr-defined]
    fake.vehicle_type_names = fake_vehicle_type_names  # type: ignore[attr-defined]

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        await coordinator.async_refresh()

    assert coordinator.data is not None
    assert coordinator.data["_e_bike_avg_battery_pct"] == 76.3
    assert coordinator.data["_e_bike_min_battery_pct"] == 40.0
    assert coordinator.data["_e_bike_max_battery_pct"] == 95.0
    assert coordinator.data["_e_bike_range_samples"] == 4
    assert coordinator.data["_e_bike_battery_list"] == per_bike_list
    assert coordinator.data["_vehicle_type_names"] == {"183": "E-Bike", "192": "Classic Bike"}


async def test_coordinator_merges_reserved_when_opt_on(hass: HomeAssistant) -> None:
    """Reserved-only stats also flow into coordinator.data (no battery needed)."""
    from custom_components.nextbike_austria.const import CONF_TRACK_E_BIKE_RANGE

    entry = _make_entry({CONF_TRACK_E_BIKE_RANGE: True})
    entry.add_to_hass(hass)

    fake = _FakeClient()
    fake.set_stations({"68577989": _station_snapshot()})

    async def mock_fetch_battery(*args: Any, **kwargs: Any) -> None:
        return None

    def fake_battery_stats(station_id: str) -> dict[str, Any] | None:
        if station_id == "68577989":
            # A station that has reserved bikes but no battery samples —
            # the merge path must still surface the reserved keys.
            return {
                "reserved_count": 2,
                "reserved_types": ["Classic Bike", "E-Bike"],
            }
        return None

    def fake_vehicle_type_names() -> dict[str, str]:
        return {"183": "E-Bike", "192": "Classic Bike"}

    fake.async_fetch_battery = mock_fetch_battery  # type: ignore[attr-defined]
    fake.battery_stats = fake_battery_stats  # type: ignore[attr-defined]
    fake.vehicle_type_names = fake_vehicle_type_names  # type: ignore[attr-defined]

    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        coordinator = NextbikeStationCoordinator(hass, entry)
        await coordinator.async_refresh()

    assert coordinator.data is not None
    assert coordinator.data["_bikes_reserved"] == 2
    assert coordinator.data["_bikes_reserved_types"] == ["Classic Bike", "E-Bike"]
    # Battery keys are absent when only reserved info was reported.
    assert "_e_bike_avg_battery_pct" not in coordinator.data


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
