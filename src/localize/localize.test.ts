import { describe, expect, it } from "vitest";

import type { HomeAssistant } from "../types";
import { et, t } from "./localize";

const withLang = (language?: string): HomeAssistant =>
  ({ states: {}, ...(language === undefined ? {} : { language }) }) as HomeAssistant;

describe("t — flat card strings", () => {
  it("reads the user's language", () => {
    expect(t(withLang("de"), "bikes")).toBe("Räder");
    expect(t(withLang("en"), "bikes")).toBe("bikes");
  });

  it("treats a regional German locale as German", () => {
    expect(t(withLang("de-AT"), "bikes")).toBe("Räder");
  });

  it("falls back to English for other languages and a missing hass", () => {
    expect(t(withLang("fr"), "bikes")).toBe("bikes");
    expect(t(withLang(), "bikes")).toBe("bikes");
    expect(t(undefined, "bikes")).toBe("bikes");
  });

  it("returns the key itself when no language has it", () => {
    expect(t(withLang("de"), "no_such_key")).toBe("no_such_key");
  });

  it("does not return a nested section as a string", () => {
    expect(t(withLang("en"), "editor")).toBe("editor");
  });
});

describe("et — editor section strings", () => {
  it("reads the editor section in the user's language", () => {
    expect(et(withLang("en"), "layout_tabs")).not.toBe("layout_tabs");
    expect(et(withLang("de"), "layout_tabs")).not.toBe(et(withLang("en"), "layout_tabs"));
  });

  it("returns the key itself when the editor section lacks it", () => {
    expect(et(withLang("de"), "no_such_key")).toBe("no_such_key");
  });
});
