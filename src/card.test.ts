/**
 * @vitest-environment happy-dom
 *
 * Component tests for the station card and everything src/index.ts registers.
 *
 * Three jobs a green build does not do on its own:
 *
 * 1. **The decorator check.** Rolldown lowers Lit's legacy decorators per
 *    tsconfig.json, and so does vitest's Vite for these tests; nothing here
 *    runs the built bundle. It can regress two ways, both with the build
 *    still green. The decorators stop running: reading `elementProperties`
 *    back off the constructor catches that. Or class fields overwrite Lit's
 *    accessors and the card stops re-rendering: mounting a card catches
 *    that, through Lit's dev-mode check or, failing that, the own-property
 *    assertion.
 * 2. **Behaviour.** The hass gate in shouldUpdate, the tab strip's keyboard
 *    handling, the version banner and the empty states.
 * 3. **The rendered markup, pinned.** Each scenario under "rendered markup"
 *    snapshots the card with Lit's comment markers removed, whitespace runs
 *    squeezed to one space and none left between tags, so a refactor of the
 *    render helpers must reproduce the same elements, attributes and text.
 *    When to update a snapshot: CONTRIBUTING.md.
 *
 * `ha-card` and `ha-icon` are HA elements that do not exist here; happy-dom
 * renders them as inert containers, which is all these tests need.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { NextbikeAustriaCard } from "./card";
import type { HassEntityAttributes, HomeAssistant, WindowWithCustomCards } from "./types";

const NOW = Date.parse("2026-09-29T12:00:00Z");
const minutesAgo = (n: number): string => new Date(NOW - n * 60_000).toISOString();

/** Custom-element names recorded as src/index.ts registers them. */
const registered: string[] = [];

beforeAll(async () => {
  // happy-dom keeps its registry private, so record names as they arrive.
  const realDefine = customElements.define.bind(customElements);
  customElements.define = ((
    name: string,
    ctor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
  ) => {
    registered.push(name);
    return realDefine(name, ctor, options);
  }) as typeof customElements.define;
  await import("./index");
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  document.body.replaceChildren();
  window.sessionStorage.clear();
  vi.useRealTimers();
});

// --- fixtures ---------------------------------------------------------------

const NB = { station_id: "1", attribution: "Data: nextbike GmbH, CC0-1.0" };

/** A busy Vienna station: e-bikes with and without charge data, reserved,
 *  disabled and empty docks, every flag raised. */
const FULL: HassEntityAttributes = {
  ...NB,
  friendly_name: "Hauptbahnhof Bikes available",
  station_display_name: "Hauptbahnhof",
  system_id: "nextbike_wr",
  system_label: "WienMobil Rad",
  capacity: 10,
  num_docks_available: 2,
  e_bike_vehicle_type_ids: ["143"],
  vehicle_types_available: [
    { vehicle_type_id: "143", count: 3 },
    { vehicle_type_id: "196", count: 3 },
  ],
  vehicle_type_names: { "143": "E-Bike", "196": "Classic Bike" },
  bikes_reserved: 1,
  bikes_reserved_types: ["Classic Bike"],
  bikes_disabled: 2,
  bikes_disabled_types: ["E-Bike"],
  e_bike_avg_battery_pct: 55,
  e_bike_range_samples: 2,
  e_bike_battery_list: [{ type: "E-Bike", pct: 82 }, { pct: 20 }],
  rental_uri: "https://nextbike.at/rent/1",
  latitude: 48.185,
  longitude: 16.376,
  last_reported: minutesAgo(5),
  is_installed: false,
  is_renting: false,
  is_returning: false,
  is_virtual_station: true,
};

/** More bikes than docks, default e-bike ids, no names, no charge data. */
const OVERFLOW: HassEntityAttributes = {
  ...NB,
  friendly_name: "Linz Hbf Bikes available",
  system_id: "nextbike_al",
  capacity: 8,
  num_docks_available: 0,
  vehicle_types_available: [
    { vehicle_type_id: "183", count: 2 },
    { vehicle_type_id: "999", count: 10 },
  ],
  last_reported: NOW / 1000 - 30,
};

/** Almost nothing: no capacity, no names, an unsafe rental link. */
const MINIMAL: HassEntityAttributes = {
  rental_uri: "javascript:alert(1)",
};

function hass(states: Record<string, [string, HassEntityAttributes]>): HomeAssistant {
  return {
    language: "en",
    states: Object.fromEntries(
      Object.entries(states).map(([id, [state, attributes]]) => [id, { state, attributes }]),
    ),
  };
}

type Card = NextbikeAustriaCard;

/** Mount a card, let Lit settle, and hand it back. */
async function mount(config: Record<string, unknown>, h?: HomeAssistant): Promise<Card> {
  const el = document.createElement("nextbike-austria-card") as unknown as Card;
  el.setConfig(config as never);
  if (h) el.hass = h;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const root = (el: Card): ShadowRoot => el.shadowRoot!;

/** The card's markup without Lit's comment markers, with whitespace runs
 *  squeezed to one space and none left between tags. The markers are
 *  removed as DOM nodes from a clone, not by pattern-matching the HTML
 *  string, which CodeQL rightly flags as incomplete sanitisation. */
function markup(el: Card): string {
  const card = root(el).querySelector("ha-card");
  if (!card) return "";
  const clone = card.cloneNode(true) as Element;
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT);
  const markers: Node[] = [];
  while (walker.nextNode()) markers.push(walker.currentNode);
  for (const marker of markers) marker.parentNode?.removeChild(marker);
  return clone.outerHTML.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
}

/** Let a pending WebSocket probe resolve and the card re-render. */
async function settle(el: Card): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
}

// --- registration -----------------------------------------------------------

describe("custom element registration", () => {
  it.each(["nextbike-austria-card", "nextbike-austria-card-editor"])("registers %s", (tag) => {
    expect(registered).toContain(tag);
  });

  it("advertises the card to the Lovelace picker", () => {
    const cards = (window as unknown as WindowWithCustomCards).customCards;
    expect(cards.map((c) => c.type)).toContain("nextbike-austria-card");
  });

  it("suggests the card only for this integration's sensors", () => {
    const entry = (window as unknown as WindowWithCustomCards).customCards.find(
      (c) => c.type === "nextbike-austria-card",
    )!;
    const h = {
      states: {},
      entities: {
        "sensor.nb": { platform: "nextbike_austria" },
        "sensor.other": { platform: "other" },
      },
    } as HomeAssistant;
    expect(entry.getEntitySuggestion?.(h, "sensor.nb")).toEqual({
      config: { type: "custom:nextbike-austria-card", entities: [{ entity: "sensor.nb" }] },
    });
    expect(entry.getEntitySuggestion?.(h, "sensor.other")).toBeNull();
    expect(entry.getEntitySuggestion?.(h, "light.nb")).toBeNull();
  });

  const reactive = ["hass", "_config", "_activeTab", "_versionMismatch", "_tickKey"];

  it("keeps Lit's reactive properties through decorator lowering", () => {
    const ctor = customElements.get("nextbike-austria-card") as unknown as {
      elementProperties: Map<PropertyKey, unknown>;
    };
    const props = [...ctor.elementProperties.keys()].map(String);
    for (const name of reactive) {
      expect(props).toContain(name);
    }
  });

  it("leaves a mounted card's reactive properties to Lit's accessors", async () => {
    // A class field would define an own property on the instance,
    // shadowing the accessor Lit put on the prototype.
    const el = await mount({ entities: ["sensor.nb_a"] }, hass({ "sensor.nb_a": ["3", FULL] }));
    for (const name of reactive) {
      expect(Object.hasOwn(el, name)).toBe(false);
    }
  });
});

// --- card API -----------------------------------------------------------------

describe("card API", () => {
  it.each([null, "nope", ["sensor.nb"]])("rejects the config %j", (config) => {
    const el = document.createElement("nextbike-austria-card") as unknown as Card;
    expect(() => el.setConfig(config as never)).toThrow("config must be an object");
  });

  it("sizes from the configured stations before hass arrives", () => {
    const el = document.createElement("nextbike-austria-card") as unknown as Card;
    el.setConfig({ type: "t", entities: [{ entity: "sensor.a" }, { entity: "sensor.b" }] });
    expect(el.getCardSize()).toBe(9);
    el.setConfig({ type: "t", entities: [] });
    expect(el.getCardSize()).toBe(6);
  });

  it("sizes from the stations that exist once hass arrives", async () => {
    const el = await mount(
      { entities: ["sensor.nb_a", "sensor.gone"] },
      hass({ "sensor.nb_a": ["3", FULL] }),
    );
    expect(el.getCardSize()).toBe(6);
  });

  it("asks sections view for a full-width, auto-height cell", () => {
    const el = document.createElement("nextbike-austria-card") as unknown as Card;
    expect(el.getGridOptions()).toEqual({ columns: 12, rows: "auto", min_columns: 6, min_rows: 3 });
  });

  it("stubs the first nextbike sensor for the picker", () => {
    const ctor = customElements.get("nextbike-austria-card") as unknown as typeof NextbikeAustriaCard;
    expect(ctor.getStubConfig(hass({ "sensor.nb_a": ["3", FULL] }))).toEqual({
      entities: [{ entity: "sensor.nb_a" }],
    });
    expect(ctor.getStubConfig(hass({}))).toEqual({ entities: [] });
  });

  it("hands HA the registered editor element", async () => {
    const ctor = customElements.get("nextbike-austria-card") as unknown as typeof NextbikeAustriaCard;
    expect((await ctor.getConfigElement()).tagName.toLowerCase()).toBe(
      "nextbike-austria-card-editor",
    );
  });
});

describe("editor", () => {
  interface Editor extends HTMLElement {
    setConfig(config: unknown): void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
  }

  const mountEditor = async (entities: string[], h: HomeAssistant): Promise<Editor> => {
    const editor = document.createElement("nextbike-austria-card-editor") as Editor;
    editor.setConfig({
      type: "custom:nextbike-austria-card",
      entities: entities.map((entity) => ({ entity })),
    });
    editor.hass = h;
    document.body.appendChild(editor);
    await editor.updateComplete;
    return editor;
  };

  it("names each picked sensor that no longer exists (WCAG 3.3.1)", async () => {
    const editor = await mountEditor(
      ["sensor.nb_a", "sensor.gone"],
      hass({ "sensor.nb_a": ["3", FULL] }),
    );
    const alerts = [...editor.shadowRoot!.querySelectorAll("ha-alert")];
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.getAttribute("alert-type")).toBe("warning");
    expect(alerts[0]!.textContent).toContain("sensor.gone");
  });

  it("shows no alert while every picked sensor exists", async () => {
    const editor = await mountEditor(["sensor.nb_a"], hass({ "sensor.nb_a": ["3", FULL] }));
    expect(editor.shadowRoot!.querySelectorAll("ha-alert")).toHaveLength(0);
  });
});

// --- station resolution and empty states ------------------------------------

describe("station resolution", () => {
  it("renders nothing until hass arrives", async () => {
    const el = await mount({ entities: ["sensor.nb_a"] });
    expect(root(el).querySelector("ha-card")).toBeNull();
  });

  it("says so when no nextbike sensor exists at all", async () => {
    const el = await mount({ entities: [] }, hass({}));
    expect(root(el).querySelector(".empty-state")?.textContent).toBe("No nextbike sensors found");
  });

  it("falls back to the first nextbike sensor when the picked ones are gone", async () => {
    const el = await mount(
      { entities: ["sensor.gone"] },
      hass({ "sensor.nb_a": ["4", { ...FULL, system_id: "nextbike_wr" }] }),
    );
    expect(root(el).querySelector(".title")?.textContent?.trim()).toBe("Hauptbahnhof");
  });

  it("shows the default attribution when no station carries one", async () => {
    const el = await mount({ entities: ["sensor.nb_min"] }, hass({ "sensor.nb_min": ["1", MINIMAL] }));
    expect(root(el).querySelector(".attr")?.textContent).toBe("Data: nextbike GmbH, CC0-1.0");
  });

  it("treats a malformed or negative bike count as zero", async () => {
    for (const state of ["unavailable", "-3"]) {
      const el = await mount({ entities: ["sensor.nb_a"] }, hass({ "sensor.nb_a": [state, MINIMAL] }));
      expect(root(el).querySelector(".metric-num")?.textContent).toBe("0");
    }
  });
});

// --- the hass gate --------------------------------------------------------------

describe("re-render gate", () => {
  it("skips a hass update that did not touch the rendered stations", async () => {
    const h = hass({ "sensor.nb_a": ["3", FULL], "sensor.unrelated": ["on", {}] });
    const el = await mount({ entities: ["sensor.nb_a"] }, h);
    const spy = vi.spyOn(el as unknown as { render(): unknown }, "render");

    el.hass = { ...h, states: { ...h.states, "sensor.unrelated": { state: "off", attributes: {} } } };
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();

    el.hass = { ...h, states: { ...h.states, "sensor.nb_a": { state: "7", attributes: FULL } } };
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(root(el).querySelector(".metric-num")?.textContent).toBe("7");
  });

  it("re-renders when the config changes", async () => {
    const el = await mount({ entities: ["sensor.nb_a"] }, hass({ "sensor.nb_a": ["3", FULL] }));
    el.setConfig({ entities: ["sensor.nb_a"], hide_attribution: true } as never);
    await el.updateComplete;
    expect(root(el).querySelector(".attr")).toBeNull();
  });
});

// --- version banner ---------------------------------------------------------------

describe("version banner", () => {
  it("appears when the backend runs a different version", async () => {
    const h = { ...hass({ "sensor.nb_a": ["3", FULL] }), callWS: async <T>() => ({ version: "9.9.9" }) as T };
    const el = await mount({ entities: ["sensor.nb_a"] }, h);
    await settle(el);
    expect(root(el).querySelector(".banner")?.textContent).toContain("9.9.9");
  });

  it("probes the backend once, not on every hass update", async () => {
    let calls = 0;
    const callWS = async <T>(): Promise<T> => {
      calls++;
      return {} as T;
    };
    const h = { ...hass({ "sensor.nb_a": ["3", FULL] }), callWS };
    const el = await mount({ entities: ["sensor.nb_a"] }, h);
    el.hass = { ...h, states: { ...h.states } };
    await settle(el);
    expect(calls).toBe(1);
  });
});

// --- tabs -------------------------------------------------------------------------

describe("tab layout", () => {
  const three = hass({
    "sensor.nb_a": ["3", { ...FULL, station_display_name: "A" }],
    "sensor.nb_b": ["1", { ...MINIMAL }],
    "sensor.nb_c": ["2", { ...OVERFLOW }],
  });
  const tabs = (el: Card) => [...root(el).querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const selected = (el: Card) => tabs(el).findIndex((b) => b.getAttribute("aria-selected") === "true");
  const press = async (el: Card, index: number, key: string): Promise<KeyboardEvent> => {
    const ev = new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true });
    tabs(el)[index]!.dispatchEvent(ev);
    await el.updateComplete;
    return ev;
  };
  const mountTabs = () =>
    mount({ layout: "tabs", entities: ["sensor.nb_a", "sensor.nb_b", "sensor.nb_c"] }, three);

  it("stacks instead when only one station resolves", async () => {
    const el = await mount({ layout: "tabs", entities: ["sensor.nb_a"] }, three);
    expect(tabs(el)).toHaveLength(0);
    expect(root(el).querySelectorAll("section.station")).toHaveLength(1);
  });

  it("renders one panel, tied to its tab", async () => {
    const el = await mountTabs();
    expect(tabs(el)).toHaveLength(3);
    const panel = root(el).querySelector("section.station")!;
    expect(panel.getAttribute("role")).toBe("tabpanel");
    expect(panel.getAttribute("aria-labelledby")).toBe("nbtab-0");
    expect(root(el).querySelectorAll("section.station")).toHaveLength(1);
  });

  it("switches panels on click", async () => {
    const el = await mountTabs();
    tabs(el)[2]!.click();
    await el.updateComplete;
    expect(selected(el)).toBe(2);
    expect(root(el).querySelector("section.station")?.id).toBe("nbpanel-2");
  });

  it.each([
    ["ArrowRight", 0, 1],
    ["ArrowRight", 2, 0],
    ["ArrowLeft", 0, 2],
    ["Home", 2, 0],
    ["End", 0, 2],
  ])("%s from tab %i selects tab %i", async (key, from, to) => {
    const el = await mountTabs();
    tabs(el)[from]!.click();
    await el.updateComplete;
    const ev = await press(el, from, key);
    expect(selected(el)).toBe(to);
    expect(ev.defaultPrevented).toBe(true);
  });

  it("ignores other keys", async () => {
    const el = await mountTabs();
    const ev = await press(el, 0, "Enter");
    expect(selected(el)).toBe(0);
    expect(ev.defaultPrevented).toBe(false);
  });

  it("moves focus to the newly selected tab", async () => {
    const el = await mountTabs();
    await press(el, 0, "ArrowRight");
    await el.updateComplete;
    expect(root(el).activeElement).toBe(tabs(el)[1]);
  });

  it("resets to the first tab when the selected one disappears", async () => {
    const el = await mountTabs();
    await press(el, 0, "End");
    el.setConfig({ layout: "tabs", entities: ["sensor.nb_a", "sensor.nb_b"] } as never);
    await el.updateComplete;
    expect(selected(el)).toBe(0);
  });
});

// --- rendered markup --------------------------------------------------------------

describe("accessibility", () => {
  it("names the tab strip", async () => {
    const el = await mount(
      { entities: ["sensor.nb_a", "sensor.nb_b"], layout: "tabs" },
      hass({ "sensor.nb_a": ["3", FULL], "sensor.nb_b": ["12", OVERFLOW] }),
    );
    expect(root(el).querySelector('[role="tablist"]')?.getAttribute("aria-label")).toBe(
      "Stations",
    );
  });

  it("spells out the rack's +N for screen readers", async () => {
    const el = await mount({ entities: ["sensor.nb_b"] }, hass({ "sensor.nb_b": ["12", OVERFLOW] }));
    const note = root(el).querySelector(".rack-note")!;
    expect(note.querySelector('[aria-hidden="true"]')?.textContent).toBe("+4");
    expect(note.querySelector(".visually-hidden")?.textContent).toBe("4 more bikes than docks");
  });

  it("shows the average charge as text when the battery display is on", async () => {
    const chips = (el: Card): string =>
      (root(el).querySelector(".chip-row")?.textContent ?? "").replace(/\s+/g, " ");
    const on = await mount({ entities: ["sensor.nb_a"] }, hass({ "sensor.nb_a": ["3", FULL] }));
    expect(chips(on)).toContain("55% avg. charge");

    document.body.replaceChildren();
    const off = await mount(
      { entities: ["sensor.nb_a"], show_battery: false },
      hass({ "sensor.nb_a": ["3", FULL] }),
    );
    expect(chips(off)).not.toContain("avg. charge");
  });

  it("gives each station the text colour its accent needs", async () => {
    const el = await mount({ entities: ["sensor.nb_a"] }, hass({ "sensor.nb_a": ["3", FULL] }));
    const style = root(el).querySelector("section.station")?.getAttribute("style") ?? "";
    expect(style).toContain("--nb-accent-ink:#ffffff");
    expect(style).toContain("--nb-stripe-edge:var(--nb-ebike-amber)");
  });
});

describe("rack colours", () => {
  it("come from the stylesheet, never from inline styles", async () => {
    // One source for every slot and legend colour. An inline background
    // would also override the high-contrast (forced-colors) rules.
    const el = await mount(
      { entities: ["sensor.nb_a"], show_battery: true },
      hass({ "sensor.nb_a": ["3", FULL] }),
    );
    const painted = root(el).querySelectorAll<HTMLElement>(".slot, .legend-swatch");
    expect(painted.length).toBeGreaterThan(0);
    for (const node of painted) {
      expect(node.style.background).toBe("");
      expect(node.style.backgroundColor).toBe("");
    }
  });
});

describe("rendered markup", () => {
  it("a full station stacked above an overflowing one", async () => {
    const el = await mount(
      { entities: ["sensor.nb_full", "sensor.nb_over"] },
      hass({ "sensor.nb_full": ["6", FULL], "sensor.nb_over": ["12", OVERFLOW] }),
    );
    expect(markup(el)).toMatchSnapshot();
  });

  it("e-bikes without charge data when the battery display is off", async () => {
    const el = await mount(
      { entities: ["sensor.nb_full"], show_battery: false },
      hass({ "sensor.nb_full": ["6", FULL] }),
    );
    expect(markup(el)).toMatchSnapshot();
  });

  it("every optional section switched off", async () => {
    const el = await mount(
      {
        entities: ["sensor.nb_full"],
        hide_header: true,
        hide_attribution: true,
        show_legend: false,
        show_ebikes: false,
        show_docks: false,
        show_flags: false,
        show_timestamp: false,
        show_rent_button: false,
      },
      hass({ "sensor.nb_full": ["6", FULL] }),
    );
    expect(markup(el)).toMatchSnapshot();
  });

  it("the rack hidden", async () => {
    const el = await mount(
      { entities: ["sensor.nb_full"], show_rack: false },
      hass({ "sensor.nb_full": ["6", FULL] }),
    );
    expect(markup(el)).toMatchSnapshot();
  });

  it("a station with almost no data", async () => {
    const el = await mount({ entities: ["sensor.nb_min"] }, hass({ "sensor.nb_min": ["1", MINIMAL] }));
    expect(markup(el)).toMatchSnapshot();
  });

  it("two stations as tabs", async () => {
    const el = await mount(
      { layout: "tabs", entities: ["sensor.nb_full", "sensor.nb_min"] },
      hass({ "sensor.nb_full": ["6", FULL], "sensor.nb_min": ["1", MINIMAL] }),
    );
    expect(markup(el)).toMatchSnapshot();
  });
});
