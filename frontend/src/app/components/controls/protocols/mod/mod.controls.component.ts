import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'mod-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './mod.controls.component.html',
  styleUrl: './mod.controls.component.css'
})
export class ModControlsComponent {
  @Output() agentsChanged = new EventEmitter<number>();
  @Output() modChanged = new EventEmitter<number>();

  onAgentsChange(value: number) {
    this.agentsChanged.emit(value);
  }

  onModChange(value: number) {
    this.modChanged.emit(value);
  }
}