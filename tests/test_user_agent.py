"""Regression test — every outbound GBFS call must carry the canonical User-Agent.

A malformed User-Agent is silent failure (the integration still works, only
upstream log parsers break). This test guards two independent call sites:
the SharedSystemClient `_fetch_json` (per-tick GBFS feed refresh) and
config_flow `_fetch_stations` (live station-catalogue probe during entry
creation).
"""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant

from custom_components.nextbike_austria.const import USER_AGENT


class _CtxResp:
    """Adapt a fake response into an async context manager.

    Production code uses ``async with session.get(...) as resp``, so the
    fake ``session.get`` must return an object exposing
    ``__aenter__`` / ``__aexit__``.
    """

    def __init__(self, resp: Any) -> None:
        self._resp = resp

    async def __aenter__(self) -> Any:
        return self._resp

    async def __aexit__(self, *exc: Any) -> None:
        return None


def _ok_resp(body: object, status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status = status
    resp.headers = {}
    resp.raise_for_status = MagicMock()
    resp.text = AsyncMock(
        return_value=body if isinstance(body, str) else __import__("json").dumps(body)
    )
    resp.json = AsyncMock(return_value=body)
    return resp


class _RecordingSession:
    """A fake aiohttp session that captures the kwargs of each .get() call."""

    def __init__(self, response: MagicMock) -> None:
        self._response = response
        self.calls: list[dict[str, Any]] = []

    def get(self, *args: Any, **kwargs: Any) -> _CtxResp:
        self.calls.append({"args": args, "kwargs": kwargs})
        return _CtxResp(self._response)


async def test_shared_client_fetch_sends_user_agent(hass: HomeAssistant) -> None:
    """SharedSystemClient._fetch_json carries the canonical User-Agent."""
    from custom_components.nextbike_austria.coordinator import SharedSystemClient

    client = SharedSystemClient(hass, "nextbike_wr")
    body = {"data": {"stations": []}, "last_updated": 0}
    session = _RecordingSession(_ok_resp(body))
    client._session = session  # type: ignore[assignment]

    await client._fetch_json("station_information")

    assert session.calls, "expected exactly one GBFS GET"
    sent = session.calls[0]["kwargs"]["headers"]
    assert sent["User-Agent"] == USER_AGENT


async def test_config_flow_probe_sends_user_agent(hass: HomeAssistant) -> None:
    """config_flow._fetch_stations carries the canonical User-Agent."""
    from custom_components.nextbike_austria.config_flow import _fetch_stations

    body = {"data": {"stations": []}}
    session = _RecordingSession(_ok_resp(body))
    with patch(
        "custom_components.nextbike_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        await _fetch_stations(hass, "nextbike_wr")

    assert session.calls, "expected exactly one station-catalogue GET"
    sent = session.calls[0]["kwargs"]["headers"]
    assert sent["User-Agent"] == USER_AGENT
