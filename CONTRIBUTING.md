# Contributing to Nextbike Austria

## Dev setup

Uses [`uv`](https://docs.astral.sh/uv/) — the same tool CI installs deps with.

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # produces custom_components/nextbike_austria/www/nextbike-austria-card.js
```

## Branching & releases

- Work on `dev`. PRs target `dev`.
- Releases are tagged from `main` after merging `dev → main`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Python's `CARD_VERSION` is aliased to `INTEGRATION_VERSION` (read from `manifest.json` "version"). Bump in lockstep, same commit:

1. `custom_components/nextbike_austria/manifest.json` → `"version"`
2. `src/const.ts` → `CARD_VERSION`

`tests/test_card_version.py` enforces byte-identical match. Drift triggers an infinite reload-banner loop on the user side.

`manifest.json` stays at the clean (non-beta) version; the TS constant can carry a `-beta-N` suffix during development (in which case bump `manifest.json` to the same beta to keep them aligned).

## Tooling & config

- `pyproject.toml` — ruff, mypy, coverage. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.1.0, which runs on Python 3.12, so `target-version = "py312"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how wiener-linien-austria v1.7.1 shipped a SyntaxError. The `compile-floor-python` CI job byte-compiles the shipped package on 3.12 as an independent backstop. Raise all three together or not at all.
- `pytest.ini` — pytest config and the **`--cov-fail-under=90` coverage gate** (current measurement ~97%).
- `ATTRIBUTION` — data-source statement; keep `const.ATTRIBUTION` in sync when this changes.

View per-file coverage locally:

```bash
pytest tests/ --cov-report=term-missing
```

## Snapshot tests

Diagnostics output is pinned via `syrupy`. Snapshots live under `tests/snapshots/`. After an intentional change to the diagnostics shape (new field, redaction-set drift), regenerate:

```bash
pytest tests/test_diagnostics.py --snapshot-update
```

Commit the updated `.ambr` file alongside the code change so the diff is reviewable.

## Verification gate (must pass before pushing)

```bash
pytest tests/ -v
mypy --strict --ignore-missing-imports custom_components/nextbike_austria
ruff check .
npx tsc --noEmit
npm run build
```

CI runs the same checks plus hassfest + HACS validation. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Nextbike Austria version
- Diagnostics download (Settings → Devices & Services → Nextbike Austria → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
