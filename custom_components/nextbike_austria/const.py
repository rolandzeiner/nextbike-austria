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

# Integration version — must match manifest.json "version" field.
INTEGRATION_VERSION: Final = "0.2.0"

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
USER_AGENT: Final = f"HomeAssistant/{_HA_VERSION} {DOMAIN}/{INTEGRATION_VERSION}"

# Lovelace card — the JS at www/nextbike-austria-card.js carries a
# `const CARD_VERSION` that MUST match this string byte-for-byte.
# A mismatch triggers HA's reload-banner loop (banner prompts reload,
# reload re-serves the same stale JS, banner reappears). Bump both in
# the same commit.
CARD_VERSION: Final = "0.3.0"
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

# Battery-range fetch cadence. `free_bike_status.json` is ~1.3 MB for Wien.
# Parked e-bikes charge and discharge slowly — a 30-min window is
# granular enough for any realistic "is there a charged bike at my
# home station?" automation, and halves the bandwidth cost vs. 15 or
# 20 min. Approx ~63 MB/day / ~1.9 GB/month per opted-in Austrian
# system. Only fetched when at least one tracked entry has
# `track_e_bike_range` enabled in its options.
BATTERY_FETCH_TTL_SECONDS: Final = 1800

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
# Verified against https://api.nextbike.net/maps/nextbike-live.json and the
# per-system GBFS endpoints on 2026-04-21. To add a new system:
#   1. Confirm its GBFS feed exists at `{GBFS_BASE}/{system_id}/gbfs.json`.
#   2. Append a SystemInfo entry here.
#   3. Add translation entries for the system's display in strings.json.
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
PROPULSION_HUMAN: Final = "human"
EBIKE_PROPULSIONS: Final = frozenset({"electric_assist", "electric"})
