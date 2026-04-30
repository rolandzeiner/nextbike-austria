// Must match CARD_VERSION in custom_components/nextbike_austria/const.py
// byte-for-byte — drift causes an infinite reload-banner loop.
// Python's CARD_VERSION is aliased to INTEGRATION_VERSION (read from
// manifest.json), so a manifest bump is what to mirror here.
export const CARD_VERSION = "1.2.0";

// System-specific brand tints for the header accent. Pulled from each
// operator's public brand guides; falls back to theme primary otherwise.
export const SYSTEM_ACCENT: Record<string, string> = {
  nextbike_wr: "#DC2026", // WienMobil Rad red
  nextbike_la: "#004E9E", // NÖ blue
  nextbike_si: "#C8102E", // Innsbruck Stadtrad red
  nextbike_vt: "#009D58", // VVT REGIORAD green
  nextbike_al: "#E30613", // Linz red
  nextbike_ka: "#FFC20E", // Klagenfurt yellow
};

// E-bike vehicle-type ids are no longer hardcoded on the card side.
// The Python coordinator resolves them live from GBFS `propulsion_type`
// and surfaces the set as the `e_bike_vehicle_type_ids` sensor
// attribute; the card reads it via `getEbikeIds(attrs)` in utils.ts
// (with a small fallback for the brief Python-old/JS-new window after
// an upgrade).
