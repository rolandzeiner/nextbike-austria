"""HTTP helpers for the Nextbike Austria integration.

Single source of truth for outbound request headers. Centralised so the
two call sites — `coordinator.py` GBFS feed fetches and `config_flow.py`
station-catalogue fetch — can't drift in what they send to nextbike's
GBFS CDN.

`Accept-Encoding` is deliberately not set. aiohttp already offers
`gzip, deflate` (plus `zstd` on Python 3.14) and decompresses
transparently; pinning `gzip` would only narrow that offer. nextbike
serves gzip either way (21x on Wien's station_status; the measurements
are in const.py).
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

    Returns a fresh dict on each call so a call site that needs to add
    an extra header can mutate it without leaking back into the SoT.
    """
    return {
        "User-Agent": user_agent,
        "Accept": "application/json",
    }
