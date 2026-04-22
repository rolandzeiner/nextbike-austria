// Minimal HomeAssistant shape — the card only reads `states`, `language`,
// and `callWS`. Keeping it local avoids pulling in custom-card-helpers as
// another dependency for six fields.

export interface HassEntityAttributes {
  friendly_name?: string;
  attribution?: string;
  unit_of_measurement?: string;
  station_id?: string;
  system_id?: string;
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
  last_reported?: number;
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
  hide_attribution?: boolean;
}

// Register editor/card tags with the HTMLElementTagNameMap so IDEs
// autocomplete them in html`` templates.
declare global {
  interface HTMLElementTagNameMap {
    "nextbike-austria-card": HTMLElement;
    "nextbike-austria-card-editor": HTMLElement;
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
