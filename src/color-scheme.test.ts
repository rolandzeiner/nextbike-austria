/**
 * The card takes its colour scheme from Home Assistant, not from the OS.
 *
 * Home Assistant writes the active theme's scheme to the document's
 * `<meta name="color-scheme">` ("dark", "light", or both for a custom
 * theme in light mode), and every element inherits it. A host that declares
 * `color-scheme: light dark` replaces that with the browser's preference,
 * so `light-dark()`, system colours and native controls inside it follow
 * the OS setting and come out wrong whenever the user's Home Assistant
 * theme and OS disagree. Measured in WebKit: with the declaration a card
 * resolved to light under a dark Home Assistant theme on a light OS, and
 * to dark the other way round; without it, it matched the theme each time.
 *
 * Node does no styling, so the guard is on the CSS text.
 */
import type { CSSResult } from "lit";
import { describe, expect, it } from "vitest";

import { cardStyles } from "./card-styles";
import { editorStyles } from "./editor-styles";

/** Whether a stylesheet declares the property, comments and
 *  `prefers-color-scheme` media queries aside. */
const declaresColorScheme = (styles: unknown): boolean =>
  /(?<![\w-])color-scheme\s*:/.test((styles as CSSResult).cssText.replace(/\/\*[\s\S]*?\*\//g, ""));

describe("colour scheme", () => {
  it("is inherited by the card", () => {
    expect(declaresColorScheme(cardStyles)).toBe(false);
  });

  it("is inherited by the editor", () => {
    expect(declaresColorScheme(editorStyles)).toBe(false);
  });
});
