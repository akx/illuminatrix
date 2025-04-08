import App from "./App.svelte";
import IlluminatrixPanel from "./ha-panel-element";
import { standaloneRootSelector } from "./consts";
import { mount } from "svelte";

// Minor shenanigans to keep bundle sizes low...
if (!import.meta.env?.VITE_ILLUMINATRIX_LIB) {
  const target = document.querySelector(standaloneRootSelector);
  if (target) {
    import("./app.css");
    mount(App, { target, props: { initialHass: null } });
  }
} else {
  customElements.define("illuminatrix-panel", IlluminatrixPanel);
}
