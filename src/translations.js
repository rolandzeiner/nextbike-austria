export const TRANSLATIONS = {
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
    battery_unknown: "Batterie unbekannt",
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
    no_rental: "no rental",
    no_return: "no return",
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
    minutes_ago: "{n}min ago",
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
    battery_unknown: "battery unknown",
    version_update:
      "Nextbike Austria updated to v{v} — please reload",
    version_reload: "Reload",
    editor: {
      section_stations: "Stations",
      stations_hint: "Show one or more stations.",
      section_display: "Display",
      layout_label: "Multi-station layout",
      layout_stacked: "Stacked",
      layout_tabs: "Tabs",
      show_rack: "Show bike rack",
      show_legend: "Show legend",
      show_battery: "Show battery in e-bike slot",
      show_ebikes: "Show e-bikes",
      show_docks: "Show docks",
      show_flags: "Show status flags",
      show_timestamp: "Show timestamp",
      show_rent_button: "Show app-rent link",
      hide_attribution: "Hide attribution",
      no_sensors_available:
        "No nextbike sensors available. Add a station first via Settings → Devices & Services.",
    },
  },
};

export function pickLang(hass) {
  const hl = hass?.language || "en";
  return hl.startsWith("de") ? "de" : "en";
}

export function t(hass, key) {
  const lang = pickLang(hass);
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
}

export function et(hass, key) {
  const lang = pickLang(hass);
  return (
    TRANSLATIONS[lang]?.editor?.[key]
    ?? TRANSLATIONS.en.editor[key]
    ?? key
  );
}
