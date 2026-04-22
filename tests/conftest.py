"""Shared pytest fixtures for Nextbike Austria tests."""
from __future__ import annotations

from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.syrupy import HomeAssistantSnapshotExtension
from syrupy.assertion import SnapshotAssertion

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture
def snapshot(snapshot: SnapshotAssertion) -> SnapshotAssertion:
    """Use the HA snapshot extension so diagnostics / state dumps diff cleanly.

    Create/update snapshots with: pytest --snapshot-update
    Stored under tests/snapshots/ next to the test module.
    """
    return snapshot.use_extension(HomeAssistantSnapshotExtension)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests in this package."""
    yield


@pytest.fixture(autouse=True)
def mock_aiohttp_session():
    """Stop pycares's DNS-resolver thread from leaking into verify_cleanup.

    Patching ``async_get_clientsession`` in both modules that import it is
    enough — neither the coordinator's SharedSystemClient nor the config
    flow's catalogue fetch actually calls the real session in tests,
    because the network-touching callables are monkey-patched per test.
    """
    with (
        patch("custom_components.nextbike_austria.coordinator.async_get_clientsession"),
        patch("custom_components.nextbike_austria.config_flow.async_get_clientsession"),
    ):
        yield
