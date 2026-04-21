/**
 * Nextbike Austria Card v0.2.1
 * Custom Lovelace card for nextbike station dashboards.
 * https://github.com/rolandzeiner/nextbike-austria
 */

// Must match CARD_VERSION in custom_components/nextbike_austria/const.py
// byte-for-byte — drift causes an infinite reload-banner loop.
const CARD_VERSION = "0.2.1";

// System-specific brand tints for the header accent. Pulled from each
// operator's public brand guides; fallbacks to theme primary otherwise.
const SYSTEM_ACCENT = {
  nextbike_wr: "#DC2026", // WienMobil Rad red
  nextbike_la: "#004E9E", // NÖ blue
  nextbike_si: "#C8102E", // Innsbruck Stadtrad red
  nextbike_vt: "#009D58", // VVT REGIORAD green
  nextbike_al: "#E30613", // Linz red
  nextbike_ka: "#FFC20E", // Klagenfurt yellow
};

const SYSTEM_LABEL = {
  nextbike_wr: "Wien",
  nextbike_la: "Niederösterreich",
  nextbike_si: "Innsbruck",
  nextbike_vt: "Tirol",
  nextbike_al: "Linz",
  nextbike_ka: "Klagenfurt",
};

const TRANSLATIONS = {
  de: {
    no_entities_picked: "Keine Station ausgewählt",
    no_entities_available: "Keine Nextbike-Sensoren gefunden",
    offline: "offline",
    no_rental: "keine Ausleihe",
    no_return: "keine Rückgabe",
    virtual_station: "virtuelle Station",
    bikes: "Räder",
    bike: "Rad",
    docks: "Plätze",
    dock: "Platz",
    ebikes: "E-Bikes",
    capacity: "Kapazität",
    last_updated: "aktualisiert",
    now: "gerade eben",
    seconds_ago: "vor {n}s",
    minutes_ago: "vor {n}min",
    hours_ago: "vor {n}h",
    rent_in_app: "In App mieten",
    open_map: "Karte",
    legend_bike: "Rad",
    legend_ebike: "E-Bike",
    legend_empty: "Freier Platz",
    legend_overflow: "Überzählig",
    legend_reserved: "Reserviert",
    reserved: "Reserviert",
    legend_disabled: "Ausser Betrieb",
    disabled: "Ausser Betrieb",
    version_update:
      "Nextbike Austria wurde auf v{v} aktualisiert — bitte neu laden",
    version_reload: "Neu laden",
    editor: {
      section_stations: "Stationen",
      stations_hint: "Eine oder mehrere Stationen anzeigen.",
      section_display: "Anzeige",
      layout_label: "Mehrfach-Layout",
      layout_stacked: "Gestapelt",
      layout_tabs: "Reiter",
      show_rack: "Bike-Rack anzeigen",
      show_legend: "Legende anzeigen",
      show_battery: "Batterie im E-Bike-Slot anzeigen",
      show_ebikes: "E-Bike-Anzeige",
      show_docks: "Plätze anzeigen",
      show_flags: "Statussymbole anzeigen",
      show_timestamp: "Zeitstempel anzeigen",
      show_rent_button: "App-Mietlink anzeigen",
      hide_attribution: "Datenquelle ausblenden",
      no_sensors_available:
        "Keine Nextbike-Sensoren verfügbar. Erst eine Station über Einstellungen → Geräte & Dienste hinzufügen.",
    },
  },
  en: {
    no_entities_picked: "No station selected",
    no_entities_available: "No nextbike sensors found",
    offline: "offline",
    no_rental: "no rentals",
    no_return: "no returns",
    virtual_station: "virtual station",
    bikes: "bikes",
    bike: "bike",
    docks: "docks",
    dock: "dock",
    ebikes: "e-bikes",
    capacity: "capacity",
    last_updated: "updated",
    now: "just now",
    seconds_ago: "{n}s ago",
    minutes_ago: "{n}m ago",
    hours_ago: "{n}h ago",
    rent_in_app: "Rent in app",
    open_map: "Map",
    legend_bike: "Bike",
    legend_ebike: "E-bike",
    legend_empty: "Empty dock",
    legend_overflow: "Overflow",
    legend_reserved: "Reserved",
    reserved: "Reserved",
    legend_disabled: "Out of service",
    disabled: "Out of service",
    version_update:
      "Nextbike Austria updated to v{v} — please reload",
    version_reload: "Reload",
    editor: {
      section_stations: "Stations",
      stations_hint: "Pick one or more stations to display.",
      section_display: "Display",
      layout_label: "Multi-station layout",
      layout_stacked: "Stacked",
      layout_tabs: "Tabs",
      show_rack: "Show bike rack",
      show_legend: "Show rack legend",
      show_battery: "Show battery level inside e-bike slot",
      show_ebikes: "Show e-bike pill",
      show_docks: "Show docks",
      show_flags: "Show operational flags",
      show_timestamp: "Show timestamp",
      show_rent_button: "Show 'Rent in app' link",
      hide_attribution: "Hide data source",
      no_sensors_available:
        "No nextbike sensors available. Add a station first via Settings → Devices & Services.",
    },
  },
};

const _esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function _findNextbikeEntities(hass) {
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

function _normaliseStationEntry(raw) {
  if (typeof raw === "string") {
    return raw.includes(".") ? { entity: raw } : null;
  }
  if (!raw || typeof raw !== "object" || typeof raw.entity !== "string") {
    return null;
  }
  return { entity: raw.entity };
}

function _normaliseConfig(config) {
  const out = { ...(config || {}) };
  if (typeof out.entity === "string" && out.entity.includes(".")) {
    if (!Array.isArray(out.entities) || out.entities.length === 0) {
      out.entities = [out.entity];
    }
  }
  delete out.entity;

  const raw = Array.isArray(out.entities) ? out.entities : [];
  out.entities = raw
    .map(_normaliseStationEntry)
    .filter((e) => e !== null);

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

function _countEbikesAvailable(attrs) {
  // Best-effort count from the `vehicle_types_available` breakdown.
  // Without the `vehicle_types` manifest we can't be 100% sure which
  // IDs are e-bikes, but nextbike only ever uses these two propulsion
  // types so their vehicle_type_ids are stable within each system.
  // We fall back to heuristics: any numeric id we've seen in Vienna /
  // Innsbruck / Tirol / Linz e-bike fleets. Users who expose a separate
  // e-bikes sensor should trust that over this card-side computation.
  const breakdown = attrs?.vehicle_types_available;
  if (!Array.isArray(breakdown)) return null;
  // Known e-bike vehicle_type_ids across Austrian nextbike systems as
  // of April 2026. If nextbike adds new ones this list grows; the
  // standalone `E-bikes available` sensor uses the live
  // vehicle_types.json for ground truth. This heuristic only drives
  // the optional card pill.
  const EBIKE_IDS = new Set(["143", "183", "200"]);
  let total = 0;
  for (const row of breakdown) {
    if (!row || typeof row !== "object") continue;
    const tid = String(row.vehicle_type_id || "");
    const count = row.count;
    if (EBIKE_IDS.has(tid) && Number.isFinite(count)) total += count;
  }
  return total;
}

// Known e-bike vehicle_type_ids across Austrian nextbike systems — same
// list used by `_countEbikesAvailable`. Canonical home is
// coordinator.py EBIKE_PROPULSIONS, but the card can't reach Python so
// we mirror the ids the aggregator cares about.
const _EBIKE_IDS = new Set(["143", "183", "200"]);

function _firstEbikeTypeName(vehicleTypesAvailable, vehicleTypeNames) {
  if (!Array.isArray(vehicleTypesAvailable)) return null;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id || "");
    if (_EBIKE_IDS.has(tid) && vehicleTypeNames?.[tid]) {
      return vehicleTypeNames[tid];
    }
  }
  return null;
}

function _expandClassicTypes(vehicleTypesAvailable, vehicleTypeNames) {
  // Flatten `[{vehicle_type_id, count}]` into a sequential list of
  // type names for classic (non-e-bike) slots. Order matches the
  // vehicle_types_available order, which is the best we can do — we
  // don't know which specific slot holds which bike.
  const out = [];
  if (!Array.isArray(vehicleTypesAvailable)) return out;
  for (const row of vehicleTypesAvailable) {
    const tid = String(row?.vehicle_type_id || "");
    const count = Number.isFinite(row?.count) ? row.count : 0;
    if (_EBIKE_IDS.has(tid) || count <= 0) continue;
    const name = vehicleTypeNames?.[tid] || "";
    for (let i = 0; i < count; i++) out.push(name);
  }
  return out;
}

function _batteryColor(pct) {
  // Thresholded scale — sharp breakpoints read more clearly than a
  // continuous gradient at 16x18 px. ≥75 green, 50–75 lime, 25–50 amber,
  // <25 red. Matches common battery-level UI conventions.
  if (!Number.isFinite(pct)) return "#2ecc71";
  if (pct >= 75) return "#2ecc71"; // green
  if (pct >= 50) return "#8bc34a"; // lime-green
  if (pct >= 25) return "#ffa726"; // amber
  return "#e53935"; // red
}

function _relativeTime(tsSeconds, t) {
  if (!Number.isFinite(tsSeconds)) return null;
  const ageSec = Math.max(0, Math.floor(Date.now() / 1000 - tsSeconds));
  if (ageSec < 10) return t("now");
  if (ageSec < 60) return t("seconds_ago").replace("{n}", String(ageSec));
  if (ageSec < 3600) {
    return t("minutes_ago").replace("{n}", String(Math.floor(ageSec / 60)));
  }
  return t("hours_ago").replace("{n}", String(Math.floor(ageSec / 3600)));
}

const CARD_STYLE = `
  .wrap { padding: 12px 16px 10px; }
  .banner {
    background: var(--warning-color, #ffa000);
    color: #fff;
    padding: 8px 12px;
    margin: -12px -16px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .banner button {
    background: #fff;
    color: var(--warning-color, #ffa000);
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    margin-bottom: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex: 0 0 auto;
    padding: 8px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    font-size: 0.95em;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  .tab:hover { color: var(--primary-text-color); }
  .station {
    margin-bottom: 0;
  }
  .station:not(:last-child) {
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
  }
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .accent {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--primary-color);
  }
  .title {
    font-size: 1.05em;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .subtitle {
    font-size: 0.78em;
    color: var(--secondary-text-color);
    font-weight: 400;
    letter-spacing: 0.2px;
  }
  .header-link {
    color: var(--secondary-text-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.78em;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .header-link:hover { opacity: 1; color: var(--primary-color); }
  .header-link ha-icon { --mdc-icon-size: 16px; }
  .primary {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 6px 0 2px;
  }
  .bikes-num {
    font-size: 2.4em;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .bikes-of {
    font-size: 1em;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  .bikes-label {
    color: var(--secondary-text-color);
    font-size: 0.95em;
    margin-left: -6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.78em;
    font-weight: 600;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
  }
  .pill ha-icon { --mdc-icon-size: 14px; }
  .pill.muted {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    color: var(--secondary-text-color);
  }
  .pill-row {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
    align-self: center;
  }
  .rack {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    margin: 8px 0 4px;
    padding: 6px 8px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--secondary-text-color) 4%, transparent);
  }
  .slot {
    display: block;
    width: 16px;
    height: 18px;
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 16px;
    line-height: 0;
    padding: 0;
    margin: 0;
  }
  .slot.filled {
    background: var(--primary-color);
  }
  .slot.filled.ebike {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 55%, #ffd740 55%, #ffd740 100%);
  }
  /* Battery-fill variant: vertical gradient from bottom (filled) to top
     (empty). --bat-pct and --bat-color are set inline per slot. The
     empty portion is a desaturated version of the same hue so shape
     still reads as an e-bike slot, with an outline so 0% is visible. */
  .slot.filled.ebike.battery {
    background: linear-gradient(
      to top,
      var(--bat-color, #2ecc71) var(--bat-pct, 0%),
      color-mix(in srgb, var(--bat-color, #2ecc71) 15%, transparent) var(--bat-pct, 0%)
    );
    outline: 1px solid color-mix(in srgb, var(--bat-color, #2ecc71) 60%, transparent);
    outline-offset: -1px;
  }
  .slot.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  /* Reserved: a bike is physically at the station but held for another
     user. Rendered as extra slots past num_bikes_available, taking up
     capacity that would otherwise paint as empty docks. Solid outline
     + lock icon so it reads clearly against both empty (dashed) and
     filled (solid fill) neighbours. */
  .slot.reserved {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
  }
  .slot.reserved ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.reserved {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    color: var(--secondary-text-color);
  }
  .legend-swatch.reserved ha-icon {
    --mdc-icon-size: 9px;
  }
  /* Disabled: broken / out of service. Amber tint + wrench icon —
     different enough from reserved (neutral grey lock) that the
     concepts don't blur together at a glance. */
  .slot.disabled {
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #e65100;
  }
  .slot.disabled ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    color: #e65100;
  }
  .legend-swatch.disabled ha-icon {
    --mdc-icon-size: 9px;
  }
  .slot.overflow {
    background: color-mix(in srgb, var(--primary-color) 50%, transparent);
  }
  .rack-note {
    font-size: 0.75em;
    line-height: 18px;
    color: var(--secondary-text-color);
    margin-left: 6px;
    flex-shrink: 0;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin: 0 0 6px;
    padding: 0 2px;
    font-size: 0.72em;
    color: var(--secondary-text-color);
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .legend-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 12px;
    line-height: 0;
    padding: 0;
    margin: 0;
    vertical-align: middle;
  }
  .legend-swatch.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  .legend-overflow {
    padding: 0 4px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.82em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .flag ha-icon { --mdc-icon-size: 14px; }
  .flag.warn { color: var(--warning-color, #ffa000); }
  .flag.err { color: var(--error-color, #db4437); }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 10px;
    font-size: 0.78em;
    color: var(--secondary-text-color);
  }
  .footer a.rent {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .footer a.rent:hover { text-decoration: underline; }
  .footer ha-icon { --mdc-icon-size: 14px; }
  .attr {
    margin-top: 8px;
    font-size: 0.72em;
    color: var(--secondary-text-color);
    text-align: center;
    opacity: 0.7;
  }
  .empty-state {
    padding: 20px 0;
    text-align: center;
    color: var(--secondary-text-color);
  }
`;

class NextbikeAustriaCard extends HTMLElement {
  _config = {};
  _hass = null;
  _versionMismatch = null;
  _lastFingerprint = null;
  _activeTab = 0;
  _tickTimer = null;

  constructor() {
    super();
    // Shadow DOM scopes our CSS — without it, every class name (.station,
    // .stop-name, .chip, .tab, .editor, .section-header, …) leaks into
    // the global page scope and collides with sibling custom cards
    // rendered into light DOM.
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("nextbike-austria-card: config must be an object");
    }
    this._config = _normaliseConfig(config);
    this._lastFingerprint = null;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._checkCardVersion();
      // Tick once a minute so the "updated N min ago" label stays honest
      // between coordinator polls. Guarded against repeated connections
      // by the !this._tickTimer check.
      if (!this._tickTimer) {
        this._tickTimer = setInterval(() => {
          this._lastFingerprint = null;
          this._render();
        }, 60_000);
      }
    }
    const fp = this._fingerprint();
    if (fp === this._lastFingerprint) return;
    this._lastFingerprint = fp;
    this._render();
  }

  disconnectedCallback() {
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  getCardSize() {
    const n = (this._config.entities || []).length || 1;
    return Math.min(12, 3 + n * 3);
  }

  static getConfigElement() {
    return document.createElement("nextbike-austria-card-editor");
  }

  static getStubConfig(hass) {
    const entities = _findNextbikeEntities(hass);
    return {
      entities: entities.length ? [entities[0]] : [],
    };
  }

  async _checkCardVersion() {
    if (!this._hass?.callWS) return;
    try {
      const result = await this._hass.callWS({
        type: "nextbike_austria/card_version",
      });
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
        this._lastFingerprint = null;
        this._render();
      }
    } catch (_) {
      /* backend may not support the command yet */
    }
  }

  _lang() {
    const hl = this._hass?.language || "en";
    return hl.startsWith("de") ? "de" : "en";
  }

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _resolveEntities() {
    const picked = Array.isArray(this._config.entities)
      ? this._config.entities.filter((s) => this._hass?.states[s.entity])
      : [];
    if (picked.length) return picked;
    const available = _findNextbikeEntities(this._hass);
    return available.length ? [{ entity: available[0] }] : [];
  }

  _fingerprint() {
    if (!this._hass) return null;
    const cfgKey = JSON.stringify(this._config);
    const stations = this._resolveEntities();
    const keys = stations.map((s) => {
      const st = this._hass.states[s.entity];
      if (!st) return `${s.entity}#missing`;
      const a = st.attributes || {};
      return [
        s.entity,
        st.state,
        a.num_docks_available ?? "?",
        a.capacity ?? "?",
        a.last_reported ?? "?",
        a.is_installed ? 1 : 0,
        a.is_renting ? 1 : 0,
        a.is_returning ? 1 : 0,
      ].join("|");
    });
    return `${this._versionMismatch || ""}||${cfgKey}||${keys.join(";")}`;
  }

  _render() {
    if (!this._hass) return;
    const stations = this._resolveEntities();
    const useTabs =
      this._config.layout === "tabs" && stations.length >= 2;
    if (useTabs && this._activeTab >= stations.length) this._activeTab = 0;

    let body;
    if (!stations.length) {
      body = this._renderEmpty();
    } else if (useTabs) {
      body =
        this._renderTabs(stations) +
        this._renderStation(stations[this._activeTab]);
    } else {
      body = stations.map((s) => this._renderStation(s)).join("");
    }

    const attribution =
      stations
        .map((s) => this._hass.states[s.entity]?.attributes?.attribution)
        .find((v) => typeof v === "string" && v.length > 0) ||
      "Data: nextbike GmbH, CC0-1.0";

    const attrHtml = this._config.hide_attribution
      ? ""
      : `<div class="attr">${_esc(attribution)}</div>`;

    this.shadowRoot.innerHTML =`
      <ha-card>
        <style>${CARD_STYLE}</style>
        <div class="wrap">
          ${this._versionMismatch ? this._renderBanner() : ""}
          ${body}
          ${attrHtml}
        </div>
      </ha-card>
    `;

    const reloadBtn = this.shadowRoot.querySelector(".banner button");
    if (reloadBtn) reloadBtn.addEventListener("click", () => window.location.reload());

    this.shadowRoot.querySelectorAll(".tab[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.tab, 10);
        if (Number.isFinite(i) && i !== this._activeTab) {
          this._activeTab = i;
          this._render();
        }
      });
    });
  }

  _renderBanner() {
    const msg = this._t("version_update").replace(
      "{v}",
      this._versionMismatch || "?",
    );
    return `
      <div class="banner">
        <span>${_esc(msg)}</span>
        <button type="button">${_esc(this._t("version_reload"))}</button>
      </div>
    `;
  }

  _renderEmpty() {
    const available = _findNextbikeEntities(this._hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return `<div class="empty-state">${_esc(this._t(key))}</div>`;
  }

  _renderTabs(stations) {
    const buttons = stations
      .map((s, i) => {
        const a = this._hass.states[s.entity]?.attributes || {};
        const name = a.friendly_name || s.entity;
        // Show just the station name, not the full "… Bikes available" suffix
        // added by the translation. Strip the sensor-kind slug from the end.
        const label = String(name).replace(
          /\s+(Bikes available|Räder verfügbar)$/,
          "",
        );
        const active = i === this._activeTab ? " active" : "";
        return `<button type="button" class="tab${active}" data-tab="${i}">${_esc(
          label,
        )}</button>`;
      })
      .join("");
    return `<div class="tabs">${buttons}</div>`;
  }

  _renderStation(stopCfg) {
    const state = this._hass.states[stopCfg.entity];
    if (!state) {
      return `<div class="empty-state">${_esc(this._t("no_entities_picked"))}</div>`;
    }
    const a = state.attributes || {};
    const bikes = Number.isFinite(parseInt(state.state, 10))
      ? parseInt(state.state, 10)
      : 0;
    const capacity = typeof a.capacity === "number" ? a.capacity : null;
    const docks =
      typeof a.num_docks_available === "number" ? a.num_docks_available : null;
    const ebikes = _countEbikesAvailable(a);
    // Battery state is only present when the options flow has
    // `track_e_bike_range` enabled AND upstream reported
    // `current_range_meters` for at least one e-bike at this station.
    // Absent keys are intentional; templates shouldn't receive stale zeros.
    const batteryPct =
      typeof a.e_bike_avg_battery_pct === "number"
        ? a.e_bike_avg_battery_pct
        : null;
    const batterySamples =
      typeof a.e_bike_range_samples === "number" ? a.e_bike_range_samples : 0;
    // Per-bike list, sorted max→min by the coordinator. Enables
    // per-slot fills + tooltips. When missing (opt-off, or pre-first-
    // fetch), slots fall back to uniform-avg rendering.
    const batteryList = Array.isArray(a.e_bike_battery_list)
      ? a.e_bike_battery_list
      : null;
    // Map {vehicle_type_id: display_name}. Used to tooltip classic
    // bike slots with a real name ("Classic Bike", "+ Children's seat"
    // …) rather than a generic fallback.
    const vehicleTypeNames =
      a.vehicle_type_names && typeof a.vehicle_type_names === "object"
        ? a.vehicle_type_names
        : {};
    const vehicleTypesAvailable = Array.isArray(a.vehicle_types_available)
      ? a.vehicle_types_available
      : [];
    // Reserved bikes occupy extra rack slots beyond `num_bikes_available`
    // (upstream excludes reserved from the available count). `types`
    // parallels `count` for slot-level tooltips; both are only present
    // when tracking is enabled AND at least one bike is reserved here.
    const reservedCount =
      typeof a.bikes_reserved === "number" ? a.bikes_reserved : 0;
    const reservedTypes = Array.isArray(a.bikes_reserved_types)
      ? a.bikes_reserved_types
      : [];
    // Disabled = out of service. Same pattern as reserved — upstream
    // keeps them out of the available count, so they're rendered as
    // extra wrench slots in the remaining rack capacity.
    const disabledCount =
      typeof a.bikes_disabled === "number" ? a.bikes_disabled : 0;
    const disabledTypes = Array.isArray(a.bikes_disabled_types)
      ? a.bikes_disabled_types
      : [];
    const systemId = a.system_id || "";
    const accent = SYSTEM_ACCENT[systemId] || "var(--primary-color)";
    const systemName = SYSTEM_LABEL[systemId] || systemId.replace(/^nextbike_/, "");
    const rentUri = typeof a.rental_uri === "string" ? a.rental_uri : "";

    // Station title: strip the appended sensor-type suffix that HA
    // builds from `has_entity_name=True` + translation_key. We want the
    // clean device name. Friendly_name is the safe source; entity_id
    // is a fallback.
    const fullName = a.friendly_name || stopCfg.entity;
    const title = String(fullName).replace(
      /\s+(Bikes available|Räder verfügbar)$/,
      "",
    );

    const mapUrl =
      typeof a.latitude === "number" && typeof a.longitude === "number"
        ? `https://www.google.com/maps/search/?api=1&query=${a.latitude},${a.longitude}`
        : null;

    // Header
    const headerHtml = `
      <div class="header">
        <div class="accent" style="background:${accent}"></div>
        <div style="min-width:0;flex:1;">
          <div class="title">${_esc(title)}</div>
          <div class="subtitle">${_esc(systemName)}</div>
        </div>
        ${
          mapUrl
            ? `<a class="header-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer" title="${_esc(this._t("open_map"))}">
                 <ha-icon icon="mdi:map-marker"></ha-icon>${_esc(this._t("open_map"))}
               </a>`
            : ""
        }
      </div>
    `;

    // Primary: big bikes number + capacity suffix + pill row
    const capSuffix =
      capacity !== null ? ` <span class="bikes-of">/ ${capacity}</span>` : "";
    const bikeWord = bikes === 1 ? this._t("bike") : this._t("bikes");
    const pills = [];
    if (this._config.show_ebikes && Number.isFinite(ebikes) && ebikes > 0) {
      // Amber matches the diagonal "e-bike" stripe inside the rack
      // slot — same visual vocabulary for the "there are e-bikes here"
      // signal, regardless of whether per-bike charge data is known.
      // Text uses the theme text colour so the count stays readable
      // on both light and dark themes; the amber tint carries identity.
      pills.push(
        `<span class="pill" style="background:color-mix(in srgb, #ffd740 28%, transparent);color:var(--primary-text-color);">
           <ha-icon icon="mdi:lightning-bolt" style="color:#c28a00;"></ha-icon>${ebikes} ${_esc(this._t("ebikes"))}
         </span>`,
      );
    }
    // Only render the docks pill when capacity is actually published.
    // Stations with null capacity (virtual or just unpublished racks —
    // e.g. St. Pölten Bildungscampus) still report `num_docks_available`
    // as 0 upstream, which would otherwise paint a misleading "0 docks".
    if (this._config.show_docks && docks !== null && capacity !== null) {
      const dockWord = docks === 1 ? this._t("dock") : this._t("docks");
      pills.push(
        `<span class="pill muted">
           <ha-icon icon="mdi:parking"></ha-icon>${docks} ${_esc(dockWord)}
         </span>`,
      );
    }
    const primaryHtml = `
      <div class="primary">
        <span class="bikes-num">${bikes}</span>${capSuffix}
        <span class="bikes-label">${_esc(bikeWord)}</span>
        <span class="pill-row">${pills.join("")}</span>
      </div>
    `;

    // Bike rack — only when capacity is known AND requested in config.
    let rackHtml = "";
    if (this._config.show_rack && capacity !== null && capacity > 0) {
      rackHtml = this._renderRack(
        bikes,
        ebikes,
        capacity,
        accent,
        batteryPct,
        batterySamples,
        batteryList,
        vehicleTypesAvailable,
        vehicleTypeNames,
        reservedCount,
        reservedTypes,
        disabledCount,
        disabledTypes,
      );
    }

    // Operational flags
    let flagsHtml = "";
    if (this._config.show_flags) {
      const flagBits = [];
      if (a.is_installed === false) {
        flagBits.push(
          `<span class="flag err"><ha-icon icon="mdi:alert-circle"></ha-icon>${_esc(this._t("offline"))}</span>`,
        );
      }
      if (a.is_renting === false) {
        flagBits.push(
          `<span class="flag warn"><ha-icon icon="mdi:cancel"></ha-icon>${_esc(this._t("no_rental"))}</span>`,
        );
      }
      if (a.is_returning === false) {
        flagBits.push(
          `<span class="flag warn"><ha-icon icon="mdi:cancel"></ha-icon>${_esc(this._t("no_return"))}</span>`,
        );
      }
      if (a.is_virtual_station === true) {
        flagBits.push(
          `<span class="flag"><ha-icon icon="mdi:map-marker-radius"></ha-icon>${_esc(this._t("virtual_station"))}</span>`,
        );
      }
      if (flagBits.length) {
        flagsHtml = `<div class="flags">${flagBits.join("")}</div>`;
      }
    }

    // Footer: rent button + relative timestamp
    const footerBits = [];
    if (this._config.show_rent_button && rentUri) {
      footerBits.push(
        `<a class="rent" href="${_esc(rentUri)}" target="_blank" rel="noopener noreferrer">
           <ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>${_esc(this._t("rent_in_app"))}
         </a>`,
      );
    }
    if (this._config.show_timestamp) {
      const rel = _relativeTime(a.last_reported, (k) => this._t(k));
      if (rel) {
        footerBits.push(
          `<span>${_esc(this._t("last_updated"))} ${_esc(rel)}</span>`,
        );
      }
    }
    const footerHtml = footerBits.length
      ? `<div class="footer">${footerBits.join("")}</div>`
      : "";

    return `
      <div class="station">
        ${headerHtml}
        ${primaryHtml}
        ${rackHtml}
        ${flagsHtml}
        ${footerHtml}
      </div>
    `;
  }

  _renderRack(
    bikes,
    ebikes,
    capacity,
    accent,
    batteryPct,
    batterySamples,
    batteryList,
    vehicleTypesAvailable,
    vehicleTypeNames,
    reservedCount,
    reservedTypes,
    disabledCount,
    disabledTypes,
  ) {
    // One visual slot per dock, always. Overflow (bikes > capacity —
    // happens at stations where people cram bikes beyond the rack count)
    // is carried by the "+N" note below the rack, not by extra slots.
    const totalSlots = capacity;
    const bikesVis = Math.min(bikes, capacity);
    // Reserved + disabled slots each eat into what would otherwise
    // render as empty docks. Order: reserved first, then disabled, then
    // empty. Each capped at remaining capacity so we never blow past
    // the rack.
    const reservedVis = Math.min(
      Number.isFinite(reservedCount) ? reservedCount : 0,
      Math.max(0, totalSlots - bikesVis),
    );
    const disabledVis = Math.min(
      Number.isFinite(disabledCount) ? disabledCount : 0,
      Math.max(0, totalSlots - bikesVis - reservedVis),
    );
    const hasEbikes = Number.isFinite(ebikes) && ebikes > 0;
    const ebikesVis = hasEbikes ? Math.min(bikesVis, ebikes) : 0;
    // Battery-fill rendering kicks in when the entry opted into range
    // tracking AND upstream reported at least one charge sample.
    const showBattery =
      this._config.show_battery &&
      typeof batteryPct === "number" &&
      batterySamples > 0;
    // Per-bike list (sorted max→min) drives individual slot fills +
    // tooltips when available. Falls back to uniform-avg for any
    // e-bikes that didn't report (list shorter than ebikesVis).
    const perBike =
      showBattery && Array.isArray(batteryList) ? batteryList : [];

    // Pick the e-bike type name for fallback tooltips (slots without
    // a matching batteryList entry). Picks the first e-bike-propulsion
    // type present at the station.
    const ebikeFallbackType = _firstEbikeTypeName(
      vehicleTypesAvailable,
      vehicleTypeNames,
    );
    // Flatten classic-bike types in the order they appear in
    // vehicle_types_available, for ordered tooltip assignment.
    const classicSequence = _expandClassicTypes(
      vehicleTypesAvailable,
      vehicleTypeNames,
    );
    let classicCursor = 0;

    const slots = [];
    for (let i = 0; i < bikesVis; i++) {
      const isEbike = i < ebikesVis;
      if (isEbike) {
        const entry = perBike[i] || null; // null ⇒ no battery data for this slot
        const typeName = entry?.type || ebikeFallbackType || this._t("legend_ebike");
        if (entry && showBattery) {
          const pct = entry.pct;
          const color = _batteryColor(pct);
          const tooltip = `${typeName} · ${Math.round(pct)}%`;
          slots.push(
            `<div class="slot filled ebike battery" style="--bat-pct:${pct}%;--bat-color:${color};" title="${_esc(tooltip)}"></div>`,
          );
        } else {
          const tooltip = showBattery
            ? `${typeName} · ${_esc(this._lang() === "de" ? "Batterie unbekannt" : "battery unknown")}`
            : typeName;
          slots.push(
            `<div class="slot filled ebike" style="background:linear-gradient(135deg, ${accent} 0%, ${accent} 55%, #ffd740 55%, #ffd740 100%);" title="${_esc(tooltip)}"></div>`,
          );
        }
      } else {
        const typeName =
          classicSequence[classicCursor++] || this._t("legend_bike");
        slots.push(
          `<div class="slot filled" style="background:${accent};" title="${_esc(typeName)}"></div>`,
        );
      }
    }
    // Reserved slots come right after filled bikes — visually grouped
    // as "bikes that are here but unavailable" before the genuinely
    // empty docks.
    const reservedLabel = this._t("reserved");
    for (let i = 0; i < reservedVis; i++) {
      const typeName = reservedTypes?.[i];
      const tooltip = typeName ? `${typeName} · ${reservedLabel}` : reservedLabel;
      slots.push(
        `<div class="slot reserved" title="${_esc(tooltip)}"><ha-icon icon="mdi:lock"></ha-icon></div>`,
      );
    }
    // Disabled (broken) slots after reserved, before empty.
    const disabledLabel = this._t("disabled");
    for (let i = 0; i < disabledVis; i++) {
      const typeName = disabledTypes?.[i];
      const tooltip = typeName ? `${typeName} · ${disabledLabel}` : disabledLabel;
      slots.push(
        `<div class="slot disabled" title="${_esc(tooltip)}"><ha-icon icon="mdi:wrench"></ha-icon></div>`,
      );
    }
    for (let i = bikesVis + reservedVis + disabledVis; i < totalSlots; i++) {
      slots.push(
        `<div class="slot empty" title="${_esc(this._t("legend_empty"))}"></div>`,
      );
    }

    // Overflow indicator only — bikes exceeding capacity is a genuine
    // edge case (Hoher Markt 29/25) that deserves a visual flag. The
    // raw "45/54" ratio is already shown in the big headline above the
    // rack, so we don't repeat it here.
    const hasOverflow = bikes > capacity;
    const note = hasOverflow
      ? `<span class="rack-note">+${bikes - capacity}</span>`
      : "";

    const rackHtml = `<div class="rack">${slots.join("")}${note}</div>`;
    // Show "empty dock" in the legend whenever at least one empty slot
    // actually rendered — at a full station the concept isn't visible,
    // so don't advertise it.
    const hasEmptyVisible =
      bikesVis + reservedVis + disabledVis < totalSlots;
    const hasReservedVisible = reservedVis > 0;
    const hasDisabledVisible = disabledVis > 0;
    const legendHtml = this._config.show_legend
      ? this._renderLegend(
          accent,
          hasEbikes,
          hasOverflow,
          hasEmptyVisible,
          showBattery
            ? { pct: batteryPct, color: _batteryColor(batteryPct) }
            : null,
          hasReservedVisible,
          hasDisabledVisible,
        )
      : "";
    return `${rackHtml}${legendHtml}`;
  }

  _renderLegend(
    accent,
    hasEbikes,
    hasOverflow,
    hasEmptyVisible,
    battery,
    hasReservedVisible,
    hasDisabledVisible,
  ) {
    // Show legend items only for concepts actually visible in the rack
    // right now. Example: a full station skips "empty dock"; classic-
    // only fleets (NÖ / Klagenfurt) skip the e-bike swatch.
    const items = [
      `<span class="legend-item">
         <span class="legend-swatch" style="background:${accent}"></span>
         ${_esc(this._t("legend_bike"))}
       </span>`,
    ];
    if (hasEbikes) {
      // Legend swatch variant follows what's actually rendered in the
      // rack — vertical-fill battery pattern when per-slot charge is
      // showing, classic amber-diagonal otherwise. Label is the same
      // either way; the rack's colors + hover tooltips carry the
      // charge-level detail.
      const swatchStyle = battery
        ? `background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;`
        : `background:linear-gradient(135deg, ${accent} 0%, ${accent} 55%, #ffd740 55%, #ffd740 100%);`;
      items.push(
        `<span class="legend-item">
           <span class="legend-swatch" style="${swatchStyle}"></span>
           ${_esc(this._t("legend_ebike"))}
         </span>`,
      );
    }
    if (hasReservedVisible) {
      items.push(
        `<span class="legend-item">
           <span class="legend-swatch reserved"><ha-icon icon="mdi:lock"></ha-icon></span>
           ${_esc(this._t("legend_reserved"))}
         </span>`,
      );
    }
    if (hasDisabledVisible) {
      items.push(
        `<span class="legend-item">
           <span class="legend-swatch disabled"><ha-icon icon="mdi:wrench"></ha-icon></span>
           ${_esc(this._t("legend_disabled"))}
         </span>`,
      );
    }
    if (hasEmptyVisible) {
      items.push(
        `<span class="legend-item">
           <span class="legend-swatch empty"></span>
           ${_esc(this._t("legend_empty"))}
         </span>`,
      );
    }
    if (hasOverflow) {
      items.push(
        `<span class="legend-item">
           <span class="legend-overflow">+N</span>
           ${_esc(this._t("legend_overflow"))}
         </span>`,
      );
    }
    return `<div class="legend">${items.join("")}</div>`;
  }
}

// ============================================================
// Visual Card Editor
// ============================================================

const EDITOR_STYLE = `
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0,0,0,0.04));
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip:hover { opacity: 0.85; }
  .chip .stop-name { font-weight: 500; }
  .chip .eid {
    font-size: 11px;
    opacity: 0.7;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .toggle-row label {
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .layout-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .layout-buttons button {
    padding: 4px 12px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
  }
  .layout-buttons button.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
`;

class NextbikeAustriaCardEditor extends HTMLElement {
  _config = {};
  _hass = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = _normaliseConfig(config);
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._render();
  }

  _lang() {
    const hl = this._hass?.language || "en";
    return hl.startsWith("de") ? "de" : "en";
  }

  _et(key) {
    return (
      TRANSLATIONS[this._lang()]?.editor?.[key]
      ?? TRANSLATIONS.en.editor[key]
      ?? key
    );
  }

  _t(key) {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _fire() {
    // bubbles + composed required so the event crosses our shadow boundary
    // and reaches the dashboard's card editor listener.
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _toggleStation(eid) {
    const list = [...(this._config.entities || [])];
    const idx = list.findIndex((s) => s.entity === eid);
    const next = idx >= 0
      ? list.filter((_, i) => i !== idx)
      : [...list, { entity: eid }];
    this._config = { ...this._config, entities: next };
    this._fire();
    this._render();
  }

  _setBool(field, value) {
    this._config = { ...this._config, [field]: value };
    this._fire();
    this._render();
  }

  _setLayout(layout) {
    if (layout !== "stacked" && layout !== "tabs") return;
    this._config = { ...this._config, layout };
    this._fire();
    this._render();
  }

  _render() {
    if (!this._hass) return;

    const available = _findNextbikeEntities(this._hass);
    const selected = this._config.entities || [];
    const selectedIds = new Set(selected.map((s) => s.entity));

    const stationChips = available.length
      ? available
          .map((eid) => {
            const a = this._hass.states[eid]?.attributes;
            const friendly = a?.friendly_name || eid;
            const stopName = String(friendly).replace(
              /\s+(Bikes available|Räder verfügbar)$/,
              "",
            );
            const isSel = selectedIds.has(eid);
            return `
              <button
                type="button"
                class="chip ${isSel ? "selected" : ""}"
                data-action="toggle-station"
                data-entity="${_esc(eid)}"
              >
                <span class="stop-name">${_esc(stopName)}</span>
                <span class="eid">${_esc(eid.split(".")[1] || eid)}</span>
              </button>
            `;
          })
          .join("")
      : `<div class="editor-hint">${_esc(this._et("no_sensors_available"))}</div>`;

    const layout = this._config.layout === "tabs" ? "tabs" : "stacked";

    const toggle = (field, labelKey) => {
      const id = `nb-toggle-${field}`;
      const checked = this._config[field] !== false ? "checked" : "";
      return `
        <div class="toggle-row">
          <label for="${id}">${_esc(this._et(labelKey))}</label>
          <ha-switch id="${id}" data-field="${field}" ${checked}></ha-switch>
        </div>
      `;
    };

    // hide_attribution is the one "inverted" toggle — default false, on = hide
    const hideAttrToggle = (() => {
      const on = this._config.hide_attribution === true ? "checked" : "";
      return `
        <div class="toggle-row">
          <label for="nb-toggle-hide_attribution">${_esc(this._et("hide_attribution"))}</label>
          <ha-switch id="nb-toggle-hide_attribution" data-field="hide_attribution" data-invert="1" ${on}></ha-switch>
        </div>
      `;
    })();

    this.shadowRoot.innerHTML =`
      <div class="editor">
        <style>${EDITOR_STYLE}</style>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_stations"))}</div>
          <div class="editor-hint">${_esc(this._et("stations_hint"))}</div>
          <div class="chips">${stationChips}</div>
        </div>

        <div class="editor-section">
          <div class="section-header">${_esc(this._et("section_display"))}</div>
          <div class="toggle-row">
            <span style="font-size:13px;">${_esc(this._et("layout_label"))}</span>
            <div class="layout-buttons">
              <button type="button" data-layout="stacked" class="${layout === "stacked" ? "active" : ""}">${_esc(this._et("layout_stacked"))}</button>
              <button type="button" data-layout="tabs" class="${layout === "tabs" ? "active" : ""}">${_esc(this._et("layout_tabs"))}</button>
            </div>
          </div>
          ${toggle("show_rack", "show_rack")}
          ${toggle("show_legend", "show_legend")}
          ${toggle("show_ebikes", "show_ebikes")}
          ${toggle("show_battery", "show_battery")}
          ${toggle("show_docks", "show_docks")}
          ${toggle("show_flags", "show_flags")}
          ${toggle("show_timestamp", "show_timestamp")}
          ${toggle("show_rent_button", "show_rent_button")}
          ${hideAttrToggle}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    this.shadowRoot.querySelectorAll('[data-action="toggle-station"]').forEach((chip) => {
      chip.addEventListener("click", () =>
        this._toggleStation(chip.dataset.entity),
      );
    });
    this.shadowRoot.querySelectorAll("button[data-layout]").forEach((btn) => {
      btn.addEventListener("click", () => this._setLayout(btn.dataset.layout));
    });
    this.shadowRoot.querySelectorAll("ha-switch[data-field]").forEach((sw) => {
      sw.addEventListener("change", (e) => {
        const field = e.target.dataset.field;
        this._setBool(field, e.target.checked);
      });
    });
  }
}

// ------------------------------------------------------------
// Registration
// ------------------------------------------------------------

try {
  if (!customElements.get("nextbike-austria-card")) {
    customElements.define("nextbike-austria-card", NextbikeAustriaCard);
  }
  if (!customElements.get("nextbike-austria-card-editor")) {
    customElements.define(
      "nextbike-austria-card-editor",
      NextbikeAustriaCardEditor,
    );
  }
} catch (e) {
  console.error("[Nextbike Austria] custom element registration failed", e);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "nextbike-austria-card",
  name: "Nextbike Austria Card",
  description:
    "Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",
  preview: true,
  documentationURL: "https://github.com/rolandzeiner/nextbike-austria",
});

console.info(
  `%c  NEXTBIKE-AUSTRIA-CARD  %c  v${CARD_VERSION}  `,
  "color: #DC2026; font-weight: bold; background: black",
  "color: white; background: dimgray",
);
