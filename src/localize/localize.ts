// nextbike-specific localize helper. Uses hass.language (canonical HA
// user-UI locale) rather than the skill's generic localStorage pattern —
// hass.language updates immediately when the user switches, and nextbike
// only ships two locales so keying off localStorage would be overkill.

import type { HomeAssistant } from "../types";
import en from "./languages/en.json";
import de from "./languages/de.json";

interface Dict {
  [key: string]: string | Dict;
}

// `en` is imported and assigned at module load — the `en` slot in
// TRANSLATIONS is statically guaranteed to exist. Using `as const
// satisfies` keeps the type honest (TypeScript knows `en` is a real key)
// while still letting the `[lang]` index access elsewhere be widened by
// `noUncheckedIndexedAccess`. No runtime fallback needed for the
// English path; non-English paths fall back to `TRANSLATIONS.en`
// directly, which the `satisfies` clause guarantees is `Dict`.
const TRANSLATIONS = {
  en: en as Dict,
  de: de as Dict,
} as const satisfies Record<string, Dict>;

function pickLang(hass: HomeAssistant | undefined): "de" | "en" {
  const hl = hass?.language || "en";
  return hl.startsWith("de") ? "de" : "en";
}

function resolvePath(dict: Dict, path: string[]): string | undefined {
  let cur: Dict | string = dict;
  for (const seg of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    const next: Dict | string | undefined = (cur as Dict)[seg];
    if (next === undefined) return undefined;
    cur = next;
  }
  return typeof cur === "string" ? cur : undefined;
}

// Flat lookup: `t(hass, "bikes")` → "bikes"/"Räder"
export function t(hass: HomeAssistant | undefined, key: string): string {
  const lang = pickLang(hass);
  return (
    resolvePath(TRANSLATIONS[lang] ?? TRANSLATIONS.en, [key]) ??
    resolvePath(TRANSLATIONS.en, [key]) ??
    key
  );
}

// Editor section lookup: `et(hass, "section_stations")` → "Stations"
export function et(hass: HomeAssistant | undefined, key: string): string {
  const lang = pickLang(hass);
  return (
    resolvePath(TRANSLATIONS[lang] ?? TRANSLATIONS.en, ["editor", key]) ??
    resolvePath(TRANSLATIONS.en, ["editor", key]) ??
    key
  );
}
