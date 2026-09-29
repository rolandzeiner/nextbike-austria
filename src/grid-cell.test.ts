/**
 * The card fills its sections-view grid cell instead of painting over the
 * card below it.
 *
 * A sections view gives the card a fixed-height cell whenever rows is numeric
 * -- which the user causes by dragging the height or width handle, since a
 * stored grid_options overrides getGridOptions(). rows: "auto" exempts
 * nobody. Only the pair below makes the card take that height; the comments
 * on the two rules in card-styles.ts explain why.
 *
 * Node does no layout, so the guard is on the CSS text.
 */
import type { CSSResult } from "lit";
import { describe, expect, it } from "vitest";

import { cardStyles } from "./card-styles";

/** The declarations of the first rule for a selector, up to its closing brace. */
const rule = (selector: string): string => {
  const css = (cardStyles as CSSResult).cssText;
  const start = css.indexOf(`${selector} {`);
  return start < 0 ? "" : css.slice(start, css.indexOf("}", start));
};

describe("the grid cell", () => {
  it("takes the cell's height on the host", () => {
    expect(rule(":host")).toMatch(/display:\s*block/);
    expect(rule(":host")).toMatch(/block-size:\s*100%/);
  });

  it("resolves ha-card against it and clips inside the card", () => {
    expect(rule("ha-card")).toMatch(/block-size:\s*100%/);
    expect(rule("ha-card")).toMatch(/overflow:\s*hidden/);
  });
});
