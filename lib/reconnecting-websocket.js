
export class ReconnectingWebsocket {

  constructor(url) {
    this.url = url;
    this.forceClose = false;
    this.wasConnected = false;
    this.reconnectAfter = 0;
    this.connectLoop();
  }

  connectLoop() {
    setTimeout(() => {
      if (this.forceClose) {
        return;
      }
      if (this.readyState !== WebSocket.OPEN && this.readyState !== WebSocket.CONNECTING) {
        if (Date.now() > this.reconnectAfter) {
          this.reconnectAfter = Date.now() + 500;
          this.connect();
        }
      }
      this.connectLoop();
    });
  }

  connect() {
    this.readyState = WebSocket.CONNECTING;
    let ws = this.ws = new WebSocket(this.url);
    ws.onmessage = (event) => {
      this.onmessage(event);
    };
    ws.onopen = (event) => {
      this.readyState = WebSocket.OPEN;
      this.wasConnected = true;
      this.onopen(event);
    };
    ws.onclose = (event) => {
      this.readyState = WebSocket.CLOSED;
      if (this.wasConnected) {
        this.ondisconnect({
          forceClose: this.forceClose
        });
      }
      if (this.forceClose) {
        this.onclose(event);
      }
    };
    ws.onerror = (event) => {
      this.readyState = WebSocket.CLOSED;
      this.onerror(event);
    };
  };

  send(data) {
    let state = this.readyState;
    this.readyState = WebSocket.CLOSING;
    if (typeof data === "object") {
      this.ws.send(JSON.stringify(data));
    } else {
      this.ws.send(data);
    }
    this.readyState = state;
  };

  close() {
    this.forceClose = true;
    this.ws.close();
  };

  keepAlive(timeoutMs, message) {
    return setInterval(() => {
      this.send(message);
    }, timeoutMs);
  };

  onopen(event) {};
  onclose(event) {};
  onmessage(event) {};
  onerror(event) {};
  ondisconnect(event) {};
}
