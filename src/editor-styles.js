import { css } from "lit";

export const editorStyles = css`
  :host {
    display: block;
  }
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: 12px;
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
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
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
    font-size: 11px;
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
  .layout-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .layout-buttons button {
    padding: 4px 12px;
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
`;
