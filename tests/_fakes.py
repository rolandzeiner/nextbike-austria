"""Shared test doubles for Nextbike Austria tests.

Hoisted out of the individual test modules so divergence stays impossible
— every fake here exposes the same public surface as
``SharedSystemClient`` / ``aiohttp.ClientResponse`` so tests inject data
through the production seams instead of poking private attributes.
"""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock


class CtxResp:
    """Adapt a fake response (or raise) into an async context manager.

    Production code uses ``async with session.get(...) as resp``, so the
    fake ``session.get`` must return an object exposing
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


def ok_resp(body: object, status: int = 200) -> MagicMock:
    """Build a fake aiohttp response that returns ``body`` as JSON/text."""
    import json

    resp = MagicMock()
    resp.status = status
    resp.headers = {}
    resp.raise_for_status = MagicMock()
    resp.text = AsyncMock(
        return_value=body if isinstance(body, str) else json.dumps(body)
    )
    resp.json = AsyncMock(return_value=body)
    return resp


class RecordingSession:
    """A fake aiohttp session that captures the kwargs of each .get() call."""

    def __init__(self, response: MagicMock) -> None:
        self._response = response
        self.calls: list[dict[str, Any]] = []

    def get(self, *args: Any, **kwargs: Any) -> CtxResp:
        self.calls.append({"args": args, "kwargs": kwargs})
        return CtxResp(self._response)


class FakeClient:
    """Minimal in-memory ``SharedSystemClient`` replacement.

    Constructor + setter methods drive every piece of state — no test
    should reach in and assign ``_vehicle_types`` / ``_battery_*``
    directly. Coordinator / sensor tests use this to avoid spinning up
    the real GBFS fetch path.
    """

    def __init__(
        self,
        system_id: str = "nextbike_wr",
        *,
        ebike_type_ids: frozenset[str] = frozenset({"183"}),
    ) -> None:
        self.system_id = system_id
        self._stations: dict[str, dict[str, Any]] = {}
        self._raise: Exception | None = None
        self._ebike_ids: frozenset[str] = ebike_type_ids
        self._battery_by_station: dict[str, dict[str, Any]] = {}
        self._vehicle_type_names: dict[str, str] = {}
        self.fetch_calls: int = 0
        self.battery_calls: int = 0

    # ----- production interface -----------------------------------------

    async def async_fetch(self, *, force: bool = False) -> None:
        self.fetch_calls += 1
        if self._raise is not None:
            raise self._raise

    async def async_fetch_battery(self, *, force: bool = False) -> None:
        self.battery_calls += 1

    def station(self, station_id: str) -> dict[str, Any] | None:
        return self._stations.get(station_id)

    def is_ebike_type(self, tid: str) -> bool:
        return tid in self._ebike_ids

    def battery_stats(self, station_id: str) -> dict[str, Any] | None:
        return self._battery_by_station.get(station_id)

    def vehicle_type_names(self) -> dict[str, str]:
        return dict(self._vehicle_type_names)

    def ebike_type_ids(self) -> list[str]:
        return sorted(self._ebike_ids)

    # ----- test seams ---------------------------------------------------

    def set_stations(self, stations: dict[str, dict[str, Any]]) -> None:
        self._stations = stations

    def set_error(self, err: Exception | None) -> None:
        self._raise = err

    def set_battery(
        self,
        per_station: dict[str, dict[str, Any]],
        *,
        type_names: dict[str, str] | None = None,
    ) -> None:
        self._battery_by_station = per_station
        if type_names is not None:
            self._vehicle_type_names = type_names
