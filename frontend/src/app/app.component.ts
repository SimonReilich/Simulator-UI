import { RouterOutlet } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { SniperComponent } from './components/sniper/sniper.component';
import { ControlsComponent } from './components/controls/controls.component';
import { ConsoleComponent } from './components/console/console.component';
import { CommandService } from './services/command.service';

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
  currentProtocol: string = '';
  currentData = new Map();
  isRunning = false;
  manual = false;
  agentCount = 0;

  @ViewChild('controlRef') controlComponent!: ControlsComponent;

  constructor(private cmdService: CommandService) {
    this.cmdService.output$.subscribe(line => {
      if (line.includes('[Process Finished]')) {
        this.controlComponent.onQuit();
      } else {
        this.logData(line);
      }
    });
  }

  @ViewChild('consoleRef') consoleComponent!: ConsoleComponent;

  logData(data: any) {
    this.consoleComponent.appendMessage(data);
  }

  clearLogs() {
    this.consoleComponent.resetMessages();
  }

  @ViewChild('sniperRef') sniper!: SniperComponent;

  handleUpdate(state: { protocol: string, data: Map<string, any> }) {
    this.currentProtocol = state.protocol;
    this.currentData = state.data;
    this.manual = !this.isRunning || this.currentData.get('randomSniper');
  }

  handleStart(state: { protocol: string, data: Map<string, any> }) {
    this.isRunning = true;
    this.currentProtocol = state.protocol;
    this.currentData = state.data;
    if (this.currentProtocol === 'monadic' || this.currentProtocol === 'maj') {
      this.agentCount = this.currentData.get('x1') + this.currentData.get('x2');
    } else {
      this.agentCount = this.currentData.get('x');
    }
    this.clearLogs();
    this.manual = !this.isRunning || this.currentData.get('randomSniper');

    let req = this.cmdService.to_sim_request(this.currentProtocol, this.currentData);
    if (req != null) {
      this.cmdService.runSimulation(req);
    }
  }

  handleQuit() {
    this.isRunning = false;
    this.manual = !this.isRunning || this.currentData.get('randomSniper');
    console.log('Simulation stopped.');
    this.sniper.resetAll();
    this.cmdService.stopSimulation();
  }

  tiles: Tile[] = [
    {content: 'main', cols: 3, rows: 4, color: 'var(--mat-sys-surface)'},
    {content: 'side', cols: 1, rows: 5, color: 'var(--mat-sys-surface-container-highest)'},
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