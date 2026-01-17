import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SimRequest {
  protocol: string;
  args: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private socket: WebSocket | null = null;
  private outputSubject = new Subject<string>();

  public output$ = this.outputSubject.asObservable();

  runSimulation(request: SimRequest): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    this.socket = new WebSocket(`${protocol}//${host}/ws`);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify(request));
    };

    this.socket.onmessage = (event) => {
      this.outputSubject.next(event.data);
    };

    this.socket.onclose = (event) => {
      this.outputSubject.next('\n[Connection Closed]');
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      this.outputSubject.next('\n[WebSocket Error Occurred]');
      console.error('WebSocket Error:', error);
    };
  }

  stopSimulation(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  to_sim_request(protocol: string, args: Map<any, any>) {
  switch (protocol) {
    case 'min':
      return { protocol: 'cut', args: `-d 0.5 -n ${args.get('x')} ${args.get('c')}`};
    default:
      return null;
  }
}
}