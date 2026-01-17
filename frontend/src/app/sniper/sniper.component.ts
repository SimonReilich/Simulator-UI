import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

export interface AgentSnipe {
  id: number;
  active: boolean;
}

@Component({
  selector: 'app-sniper',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './sniper.component.html',
  styleUrl: './sniper.component.css'
})
export class SniperComponent {
  agents: AgentSnipe[] = [{ id: 0, active: true }, { id: 1, active: true }];

  snipe(id: number) {
    this.agents[id] = { id: id, active: false };
  }
}
