import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommandService } from '../../services/command.service';

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
  
  _count = 0;
  agents: AgentSnipe[] = [];

  constructor(private cmdService: CommandService) {
    this.resetAll();
  }

  snipe(id: number) {
    if (id > 0 && this.agents[id - 1]) {
      this.agents[id - 1] = { ...this.agents[id - 1], active: false };
      this.cmdService.sendManualInput(`${id}`);
    } else {
      this.cmdService.sendManualInput(`${id}`);
    }
  }

  public resetAll() {
    this.agents = Array.from({ length: this._count }, (_, i) => ({
      id: i + 1,
      active: true
    }));
  }
}