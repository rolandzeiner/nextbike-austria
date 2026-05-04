"""Constants for Nextbike Austria.

Every registered Austrian nextbike system publishes a GBFS 2.3 discovery
document at `{GBFS_BASE}/{system_id}/gbfs.json`. The per-feed URLs under it
can be derived without fetching the discovery doc every poll; we use the
predictable pattern directly and keep the discovery URL only for
validation / future-proofing.
"""
from __future__ import annotations

from typing import Final, TypedDict

from homeassistant.const import __version__ as _HA_VERSION

DOMAIN: Final = "nextbike_austria"

# Integration version — pinned as a string literal here. Reading
# `manifest.json` at import time is sync I/O on the event loop, which
# HA core's import-time blocking-call detector flags. Drift between
# this constant and `manifest.json` is caught by
# `tests/test_manifest_version.py`, which asserts byte-for-byte
# equality. Release workflow: bump BOTH this constant AND
# `manifest.json["version"]` (and `src/const.ts`) to the same string.
INTEGRATION_VERSION: Final = "1.2.1"

# Config entry keys
CONF_SYSTEM_ID: Final = "system_id"
CONF_STATION_ID: Final = "station_id"
CONF_STATION_NAME: Final = "station_name"
CONF_SEARCH_QUERY: Final = "search_query"
CONF_TRACK_E_BIKE_RANGE: Final = "track_e_bike_range"

# Attribution for data shipped to entities. Nextbike's GBFS
# `system_information.license_id` is CC0-1.0, so there is no legal
# attribution requirement — but crediting the operator is polite and
# mirrors the Wiener-Linien-Austria integration's pattern.
ATTRIBUTION: Final = "Data: nextbike GmbH, CC0-1.0"

# User-Agent header sent on every outbound request. Identifying ourselves
# beyond HA's default clientsession UA lets nextbike traffic-shape or
# reach out to *this* integration specifically rather than blanket-blocking
# the HA UA for everyone. HA convention: "HomeAssistant/{ver} {slug}/{ver}".
# Matches the same scheme used by wiener_linien_austria and tankstellen_austria.
# The trailing "(+<repo-url>)" comment follows RFC-9110 product-token-comment
# convention so the upstream operator has a direct contact point for abuse /
# coordination without having to find the repo by guessing.
USER_AGENT: Final = (
    f"HomeAssistant/{_HA_VERSION} {DOMAIN}/{INTEGRATION_VERSION} "
    f"(+https://github.com/rolandzeiner/nextbike-austria)"
)

# Lovelace card version — pinned to ``INTEGRATION_VERSION`` so the
# manifest is the single source of truth. ``src/const.ts`` carries the
# same string as the bundle's compile-time constant; a manifest-only
# bump that forgets the TS side trips ``tests/test_card_version.py``.
# The drift it guards against would otherwise put HA into a reload-
# banner loop (banner → reload → same JS → banner).
CARD_VERSION: Final = INTEGRATION_VERSION
CARD_URL: Final = "/nextbike_austria/nextbike-austria-card.js"
CARD_FILENAME: Final = "nextbike-austria-card.js"

# Polling cadence.
#
# Nextbike advertises `ttl: 60` in the GBFS feed — the spec's "don't poll
# faster than this" floor. We default to 60s to match, and let the user
# stretch it. GBFS TTL is a contract: faster polling returns the same
# cached data, so there is no benefit and small bandwidth cost.
DEFAULT_SCAN_INTERVAL: Final = 60  # seconds
MIN_POLL_SECONDS: Final = 60       # never below the feed's TTL
MAX_POLL_SECONDS: Final = 900      # 15 min — bikes move fast enough that stale data is useless

# Battery-range fetch cadence. `free_bike_status.json` is ~1.2 MB raw
# for Wien but ~75 KB on the wire under `Accept-Encoding: gzip`. The
# GBFS feed advertises ttl=60s, so the API permits anything from 60 s
# upward; 20 min keeps the bandwidth profile polite (~5.3 MB/day per
# opted-in Austrian system) for an opt-in feed where battery state
# changes slowly. Only fetched when at least one tracked entry has
# `track_e_bike_range` enabled in its options.
BATTERY_FETCH_TTL_SECONDS: Final = 1200

# GBFS endpoint base. Each Austrian system (see AUSTRIAN_SYSTEMS below)
# publishes at `{GBFS_BASE}/{system_id}/{lang}/{feed}.json`.
GBFS_BASE: Final = "https://gbfs.nextbike.net/maps/gbfs/v2"

# Per-system discovery URL. `system_information` is the smallest feed so
# we use it as the "is this system alive?" probe in the config flow.
GBFS_LANG: Final = "en"


class SystemInfo(TypedDict):
    """Static metadata for a supported Austrian nextbike system."""

    id: str  # GBFS system_id (e.g. "nextbike_wr")
    name: str  # human-friendly, shown in the config flow picker
    region: str  # single-word region / city name used in entity titles


# Known Austrian nextbike systems, in the order they appear in the picker.
# To add a new system:
#   1. Confirm its GBFS feed exists at `{GBFS_BASE}/{system_id}/gbfs.json`.
#   2. Append a SystemInfo entry here.
#   3. Add translation entries for the system's display in strings.json.
#   4. Add the system to `SYSTEM_ACCENT` in src/const.ts so the
#      Lovelace card's per-system theming works.
AUSTRIAN_SYSTEMS: Final[tuple[SystemInfo, ...]] = (
    {"id": "nextbike_wr", "name": "Wien — WienMobil Rad", "region": "Wien"},
    {"id": "nextbike_la", "name": "Niederösterreich", "region": "Niederösterreich"},
    {"id": "nextbike_si", "name": "Innsbruck — Stadtrad", "region": "Innsbruck"},
    {"id": "nextbike_vt", "name": "Tirol — VVT REGIORAD", "region": "Tirol"},
    {"id": "nextbike_al", "name": "Linz — city bike Linz", "region": "Linz"},
    {"id": "nextbike_ka", "name": "Klagenfurt", "region": "Klagenfurt"},
)

SYSTEM_IDS: Final = tuple(s["id"] for s in AUSTRIAN_SYSTEMS)


def gbfs_feed_url(system_id: str, feed: str) -> str:
    """Return the URL for a single GBFS feed under a system.

    ``feed`` is one of: ``station_information``, ``station_status``,
    ``vehicle_types``, ``system_information``, ``free_bike_status`` (etc.).
    """
    return f"{GBFS_BASE}/{system_id}/{GBFS_LANG}/{feed}.json"


# Vehicle-type heuristic. GBFS 2.3 reports `propulsion_type` per vehicle
# type; we treat anything non-"human" as an e-bike for our "e-bikes
# available" sensor. The exact propulsion strings nextbike uses:
#   - "human"           → regular pedal bike
#   - "electric_assist" → pedelec (most common e-bike here)
#   - "electric"        → throttle-only (rare in AT)
EBIKE_PROPULSIONS: Final = frozenset({"electric_assist", "electric"})
