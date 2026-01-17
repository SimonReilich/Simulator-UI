import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'min-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './min.controls.component.html',
  styleUrl: './min.controls.component.css'
})
export class MinControlsComponent {
  @Output() agentsChanged = new EventEmitter<number>();
  @Output() maxChanged = new EventEmitter<number>();

  onAgentsChange(value: number) {
    this.agentsChanged.emit(value);
  }

  onMaxChange(value: number) {
    this.maxChanged.emit(value);
  }
}