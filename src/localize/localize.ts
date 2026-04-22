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

const TRANSLATIONS: Record<string, Dict> = {
  en: en as Dict,
  de: de as Dict,
};

export function pickLang(hass: HomeAssistant | undefined): "de" | "en" {
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
    resolvePath(TRANSLATIONS[lang], [key]) ??
    resolvePath(TRANSLATIONS.en, [key]) ??
    key
  );
}

// Editor section lookup: `et(hass, "section_stations")` → "Stations"
export function et(hass: HomeAssistant | undefined, key: string): string {
  const lang = pickLang(hass);
  return (
    resolvePath(TRANSLATIONS[lang], ["editor", key]) ??
    resolvePath(TRANSLATIONS.en, ["editor", key]) ??
    key
  );
}
