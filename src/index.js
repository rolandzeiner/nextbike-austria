import { CARD_VERSION } from "./const.js";
import { NextbikeAustriaCard } from "./card.js";

// Register the main card eagerly. The editor is registered lazily by
// NextbikeAustriaCard.getConfigElement() the first time HA opens the
// visual editor — keeps the editor code out of the main bundle's
// initial-load cost.
try {
  if (!customElements.get("nextbike-austria-card")) {
    customElements.define("nextbike-austria-card", NextbikeAustriaCard);
  }
} catch (e) {
  console.error("[Nextbike Austria] custom element registration failed", e);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "nextbike-austria-card",
  name: "Nextbike Austria Card",
  description:
    "Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",
  preview: true,
  documentationURL: "https://github.com/rolandzeiner/nextbike-austria",
});

console.info(
  `%c  NEXTBIKE-AUSTRIA-CARD  %c  v${CARD_VERSION}  `,
  "color: #DC2026; font-weight: bold; background: black",
  "color: white; background: dimgray",
);
