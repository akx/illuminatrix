import App from "./App.svelte";
import IlluminatrixPanel from "./ha-panel-element";
import { standaloneRootSelector } from "./consts";

// Minor shenanigans to keep bundle sizes low...
if (!import.meta.env?.VITE_ILLUMINATRIX_LIB) {
  const target = document.querySelector(standaloneRootSelector);
  if (target) {
    import("./app.css");
    new App({ target });
  }
} else {
  customElements.define("illuminatrix-panel", IlluminatrixPanel);
}
