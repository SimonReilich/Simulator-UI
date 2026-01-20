import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'pbl-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './pbl.controls.component.html',
  styleUrl: './pbl.controls.component.css'
})
export class PblControlsComponent {
  @Output() agentsChanged = new EventEmitter<number>();
  @Output() maxChanged = new EventEmitter<number>();

  onAgentsChange(value: number) {
    this.agentsChanged.emit(value);
  }

  onMaxChange(value: number) {
    this.maxChanged.emit(value);
  }
}