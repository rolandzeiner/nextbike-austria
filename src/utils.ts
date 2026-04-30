import { EBIKE_IDS } from "./const";
import type {
  HomeAssistant,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
} from "./types";

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
  attrs: Record<string, unknown> | undefined,
): number | null {
  // Best-effort count from `vehicle_types_available`. We mirror the
  // EBIKE_IDS set the Python coordinator uses for its own e-bikes
  // sensor; users who expose that sensor should trust it over this
  // card-side computation.
  const breakdown = attrs?.vehicle_types_available;
  if (!Array.isArray(breakdown)) return null;
  let total = 0;
  for (const row of breakdown) {
    if (!row || typeof row !== "object") continue;
    const r = row as { vehicle_type_id?: unknown; count?: unknown };
    const tid = String(r.vehicle_type_id ?? "");
    const count = r.count;
    if (EBIKE_IDS.has(tid) && typeof count === "number" && Number.isFinite(count)) {
      total += count;
    }
  }
  return total;
}

export function firstEbikeTypeName(
  vehicleTypesAvailable: Array<{ vehicle_type_id?: string; count?: number }> | undefined,
  vehicleTypeNames: Record<string, string> | undefined,
): string | null {
  if (!Array.isArray(vehicleTypesAvailable)) return null;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id ?? "");
    if (EBIKE_IDS.has(tid) && vehicleTypeNames?.[tid]) {
      return vehicleTypeNames[tid];
    }
  }
  return null;
}

export function expandClassicTypes(
  vehicleTypesAvailable: Array<{ vehicle_type_id?: string; count?: number }> | undefined,
  vehicleTypeNames: Record<string, string> | undefined,
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
    if (EBIKE_IDS.has(tid) || count <= 0) continue;
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
