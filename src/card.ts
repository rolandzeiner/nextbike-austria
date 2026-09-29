import {
  LitElement,
  html,
  nothing,
  type TemplateResult,
  type PropertyValues,
  type CSSResultGroup,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION } from "./const";
import { t } from "./localize/localize";
import {
  checkCardVersionWS,
  renderVersionBanner,
} from "./shared-render";
import { cardStyles } from "./card-styles";
import type {
  BatteryEntry,
  HomeAssistant,
  HassEntityAttributes,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
  RackInputs,
  RackLayout,
} from "./types";
import {
  accentInk,
  batteryIcon,
  findNextbikeEntities,
  normaliseConfig,
  batteryColor,
  relativeTime,
  resolveDisplayName,
  safeHttpsUri,
  numberOr,
  parseBikeCount,
  rackInputs,
  rackLayout,
  stationMapUrl,
  stripeEdge,
  systemAccent,
  systemLabel,
} from "./utils";

// Eagerly register the editor. With inlineDynamicImports=true the editor
// code is in this bundle anyway — registering here guarantees the custom
// element exists before HA calls getConfigElement().
import "./editor";

@customElement("nextbike-austria-card")
export class NextbikeAustriaCard extends LitElement {
  static override styles: CSSResultGroup = cardStyles;

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
    // Drop the per-render memo BEFORE Lit calls render() so each cycle
    // recomputes `_resolveEntities()` exactly once and threads the
    // cached result through render + shouldUpdate. Without this,
    // `findNextbikeEntities` walks `hass.states` 3× per render.
    this._resolvedEntitiesMemo = null;
    if (changed.has("hass") && this.hass && !this._versionChecked) {
      this._versionChecked = true;
      void this._checkCardVersion();
    }
    // Bounds-fix the active tab BEFORE render() runs. Mutating @state
    // inside render() schedules a redundant Lit cycle and triggers
    // dev-mode warnings.
    if (changed.has("_config") || changed.has("hass")) {
      const stations = this._resolveEntities();
      const useTabs = this._config.layout === "tabs" && stations.length >= 2;
      if (useTabs && this._activeTab >= stations.length) {
        this._activeTab = 0;
      }
    }
  }

  // Render-scoped memo for `_resolveEntities`. Cleared at the top of
  // every `willUpdate` so each Lit cycle gets a fresh value.
  private _resolvedEntitiesMemo: NextbikeStationEntry[] | null = null;

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
    // memoize=false: this pre-cycle call must neither read nor seed the
    // render-scoped memo. shouldUpdate can return false (no willUpdate,
    // no memo-clear), so a value seeded here would outlive its cycle.
    const stations = this._resolveEntities(this.hass, false);
    return stations.some(
      (s) => oldHass.states[s.entity] !== this.hass!.states[s.entity],
    );
  }

  public getCardSize(): number {
    // Size from the resolved station list — entities filtered to those
    // that actually exist, plus the single-station auto-detect fallback
    // — so the masonry height contract matches what render() paints.
    // Before the first hass arrives, fall back to the configured count.
    const n = this.hass
      ? this._resolveEntities().length || 1
      : this._config.entities.length || 1;
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
  ): Record<string, unknown> {
    const entities = findNextbikeEntities(hass);
    const first = entities[0];
    return { entities: first ? [{ entity: first }] : [] };
  }

  private async _checkCardVersion(): Promise<void> {
    this._versionMismatch = await checkCardVersionWS(
      this.hass,
      "nextbike_austria/card_version",
      CARD_VERSION,
    );
  }

  private _t(key: string): string {
    return t(this.hass, key);
  }

  private _resolveEntities(
    hass: HomeAssistant | undefined = this.hass,
    memoize = true,
  ): NextbikeStationEntry[] {
    // Memoised per render cycle when called for the card's current
    // `hass` (the common case in willUpdate / render). The memo is
    // owned by the willUpdate→render path, which clears it at the top
    // of every cycle. `shouldUpdate` passes memoize=false so its
    // pre-cycle call neither reads a stale value nor seeds one that
    // could outlive a cycle it then declines to render. Custom-hass
    // callers also bypass the cache so they read the right state map.
    const useMemo = memoize && hass === this.hass;
    if (useMemo && this._resolvedEntitiesMemo !== null) {
      return this._resolvedEntitiesMemo;
    }
    const picked = Array.isArray(this._config?.entities)
      ? this._config.entities.filter((s) => hass?.states[s.entity])
      : [];
    let result: NextbikeStationEntry[];
    if (picked.length) {
      result = picked;
    } else {
      const available = findNextbikeEntities(hass);
      const first = available[0];
      result = first ? [{ entity: first }] : [];
    }
    if (useMemo) {
      this._resolvedEntitiesMemo = result;
    }
    return result;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const stations = this._resolveEntities();
    const useTabs = this._config.layout === "tabs" && stations.length >= 2;

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
      // _activeTab is clamped to [0, stations.length) above, so the
      // index is in-bounds; narrow for noUncheckedIndexedAccess.
      const active = stations[this._activeTab] ?? stations[0]!;
      content = this._renderStation(active, this._activeTab);
    } else {
      content = stations.map((s) => this._renderStation(s));
    }

    return html`
      <ha-card>
        ${useTabs ? this._renderTabs(stations) : nothing}
        <div class="wrap">
          ${renderVersionBanner(this._versionMismatch, (k) => this._t(k))}
          ${content}
          ${this._config.hide_attribution
            ? nothing
            : html`<div class="attr">${attribution}</div>`}
        </div>
      </ha-card>
    `;
  }

  // Reached only when no nextbike sensor exists at all: _resolveEntities
  // falls back to the first one whenever the picked stations are gone.
  private _renderEmpty(): TemplateResult {
    return html`<div class="empty-state" role="status">${this._t("no_entities_available")}</div>`;
  }

  private _renderTabs(stations: NextbikeStationEntry[]): TemplateResult {
    return html`
      <div class="tabs" role="tablist" aria-label=${this._t("stations")}>
        ${stations.map((s, i) => {
          const a = this.hass?.states[s.entity]?.attributes || {};
          const hasFriendlyName = typeof a.friendly_name === "string" && a.friendly_name.length > 0;
          const displayName = resolveDisplayName(a, s.entity);
          const label = displayName;
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
              id=${`nbtab-${i}`}
              aria-controls=${`nbpanel-${i}`}
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

  private _renderStation(
    stopCfg: NextbikeStationEntry,
    tabIndex?: number,
  ): TemplateResult {
    const state = this.hass?.states[stopCfg.entity];
    if (!state) {
      // Safety net: _resolveEntities only returns stations whose sensor
      // is in this hass, so today this only narrows the type. A picked
      // sensor that disappears falls back to the first nextbike sensor
      // instead of landing here.
      return html`<div class="empty-state" role="status">${this._t("no_entities_unavailable")}</div>`;
    }
    const a = state.attributes || ({} as HassEntityAttributes);
    const accent = systemAccent(a);
    const ink = accentInk(accent);
    const rack = rackInputs(parseBikeCount(state.state), a);
    const title = resolveDisplayName(a, stopCfg.entity);

    // WAI-ARIA tabpanel pattern: when rendered inside the tab strip,
    // tie the section back to the active tab so AT users hear the
    // panel-of-this-tab relationship.
    const inTabs = typeof tabIndex === "number";
    return html`
      <section
        class="station"
        aria-label=${title}
        role=${inTabs ? "tabpanel" : nothing}
        id=${inTabs ? `nbpanel-${tabIndex}` : nothing}
        aria-labelledby=${inTabs ? `nbtab-${tabIndex}` : nothing}
        tabindex=${inTabs ? "-1" : nothing}
        style=${`--nb-accent:${accent};--nb-accent-ink:${ink};--nb-stripe-edge:${stripeEdge(ink)};`}
      >
        ${this._config.hide_header ? nothing : this._renderHeader(a, title)}
        ${this._renderHero(rack, numberOr(a.num_docks_available, null))}
        ${this._config.show_rack && rack.capacity !== null && rack.capacity > 0
          ? this._renderRack(rack, rack.capacity)
          : nothing}
        ${this._config.show_flags ? this._renderFlags(a) : nothing}
        ${this._renderFooter(a, safeHttpsUri(a.rental_uri))}
      </section>
    `;
  }

  private _renderHeader(a: HassEntityAttributes, title: string): TemplateResult {
    const hasFriendlyName = typeof a.friendly_name === "string" && a.friendly_name.length > 0;
    const mapUrl = stationMapUrl(a);
    return html`<header class="header">
      <div class="icon-tile" aria-hidden="true">
        <ha-icon icon="mdi:bicycle"></ha-icon>
      </div>
      <div class="header-text">
        <h2 class="title">
          ${hasFriendlyName
            ? html`<span lang="de">${title}</span>`
            : title}
        </h2>
        <p class="subtitle">${systemLabel(a)}</p>
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
    </header>`;
  }

  private _renderHero(rack: RackInputs, docks: number | null): TemplateResult {
    const bikeWord = rack.bikes === 1 ? this._t("bike") : this._t("bikes");
    // Shown beside the e-bike count, so it follows that chip's option too.
    const avgCharge =
      this._config.show_ebikes &&
      this._config.show_battery &&
      typeof rack.batteryPct === "number" &&
      rack.batterySamples > 0
        ? rack.batteryPct
        : null;
    const chips = this._renderPills(rack.ebikes, avgCharge, docks, rack.capacity);
    return html`
      <div class="hero">
        <div class="metric">
          <div class="metric-value">
            <span class="metric-num">${rack.bikes}</span>
            ${rack.capacity !== null
              ? html`<span class="metric-of">/ ${rack.capacity}</span>`
              : nothing}
          </div>
          <div class="metric-label">${bikeWord}</div>
        </div>
        ${chips.length
          ? html`<div class="chip-row">${chips}</div>`
          : nothing}
      </div>
    `;
  }

  private _renderPills(
    ebikes: number | null,
    avgCharge: number | null,
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
          <ha-icon icon="mdi:lightning-bolt" aria-hidden="true"></ha-icon>${ebikes}
          ${this._t("ebikes")}
        </span>
      `);
    }
    // The station's average charge as text. Each slot's own charge is
    // only a fill height plus a hover tooltip, which keyboard and touch
    // users can't open; this gives them the number.
    if (avgCharge !== null) {
      out.push(html`
        <span class="chip muted">
          <ha-icon icon=${batteryIcon(avgCharge)} aria-hidden="true"></ha-icon>${Math.round(avgCharge)}%
          ${this._t("battery_avg")}
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
          <ha-icon icon="mdi:parking" aria-hidden="true"></ha-icon>${docks} ${dockWord}
        </span>
      `);
    }
    return out;
  }

  private _renderRack(rack: RackInputs, capacity: number): TemplateResult {
    const layout = rackLayout(rack, capacity, !!this._config.show_battery);
    const rackAriaLabel = this._t("rack_summary")
      .replace("{available}", String(layout.bikes))
      .replace("{capacity}", String(capacity));
    return html`
      <div class="rack-block">
        <div class="rack" role="group" aria-label=${rackAriaLabel}>
          ${this._bikeSlots(layout)}
          ${this._dockSlots(layout, rack)}
          ${layout.overflow > 0
            ? html`<span class="rack-note"
                ><span aria-hidden="true">+${layout.overflow}</span
                ><span class="visually-hidden"
                  >${this._t("overflow_more").replace("{n}", String(layout.overflow))}</span
                ></span
              >`
            : nothing}
        </div>
        ${this._config.show_legend
          ? this._renderLegend({
              hasEbikes: layout.hasEbikes,
              hasOverflow: layout.overflow > 0,
              hasEmptyVisible: layout.empty > 0,
              battery:
                layout.showBattery && typeof rack.batteryPct === "number"
                  ? { pct: rack.batteryPct, color: batteryColor(rack.batteryPct) }
                  : null,
              hasReservedVisible: layout.reserved > 0,
              hasDisabledVisible: layout.disabled > 0,
            })
          : nothing}
      </div>
    `;
  }

  /** The docks holding an available bike: e-bikes first, then classic bikes. */
  private _bikeSlots(layout: RackLayout): TemplateResult[] {
    const slots: TemplateResult[] = [];
    for (let i = 0; i < layout.ebikes; i++) {
      slots.push(this._ebikeSlot(layout.perBike[i] || null, layout));
    }
    for (let i = 0; i < layout.bikes - layout.ebikes; i++) {
      const typeName = layout.classicNames[i] || this._t("legend_bike");
      slots.push(html`
        <div
          class="slot filled"
          role="img"
          aria-label=${typeName}
          title=${typeName}
        ></div>
      `);
    }
    return slots;
  }

  /** An e-bike slot: filled to its charge when that is known, otherwise
   *  the accent with the amber e-bike stripe. With the charge display on,
   *  a bike without a reading is labelled "battery unknown". */
  private _ebikeSlot(entry: BatteryEntry | null, layout: RackLayout): TemplateResult {
    const typeName = entry?.type || layout.ebikeFallbackType || this._t("legend_ebike");
    if (entry && layout.showBattery && typeof entry.pct === "number") {
      const pct = entry.pct;
      const color = batteryColor(pct);
      const label = `${typeName} · ${Math.round(pct)}%`;
      return html`
        <div
          class="slot filled ebike battery"
          role="img"
          aria-label=${label}
          style=${`--bat-pct:${pct}%;--bat-color:${color};`}
          title=${label}
        ></div>
      `;
    }
    const tooltip = layout.showBattery
      ? `${typeName} · ${this._t("battery_unknown")}`
      : typeName;
    return html`
      <div
        class="slot filled ebike"
        role="img"
        aria-label=${tooltip}
        title=${tooltip}
      ></div>
    `;
  }

  /** The docks without an available bike: reserved, out of service, empty. */
  private _dockSlots(layout: RackLayout, rack: RackInputs): TemplateResult[] {
    const slots: TemplateResult[] = [];
    const withType = (typeName: string | undefined, label: string): string =>
      typeName ? `${typeName} · ${label}` : label;
    const reservedLabel = this._t("reserved");
    for (let i = 0; i < layout.reserved; i++) {
      const tooltip = withType(rack.reservedTypes[i], reservedLabel);
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
    for (let i = 0; i < layout.disabled; i++) {
      const tooltip = withType(rack.disabledTypes[i], disabledLabel);
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
    const emptyLabel = this._t("legend_empty");
    for (let i = 0; i < layout.empty; i++) {
      slots.push(html`
        <div
          class="slot empty"
          role="img"
          aria-label=${emptyLabel}
          title=${emptyLabel}
        ></div>
      `);
    }
    return slots;
  }

  private _renderLegend(args: {
    hasEbikes: boolean;
    hasOverflow: boolean;
    hasEmptyVisible: boolean;
    battery: { pct: number; color: string } | null;
    hasReservedVisible: boolean;
    hasDisabledVisible: boolean;
  }): TemplateResult {
    const {
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
          <dt class="legend-swatch filled" aria-hidden="true"></dt>
          <dd>${this._t("legend_bike")}</dd>
        </div>
      `,
    ];
    if (hasEbikes) {
      // Legend swatch follows what's actually rendered in the rack —
      // vertical-fill battery pattern when per-slot charge is showing,
      // classic amber-diagonal otherwise. Label is the same either way;
      // the rack's colors + hover tooltips carry charge-level detail.
      items.push(html`
        <div class="legend-item">
          <dt class=${battery ? "legend-swatch ebike battery" : "legend-swatch ebike"} aria-hidden="true"></dt>
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
          <ha-icon icon="mdi:alert-circle" aria-hidden="true"></ha-icon>${this._t("offline")}
        </span>
      `);
    }
    if (a.is_renting === false) {
      flags.push(html`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel" aria-hidden="true"></ha-icon>${this._t("no_rental")}
        </span>
      `);
    }
    if (a.is_returning === false) {
      flags.push(html`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel" aria-hidden="true"></ha-icon>${this._t("no_return")}
        </span>
      `);
    }
    if (a.is_virtual_station === true) {
      flags.push(html`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius" aria-hidden="true"></ha-icon>${this._t("virtual_station")}
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

