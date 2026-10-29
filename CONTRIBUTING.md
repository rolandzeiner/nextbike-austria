# Contributing to Nextbike Austria

## Dev setup

Uses [`uv`](https://docs.astral.sh/uv/) — the same tool CI installs deps with — and Node 24 for the card, as in CI.

```bash
uv venv --python 3.14 && source .venv/bin/activate
uv pip install -r requirements_test.txt pre-commit
pre-commit install      # runs ruff + mypy + vp check on every commit

npm ci                  # Lovelace card deps (Node ^24.11 or 26+, npm 11+)
npm run build           # = vp build; produces custom_components/nextbike_austria/www/nextbike-austria-card.js
```

The built bundle is committed, because users install through the Marketplace and never run `npm`. Commit it together with every `src/` change: CI rebuilds it and fails if the committed file differs by a single byte. That is also why pre-commit's whitespace hooks skip `www/*.js`.

## Branching & releases

- Work on `dev`. PRs target `dev`.
- Releases are tagged from `main` after merging `dev → main`. Publishing a release runs `release.yml`, which attaches `nextbike_austria.zip`, the file the Marketplace (HACS) downloads.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Card-version sync

Python's `CARD_VERSION` is aliased to `INTEGRATION_VERSION` (read from `manifest.json` "version"). Bump in lockstep, same commit, and rebuild the bundle:

1. `custom_components/nextbike_austria/manifest.json` → `"version"`
2. `src/const.ts` → `CARD_VERSION`

`tests/test_card_version.py` enforces byte-identical match. Drift triggers an infinite reload-banner loop on the user side.

Both always carry the clean version (`1.4.1`), never a `-beta-N` suffix. A pre-release uses the same number as the final release; GitHub's pre-release flag tells them apart. The version changes once per release cycle.

## Tooling & config

- `vite.config.ts` — the whole card toolchain, run through [Vite+](https://viteplus.dev/) (`vp`): `vp build` (Vite library mode on Rolldown), `vp test` (Vitest), and `vp check` (Oxfmt + Oxlint + type-check). The only card `devDependencies` are `vite-plus` and `happy-dom`. Vitest, Rolldown and the type-checker all ship inside `vite-plus`, and `typescript` is not installed. Five things there fail silently if you change them:
  - The banner must be a **legal** comment — `/*! ... */` — with `comments: { legal: true }`. A `//` banner is stripped by the minifier and nothing tells you; only the built file's first bytes do.
  - **`minify` lives on `rolldownOptions.output`, with `dropConsole: false`.** Vite's library mode skips whitespace minification for ES output, so `build.minify` alone ships an 80 kB bundle instead of 71 kB. `dropConsole` is all-or-nothing, and most `console.*` calls here sit in `catch` blocks where dropping them turns a caught error into a silent one.
  - **Dev vs prod comes from `--mode development`** (`npm run dev`). A plain `vp build` is production: minified, no sourcemap.
  - **`fmt.embeddedLanguageFormatting` stays `"off"`.** Otherwise Oxfmt reformats Lit `html`/`css` templates and changes the whitespace inside rendered elements, which is a DOM change, not a style change.
  - **Decorators are not configured.** Rolldown reads `tsconfig.json` itself and enables Lit's legacy decorators from it. If that ever regresses, class fields overwrite Lit's accessors and reactivity dies while the build stays green. The decorator checks at the top of `src/card.test.ts` catch it; the tests compile from the same `tsconfig.json`, but they don't run the built bundle.
- **The `vite` override in `package.json` must name the same version as `vite-plus`.** It keeps npm from installing upstream Vite next to Vite+'s core. Dependabot bumps `vite-plus` but not the override, and `src/toolchain.test.ts` fails until you bump both.
- **The build does not type-check.** `vp check` is the only thing between a type error and a green build, which is why the gate runs it as its own step.
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

The card tests live next to the code as `src/**/*.test.ts` (run by `vp test`; settings live in `vite.config.ts`). Suites that need a DOM opt into one with an `@vitest-environment happy-dom` docblock; the rest run in plain node. `src/card.test.ts` pins the rendered markup in `src/__snapshots__/`: update a snapshot (`npx vp test run -u`) only for an intended visual change, and review the diff when you do.

## Verification gate (must pass before pushing)

```bash
pytest tests/ -v
mypy --strict --ignore-missing-imports custom_components/nextbike_austria
ruff check .
ruff format --check .
uv run --python 3.12 --no-project python -m compileall -q custom_components/nextbike_austria
npx vp check
npm test
npm run build
```

The `compileall` line byte-compiles the package on Python 3.12, the oldest one our users run; `uv` fetches that interpreter if it's missing.

CI runs the same checks plus hassfest and HACS validation, `npm audit` on the card's runtime deps, a check that the committed bundle matches a fresh build, and CodeQL. Watch for a backtick inside a Lit `css`/`html` template, comments included: it ends the template early, and the card then fails at load. The build alone stays green; `vp check` catches it. Failing locally wastes a push.

## Reporting issues

Open an issue with:
- HA version + Nextbike Austria version
- Diagnostics download (Settings → Devices & Services → Nextbike Austria → ⋮ → Download diagnostics) — coordinates are auto-redacted
- Steps to reproduce
