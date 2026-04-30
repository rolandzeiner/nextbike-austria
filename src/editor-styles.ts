import { css, type CSSResultGroup } from "lit";

// The schema-driven editor renders a single ``<ha-form>`` element;
// ha-form owns labels, layout, focus rings, theme, motion, and
// forced-colors palettes. The card-side stylesheet only adds a
// vertical-rhythm wrapper + the `color-scheme` hint that lets
// ``light-dark()`` and the forced-colors palette pick the right
// HA-theme variant.
export const editorStyles: CSSResultGroup = css`
  :host {
    color-scheme: light dark;
    display: block;
  }
  .editor {
    padding: var(--ha-spacing-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-3, 12px);
  }
  ha-form {
    display: block;
  }
`;
