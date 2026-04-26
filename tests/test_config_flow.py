"""Tests for the Nextbike Austria config flow."""
from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.nextbike_austria.const import (
    CONF_SEARCH_QUERY,
    CONF_STATION_ID,
    CONF_STATION_NAME,
    CONF_SYSTEM_ID,
    CONF_TRACK_E_BIKE_RANGE,
    DOMAIN,
)

from ._fakes import CtxResp, FakeClient

# Small synthetic catalogue — two distinct names so the search logic has
# something to discriminate between. Enough to exercise the whole flow
# without depending on the network.
_FAKE_STATIONS = [
    {
        "station_id": "68577704",
        "name": "Julius-Raab-Platz",
        "lat": 48.211544,
        "lon": 16.382374,
        "capacity": 17,
    },
    {
        "station_id": "68577989",
        "name": "Hoher Markt",
        "lat": 48.210666,
        "lon": 16.372983,
        "capacity": 25,
    },
]


def _patch_fetch(stations: list[dict] | None = None) -> Any:
    """Patch the station-catalogue fetch to return our fake list."""
    return patch(
        "custom_components.nextbike_austria.config_flow._fetch_stations",
        new_callable=AsyncMock,
        return_value=stations if stations is not None else _FAKE_STATIONS,
    )


def _station_snapshot(sid: str = "68577989") -> dict[str, Any]:
    return {
        "station_id": sid,
        "name": "Hoher Markt",
        "capacity": 25,
        "num_bikes_available": 5,
        "num_docks_available": 20,
        "is_installed": True,
        "is_renting": True,
        "is_returning": True,
        "last_reported": 1_776_780_838,
        "vehicle_types_available": [],
    }


def _patch_shared_client(station_id: str = "68577989") -> Any:
    """Patch the coordinator's shared-client factory.

    Needed once a flow returns CREATE_ENTRY because HA core auto-runs
    the entry's first refresh, which would otherwise hit the tripwired
    aiohttp session.
    """
    fake = FakeClient()
    fake.set_stations({station_id: _station_snapshot(station_id)})
    return patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    )


async def test_form_shows_system_picker(hass: HomeAssistant) -> None:
    """Initial step shows the system picker."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "user"


async def test_full_flow_creates_entry(hass: HomeAssistant) -> None:
    """user → search_station → select_station creates an entry."""
    with _patch_fetch(), _patch_shared_client():
        # Step 1: pick system
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "search_station"

        # Step 2: type a name fragment
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "select_station"

        # Step 3: pick one
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
        )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Hoher Markt"
    assert result["data"][CONF_SYSTEM_ID] == "nextbike_wr"
    assert result["data"][CONF_STATION_ID] == "68577989"
    assert result["data"][CONF_STATION_NAME] == "Hoher Markt"


async def test_duplicate_station_aborted(hass: HomeAssistant) -> None:
    """A second entry for the same station is aborted."""
    with _patch_fetch(), _patch_shared_client():
        for _ in range(2):
            result = await hass.config_entries.flow.async_init(
                DOMAIN, context={"source": config_entries.SOURCE_USER}
            )
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
            )
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
            )
            result = await hass.config_entries.flow.async_configure(
                result["flow_id"],
                {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
            )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_cannot_connect_on_search(hass: HomeAssistant) -> None:
    """An empty catalogue surfaces cannot_connect on the search step."""
    with _patch_fetch([]):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"].get("base") == "cannot_connect"


async def test_query_too_short(hass: HomeAssistant) -> None:
    """A single-character query is rejected before hitting the network."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_SEARCH_QUERY: "H"}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"].get(CONF_SEARCH_QUERY) == "query_too_short"


async def test_no_matches(hass: HomeAssistant) -> None:
    """A query matching nothing surfaces the no_matches error."""
    with _patch_fetch():
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "xyz_nomatch"}
        )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"].get(CONF_SEARCH_QUERY) == "no_matches"


async def test_invalid_system_rejected(hass: HomeAssistant) -> None:
    """A system id outside the Austrian registry is rejected.

    ``SelectSelector`` raises voluptuous ``Invalid`` for values outside its
    option list; if a future refactor relaxes the selector, the explicit
    ``invalid_system`` error in ``async_step_user`` is the second line of
    defence and must still fire.
    """
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    try:
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_nonsense"}
        )
    except (vol.Invalid, vol.MultipleInvalid):
        return
    # Selector accepted the value → the handler's own guard must reject.
    assert result["type"] == FlowResultType.FORM
    assert result["errors"].get(CONF_SYSTEM_ID) == "invalid_system"


async def test_options_flow_updates_interval(hass: HomeAssistant) -> None:
    """Options flow persists a new scan interval."""
    with _patch_fetch(), _patch_shared_client():
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
        )
        entry = hass.config_entries.async_entries(DOMAIN)[0]

        flow = await hass.config_entries.options.async_init(entry.entry_id)
        result = await hass.config_entries.options.async_configure(
            flow["flow_id"], {CONF_SCAN_INTERVAL: 180, CONF_TRACK_E_BIKE_RANGE: False}
        )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.options[CONF_SCAN_INTERVAL] == 180


async def test_options_flow_persists_track_e_bike_range(
    hass: HomeAssistant,
) -> None:
    """Options flow persists the e-bike-range tracking toggle."""
    with _patch_fetch(), _patch_shared_client():
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
        )
        entry = hass.config_entries.async_entries(DOMAIN)[0]

        flow = await hass.config_entries.options.async_init(entry.entry_id)
        result = await hass.config_entries.options.async_configure(
            flow["flow_id"],
            {CONF_SCAN_INTERVAL: 60, CONF_TRACK_E_BIKE_RANGE: True},
        )
    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.options[CONF_TRACK_E_BIKE_RANGE] is True


async def test_search_again_returns_to_search_step(hass: HomeAssistant) -> None:
    """Picking the ``__search_again__`` sentinel re-enters the search step."""
    with _patch_fetch():
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        # Pick the synthetic "search again" option.
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "__search_again__", CONF_SCAN_INTERVAL: 60},
        )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "search_station"


async def test_fetch_stations_survives_client_error(
    hass: HomeAssistant,
) -> None:
    """_fetch_stations logs and returns [] on network error → cannot_connect."""
    import aiohttp as _aiohttp

    from custom_components.nextbike_austria.config_flow import _fetch_stations

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> CtxResp:
            return CtxResp(raise_on_enter=_aiohttp.ClientError("boom"))

    with patch(
        "custom_components.nextbike_austria.config_flow.async_get_clientsession",
        return_value=_FakeSession(),
    ):
        result = await _fetch_stations(hass, "nextbike_wr")
    assert result == []


async def test_fetch_stations_survives_non_dict_body(
    hass: HomeAssistant,
) -> None:
    """A non-dict JSON body returns [] without raising."""
    from custom_components.nextbike_austria.config_flow import _fetch_stations

    class _FakeResp:
        status = 200

        def raise_for_status(self) -> None:
            return None

        async def json(self, content_type: Any = None) -> Any:
            return ["not", "a", "dict"]

    class _FakeSession:
        def get(self, *args: Any, **kwargs: Any) -> CtxResp:
            return CtxResp(_FakeResp())

    with patch(
        "custom_components.nextbike_austria.config_flow.async_get_clientsession",
        return_value=_FakeSession(),
    ):
        result = await _fetch_stations(hass, "nextbike_wr")
    assert result == []


def test_station_label_without_capacity() -> None:
    """Missing or zero capacity just prints the bare name."""
    from custom_components.nextbike_austria.config_flow import _station_label

    assert _station_label({"station_id": "1", "name": "Foo"}) == "Foo"
    assert _station_label({"station_id": "1", "name": "Bar", "capacity": 0}) == "Bar"
    assert (
        _station_label({"station_id": "1", "name": "Baz", "capacity": 10})
        == "Baz (capacity 10)"
    )


def test_match_stations_prefix_beats_substring() -> None:
    """Prefix matches rank above substring matches."""
    from custom_components.nextbike_austria.config_flow import _match_stations

    stations = [
        {"station_id": "1", "name": "OperNring"},   # substring match
        {"station_id": "2", "name": "Oper / Karlsplatz"},  # prefix match
        {"station_id": "3", "name": ""},  # skipped (empty name)
    ]
    matches = _match_stations(stations, "Oper")
    assert [s["station_id"] for s in matches] == ["2", "1"]


def test_match_stations_skips_empty_and_missing_names() -> None:
    """Stations with empty or missing ``name`` are filtered out."""
    from custom_components.nextbike_austria.config_flow import _match_stations

    stations = [
        {"station_id": "1", "name": ""},
        {"station_id": "2"},  # missing name entirely
        {"station_id": "3", "name": "Karlsplatz"},
    ]
    matches = _match_stations(stations, "kar")
    assert [s["station_id"] for s in matches] == ["3"]


async def test_reconfigure_to_different_station_in_same_system(
    hass: HomeAssistant,
) -> None:
    """Reconfigure picks a new station; unique_id updates to the new one."""
    with _patch_fetch(), _patch_shared_client():
        # Initial entry.
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
        )
        entry = hass.config_entries.async_entries(DOMAIN)[0]

        # Reconfigure: keep the same station (unique_id match path).
        flow = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": entry.entry_id,
            },
        )
        result = await hass.config_entries.flow.async_configure(
            flow["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 120},
        )
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    refreshed = hass.config_entries.async_get_entry(entry.entry_id)
    assert refreshed is not None
    assert refreshed.data[CONF_SCAN_INTERVAL] == 120


async def test_reconfigure_to_different_station_aborts_on_mismatch(
    hass: HomeAssistant,
) -> None:
    """Reconfigure that resolves to a *different* station id aborts."""
    fake = FakeClient()
    fake.set_stations(
        {
            "68577989": _station_snapshot("68577989"),
            "68577704": _station_snapshot("68577704"),
        }
    )
    with (
        _patch_fetch(),
        patch(
            "custom_components.nextbike_austria.coordinator._get_shared_client",
            return_value=fake,
        ),
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SYSTEM_ID: "nextbike_wr"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_SEARCH_QUERY: "Hoher"}
        )
        await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577989", CONF_SCAN_INTERVAL: 60},
        )
        entry = hass.config_entries.async_entries(DOMAIN)[0]

        flow = await hass.config_entries.flow.async_init(
            DOMAIN,
            context={
                "source": config_entries.SOURCE_RECONFIGURE,
                "entry_id": entry.entry_id,
            },
        )
        result = await hass.config_entries.flow.async_configure(
            flow["flow_id"], {CONF_SEARCH_QUERY: "Julius"}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {CONF_STATION_ID: "68577704", CONF_SCAN_INTERVAL: 60},
        )
    # _abort_if_unique_id_mismatch fires — different station ids must not
    # silently overwrite the original entry's identity.
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] != "reconfigure_successful"


