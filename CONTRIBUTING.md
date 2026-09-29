# Contributing to Nextbike Austria

## Dev setup

Uses [`uv`](https://docs.astral.sh/uv/) — the same tool CI installs deps with — and Node 24 for the card, as in CI.

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + checks on every commit

npm ci                  # Lovelace card deps
npm run build           # produces custom_components/nextbike_austria/www/nextbike-austria-card.js
```

The built bundle is committed, because HACS users never run `npm`. Commit it together with every `src/` change: CI rebuilds it and fails if the committed file differs by a single byte. That is also why pre-commit's whitespace hooks skip `www/*.js`.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- Releases are tagged from `main` after merging `dev → main`. Publishing a release runs `release.yml`, which attaches `nextbike_austria.zip`, the file HACS downloads.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Python's `CARD_VERSION` is aliased to `INTEGRATION_VERSION` (read from `manifest.json` "version"). Bump in lockstep, same commit, and rebuild the bundle:

1. `custom_components/nextbike_austria/manifest.json` → `"version"`
2. `src/const.ts` → `CARD_VERSION`

`tests/test_card_version.py` enforces byte-identical match. Drift triggers an infinite reload-banner loop on the user side.

Both always carry the clean version (`1.4.0`), never a `-beta-N` suffix. A pre-release uses the same number as the final release; GitHub's pre-release flag tells them apart. The version changes once per release cycle.

## Tooling & config

- `rolldown.config.mjs` — the card build. Rolldown does transpilation, minification, module resolution and JSON natively, so the build needs only `rolldown` + `typescript`; the `@rollup/plugin-*` stack and `@swc/core` were **deleted** in the 2026-09 migration, not replaced. The other `devDependencies` (`vitest`, `@vitest/coverage-v8`, `happy-dom`) are the test stack. Four things there fail silently if you change them:
  - The banner must be a **legal** comment — `/*! ... */` — with `comments: { legal: true }`. A `//` banner is stripped by the minifier and nothing tells you; only the built file's first bytes do.
  - **`dropConsole` stays `false`.** Rolldown's option is a boolean, not terser's per-method array, so it is all-or-nothing — and most `console.*` calls here sit in `catch` blocks where dropping them turns a caught error into a silent one.
  - **Dev vs prod comes from `ROLLDOWN_WATCH || ROLLUP_WATCH`.** `rolldown -c -w` sets both today; keep reading both. If the check misses, dev builds ship minified and prod builds ship sourcemaps, with no error.
  - **Decorators are not configured.** Rolldown reads `tsconfig.json` itself and enables Lit's legacy decorators from it. If that ever regresses, class fields overwrite Lit's accessors and reactivity dies while the build stays green. The decorator checks at the top of `src/card.test.ts` catch it; vitest compiles the tests from the same `tsconfig.json`, but they don't run the built bundle.
- **Rolldown does not type-check.** `npx tsc --noEmit` is the only thing between a type error and a green build, which is why the gate runs it as its own step.
- `pyproject.toml` — ruff, mypy, coverage. Change rules here, not in CI flags.
  - **`target-version` tracks the oldest Python we support, never the one CI runs.** `hacs.json` promises HA ≥ 2025.1.0, which runs on Python 3.12, so `target-version = "py312"` — even though the venv and CI are on 3.14. Pointing it at the CI interpreter lets ruff rewrite code into syntax our users cannot parse and then stay silent about it; that is how wiener-linien-austria v1.7.1 shipped a SyntaxError. The `compile-floor-python` CI job byte-compiles the shipped package on 3.12 as an independent backstop. Raise all three together or not at all.
- `pytest.ini` — pytest config and the **`--cov-fail-under=90` coverage gate** (current measurement ~96%). It also sets a 15 s per-test timeout, rejects unknown markers, and turns `DeprecationWarning` into a failure.
  - HA reports its own API deprecations through its logger, not `warnings`, so the autouse `no_deprecated_ha_api` fixture in `tests/conftest.py` fails any test that trips one. Mark a test `@pytest.mark.allow_deprecated_ha_api` only when it exercises a deprecated API on purpose.
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

## Card tests

The card tests live next to the code as `src/**/*.test.ts` (vitest, no config file). Suites that need a DOM opt into one with an `@vitest-environment happy-dom` docblock; the rest run in plain node. `src/card.test.ts` pins the rendered markup in `src/__snapshots__/`: update a snapshot (`npx vitest run -u`) only for an intended visual change, and review the diff when you do. `npm run test:coverage` prints per-file coverage and writes `coverage/coverage-final.json` (gitignored).

## Verification gate (must pass before pushing)

```bash
pytest tests/ -v
mypy --strict --ignore-missing-imports custom_components/nextbike_austria
ruff check .
ruff format --check .
uv run --python 3.12 --no-project python -m compileall -q custom_components/nextbike_austria
npx tsc --noEmit
npm test
npm run build
```

The `compileall` line byte-compiles the package on Python 3.12, the oldest one our users run; `uv` fetches that interpreter if it's missing.

CI runs the same checks plus hassfest and HACS validation, `npm audit` on the card's runtime deps, a check that the committed bundle matches a fresh build, and CodeQL. It also rejects any backtick inside a Lit `css`/`html` template, comments included: a stray backtick ends the template early, and the card then fails at load while the build stays green. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Nextbike Austria version
- Diagnostics download (Settings → Devices & Services → Nextbike Austria → ⋮ → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
