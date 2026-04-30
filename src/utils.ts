import type {
  HassEntityAttributes,
  HomeAssistant,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
} from "./types";

// Fallback set of e-bike vehicle-type ids for users on a Python
// coordinator that pre-dates the `e_bike_vehicle_type_ids` sensor
// attribute (added in v1.2.0). Live installs read the set from the
// sensor and this constant is only the safety net during the
// integration-vs-bundle version transition.
const DEFAULT_EBIKE_IDS: ReadonlySet<string> = new Set(["143", "183", "200"]);

/** Resolve the active e-bike vehicle-type id set for a station's
 *  attributes. Prefers the live set surfaced by the Python coordinator
 *  (`e_bike_vehicle_type_ids`, derived from GBFS `propulsion_type` so a
 *  new pedelec id upstream is counted correctly without a card bundle
 *  bump). Falls back to the hardcoded default for the brief
 *  Python-old/JS-new window after an upgrade. */
export function getEbikeIds(
  attrs: HassEntityAttributes | undefined,
): ReadonlySet<string> {
  const live = attrs?.e_bike_vehicle_type_ids;
  if (Array.isArray(live) && live.length > 0) {
    const ids = live.filter(
      (s): s is string => typeof s === "string" && s.length > 0,
    );
    if (ids.length > 0) return new Set(ids);
  }
  return DEFAULT_EBIKE_IDS;
}

/** Trust-boundary guard for upstream-supplied URIs that the card
 *  renders into ``href`` attributes. Lit's ``${}`` interpolation is
 *  safe against tag/attribute injection but does NOT block
 *  ``javascript:`` or ``data:`` URIs — a compromised upstream feed
 *  could otherwise execute arbitrary JS in HA's frontend origin when
 *  the user clicks the link. Allowlist HTTP/HTTPS only; everything
 *  else collapses to an empty string and the call site treats it as
 *  "no link available". */
export function safeHttpsUri(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return /^https?:\/\//i.test(raw) ? raw : "";
}

export function findNextbikeEntities(hass: HomeAssistant | undefined): string[] {
  if (!hass || !hass.states) return [];
  return Object.keys(hass.states).filter((eid) => {
    if (!eid.startsWith("sensor.")) return false;
    const st = hass.states[eid];
    if (!st) return false;
    const a = st.attributes;
    return (
      !!a &&
      typeof a.station_id === "string" &&
      typeof a.system_id === "string" &&
      a.system_id.startsWith("nextbike_") &&
      typeof a.attribution === "string" &&
      a.attribution.startsWith("Data: nextbike")
    );
  });
}

function normaliseStationEntry(raw: unknown): NextbikeStationEntry | null {
  if (typeof raw === "string") {
    return raw.includes(".") ? { entity: raw } : null;
  }
  if (
    !raw ||
    typeof raw !== "object" ||
    typeof (raw as { entity?: unknown }).entity !== "string"
  ) {
    return null;
  }
  return { entity: (raw as { entity: string }).entity };
}

export function normaliseConfig(
  config: Partial<NextbikeAustriaCardConfig> | null | undefined,
): NextbikeAustriaCardConfig {
  const out: Partial<NextbikeAustriaCardConfig> & Record<string, unknown> = {
    ...(config || {}),
  };

  // Legacy scalar `entity` is promoted onto `entities`.
  if (typeof out.entity === "string" && out.entity.includes(".")) {
    if (!Array.isArray(out.entities) || out.entities.length === 0) {
      out.entities = [{ entity: out.entity }];
    }
  }
  delete out.entity;

  const raw = Array.isArray(out.entities) ? out.entities : [];
  out.entities = raw
    .map(normaliseStationEntry)
    .filter((e): e is NextbikeStationEntry => e !== null);

  out.show_rack = out.show_rack !== false;
  out.show_legend = out.show_legend !== false;
  out.show_ebikes = out.show_ebikes !== false;
  out.show_battery = out.show_battery !== false;
  out.show_docks = out.show_docks !== false;
  out.show_flags = out.show_flags !== false;
  out.show_timestamp = out.show_timestamp !== false;
  out.show_rent_button = out.show_rent_button !== false;
  out.hide_header = out.hide_header === true;
  out.hide_attribution = out.hide_attribution === true;
  if (out.layout !== "tabs") out.layout = "stacked";

  return out as NextbikeAustriaCardConfig;
}

export function countEbikesAvailable(
  attrs: HassEntityAttributes | undefined,
): number | null {
  // Best-effort count from `vehicle_types_available`. The id set comes
  // from the Python coordinator's live propulsion-type resolution
  // (surfaced as `e_bike_vehicle_type_ids` on the sensor); users who
  // expose the dedicated `ebikes_available` sensor should trust that
  // over this card-side computation.
  const breakdown = attrs?.vehicle_types_available;
  if (!Array.isArray(breakdown)) return null;
  const ebikeIds = getEbikeIds(attrs);
  let total = 0;
  for (const row of breakdown) {
    if (!row || typeof row !== "object") continue;
    const r = row as { vehicle_type_id?: unknown; count?: unknown };
    const tid = String(r.vehicle_type_id ?? "");
    const count = r.count;
    if (ebikeIds.has(tid) && typeof count === "number" && Number.isFinite(count)) {
      total += count;
    }
  }
  return total;
}

export function firstEbikeTypeName(
  vehicleTypesAvailable: Array<{ vehicle_type_id?: string; count?: number }> | undefined,
  vehicleTypeNames: Record<string, string> | undefined,
  ebikeIds: ReadonlySet<string>,
): string | null {
  if (!Array.isArray(vehicleTypesAvailable)) return null;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id ?? "");
    if (ebikeIds.has(tid) && vehicleTypeNames?.[tid]) {
      return vehicleTypeNames[tid];
    }
  }
  return null;
}

export function expandClassicTypes(
  vehicleTypesAvailable: Array<{ vehicle_type_id?: string; count?: number }> | undefined,
  vehicleTypeNames: Record<string, string> | undefined,
  ebikeIds: ReadonlySet<string>,
): string[] {
  // Flatten `[{vehicle_type_id, count}]` into a sequential list of
  // type names for classic (non-e-bike) slots, in the order they
  // appear in vehicle_types_available. Best-effort — we don't know
  // which specific slot holds which bike.
  const out: string[] = [];
  if (!Array.isArray(vehicleTypesAvailable)) return out;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id ?? "");
    const count = typeof row?.count === "number" && Number.isFinite(row.count) ? row.count : 0;
    if (ebikeIds.has(tid) || count <= 0) continue;
    const name = vehicleTypeNames?.[tid] || "";
    for (let i = 0; i < count; i++) out.push(name);
  }
  return out;
}

export function batteryColor(pct: number | undefined | null): string {
  // Thresholded scale — sharp breakpoints read more clearly than a
  // continuous gradient at 16x18 px. Matches common battery-level UI.
  if (typeof pct !== "number" || !Number.isFinite(pct)) return "#2ecc71";
  if (pct >= 75) return "#2ecc71"; // green
  if (pct >= 50) return "#8bc34a"; // lime-green
  if (pct >= 25) return "#ffa726"; // amber
  return "#e53935"; // red
}

export function relativeTime(
  ts: number | string | undefined | null,
  t: (key: string) => string,
): string | null {
  // Python sensor emits ISO-8601 UTC; YAML configs / older bundles may
  // still surface raw epoch seconds. Accept both shapes.
  let tsSeconds: number | null = null;
  if (typeof ts === "number" && Number.isFinite(ts)) {
    tsSeconds = ts;
  } else if (typeof ts === "string" && ts.length > 0) {
    const ms = Date.parse(ts);
    if (Number.isFinite(ms)) tsSeconds = ms / 1000;
  }
  if (tsSeconds === null) return null;
  const ageSec = Math.max(0, Math.floor(Date.now() / 1000 - tsSeconds));
  if (ageSec < 10) return t("now");
  if (ageSec < 60) return t("seconds_ago").replace("{n}", String(ageSec));
  if (ageSec < 3600) {
    return t("minutes_ago").replace("{n}", String(Math.floor(ageSec / 60)));
  }
  return t("hours_ago").replace("{n}", String(Math.floor(ageSec / 3600)));
}

// Strip the appended sensor-type suffix that HA builds from
// `has_entity_name=True` + translation_key. We want the clean device name.
export function cleanStationName(rawName: string): string {
  return String(rawName).replace(/\s+(Bikes available|Räder verfügbar)$/, "");
}
