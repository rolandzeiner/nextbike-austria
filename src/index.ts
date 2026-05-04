import "./card";
import type { WindowWithCustomCards } from "./types";

// Card class registers itself via @customElement. Just import for side effect.

const win = window as unknown as WindowWithCustomCards;
win.customCards ??= [];
win.customCards.push({
  type: "nextbike-austria-card",
  name: "Nextbike Austria Card",
  description:
    "Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",
  preview: true,
  documentationURL: "https://github.com/rolandzeiner/nextbike-austria",
});
