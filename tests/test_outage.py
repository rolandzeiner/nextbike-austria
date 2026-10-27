"""Tests for the per-system upstream-outage Repairs issue (outage.py)."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import suppress
from datetime import timedelta
from typing import Any
from unittest.mock import patch

import aiohttp
import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.nextbike_austria.api import gbfs_feed_url
from custom_components.nextbike_austria.const import (
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    DOMAIN,
)
from custom_components.nextbike_austria.coordinator import (
    GBFSError,
    SharedSystemClient,
)
from custom_components.nextbike_austria.outage import (
    OUTAGE_DATA,
    OUTAGE_ISSUE_ID,
    OUTAGE_MIN_SECONDS,
    Fault,
    async_clear_outage,
    async_note_fault,
    classify,
)

from .conftest import BASE_ENTRY_DATA, station_snapshot

WIEN = "nextbike_wr"
INNSBRUCK = "nextbike_si"
_FEEDS = ("vehicle_types", "station_information", "station_status")
_PAST_THRESHOLD = timedelta(seconds=OUTAGE_MIN_SECONDS + 1)


@pytest.fixture(autouse=True)
async def _real_http_layer(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> AsyncGenerator[None]:
    """Opt out of conftest's session tripwire, into aiohttp's mocker.

    Mocked at the HTTP layer, below the feed point, so every test here goes
    through `_fetch_json`'s own status and body handling, as an outage would.
    """
    session = aioclient_mock.create_session(hass.loop)
    with patch(
        "custom_components.nextbike_austria.coordinator.async_get_clientsession",
        return_value=session,
    ):
        yield
    await session.close()


def _make_entry(system_id: str = WIEN, station_id: str = "68577989") -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data={
            **BASE_ENTRY_DATA,
            CONF_SYSTEM_ID: system_id,
            CONF_STATION_ID: station_id,
        },
        options={},
        title=BASE_ENTRY_DATA[CONF_STATION_NAME],
        unique_id=f"{system_id}_{station_id}",
    )


def _answer(
    aioclient_mock: AiohttpClientMocker, system_id: str = WIEN, **response: Any
) -> None:
    """Make every station feed of `system_id` answer with `response`."""
    aioclient_mock.clear_requests()
    for feed in _FEEDS:
        aioclient_mock.get(gbfs_feed_url(system_id, feed), **response)


def _healthy(aioclient_mock: AiohttpClientMocker, system_id: str = WIEN) -> None:
    """Every feed answers 200, with Hoher Markt in the station data."""
    aioclient_mock.clear_requests()
    stations = {"data": {"stations": [station_snapshot()]}}
    aioclient_mock.get(gbfs_feed_url(system_id, "vehicle_types"), json={"data": {}})
    aioclient_mock.get(gbfs_feed_url(system_id, "station_information"), json=stations)
    aioclient_mock.get(gbfs_feed_url(system_id, "station_status"), json=stations)


async def _fetch(
    hass: HomeAssistant,
    aioclient_mock: AiohttpClientMocker,
    system_id: str = WIEN,
    **response: Any,
) -> None:
    """One real refresh of `system_id`, every feed answering with `response`.

    A fresh client each time, as after a reload of a sole entry, which pops
    the old one: the outage has to survive that, so its state must not live
    on the client. Fresh also means no failure window to replay from.
    """
    if response:
        _answer(aioclient_mock, system_id, **response)
    else:
        _healthy(aioclient_mock, system_id)
    with suppress(GBFSError):
        await SharedSystemClient(hass, system_id).async_fetch()


def _issue(hass: HomeAssistant, system_id: str = WIEN) -> ir.IssueEntry | None:
    return ir.async_get(hass).async_get_issue(DOMAIN, f"{OUTAGE_ISSUE_ID}_{system_id}")


def _http(status: int) -> GBFSError:
    return GBFSError("api_http_error", status=str(status), reason="")


@pytest.mark.parametrize(
    ("err", "expected"),
    [
        (_http(502), Fault.OUTAGE),
        (_http(500), Fault.OUTAGE),
        (_http(503), Fault.OUTAGE),
        (GBFSError("api_invalid_response", status="200", error="x"), Fault.OUTAGE),
        (_http(404), Fault.ANSWERED),
        (_http(429), Fault.ANSWERED),
        (GBFSError("api_timeout", seconds="15"), Fault.INCONCLUSIVE),
        (
            GBFSError("api_connection_error", error_type="x", error="refused"),
            Fault.INCONCLUSIVE,
        ),
        (AttributeError("'list' object has no attribute 'get'"), Fault.INCONCLUSIVE),
        (RuntimeError("unforeseen"), Fault.INCONCLUSIVE),
    ],
)
def test_classify(err: Exception, expected: Fault) -> None:
    """Only failures that prove a broken server count against nextbike."""
    assert classify(err) is expected


async def test_issue_appears_only_after_the_threshold(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """A 502 starts the clock; the issue waits until it has run out."""
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is None

    freezer.tick(timedelta(seconds=OUTAGE_MIN_SECONDS - 60))
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is None

    freezer.tick(timedelta(seconds=61))
    await _fetch(hass, aioclient_mock, status=502)
    issue = _issue(hass)
    assert issue is not None
    assert issue.translation_key == OUTAGE_ISSUE_ID
    assert issue.translation_placeholders == {"system": "Wien — WienMobil Rad"}
    assert issue.severity is ir.IssueSeverity.WARNING
    assert issue.is_fixable is False
    assert issue.is_persistent is False


async def test_one_fault_never_raises_however_long_ago_it_began(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """The time alone isn't enough; the outage needs a second fault."""
    async_note_fault(hass, Fault.OUTAGE, WIEN)
    freezer.tick(_PAST_THRESHOLD * 10)
    assert _issue(hass) is None
    assert hass.data[OUTAGE_DATA][WIEN].failures == 1


async def test_two_faults_inside_the_window_raise_nothing(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Back-to-back setup retries after a restart must not raise the issue."""
    async_note_fault(hass, Fault.OUTAGE, WIEN)
    freezer.tick(timedelta(seconds=10))
    async_note_fault(hass, Fault.OUTAGE, WIEN)
    freezer.tick(timedelta(seconds=20))
    async_note_fault(hass, Fault.OUTAGE, WIEN)
    assert _issue(hass) is None


async def test_recovery_clears_the_issue(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """The first good answer ends the outage and removes the issue."""
    await _fetch(hass, aioclient_mock, status=503)
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, status=503)
    assert _issue(hass) is not None

    await _fetch(hass, aioclient_mock)
    assert _issue(hass) is None
    assert WIEN not in hass.data[OUTAGE_DATA]

    # The next outage has to earn its own threshold again.
    await _fetch(hass, aioclient_mock, status=503)
    assert _issue(hass) is None


async def test_an_unreadable_body_counts_as_an_outage(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """A 200 whose body isn't a JSON object is a fault on nextbike's side."""
    await _fetch(hass, aioclient_mock, text="<html>Wartung</html>")
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, json=["not", "an", "object"])
    assert _issue(hass) is not None


async def test_network_errors_never_start_the_clock(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """Timeouts and connection errors can be the user's own network."""
    await _fetch(hass, aioclient_mock, exc=TimeoutError())
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, exc=aiohttp.ClientConnectionError("refused"))
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is None


async def test_network_errors_keep_a_running_outage_going(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """A timeout in the middle of an outage doesn't reset its clock."""
    await _fetch(hass, aioclient_mock, status=502)
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, exc=TimeoutError())
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is not None


async def test_a_real_client_error_answer_ends_the_outage(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """A 4xx comes from a working server, so the clock starts over."""
    await _fetch(hass, aioclient_mock, status=502)
    freezer.tick(timedelta(seconds=OUTAGE_MIN_SECONDS - 60))
    await _fetch(hass, aioclient_mock, status=404)
    freezer.tick(timedelta(seconds=120))
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is None


async def test_a_rate_limit_answer_ends_the_outage(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """A 429 is a working server telling us to slow down, not an outage."""
    await _fetch(hass, aioclient_mock, status=502)
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, status=429)
    await _fetch(hass, aioclient_mock, status=502)
    assert _issue(hass) is None


async def test_a_replay_inside_the_failure_window_is_not_counted(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    """Only an attempt that went out counts; a replayed failure made none."""
    client = SharedSystemClient(hass, WIEN)
    _answer(aioclient_mock, status=502)
    with pytest.raises(GBFSError):
        await client.async_fetch()
    with pytest.raises(GBFSError) as replay:
        await client.async_fetch(force=True)
    assert replay.value.replayed
    assert hass.data[OUTAGE_DATA][WIEN].failures == 1


async def test_a_failing_battery_feed_is_not_an_outage(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    """The opt-in battery fetch is a side channel and stays out of it."""
    for feed in ("vehicle_types", "free_bike_status"):
        aioclient_mock.get(gbfs_feed_url(WIEN, feed), status=502)
    await SharedSystemClient(hass, WIEN).async_fetch_battery()
    assert OUTAGE_DATA not in hass.data


async def test_issue_is_created_once(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Later failures leave the raised issue alone instead of re-creating it."""
    async_note_fault(hass, Fault.OUTAGE, WIEN)
    freezer.tick(_PAST_THRESHOLD)
    with patch(
        "custom_components.nextbike_austria.outage.ir.async_create_issue"
    ) as create:
        async_note_fault(hass, Fault.OUTAGE, WIEN)
        async_note_fault(hass, Fault.OUTAGE, WIEN)
    assert create.call_count == 1


async def test_each_system_keeps_its_own_clock_and_issue(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """Innsbruck answering doesn't end Wien's outage, and vice versa."""
    await _fetch(hass, aioclient_mock, WIEN, status=502)
    await _fetch(hass, aioclient_mock, INNSBRUCK, status=502)
    freezer.tick(_PAST_THRESHOLD)
    await _fetch(hass, aioclient_mock, WIEN, status=502)
    await _fetch(hass, aioclient_mock, INNSBRUCK)

    assert _issue(hass, WIEN) is not None
    assert _issue(hass, INNSBRUCK) is None
    assert set(hass.data[OUTAGE_DATA]) == {WIEN}


async def test_clear_outage_forgets_state_and_issue(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Clearing every scope drops both the clocks and the issues."""
    for system_id in (WIEN, INNSBRUCK):
        async_note_fault(hass, Fault.OUTAGE, system_id)
    freezer.tick(_PAST_THRESHOLD)
    for system_id in (WIEN, INNSBRUCK):
        async_note_fault(hass, Fault.OUTAGE, system_id)
    assert _issue(hass, WIEN) is not None

    async_clear_outage(hass)
    assert _issue(hass, WIEN) is None
    assert _issue(hass, INNSBRUCK) is None
    assert OUTAGE_DATA not in hass.data


async def test_removing_the_last_entry_of_a_system_clears_its_outage(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """A system's issue goes with its last entry, and only then."""
    wien_a = _make_entry(WIEN, "1")
    wien_b = _make_entry(WIEN, "2")
    innsbruck = _make_entry(INNSBRUCK, "3")
    for entry in (wien_a, wien_b, innsbruck):
        entry.add_to_hass(hass)
    for system_id in (WIEN, INNSBRUCK):
        async_note_fault(hass, Fault.OUTAGE, system_id)
    freezer.tick(_PAST_THRESHOLD)
    for system_id in (WIEN, INNSBRUCK):
        async_note_fault(hass, Fault.OUTAGE, system_id)

    with patch(
        "custom_components.nextbike_austria."
        "card_registration.JSModuleRegistration.async_unregister",
    ):
        assert await hass.config_entries.async_remove(wien_a.entry_id)
        assert _issue(hass, WIEN) is not None

        assert await hass.config_entries.async_remove(wien_b.entry_id)
        assert _issue(hass, WIEN) is None
        assert _issue(hass, INNSBRUCK) is not None

        assert await hass.config_entries.async_remove(innsbruck.entry_id)
        await hass.async_block_till_done()
    assert _issue(hass, INNSBRUCK) is None
    assert OUTAGE_DATA not in hass.data


async def test_entries_in_setup_retry_raise_and_clear_the_issue(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """An upstream outage, end to end through real config-entry setups.

    The shape of the 2026-10-21 Wiener Linien incident: the feed answers 503
    for as long as it lasts, so every entry sits in setup retry and no
    coordinator timer runs. The setup attempts themselves have to feed the
    clock, or the issue never appears in exactly the case it was built for.
    Pinned here because nobody can stage a real outage to check.
    """
    _answer(aioclient_mock, status=503)
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY
    assert _issue(hass) is None

    freezer.tick(_PAST_THRESHOLD)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY
    issue = _issue(hass)
    assert issue is not None
    assert issue.translation_placeholders == {"system": "Wien — WienMobil Rad"}

    freezer.tick(_PAST_THRESHOLD)
    _healthy(aioclient_mock)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    assert _issue(hass) is None
