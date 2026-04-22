import { LitElement, html, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HomeAssistant, NextbikeAustriaCardConfig } from "./types";
import { et, pickLang } from "./localize/localize";
import { editorStyles } from "./editor-styles";
import {
  findNextbikeEntities,
  normaliseConfig,
  cleanStationName,
} from "./utils";

// Key of a boolean column on the config — drives both editor toggle rows
// and the setConfig round-trip.
type BoolField =
  | "show_rack"
  | "show_legend"
  | "show_ebikes"
  | "show_battery"
  | "show_docks"
  | "show_flags"
  | "show_timestamp"
  | "show_rent_button"
  | "hide_attribution";

@customElement("nextbike-austria-card-editor")
export class NextbikeAustriaCardEditor extends LitElement {
  static styles: CSSResultGroup = editorStyles;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config: NextbikeAustriaCardConfig = {
    type: "nextbike-austria-card",
    entities: [],
  };

  public setConfig(config: Partial<NextbikeAustriaCardConfig>): void {
    this._config = normaliseConfig(config);
  }

  private _et(key: string): string {
    return et(this.hass, key);
  }

  private _fire(): void {
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

  private _toggleStation = (eid: string): void => {
    const list = [...(this._config.entities || [])];
    const idx = list.findIndex((s) => s.entity === eid);
    const next =
      idx >= 0
        ? list.filter((_, i) => i !== idx)
        : [...list, { entity: eid }];
    this._config = { ...this._config, entities: next };
    this._fire();
  };

  private _setBool = (field: BoolField, value: boolean): void => {
    this._config = { ...this._config, [field]: value };
    this._fire();
  };

  private _setLayout = (layout: "stacked" | "tabs"): void => {
    if (layout !== "stacked" && layout !== "tabs") return;
    this._config = { ...this._config, layout };
    this._fire();
  };

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass) return nothing;

    const available = findNextbikeEntities(this.hass);
    const selected = this._config.entities || [];
    const selectedIds = new Set(selected.map((s) => s.entity));
    const layout = this._config.layout === "tabs" ? "tabs" : "stacked";

    return html`
      <div class="editor">
        <div class="editor-section">
          <div class="section-header">${this._et("section_stations")}</div>
          <div class="editor-hint">${this._et("stations_hint")}</div>
          <div class="chips">
            ${available.length
              ? available.map((eid) => this._renderStationChip(eid, selectedIds))
              : html`<div class="editor-hint">${this._et("no_sensors_available")}</div>`}
          </div>
        </div>

        <div class="editor-section">
          <div class="section-header">${this._et("section_display")}</div>
          <div class="toggle-row">
            <span style="font-size:13px;">${this._et("layout_label")}</span>
            <div class="layout-buttons">
              <button
                type="button"
                class=${layout === "stacked" ? "active" : ""}
                @click=${() => this._setLayout("stacked")}
              >
                ${this._et("layout_stacked")}
              </button>
              <button
                type="button"
                class=${layout === "tabs" ? "active" : ""}
                @click=${() => this._setLayout("tabs")}
              >
                ${this._et("layout_tabs")}
              </button>
            </div>
          </div>
          ${this._renderToggle("show_rack")}
          ${this._renderToggle("show_legend")}
          ${this._renderToggle("show_ebikes")}
          ${this._renderToggle("show_battery")}
          ${this._renderToggle("show_docks")}
          ${this._renderToggle("show_flags")}
          ${this._renderToggle("show_timestamp")}
          ${this._renderToggle("show_rent_button")}
          ${this._renderHideAttribution()}
        </div>
      </div>
    `;
  }

  private _renderStationChip(
    eid: string,
    selectedIds: Set<string>,
  ): TemplateResult {
    const a = this.hass?.states[eid]?.attributes;
    const friendly = a?.friendly_name || eid;
    const stopName = cleanStationName(friendly);
    const isSel = selectedIds.has(eid);
    return html`
      <button
        type="button"
        class="chip ${isSel ? "selected" : ""}"
        @click=${() => this._toggleStation(eid)}
      >
        <span class="stop-name">${stopName}</span>
        <span class="eid">${eid.split(".")[1] || eid}</span>
      </button>
    `;
  }

  private _renderToggle(field: Exclude<BoolField, "hide_attribution">): TemplateResult {
    const id = `nb-toggle-${field}`;
    const checked = (this._config[field] as boolean | undefined) !== false;
    return html`
      <div class="toggle-row">
        <label for=${id}>${this._et(field)}</label>
        <ha-switch
          id=${id}
          ?checked=${checked}
          @change=${(e: Event) =>
            this._setBool(field, (e.target as HTMLInputElement).checked)}
        ></ha-switch>
      </div>
    `;
  }

  // hide_attribution is the one "inverted" toggle — default false, on = hide.
  private _renderHideAttribution(): TemplateResult {
    const on = this._config.hide_attribution === true;
    return html`
      <div class="toggle-row">
        <label for="nb-toggle-hide_attribution">
          ${this._et("hide_attribution")}
        </label>
        <ha-switch
          id="nb-toggle-hide_attribution"
          ?checked=${on}
          @change=${(e: Event) =>
            this._setBool(
              "hide_attribution",
              (e.target as HTMLInputElement).checked,
            )}
        ></ha-switch>
      </div>
    `;
  }
}

// pickLang kept as import so tree-shaker sees it; used when extending
// the editor with language-dependent widgets.
void pickLang;
