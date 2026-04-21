import { LitElement, html, nothing } from "lit";
import { TRANSLATIONS, pickLang, et } from "./translations.js";
import { editorStyles } from "./editor-styles.js";
import { findNextbikeEntities, normaliseConfig, cleanStationName } from "./utils.js";

export class NextbikeAustriaCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = editorStyles;

  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = normaliseConfig(config);
  }

  _et(key) {
    return et(this.hass, key);
  }

  _t(key) {
    const lang = pickLang(this.hass);
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
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
  }

  _setBool(field, value) {
    this._config = { ...this._config, [field]: value };
    this._fire();
  }

  _setLayout(layout) {
    if (layout !== "stacked" && layout !== "tabs") return;
    this._config = { ...this._config, layout };
    this._fire();
  }

  render() {
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

  _renderStationChip(eid, selectedIds) {
    const a = this.hass.states[eid]?.attributes;
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

  _renderToggle(field) {
    const id = `nb-toggle-${field}`;
    const checked = this._config[field] !== false;
    return html`
      <div class="toggle-row">
        <label for=${id}>${this._et(field)}</label>
        <ha-switch
          id=${id}
          ?checked=${checked}
          @change=${(e) => this._setBool(field, e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }

  // hide_attribution is the one "inverted" toggle — default false, on = hide.
  _renderHideAttribution() {
    const on = this._config.hide_attribution === true;
    return html`
      <div class="toggle-row">
        <label for="nb-toggle-hide_attribution">
          ${this._et("hide_attribution")}
        </label>
        <ha-switch
          id="nb-toggle-hide_attribution"
          ?checked=${on}
          @change=${(e) => this._setBool("hide_attribution", e.target.checked)}
        ></ha-switch>
      </div>
    `;
  }
}

// Self-register when the editor module is loaded (lazily, by
// NextbikeAustriaCard.getConfigElement()). Guard so re-imports don't
// throw — customElements.define is a one-shot per tag name.
if (!customElements.get("nextbike-austria-card-editor")) {
  customElements.define(
    "nextbike-austria-card-editor",
    NextbikeAustriaCardEditor,
  );
}
