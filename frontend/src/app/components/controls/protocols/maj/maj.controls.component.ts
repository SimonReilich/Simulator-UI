import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'maj-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './maj.controls.component.html',
  styleUrl: './maj.controls.component.css'
})
export class MajControlsComponent {
  @Output() agents1Changed = new EventEmitter<number>();
  @Output() agents2Changed = new EventEmitter<number>();

  onAgents1Change(value: number) {
    this.agents1Changed.emit(value);
  }

  onAgents2Change(value: number) {
    this.agents2Changed.emit(value);
  }
}