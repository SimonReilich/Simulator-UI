import { RouterOutlet } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private socket?: WebSocket;
  private pingInterval?: any;

  ngOnInit() {
    this.connectKeepAlive();
  }

  title = 'frontend';

  connectKeepAlive() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    this.socket.onopen = () => {
      console.log("Heartbeat active.");
      this.pingInterval = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send('ping');
        }
      }, 5000);
    };

    this.socket.onclose = () => {
      clearInterval(this.pingInterval);
    };
  }

  ngOnDestroy() {
    clearInterval(this.pingInterval);
    this.socket?.close();
  }
}