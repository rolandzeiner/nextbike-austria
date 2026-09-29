import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HassEntityAttributes, HomeAssistant, RackInputs } from "./types";
import { SYSTEM_ACCENT } from "./const";
import {
  ACCENT_INK_DARK,
  accentInk,
  arrayOr,
  batteryColor,
  batteryIcon,
  contrastRatio,
  cleanStationName,
  countEbikesAvailable,
  countOf,
  expandClassicTypes,
  findNextbikeEntities,
  firstEbikeTypeName,
  getEbikeIds,
  normaliseConfig,
  numberOr,
  parseBikeCount,
  rackInputs,
  rackLayout,
  relativeTime,
  resolveDisplayName,
  safeHttpsUri,
  stationMapUrl,
  stripeEdge,
  systemAccent,
  systemLabel,
} from "./utils";

const NAMES = { "143": "E-Bike", "196": "Classic Bike", "200": "Cargo E-Bike" };
const EBIKES: ReadonlySet<string> = new Set(["143", "200"]);

describe("getEbikeIds — live set from the coordinator, fallback otherwise", () => {
  it("prefers the live id list", () => {
    expect([...getEbikeIds({ e_bike_vehicle_type_ids: ["7", "9"] })]).toEqual(["7", "9"]);
  });

  it("drops blank and non-string ids from the live list", () => {
    const attrs = { e_bike_vehicle_type_ids: ["7", "", 9] } as unknown as HassEntityAttributes;
    expect([...getEbikeIds(attrs)]).toEqual(["7"]);
  });

  it.each([
    ["missing attributes", undefined],
    ["no live list", {}],
    ["an empty live list", { e_bike_vehicle_type_ids: [] }],
    ["a live list of junk only", { e_bike_vehicle_type_ids: [""] }],
  ])("falls back to the bundled defaults for %s", (_label, attrs) => {
    expect([...getEbikeIds(attrs)]).toEqual(["143", "183", "200"]);
  });
});

describe("safeHttpsUri — href trust boundary", () => {
  it.each(["https://nextbike.at/app", "http://example.org", "HTTPS://X.AT"])(
    "keeps %s",
    (uri) => {
      expect(safeHttpsUri(uri)).toBe(uri);
    },
  );

  it.each([
    "javascript:alert(1)",
    "data:text/html,<b>x</b>",
    "//nextbike.at",
    "",
    42,
    null,
  ])("rejects %s", (uri) => {
    expect(safeHttpsUri(uri)).toBe("");
  });
});

describe("findNextbikeEntities — picker auto-detect", () => {
  const nb = { station_id: "1", system_id: "nextbike_wr", attribution: "Data: nextbike GmbH" };
  const hass = {
    states: {
      "sensor.nb_one": { state: "3", attributes: nb },
      "sensor.other_system": {
        state: "3",
        attributes: { ...nb, system_id: "citybike" },
      },
      "sensor.no_attribution": {
        state: "3",
        attributes: { ...nb, attribution: "Data: someone else" },
      },
      "sensor.no_station_id": {
        state: "3",
        attributes: { system_id: "nextbike_wr", attribution: "Data: nextbike" },
      },
      "binary_sensor.nb_flag": { state: "on", attributes: nb },
    },
  } as unknown as HomeAssistant;

  it("finds only nextbike station sensors", () => {
    expect(findNextbikeEntities(hass)).toEqual(["sensor.nb_one"]);
  });

  it("returns nothing without hass", () => {
    expect(findNextbikeEntities(undefined)).toEqual([]);
    expect(findNextbikeEntities({} as HomeAssistant)).toEqual([]);
  });

  it("skips a state entry that is missing or has no attributes", () => {
    const sparse = {
      states: { "sensor.gone": undefined, "sensor.bare": { state: "1" } },
    } as unknown as HomeAssistant;
    expect(findNextbikeEntities(sparse)).toEqual([]);
  });
});

describe("normaliseConfig — setConfig's defaults", () => {
  it("fills every display default for an empty config", () => {
    expect(normaliseConfig(null)).toEqual({
      entities: [],
      show_rack: true,
      show_legend: true,
      show_ebikes: true,
      show_battery: true,
      show_docks: true,
      show_flags: true,
      show_timestamp: true,
      show_rent_button: true,
      hide_header: false,
      hide_attribution: false,
      layout: "stacked",
    });
  });

  it("keeps explicit choices over the defaults", () => {
    const out = normaliseConfig({
      type: "custom:nextbike-austria-card",
      entities: [],
      show_rack: false,
      hide_header: true,
      layout: "tabs",
    });
    expect(out).toMatchObject({ show_rack: false, hide_header: true, layout: "tabs" });
  });

  it("promotes the legacy scalar entity onto entities", () => {
    const out = normaliseConfig({ entity: "sensor.nb_one" } as never);
    expect(out.entities).toEqual([{ entity: "sensor.nb_one" }]);
    expect("entity" in out).toBe(false);
  });

  it("does not let the legacy entity override an entities list", () => {
    const out = normaliseConfig({
      entity: "sensor.legacy",
      entities: [{ entity: "sensor.kept" }],
    } as never);
    expect(out.entities).toEqual([{ entity: "sensor.kept" }]);
  });

  it("drops a legacy entity that is not an entity id", () => {
    expect(normaliseConfig({ entity: "nonsense" } as never).entities).toEqual([]);
  });

  it("accepts string and object entries and drops junk", () => {
    const out = normaliseConfig({
      entities: ["sensor.a", { entity: "sensor.b" }, "nodot", { entity: 5 }, null, 7],
    } as never);
    expect(out.entities).toEqual([{ entity: "sensor.a" }, { entity: "sensor.b" }]);
  });

  it("falls back to stacked for an unknown layout", () => {
    expect(normaliseConfig({ layout: "grid" } as never).layout).toBe("stacked");
  });
});

describe("countEbikesAvailable — card-side e-bike count", () => {
  it("returns null without a vehicle-type breakdown", () => {
    expect(countEbikesAvailable(undefined)).toBeNull();
    expect(countEbikesAvailable({})).toBeNull();
  });

  it("sums the e-bike rows using the live id set", () => {
    const attrs = {
      e_bike_vehicle_type_ids: ["143"],
      vehicle_types_available: [
        { vehicle_type_id: "143", count: 2 },
        { vehicle_type_id: "196", count: 5 },
        { vehicle_type_id: "143", count: 1 },
      ],
    };
    expect(countEbikesAvailable(attrs)).toBe(3);
  });

  it("ignores junk rows and non-finite counts", () => {
    const attrs = {
      vehicle_types_available: [
        null,
        "row",
        { vehicle_type_id: "183", count: Number.NaN },
        { vehicle_type_id: "183", count: "4" },
        { count: 9 },
        { vehicle_type_id: "200", count: 2 },
      ],
    } as unknown as HassEntityAttributes;
    expect(countEbikesAvailable(attrs)).toBe(2);
  });
});

describe("firstEbikeTypeName — fallback label for e-bike slots", () => {
  it("names the first e-bike type that has a name", () => {
    const rows = [
      { vehicle_type_id: "196", count: 1 },
      { vehicle_type_id: "200", count: 1 },
      { vehicle_type_id: "143", count: 1 },
    ];
    expect(firstEbikeTypeName(rows, NAMES, EBIKES)).toBe("Cargo E-Bike");
  });

  it("returns null when no e-bike type is named", () => {
    expect(firstEbikeTypeName([{ vehicle_type_id: "143" }], {}, EBIKES)).toBeNull();
    expect(firstEbikeTypeName([{ vehicle_type_id: "143" }], undefined, EBIKES)).toBeNull();
    expect(firstEbikeTypeName(undefined, NAMES, EBIKES)).toBeNull();
  });

  it("tolerates a row without a type id", () => {
    expect(firstEbikeTypeName([{ count: 1 }], NAMES, EBIKES)).toBeNull();
  });
});

describe("expandClassicTypes — one name per classic bike, in feed order", () => {
  it("expands each classic row by its count and skips e-bikes", () => {
    const rows = [
      { vehicle_type_id: "196", count: 2 },
      { vehicle_type_id: "143", count: 4 },
      { vehicle_type_id: "300", count: 1 },
    ];
    expect(expandClassicTypes(rows, NAMES, EBIKES)).toEqual([
      "Classic Bike",
      "Classic Bike",
      "",
    ]);
  });

  it("skips empty, negative and non-numeric counts", () => {
    const rows = [
      { vehicle_type_id: "196", count: 0 },
      { vehicle_type_id: "196", count: -2 },
      { vehicle_type_id: "196" },
      { vehicle_type_id: "196", count: Number.POSITIVE_INFINITY },
    ];
    expect(expandClassicTypes(rows, NAMES, EBIKES)).toEqual([]);
  });

  it("returns nothing without a breakdown, and blank names without a name table", () => {
    expect(expandClassicTypes(undefined, NAMES, EBIKES)).toEqual([]);
    expect(expandClassicTypes([{ count: 1 }], undefined, EBIKES)).toEqual([""]);
  });
});

describe("batteryColor — thresholded charge scale", () => {
  it.each([
    [100, "#2ecc71"],
    [75, "#2ecc71"],
    [74.9, "#8bc34a"],
    [50, "#8bc34a"],
    [49, "#ffa726"],
    [25, "#ffa726"],
    [24, "#e53935"],
    [0, "#e53935"],
  ])("%d%% is %s", (pct, color) => {
    expect(batteryColor(pct)).toBe(color);
  });

  it.each([undefined, null, Number.NaN])("treats %s as full", (pct) => {
    expect(batteryColor(pct)).toBe("#2ecc71");
  });
});

describe("relativeTime — the footer's age label", () => {
  const NOW = Date.parse("2026-09-29T12:00:00Z");
  const LABELS: Record<string, string> = {
    now: "now",
    seconds_ago: "{n}s",
    minutes_ago: "{n}m",
    hours_ago: "{n}h",
  };
  const t = (key: string): string => LABELS[key] ?? key;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["under ten seconds", 5, "now"],
    ["seconds", 42, "42s"],
    ["minutes", 5 * 60 + 30, "5m"],
    ["hours", 3 * 3600 + 59, "3h"],
  ])("labels an ISO timestamp %s old", (_label, ageSec, expected) => {
    const iso = new Date(NOW - ageSec * 1000).toISOString();
    expect(relativeTime(iso, t)).toBe(expected);
  });

  it("accepts epoch seconds", () => {
    expect(relativeTime(NOW / 1000 - 90, t)).toBe("1m");
  });

  it("reads an epoch-milliseconds value as milliseconds, not the far future", () => {
    expect(relativeTime(NOW - 2 * 3600 * 1000, t)).toBe("2h");
  });

  it("clamps a timestamp in the future to now", () => {
    expect(relativeTime(new Date(NOW + 60_000).toISOString(), t)).toBe("now");
  });

  it.each([undefined, null, "", "not a date", Number.NaN])("returns null for %s", (ts) => {
    expect(relativeTime(ts, t)).toBeNull();
  });
});

describe("station display names", () => {
  it.each([
    ["Westbahnhof Bikes available", "Westbahnhof"],
    ["Westbahnhof Räder verfügbar", "Westbahnhof"],
    ["Westbahnhof", "Westbahnhof"],
  ])("cleans %s", (raw, clean) => {
    expect(cleanStationName(raw)).toBe(clean);
  });

  it("prefers the locale-agnostic display name", () => {
    const attrs = { station_display_name: "Praterstern", friendly_name: "X Bikes available" };
    expect(resolveDisplayName(attrs, "sensor.nb")).toBe("Praterstern");
  });

  it("falls back to the cleaned friendly name, then the entity id", () => {
    expect(resolveDisplayName({ friendly_name: "Karlsplatz Bikes available" }, "sensor.nb")).toBe(
      "Karlsplatz",
    );
    expect(resolveDisplayName({ station_display_name: "" }, "sensor.nb_karlsplatz")).toBe(
      "sensor.nb_karlsplatz",
    );
    expect(resolveDisplayName(undefined, "sensor.nb_karlsplatz")).toBe("sensor.nb_karlsplatz");
  });
});

describe("attribute coercion", () => {
  it("keeps numbers and arrays, and falls back for anything else", () => {
    expect(numberOr(0, null)).toBe(0);
    expect(numberOr("4", null)).toBeNull();
    expect(numberOr(undefined, 7)).toBe(7);
    expect(arrayOr(["a"], null)).toEqual(["a"]);
    expect(arrayOr(undefined, [])).toEqual([]);
    expect(arrayOr("a" as unknown as string[], null)).toBeNull();
  });

  it.each([
    ["7", 7],
    ["0", 0],
    ["-3", 0],
    ["unavailable", 0],
    ["", 0],
  ])("reads the bike count %j as %d", (state, bikes) => {
    expect(parseBikeCount(state)).toBe(bikes);
  });

  it.each([
    [3, 3],
    [0, 0],
    [-3, 0],
    [1.5, 1],
    [Number.NaN, 0],
    ["2", 0],
    [undefined, 0],
  ])("reads the count %o as %d", (value, count) => {
    expect(countOf(value)).toBe(count);
  });
});

describe("station header", () => {
  it("tints known operators and falls back to the theme colour", () => {
    expect(systemAccent({ system_id: "nextbike_wr" })).toBe("#DC2026");
    expect(systemAccent({ system_id: "nextbike_zz" })).toBe("var(--primary-color)");
    expect(systemAccent({})).toBe("var(--primary-color)");
  });

  it("labels the operator, stripping the slug for older sensors", () => {
    expect(systemLabel({ system_label: "WienMobil Rad", system_id: "nextbike_wr" })).toBe(
      "WienMobil Rad",
    );
    expect(systemLabel({ system_id: "nextbike_la" })).toBe("la");
    expect(systemLabel({})).toBe("");
  });

  it("links the map only with both coordinates", () => {
    expect(stationMapUrl({ latitude: 48.2, longitude: 16.37 })).toBe(
      "https://www.google.com/maps/search/?api=1&query=48.2,16.37",
    );
    expect(stationMapUrl({ latitude: 48.2 })).toBeNull();
    expect(stationMapUrl({})).toBeNull();
  });
});

describe("rackInputs — what the rack reads off the sensor", () => {
  it("defaults every missing or malformed attribute", () => {
    const junk = {
      capacity: "10",
      vehicle_type_names: "names",
      bikes_reserved_types: "x",
      e_bike_battery_list: {},
    } as unknown as HassEntityAttributes;
    expect(rackInputs(3, junk)).toEqual({
      bikes: 3,
      ebikes: null,
      capacity: null,
      batteryPct: null,
      batterySamples: 0,
      batteryList: null,
      vehicleTypesAvailable: [],
      vehicleTypeNames: {},
      ebikeIds: new Set(["143", "183", "200"]),
      reservedCount: 0,
      reservedTypes: [],
      disabledCount: 0,
      disabledTypes: [],
    });
  });
});

describe("rackLayout — filling the docks", () => {
  const rack = (over: Partial<RackInputs> = {}): RackInputs => ({
    ...rackInputs(0, {}),
    ...over,
  });
  const counts = (r: RackInputs, capacity: number, battery = true) => {
    const { bikes, ebikes, reserved, disabled, empty, overflow } = rackLayout(r, capacity, battery);
    return { bikes, ebikes, reserved, disabled, empty, overflow };
  };

  it("fills bikes, then reserved, then out of service, then empty", () => {
    expect(
      counts(rack({ bikes: 4, ebikes: 1, reservedCount: 2, disabledCount: 1 }), 10),
    ).toEqual({ bikes: 4, ebikes: 1, reserved: 2, disabled: 1, empty: 3, overflow: 0 });
  });

  it("caps bikes at the dock count and carries the rest as overflow", () => {
    expect(counts(rack({ bikes: 12, reservedCount: 1 }), 8)).toEqual({
      bikes: 8,
      ebikes: 0,
      reserved: 0,
      disabled: 0,
      empty: 0,
      overflow: 4,
    });
  });

  it("lets reserved bikes crowd out the out-of-service ones, never the capacity", () => {
    expect(counts(rack({ bikes: 5, reservedCount: 4, disabledCount: 4 }), 8)).toEqual({
      bikes: 5,
      ebikes: 0,
      reserved: 3,
      disabled: 0,
      empty: 0,
      overflow: 0,
    });
  });

  it("draws one slot per dock even when upstream sends negative counts", () => {
    const fromSensor = rackInputs(4, { bikes_reserved: -3, bikes_disabled: 1.5 });
    expect(counts(fromSensor, 10)).toEqual({
      bikes: 4,
      ebikes: 0,
      reserved: 0,
      disabled: 1,
      empty: 5,
      overflow: 0,
    });
  });

  it("never shows more e-bikes than bikes", () => {
    expect(counts(rack({ bikes: 2, ebikes: 5 }), 4).ebikes).toBe(2);
    expect(counts(rack({ bikes: 2, ebikes: Number.NaN }), 4).ebikes).toBe(0);
  });

  it("shows charge only when enabled and sampled", () => {
    const charged = rack({ batteryPct: 60, batterySamples: 2, batteryList: [{ pct: 60 }] });
    expect(rackLayout(charged, 4, true)).toMatchObject({ showBattery: true, perBike: [{ pct: 60 }] });
    expect(rackLayout(charged, 4, false)).toMatchObject({ showBattery: false, perBike: [] });
    expect(rackLayout({ ...charged, batterySamples: 0 }, 4, true).showBattery).toBe(false);
    expect(rackLayout({ ...charged, batteryList: null }, 4, true).perBike).toEqual([]);
  });

  it("names e-bike and classic slots from the vehicle types", () => {
    const layout = rackLayout(
      rack({
        vehicleTypesAvailable: [
          { vehicle_type_id: "143", count: 1 },
          { vehicle_type_id: "196", count: 2 },
        ],
        vehicleTypeNames: { "143": "E-Bike", "196": "Classic" },
      }),
      4,
      true,
    );
    expect(layout.ebikeFallbackType).toBe("E-Bike");
    expect(layout.classicNames).toEqual(["Classic", "Classic"]);
  });
});

describe("operator colours meet WCAG contrast", () => {
  const AMBER = "#ffd740";
  const accents = Object.entries(SYSTEM_ACCENT);

  it("measures contrast the WCAG way", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#009ac7", "#ffffff")).toBeCloseTo(3.26, 2);
  });

  it.each(accents)("rent-button text on %s reaches 4.5:1", (_system, accent) => {
    expect(contrastRatio(accentInk(accent), accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps white text on the dark accents", () => {
    expect(accentInk(SYSTEM_ACCENT.nextbike_wr!)).toBe("#ffffff");
    expect(accentInk(SYSTEM_ACCENT.nextbike_ka!)).toBe(ACCENT_INK_DARK);
    expect(accentInk(SYSTEM_ACCENT.nextbike_vt!)).toBe(ACCENT_INK_DARK);
    expect(accentInk("var(--primary-color)")).toBe("var(--text-primary-color, #fff)");
  });

  it.each(accents)("the e-bike stripe on %s stands out at 3:1", (_system, accent) => {
    const edge = stripeEdge(accentInk(accent));
    if (edge === ACCENT_INK_DARK) {
      // A dark band sits between the accent and the amber.
      expect(contrastRatio(edge, accent)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(edge, AMBER)).toBeGreaterThanOrEqual(3);
    } else {
      // No band: the amber meets the accent directly.
      expect(edge).toBe("var(--nb-ebike-amber)");
      expect(contrastRatio(AMBER, accent)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("batteryIcon — average-charge chip", () => {
  it.each([
    [100, "mdi:battery"],
    [96, "mdi:battery"],
    [64, "mdi:battery-60"],
    [12, "mdi:battery-10"],
    [3, "mdi:battery-outline"],
  ])("shows %d%% as %s", (pct, icon) => {
    expect(batteryIcon(pct)).toBe(icon);
  });
});
