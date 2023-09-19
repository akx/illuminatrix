/**
 * Very minimal re-implementation of the Home Assistant WebSocket API.
 * See https://github.com/home-assistant/home-assistant-js-websocket for the
 * original implementation.
 */

/**
 * Connect to the Home Assistant WebSocket API and do the initial auth dance.
 *
 * @param apiBaseURL The base URL of the Home Assistant instance's API
 * @param authToken The long-lived access token to use for authentication.
 */
function connect(apiBaseURL: string, authToken: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(apiBaseURL.replace(/^http/, "ws") + "websocket");

    function initialDanceHandler(event: MessageEvent) {
      const msg = JSON.parse(event.data);
      if (msg.type === "auth_required") {
        ws.send(
          JSON.stringify({
            type: "auth",
            access_token: authToken,
          }),
        );
      } else if (msg.type === "auth_ok") {
        ws.removeEventListener("message", initialDanceHandler);
        resolve(ws);
      } else {
        const error = new Error("Initial dance failed");
        error.cause = event;
        reject(error);
      }
    }

    ws.addEventListener("message", initialDanceHandler);
  });
}

type DisconnectionCallback = (haws: HassWebSocket) => void;
type HAWebSocketMessage = Record<string, any>;
type Waiter = (msg: HAWebSocketMessage) => void;
type WaiterPair = { resolve: Waiter; reject: Waiter };

export default class HassWebSocket {
  private ws: WebSocket | null = null;
  private counter: number = 1;
  private waiters: Record<number, WaiterPair> = {};
  private disconnectionCallbacks: Array<DisconnectionCallback> = [];

  public addDisconnectionCallback(cb: DisconnectionCallback) {
    this.disconnectionCallbacks.push(cb);
  }

  public sendRaw(msg: Record<string, any>) {
    const { ws } = this;
    if (!ws) {
      throw new Error("Not connected");
    }
    ws.send(JSON.stringify(msg));
  }

  /**
   * Send a command to the Home Assistant WebSocket API, imbuing it with an ID.
   *
   * @param msg The message to send.
   * @returns The ID of the message.
   */
  public sendCommand(msg: Record<string, any>) {
    const { ws } = this;
    if (!ws) {
      throw new Error("Not connected");
    }
    const id = this.counter++;
    this.sendRaw({
      id,
      ...msg,
    });
    return id;
  }

  /**
   * Send a command and wait for a response.
   *
   * @param msg The message to send; if a string, it will be used as the `type`.
   * @param timeout How long to wait for a response before rejecting the promise.
   */
  public async sendCommandAndWait<T = HAWebSocketMessage>(
    msg: Record<string, any> | string,
    timeout: number = 5000,
  ) {
    return new Promise<T>((resolve, reject) => {
      if (typeof msg === "string") {
        msg = { type: msg };
      }
      const id = this.sendCommand(msg);
      const pair = { resolve, reject };
      this.waiters[id] = pair;
      setTimeout(() => {
        if (this.waiters[id] === pair) {
          delete this.waiters[id];
          reject(new Error("Timeout"));
        }
      }, timeout);
    });
  }

  private handleMessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    const { id } = msg;
    if (id) {
      this.dispatchToWaiters(id, msg);
    } else {
      console.warn("Unhandled message", msg);
    }
  };

  private dispatchToWaiters(id: number, msg: HAWebSocketMessage) {
    const waiters = this.waiters[id];
    delete this.waiters[id];
    if (!waiters) {
      return;
    }
    const { resolve, reject } = waiters;
    if ("success" in msg) {
      if (msg.success) {
        resolve(msg);
      } else {
        reject(msg);
      }
    } else {
      resolve(msg);
    }
  }

  public async connect(url: string, authToken: string): Promise<void> {
    if (this.ws) {
      this.disconnect();
    }
    this.ws = await connect(url, authToken);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.disconnect);
    this.ws.addEventListener("error", this.disconnect);
  }

  private disconnect = () => {
    if (!this.ws) return;
    try {
      this.ws.close();
    } catch (e) {
      // Not going to worry about it
    }
    this.ws = null;
    this.disconnectionCallbacks.forEach((cb) => cb(this));
  };
}
