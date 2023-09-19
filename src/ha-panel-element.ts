/// Custom panel for HA integration.
import App from "./App.svelte";
import css from "./app.css?inline";

export default class IlluminatrixPanel extends HTMLElement {
  private props: Record<string, any> | null = null;
  private app: App | null = null;

  setProperties(props: Record<string, any>): void {
    this.props = props;
    this.app?.$set(this.props);
  }

  connectedCallback() {
    if (!this.props) {
      return;
    }
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.innerText = css;
    shadow.appendChild(style);
    this.app = new App({
      target: shadow,
      props: this.props,
    });
  }

  disconnectedCallback() {
    this.app?.$destroy();
    this.app = null;
    this.props = null;
  }
}
