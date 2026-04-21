import { LitElement, html, nothing } from "lit";
import { CARD_VERSION, SYSTEM_ACCENT, SYSTEM_LABEL } from "./const.js";
import { TRANSLATIONS, pickLang } from "./translations.js";
import { cardStyles } from "./card-styles.js";
import {
  findNextbikeEntities,
  normaliseConfig,
  countEbikesAvailable,
  firstEbikeTypeName,
  expandClassicTypes,
  batteryColor,
  relativeTime,
  cleanStationName,
} from "./utils.js";

export class NextbikeAustriaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _activeTab: { state: true },
    _versionMismatch: { state: true },
    _tickKey: { state: true },
  };

  static styles = cardStyles;

  constructor() {
    super();
    this._config = {};
    this._activeTab = 0;
    this._versionMismatch = null;
    this._tickKey = 0;
    this._tickTimer = null;
    this._versionChecked = false;
  }

  setConfig(config) {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("nextbike-austria-card: config must be an object");
    }
    this._config = normaliseConfig(config);
  }

  connectedCallback() {
    super.connectedCallback();
    // Tick once a minute so the "updated N min ago" label stays honest
    // between coordinator polls. Bumping _tickKey is enough to trigger
    // a re-render via shouldUpdate.
    if (!this._tickTimer) {
      this._tickTimer = setInterval(() => {
        this._tickKey++;
      }, 60_000);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  willUpdate(changed) {
    if (changed.has("hass") && this.hass && !this._versionChecked) {
      this._versionChecked = true;
      this._checkCardVersion();
    }
  }

  // Performance gate — every entity state change in HA fires a hass
  // update. Without this, we re-render on every change anywhere in the
  // user's HA install. We only care when the entities we render moved.
  shouldUpdate(changed) {
    if (!this._config) return false;
    if (
      changed.has("_config") ||
      changed.has("_activeTab") ||
      changed.has("_versionMismatch") ||
      changed.has("_tickKey")
    ) {
      return true;
    }
    if (!changed.has("hass")) return false;
    const oldHass = changed.get("hass");
    if (!oldHass) return true; // first hass — render
    const stations = this._resolveEntities(this.hass);
    return stations.some((s) => oldHass.states[s.entity] !== this.hass.states[s.entity]);
  }

  getCardSize() {
    const n = (this._config?.entities || []).length || 1;
    return Math.min(12, 3 + n * 3);
  }

  static async getConfigElement() {
    await import("./editor.js");
    return document.createElement("nextbike-austria-card-editor");
  }

  static getStubConfig(hass) {
    const entities = findNextbikeEntities(hass);
    return { entities: entities.length ? [entities[0]] : [] };
  }

  async _checkCardVersion() {
    if (!this.hass?.callWS) return;
    try {
      const result = await this.hass.callWS({
        type: "nextbike_austria/card_version",
      });
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
      }
    } catch (_) {
      /* backend may not support the command yet */
    }
  }

  _t(key) {
    const lang = pickLang(this.hass);
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  _resolveEntities(hass = this.hass) {
    const picked = Array.isArray(this._config?.entities)
      ? this._config.entities.filter((s) => hass?.states[s.entity])
      : [];
    if (picked.length) return picked;
    const available = findNextbikeEntities(hass);
    return available.length ? [{ entity: available[0] }] : [];
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const stations = this._resolveEntities();
    const useTabs = this._config.layout === "tabs" && stations.length >= 2;
    if (useTabs && this._activeTab >= stations.length) this._activeTab = 0;

    const attribution =
      stations
        .map((s) => this.hass.states[s.entity]?.attributes?.attribution)
        .find((v) => typeof v === "string" && v.length > 0) ||
      "Data: nextbike GmbH, CC0-1.0";

    let body;
    if (!stations.length) {
      body = this._renderEmpty();
    } else if (useTabs) {
      body = html`${this._renderTabs(stations)}${this._renderStation(stations[this._activeTab])}`;
    } else {
      body = stations.map((s) => this._renderStation(s));
    }

    return html`
      <ha-card>
        <div class="wrap">
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${body}
          ${this._config.hide_attribution
            ? nothing
            : html`<div class="attr">${attribution}</div>`}
        </div>
      </ha-card>
    `;
  }

  _renderBanner() {
    const msg = this._t("version_update").replace(
      "{v}",
      this._versionMismatch || "?",
    );
    return html`
      <div class="banner">
        <span>${msg}</span>
        <button type="button" @click=${() => window.location.reload()}>
          ${this._t("version_reload")}
        </button>
      </div>
    `;
  }

  _renderEmpty() {
    const available = findNextbikeEntities(this.hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return html`<div class="empty-state">${this._t(key)}</div>`;
  }

  _renderTabs(stations) {
    return html`
      <div class="tabs">
        ${stations.map((s, i) => {
          const a = this.hass.states[s.entity]?.attributes || {};
          const label = cleanStationName(a.friendly_name || s.entity);
          return html`
            <button
              type="button"
              class="tab ${i === this._activeTab ? "active" : ""}"
              @click=${() => this._setActiveTab(i)}
            >
              ${label}
            </button>
          `;
        })}
      </div>
    `;
  }

  _setActiveTab(i) {
    if (Number.isFinite(i) && i !== this._activeTab) {
      this._activeTab = i;
    }
  }

  _renderStation(stopCfg) {
    const state = this.hass.states[stopCfg.entity];
    if (!state) {
      return html`<div class="empty-state">${this._t("no_entities_picked")}</div>`;
    }
    const a = state.attributes || {};
    const bikes = Number.isFinite(parseInt(state.state, 10))
      ? parseInt(state.state, 10)
      : 0;
    const capacity = typeof a.capacity === "number" ? a.capacity : null;
    const docks =
      typeof a.num_docks_available === "number" ? a.num_docks_available : null;
    const ebikes = countEbikesAvailable(a);
    // Battery state only present when the options flow has
    // `track_e_bike_range` enabled AND upstream reported
    // `current_range_meters` for ≥1 e-bike at this station.
    const batteryPct =
      typeof a.e_bike_avg_battery_pct === "number"
        ? a.e_bike_avg_battery_pct
        : null;
    const batterySamples =
      typeof a.e_bike_range_samples === "number" ? a.e_bike_range_samples : 0;
    const batteryList = Array.isArray(a.e_bike_battery_list)
      ? a.e_bike_battery_list
      : null;
    const vehicleTypeNames =
      a.vehicle_type_names && typeof a.vehicle_type_names === "object"
        ? a.vehicle_type_names
        : {};
    const vehicleTypesAvailable = Array.isArray(a.vehicle_types_available)
      ? a.vehicle_types_available
      : [];
    // Reserved bikes occupy extra rack slots beyond `num_bikes_available`.
    const reservedCount =
      typeof a.bikes_reserved === "number" ? a.bikes_reserved : 0;
    const reservedTypes = Array.isArray(a.bikes_reserved_types)
      ? a.bikes_reserved_types
      : [];
    const disabledCount =
      typeof a.bikes_disabled === "number" ? a.bikes_disabled : 0;
    const disabledTypes = Array.isArray(a.bikes_disabled_types)
      ? a.bikes_disabled_types
      : [];
    const systemId = a.system_id || "";
    const accent = SYSTEM_ACCENT[systemId] || "var(--primary-color)";
    const systemName =
      SYSTEM_LABEL[systemId] || systemId.replace(/^nextbike_/, "");
    const rentUri = typeof a.rental_uri === "string" ? a.rental_uri : "";
    const title = cleanStationName(a.friendly_name || stopCfg.entity);
    const mapUrl =
      typeof a.latitude === "number" && typeof a.longitude === "number"
        ? `https://www.google.com/maps/search/?api=1&query=${a.latitude},${a.longitude}`
        : null;

    const bikeWord = bikes === 1 ? this._t("bike") : this._t("bikes");

    return html`
      <div class="station">
        <div class="header">
          <div class="accent" style=${`background:${accent}`}></div>
          <div style="min-width:0;flex:1;">
            <div class="title">${title}</div>
            <div class="subtitle">${systemName}</div>
          </div>
          ${mapUrl
            ? html`
                <a
                  class="header-link"
                  href=${mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title=${this._t("open_map")}
                >
                  <ha-icon icon="mdi:map-marker"></ha-icon>${this._t("open_map")}
                </a>
              `
            : nothing}
        </div>

        <div class="primary">
          <span class="bikes-num">${bikes}</span>
          ${capacity !== null ? html`<span class="bikes-of">/ ${capacity}</span>` : nothing}
          <span class="bikes-label">${bikeWord}</span>
          <span class="pill-row">${this._renderPills(ebikes, docks, capacity)}</span>
        </div>

        ${this._config.show_rack && capacity !== null && capacity > 0
          ? this._renderRack({
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
            })
          : nothing}

        ${this._config.show_flags ? this._renderFlags(a) : nothing}
        ${this._renderFooter(a, rentUri)}
      </div>
    `;
  }

  _renderPills(ebikes, docks, capacity) {
    const out = [];
    if (this._config.show_ebikes && Number.isFinite(ebikes) && ebikes > 0) {
      // Amber matches the diagonal "e-bike" stripe inside the rack slot
      // — same visual vocabulary regardless of whether per-bike charge
      // data is known.
      out.push(html`
        <span class="pill ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${ebikes}
          ${this._t("ebikes")}
        </span>
      `);
    }
    // Only render the docks pill when capacity is actually published.
    // Stations with null capacity (virtual or unpublished racks) still
    // report `num_docks_available` as 0 upstream, which would otherwise
    // paint a misleading "0 docks".
    if (this._config.show_docks && docks !== null && capacity !== null) {
      const dockWord = docks === 1 ? this._t("dock") : this._t("docks");
      out.push(html`
        <span class="pill muted">
          <ha-icon icon="mdi:parking"></ha-icon>${docks} ${dockWord}
        </span>
      `);
    }
    return out;
  }

  _renderRack({
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
  }) {
    // One visual slot per dock, always. Overflow (bikes > capacity) is
    // carried by the "+N" note below the rack, not by extra slots.
    const totalSlots = capacity;
    const bikesVis = Math.min(bikes, capacity);
    // Reserved + disabled slots each eat into what would otherwise
    // render as empty docks. Order: bikes, reserved, disabled, empty.
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
    const showBattery =
      this._config.show_battery &&
      typeof batteryPct === "number" &&
      batterySamples > 0;
    const perBike = showBattery && Array.isArray(batteryList) ? batteryList : [];
    const ebikeFallbackType = firstEbikeTypeName(
      vehicleTypesAvailable,
      vehicleTypeNames,
    );
    const classicSequence = expandClassicTypes(
      vehicleTypesAvailable,
      vehicleTypeNames,
    );
    let classicCursor = 0;

    const slots = [];
    for (let i = 0; i < bikesVis; i++) {
      const isEbike = i < ebikesVis;
      if (isEbike) {
        const entry = perBike[i] || null;
        const typeName = entry?.type || ebikeFallbackType || this._t("legend_ebike");
        if (entry && showBattery) {
          const pct = entry.pct;
          const color = batteryColor(pct);
          slots.push(html`
            <div
              class="slot filled ebike battery"
              style=${`--bat-pct:${pct}%;--bat-color:${color};`}
              title=${`${typeName} · ${Math.round(pct)}%`}
            ></div>
          `);
        } else {
          const tooltip = showBattery
            ? `${typeName} · ${this._t("battery_unknown")}`
            : typeName;
          slots.push(html`
            <div
              class="slot filled ebike"
              style=${`background:linear-gradient(135deg, ${accent} 0%, ${accent} 55%, #ffd740 55%, #ffd740 100%);`}
              title=${tooltip}
            ></div>
          `);
        }
      } else {
        const typeName =
          classicSequence[classicCursor++] || this._t("legend_bike");
        slots.push(html`
          <div
            class="slot filled"
            style=${`background:${accent};`}
            title=${typeName}
          ></div>
        `);
      }
    }
    const reservedLabel = this._t("reserved");
    for (let i = 0; i < reservedVis; i++) {
      const typeName = reservedTypes?.[i];
      const tooltip = typeName ? `${typeName} · ${reservedLabel}` : reservedLabel;
      slots.push(html`
        <div class="slot reserved" title=${tooltip}>
          <ha-icon icon="mdi:lock"></ha-icon>
        </div>
      `);
    }
    const disabledLabel = this._t("disabled");
    for (let i = 0; i < disabledVis; i++) {
      const typeName = disabledTypes?.[i];
      const tooltip = typeName ? `${typeName} · ${disabledLabel}` : disabledLabel;
      slots.push(html`
        <div class="slot disabled" title=${tooltip}>
          <ha-icon icon="mdi:wrench"></ha-icon>
        </div>
      `);
    }
    for (let i = bikesVis + reservedVis + disabledVis; i < totalSlots; i++) {
      slots.push(html`
        <div class="slot empty" title=${this._t("legend_empty")}></div>
      `);
    }

    const hasOverflow = bikes > capacity;
    const hasEmptyVisible = bikesVis + reservedVis + disabledVis < totalSlots;
    const hasReservedVisible = reservedVis > 0;
    const hasDisabledVisible = disabledVis > 0;

    return html`
      <div class="rack">
        ${slots}
        ${hasOverflow
          ? html`<span class="rack-note">+${bikes - capacity}</span>`
          : nothing}
      </div>
      ${this._config.show_legend
        ? this._renderLegend({
            accent,
            hasEbikes,
            hasOverflow,
            hasEmptyVisible,
            battery: showBattery
              ? { pct: batteryPct, color: batteryColor(batteryPct) }
              : null,
            hasReservedVisible,
            hasDisabledVisible,
          })
        : nothing}
    `;
  }

  _renderLegend({
    accent,
    hasEbikes,
    hasOverflow,
    hasEmptyVisible,
    battery,
    hasReservedVisible,
    hasDisabledVisible,
  }) {
    const items = [
      html`
        <span class="legend-item">
          <span class="legend-swatch" style=${`background:${accent}`}></span>
          ${this._t("legend_bike")}
        </span>
      `,
    ];
    if (hasEbikes) {
      // Legend swatch follows what's actually rendered in the rack —
      // vertical-fill battery pattern when per-slot charge is showing,
      // classic amber-diagonal otherwise. Label is the same either way;
      // the rack's colors + hover tooltips carry charge-level detail.
      const swatchStyle = battery
        ? `background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;`
        : `background:linear-gradient(135deg, ${accent} 0%, ${accent} 55%, #ffd740 55%, #ffd740 100%);`;
      items.push(html`
        <span class="legend-item">
          <span class="legend-swatch" style=${swatchStyle}></span>
          ${this._t("legend_ebike")}
        </span>
      `);
    }
    if (hasReservedVisible) {
      items.push(html`
        <span class="legend-item">
          <span class="legend-swatch reserved">
            <ha-icon icon="mdi:lock"></ha-icon>
          </span>
          ${this._t("legend_reserved")}
        </span>
      `);
    }
    if (hasDisabledVisible) {
      items.push(html`
        <span class="legend-item">
          <span class="legend-swatch disabled">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </span>
          ${this._t("legend_disabled")}
        </span>
      `);
    }
    if (hasEmptyVisible) {
      items.push(html`
        <span class="legend-item">
          <span class="legend-swatch empty"></span>
          ${this._t("legend_empty")}
        </span>
      `);
    }
    if (hasOverflow) {
      items.push(html`
        <span class="legend-item">
          <span class="legend-overflow">+N</span>
          ${this._t("legend_overflow")}
        </span>
      `);
    }
    return html`<div class="legend">${items}</div>`;
  }

  _renderFlags(a) {
    const flags = [];
    if (a.is_installed === false) {
      flags.push(html`
        <span class="flag err">
          <ha-icon icon="mdi:alert-circle"></ha-icon>${this._t("offline")}
        </span>
      `);
    }
    if (a.is_renting === false) {
      flags.push(html`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_rental")}
        </span>
      `);
    }
    if (a.is_returning === false) {
      flags.push(html`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_return")}
        </span>
      `);
    }
    if (a.is_virtual_station === true) {
      flags.push(html`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius"></ha-icon>${this._t("virtual_station")}
        </span>
      `);
    }
    return flags.length ? html`<div class="flags">${flags}</div>` : nothing;
  }

  _renderFooter(a, rentUri) {
    const bits = [];
    if (this._config.show_rent_button && rentUri) {
      bits.push(html`
        <a class="rent" href=${rentUri} target="_blank" rel="noopener noreferrer">
          <ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>${this._t("rent_in_app")}
        </a>
      `);
    }
    if (this._config.show_timestamp) {
      const rel = relativeTime(a.last_reported, (k) => this._t(k));
      if (rel) {
        bits.push(html`<span>${this._t("last_updated")} ${rel}</span>`);
      }
    }
    return bits.length ? html`<div class="footer">${bits}</div>` : nothing;
  }
}
