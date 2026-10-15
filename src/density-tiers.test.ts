/**
 * The rack's density tiers reach the rack.
 *
 * The card is its own query container (`nbcard` on :host), and a container
 * never matches its own query. A `:host` rule inside an `@container nbcard`
 * block is therefore dead, with no error and a green build: the tokens it
 * sets simply never change. Tokens a tier retunes go on `ha-card`, which
 * everything that reads them sits inside.
 *
 * Node does no layout, so the guard is on the CSS text.
 */
import type { CSSResult } from "lit";
import { describe, expect, it } from "vite-plus/test";

import { cardStyles } from "./card-styles";

/** Every `@container nbcard` block, comments stripped. */
const tiers = (): string[] => {
  const css = (cardStyles as CSSResult).cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  for (
    let at = css.indexOf("@container nbcard");
    at >= 0;
    at = css.indexOf("@container nbcard", at + 1)
  ) {
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

describe("the density tiers", () => {
  it("never retune tokens on the container itself", () => {
    expect(tiers().length).toBeGreaterThan(0);
    for (const block of tiers()) expect(block).not.toContain(":host");
  });

  it("retune the rack on ha-card, for narrow and for roomy cards", () => {
    const rack = tiers().filter((block) => block.includes("--nb-slot-size"));
    expect(rack).toHaveLength(2);
    for (const block of rack) expect(block).toMatch(/ha-card\s*\{[^}]*--nb-slot-size:/);
  });
});
