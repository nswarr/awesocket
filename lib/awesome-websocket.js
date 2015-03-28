
import ReconnectingWebSocket from './reconnecting-websocket';

export class AwesomeWebSocket {

  constructor(urls) {
    var openAtAll = false;
    this.urls = urls;
    this.lastSocket = undefined;
    this.sockets = [];
    this.messageQueue = [];

    if (typeof this.urls === "string") {
      this.urls = [this.urls];
    }

    for(var url in this.urls){
      let socket = new ReconnectingWebSocket(url);
      this.sockets.push(socket);
      socket.onmessage = (evt) => {
        this.onmessage(evt);
      };
      socket.onerror = (err) => {
        this.onerror(err);
      };
      socket.onopen = (evt) => {
        if (!openAtAll) {
          openAtAll = true;
          this.onopen(evt);
        }
      };
    }

    sendloop = () => {
      var trySocket;
      setTimeout(sendloop);
      if (this.messageQueue.length) {
        if (this.lastSocket) {
          trySocket = this.lastSocket;
          this.lastSocket = null;
        } else {
          trySocket = this.sockets.pop();
          this.sockets.unshift(trySocket);
        }
        if (trySocket.readyState === WebSocket.OPEN) {
          let data = this.messageQueue[this.messageQueue.length - 1];
          trySocket.send(data);
          this.lastSocket = trySocket;
          messageQueue.pop();
        }
      }
    };
    setTimeout(sendloop);
  }

  send(data) {
    messageQueue.unshift(data);
  };

  keepAlive(timeoutMs, message) {
    for(var socket in this.sockets) {
      socket.keepAlive(timeoutMs, message);
    }
  };

  close() {
    for(var socket in this.sockets) {
      socket.close();
    }
    this.onclose();
  };

  onopen(event) {};
  onclose(event) {};
  onmessage(event) {};
  onerror(event) {};
}
