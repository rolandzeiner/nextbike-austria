"""Regression tests for what every outbound GBFS call sends.

A malformed User-Agent is silent failure (the integration still works, only
upstream log parsers break). These tests guard two independent call sites:
the SharedSystemClient `_fetch_json` (per-tick GBFS feed refresh) and
config_flow `_fetch_stations` (live station-catalogue probe during entry
creation). The header-shape test keeps two dead ends from coming back: a
pinned Accept-Encoding and a conditional-GET validator.
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


async def test_requests_leave_encoding_to_aiohttp_and_send_no_validator(
    hass: HomeAssistant,
) -> None:
    """No pinned Accept-Encoding, and no If-Modified-Since on a repeat fetch.

    aiohttp's default offer is wider than a pinned `gzip`, and nextbike
    regenerates every feed's Last-Modified each minute, so a validator
    could never earn a 304 at our intervals (measured, see const.py).
    """
    from custom_components.nextbike_austria.coordinator import SharedSystemClient

    client = SharedSystemClient(hass, "nextbike_wr")
    resp = ok_resp({"data": {"stations": []}, "last_updated": 0})
    resp.headers = {"Last-Modified": "Tue, 29 Sep 2026 18:28:01 GMT"}
    session = RecordingSession(resp)
    client._session = session  # type: ignore[assignment]

    await client._fetch_json("station_status")
    await client._fetch_json("station_status")

    for call in session.calls:
        sent = call["kwargs"]["headers"]
        assert "Accept-Encoding" not in sent
        assert "If-Modified-Since" not in sent
