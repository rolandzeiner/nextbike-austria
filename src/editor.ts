// Schema-driven Lovelace editor for the Nextbike Austria card.
//
// Design notes
// ------------
// * The editor uses ``<ha-form>`` exclusively — no bespoke Lit widgets.
//   ha-form is the canonical HA editor component: it picks up the
//   active theme, supports the standard label/helper localisation
//   chain, and keeps a11y / forced-colors / focus-visible behaviour
//   in lockstep with HA core.
//
// * **Editor `_config` lifecycle gotcha** — custom-card editors do
//   NOT receive a re-`setConfig()` after dispatching `config-changed`.
//   The form-handler must therefore set ``this._config = next`` *before*
//   firing the event; otherwise the next render reads stale state and
//   the form reverts to the pre-change value. (Pure ``fireEvent``-only
//   is the HA-core editor pattern but custom editors break under it.)
//
// * **`expandable` + `flatten: true`** — without ``flatten``, ha-form
//   scopes inner-schema values under ``data[name]`` and the card's
//   flat-key reads silently default. Every expandable in this file
//   ships ``flatten: true``; the ``HaFormExpandableSchema`` interface
//   in ``types.ts`` declares the field explicitly so a future
//   maintainer can't add a nested expandable by accident.
//
// * **Storage shape** — saved configs use
//   ``entities: Array<{ entity: string }>`` (legacy promotion path
//   from the original scalar ``entity`` form). ha-form's entity
//   selector with ``multiple: true`` emits a flat ``string[]``. We
//   translate at the editor's value-changed boundary so the on-disk
//   shape stays backwards-compatible with existing dashboards.

import { LitElement, html, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type {
  HaFormSchema,
  HomeAssistant,
  NextbikeAustriaCardConfig,
  NextbikeStationEntry,
} from "./types";
import { editorStyles } from "./editor-styles";
import { et } from "./localize/localize";
import { normaliseConfig } from "./utils";

/** Local minimal `fireEvent` shim — same shape as the helper from
 *  custom-card-helpers (which the rest of the bundle deliberately
 *  avoids depending on for a single function). `bubbles: true` +
 *  `composed: true` are required so the event crosses our shadow
 *  boundary and reaches the dashboard's card-editor listener. */
function fireEvent<T>(node: HTMLElement, type: string, detail: T): void {
  const event = new CustomEvent(type, {
    detail,
    bubbles: true,
    composed: true,
  });
  node.dispatchEvent(event);
}

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

  /** Translate `key` against the active HA language. Tiny shortcut
   *  around the editor-namespaced localize helper to keep render call
   *  sites tidy. */
  private _t(key: string): string {
    return et(this.hass, key);
  }

  /** Build the ha-form schema. Called per render so option labels
   *  pick up the current `hass.language`. */
  private _schema(): ReadonlyArray<HaFormSchema> {
    return [
      {
        // Filter to nextbike-austria sensors only — picking an
        // unrelated `sensor.*` would render an empty card.
        // `multiple: true` is what enables station picking. Output
        // is a flat string[] which we translate to the storage
        // `Array<{entity}>` shape in _onFormChanged.
        name: "entities",
        required: true,
        selector: {
          entity: {
            domain: "sensor",
            integration: "nextbike_austria",
            multiple: true,
          },
        },
      },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "stacked", label: this._t("layout_stacked") },
              { value: "tabs", label: this._t("layout_tabs") },
            ],
          },
        },
      },
      {
        // `flatten: true` is non-negotiable. Without it, every toggle
        // below would write to `data.display.<name>` and the card's
        // flat config-key reads (`this._config.show_rack`) would
        // silently default. The HaFormExpandableSchema interface
        // declares `flatten?: boolean` explicitly so this can't be
        // forgotten in a future schema edit.
        type: "expandable",
        name: "display",
        title: this._t("section_display"),
        flatten: true,
        schema: [
          { name: "hide_header", selector: { boolean: {} } },
          { name: "show_rack", selector: { boolean: {} } },
          { name: "show_legend", selector: { boolean: {} } },
          { name: "show_battery", selector: { boolean: {} } },
          { name: "show_ebikes", selector: { boolean: {} } },
          { name: "show_docks", selector: { boolean: {} } },
          { name: "show_flags", selector: { boolean: {} } },
          { name: "show_timestamp", selector: { boolean: {} } },
          { name: "show_rent_button", selector: { boolean: {} } },
          { name: "hide_attribution", selector: { boolean: {} } },
        ],
      },
    ];
  }

  /** Field-label resolver. Three-step chain:
   *  1. HA core's own translations for common field names ("entities",
   *     "name", "icon"). `hass.localize` returns "" on miss, not the
   *     lookup key, so a falsy check is the correct miss signal.
   *  2. The card's editor-namespaced bundle (`editor.<field>`).
   *  3. Last resort: raw field name (still functional, dev sees the gap). */
  private _computeLabel = (field: { name: string }): string => {
    const haKey = `ui.panel.lovelace.editor.card.generic.${field.name}`;
    const ha = this.hass?.localize?.(haKey);
    if (ha) return ha;
    const localised = this._t(field.name);
    if (localised !== field.name) return localised;
    return field.name;
  };

  /** Helper-text resolver. Only surfaces a helper when an
   *  `editor.<field>_helper` key actually exists in the bundle —
   *  otherwise ha-form's empty helper line eats vertical space. */
  private _computeHelper = (field: { name: string }): string | undefined => {
    const key = `${field.name}_helper`;
    const localised = this._t(key);
    return localised === key ? undefined : localised;
  };

  /** Translate the saved-config shape to ha-form's input shape.
   *  ha-form's entity selector with `multiple: true` reads/emits a
   *  flat string[]; the storage shape carries `Array<{entity}>` for
   *  backwards compat with dashboards predating ha-form. */
  private _formData(): Record<string, unknown> {
    const entities = (this._config.entities ?? [])
      .map((s) => s.entity)
      .filter((e): e is string => typeof e === "string" && e.length > 0);
    return {
      ...this._config,
      entities,
    };
  }

  private _onFormChanged = (
    ev: CustomEvent<{ value: Record<string, unknown> }>,
  ): void => {
    const value = ev.detail.value;
    const rawEntities = value["entities"];
    const entityList: NextbikeStationEntry[] = Array.isArray(rawEntities)
      ? rawEntities
          .filter((s): s is string => typeof s === "string" && s.length > 0)
          .map((entity) => ({ entity }))
      : [];
    // Pipe through normaliseConfig so the boolean coercion + layout
    // narrowing stay consistent with the card's setConfig path.
    const next = normaliseConfig({
      ...(value as Partial<NextbikeAustriaCardConfig>),
      entities: entityList,
    });
    // CRITICAL: set _config BEFORE fireEvent. Custom editors don't
    // receive a re-setConfig after config-changed, so a fireEvent-only
    // path leaves _config stale and the next render reverts the form
    // to its pre-change value.
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  };

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass) return nothing;
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
      </div>
    `;
  }
}
