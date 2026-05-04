"""Lock the byte-for-byte version sync between manifest, Python, and TS.

Without this assertion, a maintainer can silently bump one side and ship
a release whose CARD_VERSION mismatch triggers HA's reload-banner loop
(banner → reload → same JS → banner again, forever).

Expected value is derived from ``INTEGRATION_VERSION`` — i.e. from
``manifest.json`` — so a manifest-only bump that forgets the TS side
also trips this test. Python's ``CARD_VERSION`` is wired to
``INTEGRATION_VERSION`` in ``const.py``; the assertion below catches
both halves of the chain in one go.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from custom_components.nextbike_austria.const import (
    CARD_VERSION,
    INTEGRATION_VERSION,
)

_MANIFEST = (
    Path(__file__).resolve().parent.parent
    / "custom_components"
    / "nextbike_austria"
    / "manifest.json"
)
_SRC_CONST_TS = Path(__file__).resolve().parent.parent / "src" / "const.ts"
# `\b` on both sides excludes accidental matches inside other identifiers
# (e.g. RETRO_CARD_VERSION) — `_` is a word character so the literal
# CARD_VERSION token stays unambiguous.
_RX = re.compile(r'\bCARD_VERSION\b\s*=\s*"([^"]+)"')


def test_card_version_matches_manifest_and_ts() -> None:
    """manifest.json → INTEGRATION_VERSION → CARD_VERSION → src/const.ts.

    All four must be byte-identical. ``INTEGRATION_VERSION`` is now a
    pinned string literal (the previous import-time manifest read was
    sync I/O on the event loop), so the assertion has to read
    ``manifest.json`` here in the test instead. A manifest-only bump
    that forgets to update ``const.py`` AND ``src/const.ts`` trips this
    test before release.
    """
    manifest_version = json.loads(_MANIFEST.read_text(encoding="utf-8"))["version"]
    text = _SRC_CONST_TS.read_text(encoding="utf-8")
    match = _RX.search(text)
    assert match, (
        f"CARD_VERSION literal not found in {_SRC_CONST_TS} — regex stale?"
    )
    assert INTEGRATION_VERSION == manifest_version, (
        "Python INTEGRATION_VERSION drifted from manifest.json; "
        f"got INTEGRATION_VERSION={INTEGRATION_VERSION!r}, "
        f"manifest={manifest_version!r}. Bump both in the same commit."
    )
    assert CARD_VERSION == INTEGRATION_VERSION, (
        "Python CARD_VERSION should be aliased to INTEGRATION_VERSION; "
        f"got CARD_VERSION={CARD_VERSION!r}, "
        f"INTEGRATION_VERSION={INTEGRATION_VERSION!r}."
    )
    assert match.group(1) == INTEGRATION_VERSION, (
        f"Version drift: manifest.json={INTEGRATION_VERSION!r} vs "
        f"src/const.ts={match.group(1)!r} — bump both in the same commit."
    )
