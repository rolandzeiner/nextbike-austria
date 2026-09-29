import { SYSTEM_ACCENT } from "./const";
import type {
  HassEntityAttributes,
  HomeAssistant,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
  RackInputs,
  RackLayout,
} from "./types";

// Fallback set of e-bike vehicle-type ids for users on a Python
// coordinator that pre-dates the `e_bike_vehicle_type_ids` sensor
// attribute. Live installs read the set from the sensor; this
// constant is only the safety net for a Python-old/JS-new bundle pair.
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
    // Numeric inputs are epoch seconds, but guard the legacy/YAML path
    // against an accidental epoch-milliseconds value: anything past 1e11
    // is the year 5138 in seconds (impossible) yet only ~1973 in ms, so
    // treat it as ms. Without this an ms value drives `ageSec` hugely
    // negative and `Math.max(0, …)` clamps the label to "just now".
    tsSeconds = ts > 1e11 ? ts / 1000 : ts;
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

// Prefer the locale-agnostic display name surfaced by the sensor; fall
// back to stripping HA's friendly-name suffix (or the entity id when no
// friendly_name) for users on an older Python integration version.
export function resolveDisplayName(
  attrs: HassEntityAttributes | undefined,
  fallbackEntity: string,
): string {
  const display = attrs?.station_display_name;
  if (typeof display === "string" && display) return display;
  const friendly = attrs?.friendly_name;
  return cleanStationName(typeof friendly === "string" && friendly ? friendly : fallbackEntity);
}

/** A numeric attribute, or `fallback` when upstream sent anything else.
 *  Any number passes, negatives and NaN included; use `countOf` for a
 *  count. */
export function numberOr<F extends number | null>(value: unknown, fallback: F): number | F {
  return typeof value === "number" ? value : fallback;
}

/** A count attribute as a whole number ≥ 0; anything else reads as 0. */
export function countOf(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

/** An array attribute, or `fallback` when upstream sent anything else. */
export function arrayOr<T, F extends T[] | null>(value: T[] | undefined, fallback: F): T[] | F {
  return Array.isArray(value) ? value : fallback;
}

/** Bikes available, from the sensor state. Clamped at the boundary: a
 *  non-numeric state (unavailable, unknown) or a negative one reads as 0,
 *  so the rack can't run its empty-slot loop past the dock count. A
 *  leading integer is kept ("2.5" reads as 2). */
export function parseBikeCount(state: string): number {
  const parsed = parseInt(state, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

/** The operator's brand tint, or the theme's primary colour. */
export function systemAccent(attrs: HassEntityAttributes): string {
  return SYSTEM_ACCENT[attrs.system_id || ""] || "var(--primary-color)";
}

/** The header subtitle. `system_label` ships from the Python sensor
 *  (single source of truth in const.py::AUSTRIAN_SYSTEMS); older sensors
 *  only carry the `nextbike_xx` slug. */
export function systemLabel(attrs: HassEntityAttributes): string {
  return (
    (typeof attrs.system_label === "string" && attrs.system_label) ||
    (attrs.system_id || "").replace(/^nextbike_/, "")
  );
}

/** Google Maps link for the station, or null without coordinates.
 *  Built from numeric lat/lon so the literal is always https://, but piped
 *  through the same trust-boundary guard as the rental URI so a future
 *  stop-URL attribute can't bypass the allowlist. */
export function stationMapUrl(attrs: HassEntityAttributes): string | null {
  if (typeof attrs.latitude !== "number" || typeof attrs.longitude !== "number") {
    return null;
  }
  return (
    safeHttpsUri(
      `https://www.google.com/maps/search/?api=1&query=${attrs.latitude},${attrs.longitude}`,
    ) || null
  );
}

/** What the hero and the rack draw, read off the sensor attributes. */
export function rackInputs(
  bikes: number,
  attrs: HassEntityAttributes,
  accent: string,
): RackInputs {
  const names = attrs.vehicle_type_names;
  return {
    bikes,
    ebikes: countEbikesAvailable(attrs),
    capacity: numberOr(attrs.capacity, null),
    accent,
    // Battery state is only present when the options flow has
    // `track_e_bike_range` enabled AND upstream reported
    // `current_fuel_percent` for at least one e-bike at this station.
    batteryPct: numberOr(attrs.e_bike_avg_battery_pct, null),
    batterySamples: numberOr(attrs.e_bike_range_samples, 0),
    batteryList: arrayOr(attrs.e_bike_battery_list, null),
    vehicleTypesAvailable: arrayOr(attrs.vehicle_types_available, []),
    vehicleTypeNames: names && typeof names === "object" ? names : {},
    // Live e-bike id set surfaced by the Python coordinator (with a small
    // fallback for old coordinators).
    ebikeIds: getEbikeIds(attrs),
    // Reserved and out-of-service bikes are excluded from
    // `num_bikes_available`, so they fill docks of their own. Like the
    // battery state, the coordinator only sends them when
    // `track_e_bike_range` is on. Clamped so the rack can't draw more
    // slots than it has docks.
    reservedCount: countOf(attrs.bikes_reserved),
    reservedTypes: arrayOr(attrs.bikes_reserved_types, []),
    disabledCount: countOf(attrs.bikes_disabled),
    disabledTypes: arrayOr(attrs.bikes_disabled_types, []),
  };
}

/** Fill `capacity` docks from the station's counts. `capacity` is a whole
 *  number > 0: the card only draws a rack when the station publishes one.
 *  One visual slot per dock, always: available bikes first (e-bikes
 *  leading), then reserved, then out of service, then empty. Available
 *  bikes beyond the capacity become the "+N" note, not extra slots;
 *  reserved and out-of-service bikes that don't fit are dropped. */
export function rackLayout(
  rack: RackInputs,
  capacity: number,
  batteryOption: boolean,
): RackLayout {
  const bikes = Math.min(rack.bikes, capacity);
  const reserved = Math.min(rack.reservedCount, Math.max(0, capacity - bikes));
  const disabled = Math.min(rack.disabledCount, Math.max(0, capacity - bikes - reserved));
  const ebikeCount =
    typeof rack.ebikes === "number" && Number.isFinite(rack.ebikes) && rack.ebikes > 0
      ? rack.ebikes
      : 0;
  const showBattery =
    batteryOption && typeof rack.batteryPct === "number" && rack.batterySamples > 0;
  return {
    bikes,
    ebikes: Math.min(bikes, ebikeCount),
    reserved,
    disabled,
    empty: capacity - bikes - reserved - disabled,
    overflow: Math.max(0, rack.bikes - capacity),
    hasEbikes: ebikeCount > 0,
    showBattery,
    perBike: showBattery && Array.isArray(rack.batteryList) ? rack.batteryList : [],
    ebikeFallbackType: firstEbikeTypeName(
      rack.vehicleTypesAvailable,
      rack.vehicleTypeNames,
      rack.ebikeIds,
    ),
    classicNames: expandClassicTypes(
      rack.vehicleTypesAvailable,
      rack.vehicleTypeNames,
      rack.ebikeIds,
    ),
  };
}
