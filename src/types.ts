// Minimal HomeAssistant shape — the card only reads `states`, `language`,
// `localize`, and `callWS`. Keeping it local avoids pulling in
// custom-card-helpers as another dependency for a handful of fields.

export interface HassEntityAttributes {
  friendly_name?: string;
  attribution?: string;
  unit_of_measurement?: string;
  station_id?: string;
  system_id?: string;
  system_label?: string;
  capacity?: number | null;
  num_docks_available?: number | null;
  vehicle_types_available?: Array<{
    vehicle_type_id?: string;
    count?: number;
  }>;
  vehicle_type_names?: Record<string, string>;
  bikes_reserved?: number;
  bikes_reserved_types?: string[];
  bikes_disabled?: number;
  bikes_disabled_types?: string[];
  e_bike_avg_battery_pct?: number;
  e_bike_range_samples?: number;
  e_bike_battery_list?: Array<{ type?: string; pct?: number }>;
  rental_uri?: string;
  latitude?: number;
  longitude?: number;
  // Python sensor emits this as ISO-8601 UTC (sensor.py::_epoch_to_iso),
  // but YAML configs / older bundles may still surface a raw epoch second.
  // relativeTime() handles both shapes.
  last_reported?: number | string;
  is_installed?: boolean;
  is_renting?: boolean;
  is_returning?: boolean;
  is_virtual_station?: boolean;
  [key: string]: unknown;
}

export interface HassEntity {
  state: string;
  attributes: HassEntityAttributes;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language?: string;
  // HA core ships translations for common field names ("entities",
  // "name", "icon", etc.) — the editor's _computeLabel chain queries
  // `ui.panel.lovelace.editor.card.generic.<field>` first so common
  // labels work in every supported HA locale without us translating
  // them in the card bundle.
  localize?: (key: string, ...args: unknown[]) => string;
  callWS?<T = unknown>(msg: { type: string; [key: string]: unknown }): Promise<T>;
}

// ---------------------------------------------------------------------------
// Card config
// ---------------------------------------------------------------------------

export interface NextbikeStationEntry {
  entity: string;
}

export interface NextbikeAustriaCardConfig {
  type: string;
  // `entity` is a legacy scalar form still accepted by setConfig and
  // promoted to `entities` during normalisation.
  entity?: string;
  entities: NextbikeStationEntry[];
  layout?: "stacked" | "tabs";
  show_rack?: boolean;
  show_legend?: boolean;
  show_ebikes?: boolean;
  show_battery?: boolean;
  show_docks?: boolean;
  show_flags?: boolean;
  show_timestamp?: boolean;
  show_rent_button?: boolean;
  hide_header?: boolean;
  hide_attribution?: boolean;
}

// ---------------------------------------------------------------------------
// <ha-form> schema types
// ---------------------------------------------------------------------------
//
// These mirror the HA core editor types so the form editor stays
// strictly typed. `expandable` + `flatten: true` is non-negotiable —
// without `flatten`, ha-form scopes inner-schema values under
// `data[name]` and the card's flat-key reads silently default. The
// interface declares `flatten?: boolean` explicitly so a future
// maintainer can't add an expandable that quietly nests its values.

export type HASelector =
  | {
      entity: {
        domain?: string | string[];
        integration?: string;
        multiple?: boolean;
      };
    }
  | { boolean: Record<string, never> }
  | { text: { type?: "text" | "password" | "url" | "email"; multiline?: boolean } }
  | {
      number: {
        min?: number;
        max?: number;
        step?: number;
        mode?: "box" | "slider";
        unit_of_measurement?: string;
      };
    }
  | {
      select: {
        mode?: "dropdown" | "list";
        multiple?: boolean;
        custom_value?: boolean;
        options: ReadonlyArray<{ value: string; label: string }>;
      };
    };

export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
}

export interface HaFormSelectorSchema extends HaFormBaseSchema {
  selector: HASelector;
}

export interface HaFormGridSchema {
  type: "grid";
  name: "";
  schema: ReadonlyArray<HaFormSchema>;
}

export interface HaFormExpandableSchema {
  type: "expandable";
  name: string;
  title?: string;
  /** When true, ha-form keeps the inner schema's values flat in
   *  `data` (i.e. `data.show_rack` rather than `data.display.show_rack`).
   *  Required for cards whose render() reads flat config keys —
   *  forgetting it silently leaves every flag at its default. */
  flatten?: boolean;
  schema: ReadonlyArray<HaFormSchema>;
}

export type HaFormSchema =
  | HaFormSelectorSchema
  | HaFormGridSchema
  | HaFormExpandableSchema;

// `<ha-form>` element shape — mirror the props the editor sets so
// `tsc --noEmit` validates the template at compile time.
interface HaFormElement extends HTMLElement {
  hass?: HomeAssistant;
  data?: Record<string, unknown>;
  schema?: ReadonlyArray<HaFormSchema>;
  computeLabel?: (field: { name: string }) => string;
  computeHelper?: (field: { name: string }) => string | undefined;
}

// Register editor/card tags with the HTMLElementTagNameMap so IDEs
// autocomplete them in html`` templates.
declare global {
  interface HTMLElementTagNameMap {
    "nextbike-austria-card": HTMLElement;
    "nextbike-austria-card-editor": HTMLElement;
    "ha-form": HaFormElement;
  }
}

// Lovelace `customCards` extension on window.
export interface WindowWithCustomCards extends Window {
  customCards: Array<{
    type: string;
    name: string;
    description: string;
    preview?: boolean;
    documentationURL?: string;
  }>;
}
