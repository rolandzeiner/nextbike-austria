"""Tests for the Nextbike Austria diagnostics module."""
from __future__ import annotations

import json
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from syrupy.assertion import SnapshotAssertion

from custom_components.nextbike_austria.const import (
    CONF_STATION_ID,
    DOMAIN,
)
from custom_components.nextbike_austria.diagnostics import (
    async_get_config_entry_diagnostics,
)

from ._fakes import FakeClient
from .conftest import BASE_ENTRY_DATA, station_snapshot

# Distinctive sentinel for the full-blob redaction grep — it would
# leak into diagnostics if a future maintainer forgets to add a new
# credential field to TO_REDACT.
SECRET_TOKEN = "ZZZ-NEXTBIKE-CANARY-DO-NOT-LEAK-ZZZ"

# lat/lon overrides exercise the coordinate-redaction codepath — the
# baseline factory keeps them off so unrelated tests aren't sensitive
# to redaction changes.
_STATION = station_snapshot(lat=48.210666, lon=16.372983)


async def test_diagnostics_carries_attribution_and_redacts_credentials(
    hass: HomeAssistant,
) -> None:
    """Diagnostics carries attribution and redacts credential-shaped fields."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={**BASE_ENTRY_DATA, "token": SECRET_TOKEN},
        options={},
        title="Hoher Markt",
        unique_id="nextbike_wr_68577989",
    )
    entry.add_to_hass(hass)

    fake = FakeClient()
    fake.set_stations({"68577989": _STATION})
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag["attribution"].startswith("Data: nextbike")
    assert diag["coordinator"]["system_id"] == "nextbike_wr"
    assert diag["coordinator"]["station_id"] == "68577989"
    assert diag["coordinator"]["last_update_success"] is True
    # `last_exception` is repr() of the last exception; `None` repr is
    # `'None'`. Triage signal even when nothing is wrong.
    assert "last_exception" in diag["coordinator"]
    # Counts derived from the live snapshot — no per-bike or per-rack-
    # state detail leaks.
    assert diag["coordinator"]["bikes_available_count"] == 29
    assert diag["coordinator"]["docks_available_count"] == 0
    assert diag["coordinator"]["vehicle_types_count"] == 2
    assert diag["coordinator"]["battery_samples_count"] == 0
    # The live coordinator payload ITSELF must not surface — only the
    # counts above. Operating-state booleans (is_renting, etc.) leak
    # monitoring patterns into public issue bodies.
    assert "station_snapshot" not in diag["coordinator"]
    assert "is_renting" not in json.dumps(diag, default=str)
    assert "is_returning" not in json.dumps(diag, default=str)
    # Entry section round-trips title + version + redacted data/options.
    assert diag["entry"]["title"] == "Hoher Markt"
    assert diag["entry"]["data"][CONF_STATION_ID] == "68577989"
    # `token` was added to `data` above and must come back redacted.
    assert diag["entry"]["data"]["token"] == "**REDACTED**"
    # Belt-and-braces: full-blob scan catches any future field that
    # forgets to wire a new credential through TO_REDACT.
    assert SECRET_TOKEN not in json.dumps(diag, default=str)


async def test_diagnostics_snapshot(
    hass: HomeAssistant, snapshot: SnapshotAssertion
) -> None:
    """Pin the full redacted diagnostics shape so silent format changes surface.

    A failing diff usually means: a field was added to the entry/coordinator
    payload, or the redaction set changed. Update the snapshot
    (`pytest --snapshot-update`) only after confirming the change is intentional.
    """
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=BASE_ENTRY_DATA,
        options={},
        title="Hoher Markt",
        unique_id="nextbike_wr_68577989",
    )
    entry.add_to_hass(hass)

    fake = FakeClient()
    fake.set_stations({"68577989": _STATION})
    with patch(
        "custom_components.nextbike_austria.coordinator._get_shared_client",
        return_value=fake,
    ):
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    diag = await async_get_config_entry_diagnostics(hass, entry)
    assert diag == snapshot
