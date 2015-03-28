
import {ReconnectingWebSocket} from './reconnecting-websocket';

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

    this.urls.forEach((url) => {
      let awesomeSocket = this;
      let socket = new ReconnectingWebSocket(url);
      this.sockets.push(socket);
      socket.onmessage = (evt) => {
        awesomeSocket.onmessage(evt);
      };
      socket.onerror = (err) => {
        awesomeSocket.onerror(err);
      };
      socket.onopen = (evt) => {
        if (!openAtAll) {
          openAtAll = true;
          awesomeSocket.onopen(evt);
        }
      };
    });

    var sendloop = () => {
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
          this.messageQueue.pop();
        }
      }
    };
    setTimeout(sendloop);
  }

  send(data) {
    this.messageQueue.unshift(data);
  };

  keepAlive(timeoutMs, message) {
    this.sockets.forEach((socket) => {
      socket.keepAlive(timeoutMs, message);
    });
  };

  close() {
    this.sockets.forEach((socket) => {
      socket.close();
    });
    this.onclose();
  };

  onopen(event) {};
  onclose(event) {};
  onmessage(event) {};
  onerror(event) {};
}
