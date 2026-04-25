import {
  LitElement,
  html,
  nothing,
  type TemplateResult,
  type PropertyValues,
  type CSSResultGroup,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION, SYSTEM_ACCENT, SYSTEM_LABEL } from "./const";
import { t, pickLang } from "./localize/localize";
import { cardStyles } from "./card-styles";
import type {
  HomeAssistant,
  HassEntityAttributes,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
} from "./types";
import {
  findNextbikeEntities,
  normaliseConfig,
  countEbikesAvailable,
  firstEbikeTypeName,
  expandClassicTypes,
  batteryColor,
  relativeTime,
  cleanStationName,
} from "./utils";

// Eagerly register the editor. With inlineDynamicImports=true the editor
// code is in this bundle anyway — registering here guarantees the custom
// element exists before HA calls getConfigElement().
import "./editor";

@customElement("nextbike-austria-card")
export class NextbikeAustriaCard extends LitElement {
  static styles: CSSResultGroup = cardStyles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config: NextbikeAustriaCardConfig = {
    type: "nextbike-austria-card",
    entities: [],
  };
  @state() private _activeTab = 0;
  @state() private _versionMismatch: string | null = null;
  @state() private _tickKey = 0;

  private _tickTimer: ReturnType<typeof setInterval> | null = null;
  private _versionChecked = false;

  public setConfig(config: Partial<NextbikeAustriaCardConfig> | null | undefined): void {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("nextbike-austria-card: config must be an object");
    }
    this._config = normaliseConfig(config);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // Tick once a minute so the "updated N min ago" label stays honest
    // between coordinator polls. Bumping _tickKey is enough to trigger
    // a re-render via shouldUpdate. This is a data refresh, not a
    // visual animation, so WCAG 2.3.3 prefers-reduced-motion does not
    // apply — the relative-time label must stay accurate regardless of
    // the user's motion preference.
    if (!this._tickTimer) {
      this._tickTimer = setInterval(() => {
        this._tickKey++;
      }, 60_000);
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this._versionChecked) {
      this._versionChecked = true;
      void this._checkCardVersion();
    }
  }

  // Performance gate — every entity state change in HA fires a hass
  // update. Without this, we re-render on every change anywhere in the
  // user's HA install. We only care when the entities we render moved.
  protected override shouldUpdate(changed: PropertyValues): boolean {
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
    const oldHass = changed.get("hass") as HomeAssistant | undefined;
    if (!oldHass) return true; // first hass — render
    if (!this.hass) return false;
    const stations = this._resolveEntities(this.hass);
    return stations.some(
      (s) => oldHass.states[s.entity] !== this.hass!.states[s.entity],
    );
  }

  public getCardSize(): number {
    const n = (this._config?.entities || []).length || 1;
    return Math.min(12, 3 + n * 3);
  }

  public getGridOptions(): {
    columns: number | "full";
    rows: number | "auto";
    min_columns: number;
    min_rows: number;
  } {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: 3,
    };
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    // Editor element is registered via the top-level `import "./editor"`
    // above. No await needed here, but keep the async signature so HA
    // treats the return as a Promise uniformly.
    return document.createElement("nextbike-austria-card-editor");
  }

  public static getStubConfig(
    hass: HomeAssistant,
  ): Partial<NextbikeAustriaCardConfig> {
    const entities = findNextbikeEntities(hass);
    return { entities: entities.length ? [{ entity: entities[0] }] : [] };
  }

  private async _checkCardVersion(): Promise<void> {
    if (!this.hass?.callWS) return;
    try {
      const result = await this.hass.callWS<{ version?: string }>({
        type: "nextbike_austria/card_version",
      });
      if (result?.version && result.version !== CARD_VERSION) {
        this._versionMismatch = result.version;
      }
    } catch {
      /* backend may not support the command yet */
    }
  }

  private _t(key: string): string {
    return t(this.hass, key);
  }

  private _resolveEntities(
    hass: HomeAssistant | undefined = this.hass,
  ): NextbikeStationEntry[] {
    const picked = Array.isArray(this._config?.entities)
      ? this._config.entities.filter((s) => hass?.states[s.entity])
      : [];
    if (picked.length) return picked;
    const available = findNextbikeEntities(hass);
    return available.length ? [{ entity: available[0] }] : [];
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const stations = this._resolveEntities();
    const useTabs = this._config.layout === "tabs" && stations.length >= 2;
    if (useTabs && this._activeTab >= stations.length) this._activeTab = 0;

    const attribution =
      stations
        .map((s) => this.hass?.states[s.entity]?.attributes?.attribution)
        .find((v): v is string => typeof v === "string" && v.length > 0) ||
      "Data: nextbike GmbH, CC0-1.0";

    // Tabs live outside `.wrap` so they're flush with ha-card's edges
    // and sit at the very top — matches the tankstellen card's layout
    // without negative-margin hacks on `.tabs`.
    let content: TemplateResult | TemplateResult[];
    if (!stations.length) {
      content = this._renderEmpty();
    } else if (useTabs) {
      content = this._renderStation(stations[this._activeTab]);
    } else {
      content = stations.map((s) => this._renderStation(s));
    }

    return html`
      <ha-card>
        ${useTabs ? this._renderTabs(stations) : nothing}
        <div class="wrap">
          ${this._versionMismatch ? this._renderBanner() : nothing}
          ${content}
          ${this._config.hide_attribution
            ? nothing
            : html`<div class="attr">${attribution}</div>`}
        </div>
      </ha-card>
    `;
  }

  private _renderBanner(): TemplateResult {
    const msg = this._t("version_update").replace(
      "{v}",
      this._versionMismatch || "?",
    );
    return html`
      <div class="banner" role="alert" aria-live="assertive">
        <span>${msg}</span>
        <button
          type="button"
          aria-label=${this._t("version_reload")}
          @click=${() => window.location.reload()}
        >
          ${this._t("version_reload")}
        </button>
      </div>
    `;
  }

  private _renderEmpty(): TemplateResult {
    const available = findNextbikeEntities(this.hass);
    const key = available.length ? "no_entities_picked" : "no_entities_available";
    return html`<div class="empty-state">${this._t(key)}</div>`;
  }

  private _renderTabs(stations: NextbikeStationEntry[]): TemplateResult {
    return html`
      <div class="tabs" role="tablist">
        ${stations.map((s, i) => {
          const a = this.hass?.states[s.entity]?.attributes || {};
          const hasFriendlyName = typeof a.friendly_name === "string" && a.friendly_name.length > 0;
          const label = cleanStationName(a.friendly_name || s.entity);
          const selected = i === this._activeTab;
          // WCAG 3.1.2 Language of Parts: station names come from the
          // nextbike API in German. Wrap in lang="de" so screen readers
          // on non-German dashboards switch pronunciation. Fallback
          // entity-ID strings (when friendly_name is missing) stay
          // unwrapped since they're ASCII slugs.
          return html`
            <button
              type="button"
              role="tab"
              class="tab ${selected ? "active" : ""}"
              aria-selected=${selected ? "true" : "false"}
              tabindex=${selected ? "0" : "-1"}
              @click=${() => this._setActiveTab(i)}
              @keydown=${(ev: KeyboardEvent) =>
                this._onTabKeydown(ev, i, stations.length)}
            >
              ${hasFriendlyName ? html`<span lang="de">${label}</span>` : label}
            </button>
          `;
        })}
      </div>
    `;
  }

  private _setActiveTab(i: number): void {
    if (Number.isFinite(i) && i !== this._activeTab) {
      this._activeTab = i;
    }
  }

  private _onTabKeydown(ev: KeyboardEvent, index: number, count: number): void {
    let next = index;
    switch (ev.key) {
      case "ArrowRight":
        next = (index + 1) % count;
        break;
      case "ArrowLeft":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    ev.preventDefault();
    this._setActiveTab(next);
    this.updateComplete.then(() => {
      const tabs = this.shadowRoot?.querySelectorAll<HTMLButtonElement>(
        '.tabs [role="tab"]',
      );
      tabs?.[next]?.focus();
    });
  }

  private _renderStation(stopCfg: NextbikeStationEntry): TemplateResult {
    const state = this.hass?.states[stopCfg.entity];
    if (!state) {
      // User picked a station in the editor but its sensor doesn't
      // exist (integration unloaded, entity renamed). Distinct from
      // _renderEmpty's "nothing configured" case — use a specific
      // message so the user knows what went wrong.
      return html`<div class="empty-state">${this._t("no_entities_unavailable")}</div>`;
    }
    const a = state.attributes || ({} as HassEntityAttributes);
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
    const hasFriendlyName = typeof a.friendly_name === "string" && a.friendly_name.length > 0;
    const title = cleanStationName(a.friendly_name || stopCfg.entity);
    const mapUrl =
      typeof a.latitude === "number" && typeof a.longitude === "number"
        ? `https://www.google.com/maps/search/?api=1&query=${a.latitude},${a.longitude}`
        : null;

    const bikeWord = bikes === 1 ? this._t("bike") : this._t("bikes");

    const chips = this._renderPills(ebikes, docks, capacity);

    return html`
      <section
        class="station"
        aria-label=${title}
        style=${`--nb-accent:${accent};`}
      >
        <header class="header">
          <div class="icon-tile" aria-hidden="true">
            <ha-icon icon="mdi:bicycle"></ha-icon>
          </div>
          <div class="header-text">
            <h2 class="title">
              ${hasFriendlyName ? html`<span lang="de">${title}</span>` : title}
            </h2>
            <p class="subtitle">${systemName}</p>
          </div>
          ${mapUrl
            ? html`
                <a
                  class="icon-action"
                  href=${mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label=${`${this._t("open_map")}: ${title}`}
                  title=${this._t("open_map")}
                >
                  <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>
                </a>
              `
            : nothing}
        </header>

        <div class="hero">
          <div class="metric">
            <div class="metric-value">
              <span class="metric-num">${bikes}</span>
              ${capacity !== null
                ? html`<span class="metric-of">/ ${capacity}</span>`
                : nothing}
            </div>
            <div class="metric-label">${bikeWord}</div>
          </div>
          ${chips.length
            ? html`<div class="chip-row">${chips}</div>`
            : nothing}
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
      </section>
    `;
  }

  private _renderPills(
    ebikes: number | null,
    docks: number | null,
    capacity: number | null,
  ): TemplateResult[] {
    const out: TemplateResult[] = [];
    if (
      this._config.show_ebikes &&
      typeof ebikes === "number" &&
      Number.isFinite(ebikes) &&
      ebikes > 0
    ) {
      // Amber matches the diagonal "e-bike" stripe inside the rack slot
      // — same visual vocabulary regardless of whether per-bike charge
      // data is known.
      out.push(html`
        <span class="chip ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${ebikes}
          ${this._t("ebikes")}
        </span>
      `);
    }
    // Only render the docks chip when capacity is actually published.
    // Stations with null capacity (virtual or unpublished racks) still
    // report `num_docks_available` as 0 upstream, which would otherwise
    // paint a misleading "0 docks".
    if (this._config.show_docks && docks !== null && capacity !== null) {
      const dockWord = docks === 1 ? this._t("dock") : this._t("docks");
      out.push(html`
        <span class="chip muted">
          <ha-icon icon="mdi:parking"></ha-icon>${docks} ${dockWord}
        </span>
      `);
    }
    return out;
  }

  private _renderRack(args: {
    bikes: number;
    ebikes: number | null;
    capacity: number;
    accent: string;
    batteryPct: number | null;
    batterySamples: number;
    batteryList: Array<{ type?: string; pct?: number }> | null;
    vehicleTypesAvailable: Array<{ vehicle_type_id?: string; count?: number }>;
    vehicleTypeNames: Record<string, string>;
    reservedCount: number;
    reservedTypes: string[];
    disabledCount: number;
    disabledTypes: string[];
  }): TemplateResult {
    const {
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
    } = args;
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
    const hasEbikes = typeof ebikes === "number" && Number.isFinite(ebikes) && ebikes > 0;
    const ebikesVis = hasEbikes ? Math.min(bikesVis, ebikes as number) : 0;
    const showBattery =
      !!this._config.show_battery &&
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

    const slots: TemplateResult[] = [];
    for (let i = 0; i < bikesVis; i++) {
      const isEbike = i < ebikesVis;
      if (isEbike) {
        const entry = perBike[i] || null;
        const typeName = entry?.type || ebikeFallbackType || this._t("legend_ebike");
        if (entry && showBattery && typeof entry.pct === "number") {
          const pct = entry.pct;
          const color = batteryColor(pct);
          const label = `${typeName} · ${Math.round(pct)}%`;
          slots.push(html`
            <div
              class="slot filled ebike battery"
              role="img"
              aria-label=${label}
              style=${`--bat-pct:${pct}%;--bat-color:${color};`}
              title=${label}
            ></div>
          `);
        } else {
          const tooltip = showBattery
            ? `${typeName} · ${this._t("battery_unknown")}`
            : typeName;
          slots.push(html`
            <div
              class="slot filled ebike"
              role="img"
              aria-label=${tooltip}
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
            role="img"
            aria-label=${typeName}
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
        <div
          class="slot reserved"
          role="img"
          aria-label=${tooltip}
          title=${tooltip}
        >
          <ha-icon icon="mdi:lock" aria-hidden="true"></ha-icon>
        </div>
      `);
    }
    const disabledLabel = this._t("disabled");
    for (let i = 0; i < disabledVis; i++) {
      const typeName = disabledTypes?.[i];
      const tooltip = typeName ? `${typeName} · ${disabledLabel}` : disabledLabel;
      slots.push(html`
        <div
          class="slot disabled"
          role="img"
          aria-label=${tooltip}
          title=${tooltip}
        >
          <ha-icon icon="mdi:wrench" aria-hidden="true"></ha-icon>
        </div>
      `);
    }
    for (let i = bikesVis + reservedVis + disabledVis; i < totalSlots; i++) {
      const emptyLabel = this._t("legend_empty");
      slots.push(html`
        <div
          class="slot empty"
          role="img"
          aria-label=${emptyLabel}
          title=${emptyLabel}
        ></div>
      `);
    }

    const hasOverflow = bikes > capacity;
    const hasEmptyVisible = bikesVis + reservedVis + disabledVis < totalSlots;
    const hasReservedVisible = reservedVis > 0;
    const hasDisabledVisible = disabledVis > 0;

    const rackAriaLabel = this._t("rack_summary")
      .replace("{available}", String(bikesVis))
      .replace("{capacity}", String(capacity));
    return html`
      <div class="rack-block">
        <div class="rack" role="group" aria-label=${rackAriaLabel}>
          ${slots}
          ${hasOverflow
            ? html`<span
                class="rack-note"
                aria-label=${`+${bikes - capacity}`}
                >+${bikes - capacity}</span
              >`
            : nothing}
        </div>
        ${this._config.show_legend
          ? this._renderLegend({
              accent,
              hasEbikes,
              hasOverflow,
              hasEmptyVisible,
              battery:
                showBattery && typeof batteryPct === "number"
                  ? { pct: batteryPct, color: batteryColor(batteryPct) }
                  : null,
              hasReservedVisible,
              hasDisabledVisible,
            })
          : nothing}
      </div>
    `;
  }

  private _renderLegend(args: {
    accent: string;
    hasEbikes: boolean;
    hasOverflow: boolean;
    hasEmptyVisible: boolean;
    battery: { pct: number; color: string } | null;
    hasReservedVisible: boolean;
    hasDisabledVisible: boolean;
  }): TemplateResult {
    const {
      accent,
      hasEbikes,
      hasOverflow,
      hasEmptyVisible,
      battery,
      hasReservedVisible,
      hasDisabledVisible,
    } = args;
    const items: TemplateResult[] = [
      html`
        <div class="legend-item">
          <dt class="legend-swatch" style=${`background:${accent}`} aria-hidden="true"></dt>
          <dd>${this._t("legend_bike")}</dd>
        </div>
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
        <div class="legend-item">
          <dt class="legend-swatch" style=${swatchStyle} aria-hidden="true"></dt>
          <dd>${this._t("legend_ebike")}</dd>
        </div>
      `);
    }
    if (hasReservedVisible) {
      items.push(html`
        <div class="legend-item">
          <dt class="legend-swatch reserved" aria-hidden="true">
            <ha-icon icon="mdi:lock"></ha-icon>
          </dt>
          <dd>${this._t("legend_reserved")}</dd>
        </div>
      `);
    }
    if (hasDisabledVisible) {
      items.push(html`
        <div class="legend-item">
          <dt class="legend-swatch disabled" aria-hidden="true">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </dt>
          <dd>${this._t("legend_disabled")}</dd>
        </div>
      `);
    }
    if (hasEmptyVisible) {
      items.push(html`
        <div class="legend-item">
          <dt class="legend-swatch empty" aria-hidden="true"></dt>
          <dd>${this._t("legend_empty")}</dd>
        </div>
      `);
    }
    if (hasOverflow) {
      items.push(html`
        <div class="legend-item">
          <dt class="legend-overflow" aria-hidden="true">+N</dt>
          <dd>${this._t("legend_overflow")}</dd>
        </div>
      `);
    }
    return html`<dl class="legend">${items}</dl>`;
  }

  private _renderFlags(a: HassEntityAttributes): TemplateResult | typeof nothing {
    const flags: TemplateResult[] = [];
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

  private _renderFooter(
    a: HassEntityAttributes,
    rentUri: string,
  ): TemplateResult | typeof nothing {
    const showRent = !!this._config.show_rent_button && !!rentUri;
    const tsLabel = this._config.show_timestamp
      ? relativeTime(a.last_reported, (k) => this._t(k))
      : null;
    if (!showRent && !tsLabel) return nothing;
    return html`
      <div class="actions">
        ${showRent
          ? html`
              <a
                class="btn-primary"
                href=${rentUri}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ha-icon
                  icon="mdi:cellphone-arrow-down"
                  aria-hidden="true"
                ></ha-icon>
                ${this._t("rent_in_app")}
              </a>
            `
          : nothing}
        ${tsLabel
          ? html`<span class="timestamp"
              >${this._t("last_updated")} ${tsLabel}</span
            >`
          : nothing}
      </div>
    `;
  }
}

// Keep the import visible to the tree-shaker — pickLang is called via
// localize re-exports in other modules, but the editor also references
// it directly. This noop satisfies TS's unused-import check.
void pickLang;
