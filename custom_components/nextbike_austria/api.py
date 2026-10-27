"""Client for nextbike's GBFS 2.3 feeds.

Owns everything about talking to nextbike: the feed URLs, the request
headers, parsing a feed body, reading Retry-After, and turning every failure
into one of the exceptions below. Callers pass in the
``aiohttp.ClientSession`` and the User-Agent, so this module never needs
Home Assistant.

It deliberately imports nothing from Home Assistant or from the rest of the
package (``const.py`` pulls in HA for its User-Agent), and
``tests/test_api.py`` enforces that. Caching, sharing one fetch across
entries, backoff and translating these exceptions for Home Assistant are the
coordinator's job.
"""

from __future__ import annotations

import email.utils
import json
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any, Final

import aiohttp

# Every registered Austrian system publishes at
# `{GBFS_BASE}/{system_id}/{GBFS_LANG}/{feed}.json`.
GBFS_BASE: Final = "https://gbfs.nextbike.net/maps/gbfs/v2"
# Language segment in the per-feed URL path.
GBFS_LANG: Final = "en"

# The coordinator's per-tick feeds, and the config flow's one-off station
# catalogue, which a person is waiting on.
FEED_TIMEOUT_SECONDS: Final = 15
CATALOGUE_TIMEOUT_SECONDS: Final = 10

# Longest Retry-After taken at face value. A day covers any real maintenance
# window; past that, a bogus header would freeze polling indefinitely.
RETRY_AFTER_MAX_SECONDS: Final = 86400.0


class NextbikeError(Exception):
    """Base class for every failure fetching a GBFS feed."""


class NextbikeTimeoutError(NextbikeError):
    """The request timed out."""

    def __init__(self, seconds: float) -> None:
        super().__init__(f"request timed out after {seconds:g} s")
        self.seconds = seconds


class NextbikeConnectionError(NextbikeError):
    """No usable HTTP answer: DNS, refused, reset, or a body cut off mid-read."""

    def __init__(self, err: aiohttp.ClientError) -> None:
        super().__init__(f"{type(err).__name__}: {err}")
        self.error_type = type(err).__name__
        self.error = str(err)


class NextbikeHttpError(NextbikeError):
    """nextbike answered with a non-2xx status."""

    def __init__(self, status: int, reason: str, retry_after: float | None) -> None:
        super().__init__(f"HTTP {status}: {reason}")
        self.status = status
        self.reason = reason
        # Seconds the server asked us to stay away (Retry-After on 429/503).
        self.retry_after = retry_after


class NextbikePayloadError(NextbikeError):
    """A 2xx answer whose body is not a JSON object."""

    def __init__(self, status: int, error: str) -> None:
        super().__init__(f"invalid response (HTTP {status}): {error}")
        self.status = status
        self.error = error


def gbfs_feed_url(system_id: str, feed: str) -> str:
    """Return the URL for a single GBFS feed under a system.

    ``feed`` is one of: ``station_information``, ``station_status``,
    ``vehicle_types``, ``system_information``, ``free_bike_status`` (etc.).
    """
    return f"{GBFS_BASE}/{system_id}/{GBFS_LANG}/{feed}.json"


def request_headers(user_agent: str) -> dict[str, str]:
    """Headers sent with every request.

    `user_agent` is the project-canonical identifier
    (`HomeAssistant/<ha-ver> nextbike_austria/<our-ver> (+repo-url)`) so
    nextbike's abuse / coordination contact can reach the right repo from
    logs.

    `Accept-Encoding` is deliberately not set. aiohttp already offers
    `gzip, deflate` (plus `zstd` on Python 3.14) and decompresses
    transparently; pinning `gzip` would only narrow that offer. nextbike
    serves gzip either way (21x on Wien's station_status; the measurements
    are in const.py).
    """
    return {
        "User-Agent": user_agent,
        "Accept": "application/json",
    }


def retry_after_seconds(headers: Mapping[str, str] | None) -> float | None:
    """Read a Retry-After header: delay-seconds or an HTTP-date (RFC 9110)."""
    value = (headers or {}).get("Retry-After", "").strip()
    if not value:
        return None
    if value.isdigit():
        seconds = float(value)
    else:
        try:
            when = email.utils.parsedate_to_datetime(value)
        except (TypeError, ValueError):
            return None
        if when.tzinfo is None:
            when = when.replace(tzinfo=UTC)
        seconds = (when - datetime.now(UTC)).total_seconds()
    return min(max(seconds, 0.0), RETRY_AFTER_MAX_SECONDS)


async def fetch_feed(
    session: aiohttp.ClientSession,
    system_id: str,
    feed: str,
    *,
    user_agent: str,
    timeout_seconds: float = FEED_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """Fetch one GBFS feed and return the parsed JSON body.

    No conditional GET: every feed regenerates its ``Last-Modified`` each
    minute, so a validator never matches at our intervals (see the
    measurement block in const.py).

    GBFS bodies from nextbike occasionally include stray control characters
    (e.g. raw CRLF in vehicle-type descriptions). We parse with
    ``strict=False`` to survive those — the alternative is the whole feed
    being unusable for a single escaping bug.
    """
    try:
        async with session.get(
            gbfs_feed_url(system_id, feed),
            headers=request_headers(user_agent),
            timeout=aiohttp.ClientTimeout(total=timeout_seconds),
        ) as resp:
            status = resp.status
            resp.raise_for_status()
            text = await resp.text()
    except TimeoutError as err:
        raise NextbikeTimeoutError(timeout_seconds) from err
    except aiohttp.ClientResponseError as err:
        # 429 and 503 may say how long to stay away (RFC 9110).
        retry_after = (
            retry_after_seconds(err.headers) if err.status in (429, 503) else None
        )
        raise NextbikeHttpError(err.status, err.message or "", retry_after) from err
    except aiohttp.ClientError as err:
        # Covers ClientPayloadError / ClientConnectionError raised mid-body
        # as well as connect-time failures.
        raise NextbikeConnectionError(err) from err

    try:
        parsed = json.loads(text, strict=False)
    except ValueError as err:
        raise NextbikePayloadError(status, str(err)) from err
    if not isinstance(parsed, dict):
        raise NextbikePayloadError(
            status, f"expected dict, got {type(parsed).__name__}"
        )
    return parsed
