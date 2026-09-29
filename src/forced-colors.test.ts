/**
 * The bike rack stays readable in forced-colors (Windows high-contrast)
 * mode.
 *
 * Forced colours reset every background to Canvas and drop gradients and
 * box-shadows, which is everything the rack draws with. The card opts the
 * slots and legend swatches out of that override and redraws them in
 * system colours; this pins that every slot state is covered. Node does
 * no layout or forced-colours emulation, so the guard is on the CSS text.
 */
import type { CSSResult } from "lit";
import { describe, expect, it } from "vitest";

import { cardStyles } from "./card-styles";

/** The forced-colors @media block, comments stripped. */
const forcedBlock = (): string => {
  const css = (cardStyles as CSSResult).cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = css.indexOf("@media (forced-colors: active)");
  expect(start).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error("unterminated forced-colors block");
};

/** The declarations of the rule whose selector list names `selector`. */
const declarations = (selector: string): string | undefined => {
  for (const [, selectors, body] of forcedBlock().matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (selectors!.split(",").map((s) => s.trim()).includes(selector)) return body;
  }
  return undefined;
};

describe("forced-colors rack", () => {
  it("takes slots and legend swatches out of the colour override", () => {
    expect(declarations(".slot")).toMatch(/forced-color-adjust:\s*none/);
    expect(declarations(".legend-swatch")).toMatch(/forced-color-adjust:\s*none/);
  });

  it.each([
    ".slot.filled",
    ".slot.filled.ebike",
    ".slot.filled.ebike.battery",
    ".slot.empty",
    ".slot.reserved",
    ".slot.disabled",
    ".legend-swatch.filled",
    ".legend-swatch.ebike",
    ".legend-swatch.ebike.battery",
    ".legend-swatch.empty",
    ".legend-swatch.reserved",
    ".legend-swatch.disabled",
  ])("redraws %s in system colours", (selector) => {
    expect(declarations(selector)).toMatch(/\b(Canvas|CanvasText|Highlight)\b/);
  });

  it("draws the battery charge as a fill height", () => {
    expect(declarations(".slot.filled.ebike.battery")).toContain("var(--bat-pct");
  });
});
