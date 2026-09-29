/**
 * @vitest-environment happy-dom
 *
 * The integration-upgrade plumbing: the WebSocket version probe and the
 * reload banner it drives. A regression here is the infinite reload-banner
 * loop, which no build or type-check notices.
 */
import { render } from "lit";
import { afterEach, describe, expect, it } from "vitest";

import { checkCardVersionWS, renderVersionBanner } from "./shared-render";
import type { HomeAssistant } from "./types";

const hassAnswering = (callWS: HomeAssistant["callWS"]): HomeAssistant =>
  ({ states: {}, callWS }) as HomeAssistant;

const t = (key: string): string =>
  key === "version_update" ? "updated to v{v}" : key;

/** Render a banner template into a fresh container. */
function mount(mismatch: string | null): HTMLElement {
  const host = document.createElement("div");
  render(renderVersionBanner(mismatch, t), host);
  return host;
}

describe("checkCardVersionWS", () => {
  it("reports the backend version when it differs from the bundle", async () => {
    const hass = hassAnswering(async <T>() => ({ version: "2.0.0" }) as T);
    expect(await checkCardVersionWS(hass, "nextbike_austria/card_version", "1.0.0")).toBe(
      "2.0.0",
    );
  });

  it("stays quiet when the versions match", async () => {
    const hass = hassAnswering(async <T>() => ({ version: "1.0.0" }) as T);
    expect(await checkCardVersionWS(hass, "x", "1.0.0")).toBeNull();
  });

  it("stays quiet when the backend answers without a version", async () => {
    const hass = hassAnswering(async <T>() => ({}) as T);
    expect(await checkCardVersionWS(hass, "x", "1.0.0")).toBeNull();
  });

  it("stays quiet on an older backend without the command", async () => {
    const hass = hassAnswering(async () => {
      throw new Error("unknown_command");
    });
    expect(await checkCardVersionWS(hass, "x", "1.0.0")).toBeNull();
  });

  it("stays quiet without a WebSocket connection", async () => {
    expect(await checkCardVersionWS(undefined, "x", "1.0.0")).toBeNull();
    expect(await checkCardVersionWS({ states: {} }, "x", "1.0.0")).toBeNull();
  });
});

describe("renderVersionBanner", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("renders nothing without a mismatch", () => {
    expect(mount(null).querySelector(".banner")).toBeNull();
  });

  it("offers a reload for a mismatch", () => {
    const banner = mount("2.0.0").querySelector(".banner");
    expect(banner?.getAttribute("role")).toBe("alert");
    expect(banner?.textContent).toContain("updated to v2.0.0");
    expect(banner?.querySelector("button")?.textContent?.trim()).toBe("version_reload");
  });

  it("switches to the stuck message once a reload for that version was tried", () => {
    window.sessionStorage.setItem("nb-reload-attempted-2.0.0", "1");
    const banner = mount("2.0.0").querySelector(".banner");
    expect(banner?.querySelector("button")).toBeNull();
    expect(banner?.textContent).toContain("version_reload_stuck");
  });

  it("scopes the stuck state to the version that was tried", () => {
    window.sessionStorage.setItem("nb-reload-attempted-1.9.0", "1");
    expect(mount("2.0.0").querySelector("button")).not.toBeNull();
  });
});
