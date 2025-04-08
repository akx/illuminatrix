/// Custom panel for HA integration.
import App from "./App.svelte";
import css from "./app.css?inline";
import { mount, unmount } from "svelte";
import type { Hass } from "./types/ha";

export default class IlluminatrixPanel extends HTMLElement {
  private hass: Hass | null = null;
  private app: App | null = null;

  // Called by HA
  setProperties({ hass }: { hass: Hass | null }): void {
    this.hass = hass;
    if (this.app) this.app.setHass(hass);
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.innerText = css;
    shadow.appendChild(style);
    this.app = mount(App, {
      target: shadow,
      props: { initialHass: this.hass },
    });
  }

  disconnectedCallback() {
    if (this.app) {
      unmount(this.app);
      this.app = null;
    }
  }
}
