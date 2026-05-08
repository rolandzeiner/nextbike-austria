"""HTTP helpers for the Nextbike Austria integration.

Single source of truth for outbound request headers. Centralised so the
two call sites — `coordinator.py` GBFS feed fetches and `config_flow.py`
system-information probe — can't drift in what they send to nextbike's
GBFS CDN.

Why `Accept-Encoding: gzip`: aiohttp does NOT auto-add the header, so
without it nextbike's CDN ships uncompressed JSON. Verified 2026-05-08
against `https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_wr/en/station_status.json`:
plain response 66267 bytes vs gzipped 3078 bytes — 21x compression on a
busy WienMobil status feed. aiohttp decompresses transparently so call
sites need no changes beyond the header.

Composes with the existing `If-Modified-Since` conditional-GET path in
the coordinator (item 7): when the feed hasn't changed the CDN returns
304 with no body; when it has changed we get the gzipped body.
"""
from __future__ import annotations


def base_request_headers(user_agent: str) -> dict[str, str]:
    """Common request headers shared by every outbound call.

    `user_agent` is the project-canonical identifier
    (`HomeAssistant/<ha-ver> nextbike_austria/<our-ver> (+repo-url)`)
    so nextbike's abuse / coordination contact can reach the right repo
    from logs. Construction lives in `const.py:USER_AGENT`; this helper
    accepts the assembled string as a parameter so tests can pass a
    sentinel and still exercise the header shape.

    Returns a fresh dict on each call so call sites that need to add
    extras (e.g. the coordinator's `If-Modified-Since` conditional-GET
    header) can mutate without leaking back into the SoT.
    """
    return {
        "User-Agent": user_agent,
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
    }
