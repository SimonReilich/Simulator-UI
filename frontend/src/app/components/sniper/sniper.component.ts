import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AgentSnipe {
  id: number;
  active: boolean;
}

@Component({
  selector: 'app-sniper',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './sniper.component.html',
  styleUrl: './sniper.component.css'
})
export class SniperComponent {
  @Input() globalDisabled = false;

  @Input() set count(value: number) {
    this._count = value;
    this.resetAll();
  }
  
  private _count = 2;
  agents: AgentSnipe[] = [];

  constructor() {
    this.resetAll();
  }

  snipe(id: number) {
    if (this.agents[id]) {
      this.agents[id] = { ...this.agents[id], active: false };
    }
  }

  public resetAll() {
    this.agents = Array.from({ length: this._count }, (_, i) => ({
      id: i,
      active: true
    }));
  }
}