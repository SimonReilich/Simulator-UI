import { RouterOutlet } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { SniperComponent } from './sniper/sniper.component';
import { ControlsComponent } from './controls/controls.component';
import { ConsoleComponent } from './console/console.component';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  content: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatGridListModule, SniperComponent, ControlsComponent, ConsoleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  tiles: Tile[] = [
    {content: 'main', cols: 3, rows: 4, color: 'var(--mat-sys-surface)'},
    {content: 'side', cols: 1, rows: 5, color: 'var(--mat-sys-surface-variant)'},
    {content: 'bottom', cols: 3, rows: 1, color: 'var(--mat-sys-surface)'},
  ];

  private socket?: WebSocket;
  private pingInterval?: any;

  ngOnInit() {
    this.connectKeepAlive();
  }

  connectKeepAlive() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    this.socket.onopen = () => {
      console.log("[INFO] - Heartbeat active.");
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