import { css, type CSSResultGroup } from "lit";

export const cardStyles: CSSResultGroup = css`
  :host {
    display: block;
    /* Card responds to its own column width, not the viewport — narrow
       dashboard columns trigger the compact layout even on wide
       screens. Slot size is driven from --nb-slot-size so a single
       custom property can retune the whole rack density.

       Font sizes below are in rem (root-relative, 16px baseline) so the
       user's browser/OS text-size preference reaches the card even when
       the parent ha-card cascades its own inherited size. Padding,
       margin, and gap stay in px. */
    container-type: inline-size;
    container-name: nbcard;
    --nb-slot-size: 16px;
    --nb-slot-height: 18px;
  }
  ha-card {
    overflow: hidden;
  }
  .wrap {
    padding: 12px 16px 10px;
  }
  .banner {
    background: var(--warning-color, #ffa000);
    color: #fff;
    padding: 8px 12px;
    margin: -12px -16px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .banner button {
    background: #fff;
    color: var(--warning-color, #ffa000);
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .tabs {
    /* .tabs is a direct child of ha-card (not inside .wrap), so it sits
       flush with the card edges and at the very top by default — no
       padding to escape. .wrap's top padding provides the breathing
       room between the tab row and the first station below. */
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    /* Fixed height removes any padding vs. border vs. line-height
       interaction — flex centres the text inside a deterministic
       44px box. Active indicator is a box-shadow (doesn't consume
       layout height) so the text stays truly centred whether or not
       the tab is active. */
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 8px;
    background: none;
    border: none;
    box-shadow: inset 0 -2px 0 transparent;
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    /* nowrap + ellipsis is the graceful-degrade pattern for text-spacing
       overrides (WCAG 1.4.12): label clips with "…" rather than pushing
       the tab row into a multi-line layout that would hide other tabs. */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s, box-shadow 0.15s;
  }
  .tab.active {
    /* Three independent cues for the active tab so it reads as active
       under any single-channel deficit (low vision, protanopia,
       grayscale mode): distinct colour, bottom border, and heavier
       weight. */
    color: var(--primary-color);
    font-weight: 700;
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .station {
    margin-bottom: 0;
  }
  .station:not(:last-child) {
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
  }
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .accent {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--primary-color);
  }
  .title {
    /* <h2> override: nuke UA heading margins + size so the card header
       stays visually identical to the previous <div>. Semantics only. */
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Station names can be long; nowrap + ellipsis keeps the header row
       a fixed height and is the graceful-degrade pattern for WCAG 1.4.12
       text-spacing overrides. */
    white-space: nowrap;
    flex: 1;
  }
  .subtitle {
    /* <p> override: nuke UA paragraph margins. */
    margin: 0;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
    font-weight: 400;
    letter-spacing: 0.2px;
  }
  .header-link {
    color: var(--secondary-text-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .header-link:hover {
    opacity: 1;
    color: var(--primary-color);
  }
  .header-link ha-icon {
    --mdc-icon-size: 16px;
  }
  .primary {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 6px 0 2px;
  }
  .bikes-num {
    font-size: 2.1rem;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .bikes-of {
    font-size: 0.875rem;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  .bikes-label {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    margin-left: -6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
  }
  .pill ha-icon {
    --mdc-icon-size: 14px;
  }
  .pill.muted {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    color: var(--secondary-text-color);
  }
  .pill.ebike {
    background: color-mix(in srgb, #ffd740 28%, transparent);
    color: var(--primary-text-color);
  }
  .pill.ebike ha-icon {
    color: #c28a00;
  }
  .pill-row {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
    align-self: center;
  }
  .rack {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    margin: 8px 0 4px;
    padding: 6px 8px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--secondary-text-color) 4%, transparent);
  }
  .slot {
    display: block;
    width: var(--nb-slot-size);
    height: var(--nb-slot-height);
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 var(--nb-slot-size);
    line-height: 0;
    padding: 0;
    margin: 0;
  }
  .slot.filled {
    background: var(--primary-color);
  }
  .slot.filled.ebike {
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--primary-color) 55%,
      #ffd740 55%,
      #ffd740 100%
    );
  }
  /* Battery-fill variant: vertical gradient bottom (filled) → top
     (empty). --bat-pct and --bat-color set inline per slot. The empty
     portion is a desaturated version of the same hue so the shape still
     reads as an e-bike slot, with an outline so 0% is visible. */
  .slot.filled.ebike.battery {
    background: linear-gradient(
      to top,
      var(--bat-color, #2ecc71) var(--bat-pct, 0%),
      color-mix(in srgb, var(--bat-color, #2ecc71) 15%, transparent)
        var(--bat-pct, 0%)
    );
    outline: 1px solid
      color-mix(in srgb, var(--bat-color, #2ecc71) 60%, transparent);
    outline-offset: -1px;
  }
  .slot.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed
      color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  /* Reserved: bike physically present, held for another user. Solid
     outline + lock icon so it reads against both empty (dashed) and
     filled (solid) neighbours. */
  .slot.reserved {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid
      color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
  }
  .slot.reserved ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.reserved {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid
      color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    color: var(--secondary-text-color);
  }
  .legend-swatch.reserved ha-icon {
    --mdc-icon-size: 9px;
  }
  /* Disabled: broken / out of service. Amber tint + wrench icon —
     different enough from reserved (neutral grey lock) that the concepts
     don't blur together at a glance. */
  .slot.disabled {
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #e65100;
  }
  .slot.disabled ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    color: #e65100;
  }
  .legend-swatch.disabled ha-icon {
    --mdc-icon-size: 9px;
  }
  .rack-note {
    font-size: 0.65rem;
    line-height: 18px;
    color: var(--secondary-text-color);
    margin-left: 6px;
    flex-shrink: 0;
  }
  .legend {
    /* <dl> override: nuke UA dl margins so the legend stays tight.
       Keeps the flex layout used when this was a <div>. */
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin: 0 0 6px;
    padding: 0 2px;
    font-size: 0.65rem;
    color: var(--secondary-text-color);
    /* Translated legend labels can be long (DE "Außer Betrieb" etc.) —
       allow wrapping so WCAG 1.4.12 text-spacing overrides don't clip. */
    overflow-wrap: anywhere;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .legend dd {
    /* <dd> default has margin-inline-start: 40px — reset so the label
       sits right next to its swatch. */
    margin: 0;
  }
  .legend-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 12px;
    line-height: 0;
    padding: 0;
    margin: 0;
    vertical-align: middle;
  }
  .legend-swatch.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed
      color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  .legend-overflow {
    /* <dt> override: block-level by default; match the swatch inline
       presentation so the legend flex row reads cleanly. */
    display: inline-flex;
    align-items: center;
    padding: 0 4px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.72rem;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .flag ha-icon {
    --mdc-icon-size: 14px;
  }
  .flag.warn {
    color: var(--warning-color, #ffa000);
  }
  .flag.err {
    color: var(--error-color, #db4437);
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 10px;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .footer a.rent {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .footer a.rent:hover {
    text-decoration: underline;
  }
  .footer ha-icon {
    --mdc-icon-size: 14px;
  }
  .attr {
    margin-top: 8px;
    font-size: 0.65rem;
    color: var(--secondary-text-color);
    text-align: center;
    opacity: 0.7;
  }
  .empty-state {
    padding: 20px 0;
    text-align: center;
    color: var(--secondary-text-color);
  }

  /* Narrow-card layout: shrink the rack density and wrap the pill row
     below the bike count so 40+ docks still fit on a one-column phone
     dashboard. Card columns wider than 440px get larger slots instead
     — dashboards placing the card in a wide sidebar no longer look
     pixel-tiny. */
  @container nbcard (inline-size < 360px) {
    :host {
      --nb-slot-size: 14px;
      --nb-slot-height: 16px;
    }
    .wrap {
      padding: 10px 12px 8px;
    }
    .banner {
      margin: -10px -12px 10px;
    }
    .primary {
      flex-wrap: wrap;
    }
    .pill-row {
      flex-basis: 100%;
    }
  }
  @container nbcard (inline-size > 440px) {
    :host {
      --nb-slot-size: 20px;
      --nb-slot-height: 22px;
    }
  }

  /* Accessibility: visible focus ring for keyboard users. */
  .tab:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* Forced-colors (Windows High Contrast) fallback: var(--primary-color)
     may resolve to a low-contrast system colour, so switch to the
     CanvasText keyword which is guaranteed to contrast with Canvas. */
  @media (forced-colors: active) {
    .tab:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline-color: CanvasText;
    }
  }

  /* Accessibility: honour user motion preference. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
