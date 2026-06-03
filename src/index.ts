import "./card";
import type { HomeAssistant, WindowWithCustomCards } from "./types";

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
  // HA 2026.6 entity-first card picker: suggest this card only for our
  // own integration's sensor entities. Additive key older HA ignores.
  getEntitySuggestion: (hass: HomeAssistant, entityId: string) => {
    if (!entityId.startsWith("sensor.")) return null;
    if (hass?.entities?.[entityId]?.platform !== "nextbike_austria") return null;
    return {
      config: {
        type: "custom:nextbike-austria-card",
        entities: [{ entity: entityId }],
      },
    };
  },
});
