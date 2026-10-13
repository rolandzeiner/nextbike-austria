/**
 * The card fills its sections-view grid cell instead of painting over the
 * card below it.
 *
 * A sections view gives the card a fixed-height cell whenever rows is numeric
 * -- which the user causes by dragging the height or width handle, since a
 * stored grid_options overrides getGridOptions(). So returning rows: "auto"
 * from getGridOptions() protects no card: the stored value wins. Only the
 * pair below makes the card take that height; the comments
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

describe("the density tiers", () => {
  // :host is the nbcard container, and a container never matches its own
  // query, so a :host rule inside one is silently dead. That left the rack
  // at one size at every width through v1.4.0.
  const tiers = (): string[] => {
    const css = (cardStyles as CSSResult).cssText.replace(/\/\*[\s\S]*?\*\//g, "");
    const blocks: string[] = [];
    for (let at = css.indexOf("@container nbcard"); at >= 0; at = css.indexOf("@container nbcard", at + 1)) {
      let depth = 0;
      for (let i = css.indexOf("{", at); i < css.length; i++) {
        if (css[i] === "{") depth++;
        else if (css[i] === "}" && --depth === 0) {
          blocks.push(css.slice(at, i + 1));
          break;
        }
      }
    }
    return blocks;
  };

  it("never retunes tokens on the container itself", () => {
    expect(tiers().length).toBeGreaterThan(0);
    for (const block of tiers()) expect(block).not.toContain(":host");
  });

  it("retunes the rack on ha-card, for narrow and for roomy cards", () => {
    const rack = tiers().filter((block) => block.includes("--nb-slot-size"));
    expect(rack).toHaveLength(2);
    for (const block of rack) expect(block).toMatch(/ha-card\s*\{[^}]*--nb-slot-size:/);
  });
});
