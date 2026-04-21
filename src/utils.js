import { EBIKE_IDS } from "./const.js";

export function findNextbikeEntities(hass) {
  if (!hass || !hass.states) return [];
  return Object.keys(hass.states).filter((eid) => {
    if (!eid.startsWith("sensor.")) return false;
    const a = hass.states[eid].attributes;
    return (
      a &&
      typeof a.station_id === "string" &&
      typeof a.system_id === "string" &&
      a.system_id.startsWith("nextbike_") &&
      typeof a.attribution === "string" &&
      a.attribution.startsWith("Data: nextbike")
    );
  });
}

function normaliseStationEntry(raw) {
  if (typeof raw === "string") {
    return raw.includes(".") ? { entity: raw } : null;
  }
  if (!raw || typeof raw !== "object" || typeof raw.entity !== "string") {
    return null;
  }
  return { entity: raw.entity };
}

export function normaliseConfig(config) {
  const out = { ...(config || {}) };
  if (typeof out.entity === "string" && out.entity.includes(".")) {
    if (!Array.isArray(out.entities) || out.entities.length === 0) {
      out.entities = [out.entity];
    }
  }
  delete out.entity;

  const raw = Array.isArray(out.entities) ? out.entities : [];
  out.entities = raw.map(normaliseStationEntry).filter((e) => e !== null);

  out.show_rack = out.show_rack !== false;
  out.show_legend = out.show_legend !== false;
  out.show_ebikes = out.show_ebikes !== false;
  out.show_battery = out.show_battery !== false;
  out.show_docks = out.show_docks !== false;
  out.show_flags = out.show_flags !== false;
  out.show_timestamp = out.show_timestamp !== false;
  out.show_rent_button = out.show_rent_button !== false;
  out.hide_attribution = out.hide_attribution === true;
  if (out.layout !== "tabs") out.layout = "stacked";

  return out;
}

export function countEbikesAvailable(attrs) {
  // Best-effort count from `vehicle_types_available`. We mirror the
  // EBIKE_IDS set the Python coordinator uses for its own e-bikes
  // sensor; users who expose that sensor should trust it over this
  // card-side computation.
  const breakdown = attrs?.vehicle_types_available;
  if (!Array.isArray(breakdown)) return null;
  let total = 0;
  for (const row of breakdown) {
    if (!row || typeof row !== "object") continue;
    const tid = String(row.vehicle_type_id || "");
    const count = row.count;
    if (EBIKE_IDS.has(tid) && Number.isFinite(count)) total += count;
  }
  return total;
}

export function firstEbikeTypeName(vehicleTypesAvailable, vehicleTypeNames) {
  if (!Array.isArray(vehicleTypesAvailable)) return null;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id || "");
    if (EBIKE_IDS.has(tid) && vehicleTypeNames?.[tid]) {
      return vehicleTypeNames[tid];
    }
  }
  return null;
}

export function expandClassicTypes(vehicleTypesAvailable, vehicleTypeNames) {
  // Flatten `[{vehicle_type_id, count}]` into a sequential list of
  // type names for classic (non-e-bike) slots, in the order they
  // appear in vehicle_types_available. Best-effort — we don't know
  // which specific slot holds which bike.
  const out = [];
  if (!Array.isArray(vehicleTypesAvailable)) return out;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id || "");
    const count = Number.isFinite(row?.count) ? row.count : 0;
    if (EBIKE_IDS.has(tid) || count <= 0) continue;
    const name = vehicleTypeNames?.[tid] || "";
    for (let i = 0; i < count; i++) out.push(name);
  }
  return out;
}

export function batteryColor(pct) {
  // Thresholded scale — sharp breakpoints read more clearly than a
  // continuous gradient at 16x18 px. Matches common battery-level UI.
  if (!Number.isFinite(pct)) return "#2ecc71";
  if (pct >= 75) return "#2ecc71"; // green
  if (pct >= 50) return "#8bc34a"; // lime-green
  if (pct >= 25) return "#ffa726"; // amber
  return "#e53935"; // red
}

export function relativeTime(tsSeconds, t) {
  if (!Number.isFinite(tsSeconds)) return null;
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
export function cleanStationName(rawName) {
  return String(rawName).replace(/\s+(Bikes available|Räder verfügbar)$/, "");
}
