import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HassEntityAttributes, HomeAssistant } from "./types";
import {
  batteryColor,
  cleanStationName,
  countEbikesAvailable,
  expandClassicTypes,
  findNextbikeEntities,
  firstEbikeTypeName,
  getEbikeIds,
  normaliseConfig,
  relativeTime,
  resolveDisplayName,
  safeHttpsUri,
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
