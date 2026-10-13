import { css, type CSSResultGroup } from "lit";

// The schema-driven editor renders a single ``<ha-form>`` element;
// ha-form owns labels, layout, focus rings, theme, motion, and
// forced-colors palettes. The card-side stylesheet only adds a
// vertical-rhythm wrapper. It sets no `color-scheme`: the editor
// inherits the one Home Assistant derives from the active theme.
export const editorStyles: CSSResultGroup = css`
  :host {
    display: block;
  }
  .editor {
    padding: var(--ha-space-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-3, 12px);
  }
  ha-form {
    display: block;
  }
`;
