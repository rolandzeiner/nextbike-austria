"""Tests for the HA-free GBFS client in api.py.

No `hass` fixture in the client tests: the client takes a session and a
User-Agent and must work without Home Assistant. The first test keeps it
that way. The last test is the config-flow side of the shared parser.
"""

from __future__ import annotations

import ast
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import aiohttp
import pytest
from homeassistant.core import HomeAssistant

from custom_components.nextbike_austria import api
from custom_components.nextbike_austria.api import (
    NextbikeConnectionError,
    NextbikeHttpError,
    NextbikePayloadError,
    NextbikeTimeoutError,
    fetch_feed,
    gbfs_feed_url,
)

from ._fakes import CtxResp, RecordingSession, ok_resp

UA = "test-agent/1.0"


def test_api_module_imports_nothing_from_home_assistant() -> None:
    """api.py may import only the standard library and aiohttp.

    A relative import counts as a violation too: const.py imports Home
    Assistant for its User-Agent, so `from .const import …` would pull HA
    back in through the side door.
    """
    tree = ast.parse(Path(api.__file__).read_text(encoding="utf-8"))
    offenders: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.level > 0 or (node.module or "").startswith("homeassistant"):
                offenders.append(f"from {'.' * node.level}{node.module or ''}")
        elif isinstance(node, ast.Import):
            offenders += [
                a.name for a in node.names if a.name.startswith("homeassistant")
            ]
    assert offenders == []


class _RaisingSession:
    def __init__(self, err: Exception) -> None:
        self._err = err

    def get(self, *args: Any, **kwargs: Any) -> CtxResp:
        return CtxResp(raise_on_enter=self._err)


async def _fetch(session: Any, **kwargs: Any) -> dict[str, Any]:
    return await fetch_feed(
        session, "nextbike_wr", "station_status", user_agent=UA, **kwargs
    )


def test_feed_url() -> None:
    assert gbfs_feed_url("nextbike_wr", "station_status") == (
        "https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_wr/en/station_status.json"
    )


async def test_fetch_sends_url_headers_and_timeout() -> None:
    session = RecordingSession(ok_resp({"data": {}}))
    assert await _fetch(session) == {"data": {}}

    call = session.calls[0]
    assert call["args"] == (gbfs_feed_url("nextbike_wr", "station_status"),)
    assert call["kwargs"]["headers"] == {
        "User-Agent": UA,
        "Accept": "application/json",
    }
    assert call["kwargs"]["timeout"].total == api.FEED_TIMEOUT_SECONDS


async def test_fetch_honours_a_shorter_timeout() -> None:
    session = RecordingSession(ok_resp({"data": {}}))
    await _fetch(session, timeout_seconds=api.CATALOGUE_TIMEOUT_SECONDS)
    assert session.calls[0]["kwargs"]["timeout"].total == 10


async def test_fetch_tolerates_raw_control_characters() -> None:
    """nextbike sometimes ships a raw CRLF inside a string; strict JSON rejects it."""
    session = RecordingSession(ok_resp('{"data": {"name": "line\r\nbreak"}}'))
    assert await _fetch(session) == {"data": {"name": "line\r\nbreak"}}


@pytest.mark.parametrize(
    ("body", "error"),
    [("not json", None), ("[1, 2, 3]", "expected dict, got list")],
)
async def test_fetch_rejects_a_body_that_is_not_an_object(
    body: str, error: str | None
) -> None:
    with pytest.raises(NextbikePayloadError) as exc:
        await _fetch(RecordingSession(ok_resp(body)))
    assert exc.value.status == 200
    if error is not None:
        assert exc.value.error == error


@pytest.mark.parametrize(
    ("status", "retry_after"), [(429, 120.0), (503, 120.0), (500, None)]
)
async def test_http_error_carries_retry_after_on_429_and_503_only(
    status: int, retry_after: float | None
) -> None:
    resp = ok_resp({})
    resp.status = status
    resp.raise_for_status = MagicMock(
        side_effect=aiohttp.ClientResponseError(
            MagicMock(),
            (),
            status=status,
            message="nope",
            headers={"Retry-After": "120"},  # type: ignore[arg-type]
        )
    )
    with pytest.raises(NextbikeHttpError) as exc:
        await _fetch(RecordingSession(resp))
    assert (exc.value.status, exc.value.reason) == (status, "nope")
    assert exc.value.retry_after == retry_after


@pytest.mark.parametrize(
    ("raised", "expected"),
    [
        (TimeoutError(), NextbikeTimeoutError),
        (aiohttp.ClientConnectionError("refused"), NextbikeConnectionError),
        (aiohttp.ClientPayloadError("cut off"), NextbikeConnectionError),
    ],
)
async def test_transport_errors_map_to_api_errors(
    raised: Exception, expected: type[Exception]
) -> None:
    with pytest.raises(expected) as exc:
        await _fetch(_RaisingSession(raised))
    assert exc.value.__cause__ is raised


async def test_timeout_error_names_the_timeout() -> None:
    with pytest.raises(NextbikeTimeoutError) as exc:
        await _fetch(_RaisingSession(TimeoutError()))
    assert exc.value.seconds == api.FEED_TIMEOUT_SECONDS


async def test_config_flow_catalogue_survives_control_characters(
    hass: HomeAssistant,
) -> None:
    """The setup flow parses a feed the coordinator can parse.

    It used to have its own strict `resp.json()`, so a stray control
    character that the coordinator shrugged off failed setup with
    cannot_connect.
    """
    from custom_components.nextbike_austria.config_flow import _fetch_stations

    body = '{"data": {"stations": [{"station_id": "1", "name": "Oper\r\n"}]}}'
    with patch(
        "custom_components.nextbike_austria.config_flow.async_get_clientsession",
        return_value=RecordingSession(ok_resp(body)),
    ):
        stations = await _fetch_stations(hass, "nextbike_wr")
    assert stations == [{"station_id": "1", "name": "Oper\r\n"}]
