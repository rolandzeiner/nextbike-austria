// Shared render helpers + small utilities used by the Nextbike Austria
// card. Extracted so the version-banner + the WS card-version probe
// live in one place — the card stays focused on station/rack rendering
// rather than carrying its own copy of the integration-upgrade
// plumbing.
//
// Conventions:
// - Pure functions: no `this`, take what they need as arguments,
//   return a TemplateResult or a Promise. The card keeps its own
//   reactive state (@state _versionMismatch) and calls these helpers
//   from render() / firstUpdated().
// - Localisation goes through the card's `t(hass, key)` shape so
//   the helper does not own a hidden module-level language state.
//   The localize helper API is grandfathered for nextbike — pass it
//   in as a callback rather than importing it here.

import { html, nothing, type TemplateResult } from "lit";

import type { HomeAssistant } from "./types";

/**
 * Probe the backend's card-version WebSocket command. Returns the
 * server-reported version when it differs from the bundled CARD_VERSION
 * (i.e. banner should appear), or null otherwise. Silent on transport
 * error — older HA installs without the handler simply don't surface a
 * mismatch, which is correct (cache-buster URL still applies).
 */
export async function checkCardVersionWS(
  hass: HomeAssistant | undefined,
  type: string,
  bundleVersion: string,
): Promise<string | null> {
  if (!hass?.callWS) return null;
  try {
    const r = await hass.callWS<{ version?: string }>({ type });
    if (r?.version && r.version !== bundleVersion) return r.version;
  } catch {
    // Silent: older backend without the WS handler.
  }
  return null;
}

/**
 * Best-effort cache-storage wipe followed by a hard reload. The reload
 * picks up the freshly-cached JS bundle so the version-mismatch banner
 * clears on next mount.
 */
export function reloadAfterCacheWipe(): void {
  try {
    window.caches?.keys?.().then((keys) => {
      keys.forEach((k) => window.caches?.delete?.(k));
    });
  } catch {
    // best-effort cache wipe
  }
  window.location.reload();
}

/**
 * Render the version-mismatch banner. Returns the lit `nothing` sentinel
 * when there is no mismatch so call sites can splat it unconditionally
 * into their template.
 *
 * `t` is the card's flat-key translate callback (`t(hass, key)`) — the
 * `version_update` string carries a `{v}` placeholder; this helper
 * substitutes it inline. Localisation strings stay in the card's
 * bundle, not in this module.
 */
export function renderVersionBanner(
  mismatch: string | null,
  t: (key: string) => string,
): TemplateResult | typeof nothing {
  if (!mismatch) return nothing;
  const updateMsg = t("version_update").replace("{v}", mismatch);
  const reloadLabel = t("version_reload");
  return html`
    <div class="banner" role="alert" aria-live="assertive">
      <span>${updateMsg}</span>
      <button
        type="button"
        aria-label=${reloadLabel}
        @click=${reloadAfterCacheWipe}
      >
        ${reloadLabel}
      </button>
    </div>
  `;
}
