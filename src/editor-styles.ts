import { css, type CSSResultGroup } from "lit";

export const editorStyles: CSSResultGroup = css`
  :host {
    /* color-scheme enables light-dark() and steers forced-colors palette
       selection. HA's active theme drives the resolution. */
    color-scheme: light dark;
    display: block;
  }
  .editor {
    padding: var(--ha-spacing-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-3, 12px);
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: var(--ha-radius-lg, 12px);
    padding: var(--ha-spacing-3, 14px) var(--ha-spacing-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-2, 10px);
  }
  .section-header {
    font-size: var(--ha-font-size-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: var(--ha-font-size-xs, 12px);
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    /* Pill radius — kept fully rounded since 16px is what produces the
       capsule look on this size. Not an HA token target. */
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    /* Be specific about the animated properties — transition: all picks
       up everything (including layout) and is wasteful. Same fast/standard
       motion tokens the card uses. */
    transition:
      background-color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      border-color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      opacity var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease);
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip:hover {
    opacity: 0.85;
  }
  .chip .stop-name {
    font-weight: 500;
  }
  .chip .eid {
    font-size: var(--ha-font-size-xs, 11px);
    opacity: 0.7;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .toggle-row label {
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  /* Visual "these toggles depend on the row above" cue — left border and
     indent mark the sub-toggles as children of show_rack. Container
     disappears entirely when the parent is off; no ghost row. */
  .sub-toggles {
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-2, 8px);
    padding-left: var(--ha-spacing-3, 12px);
    border-left: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    margin-left: 4px;
  }
  .layout-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .layout-buttons button {
    padding: 4px 12px;
    /* Pill radius — fully rounded for these toggle buttons. */
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
  }
  .layout-buttons button.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }

  /* ── Accessibility primitives ───────────────────────────────────── */
  /* Focus ring (WCAG 2.4.7 AA; 2px / 3:1 also meets 2.4.13 AAA). */
  .chip:focus-visible,
  .layout-buttons button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Forced-colors fallback (Windows High Contrast). */
  @media (forced-colors: active) {
    .chip:focus-visible,
    .layout-buttons button:focus-visible {
      outline-color: CanvasText;
    }
    .chip,
    .layout-buttons button {
      forced-color-adjust: none;
    }
  }

  /* Honour user motion preference (catch-all). */
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
