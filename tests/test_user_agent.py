"""Regression test — every outbound GBFS call must carry the canonical User-Agent.

A malformed User-Agent is silent failure (the integration still works, only
upstream log parsers break). This test guards two independent call sites:
the SharedSystemClient `_fetch_json` (per-tick GBFS feed refresh) and
config_flow `_fetch_stations` (live station-catalogue probe during entry
creation).
"""
from __future__ import annotations

from unittest.mock import patch

from homeassistant.core import HomeAssistant

from custom_components.nextbike_austria.const import USER_AGENT

from ._fakes import RecordingSession, ok_resp


async def test_shared_client_fetch_sends_user_agent(hass: HomeAssistant) -> None:
    """SharedSystemClient._fetch_json carries the canonical User-Agent."""
    from custom_components.nextbike_austria.coordinator import SharedSystemClient

    client = SharedSystemClient(hass, "nextbike_wr")
    body = {"data": {"stations": []}, "last_updated": 0}
    session = RecordingSession(ok_resp(body))
    client._session = session  # type: ignore[assignment]

    await client._fetch_json("station_information")

    assert session.calls, "expected exactly one GBFS GET"
    sent = session.calls[0]["kwargs"]["headers"]
    assert sent["User-Agent"] == USER_AGENT


async def test_config_flow_probe_sends_user_agent(hass: HomeAssistant) -> None:
    """config_flow._fetch_stations carries the canonical User-Agent."""
    from custom_components.nextbike_austria.config_flow import _fetch_stations

    body = {"data": {"stations": []}}
    session = RecordingSession(ok_resp(body))
    with patch(
        "custom_components.nextbike_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        await _fetch_stations(hass, "nextbike_wr")

    assert session.calls, "expected exactly one station-catalogue GET"
    sent = session.calls[0]["kwargs"]["headers"]
    assert sent["User-Agent"] == USER_AGENT
