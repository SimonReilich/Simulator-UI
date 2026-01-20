import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SimRequest {
  protocol: string;
  args: string;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private socket: WebSocket | null = null;
  private outputSubject = new Subject<string>();

  public output$ = this.outputSubject.asObservable();

  runSimulation(request: SimRequest): void {
    this.stopSimulation();

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
      this.outputSubject.next('');
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

  sendManualInput(input: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(input);
    }
  }

  to_sim_request(protocol: string, args: Map<any, any>) {
    const extraArgs = args.get('randomSniper') ? `-s ${args.get('p')} -d 0.5 ` : '-m ';
    const seedArg = args.get('seed') != null ? `-r ${args.get('seed')} ` : `-r ${getRandomInt(1000000)} `;

    switch (protocol) {
      case 'pbl':
        return {
          protocol: 'pbl',
          args: `${extraArgs}${seedArg}-n ${args.get('x')} ${args.get('c')}`
        }
      case 'min':
        return {
          protocol: 'cut',
          args: `${extraArgs}${seedArg}-n ${args.get('x')} ${args.get('c')}`
        };
      case 'mod':
        return {
          protocol: 'mod',
          args: `${extraArgs}${seedArg}-n ${args.get('x')} ${args.get('m')}`
        }
      case 'min-mod':
        return {
          protocol: 'cmb',
          args: `${extraArgs}${seedArg}-n ${args.get('x')} ${args.get('m')} ${args.get('c')}`
        }
      case 'monadic':
        return {
          protocol: 'p',
          args: `${extraArgs}${seedArg}-n ${args.get('x1')} ${args.get('m1')} ${args.get('c1')} ${args.get('x2')} ${args.get('m2')} ${args.get('c2')}`
        }
      default:
        return null;
    }
  }
}