import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'cmb-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './cmb.controls.component.html',
  styleUrl: './cmb.controls.component.css'
})
export class CmbControlsComponent {
  @Output() agentsChanged = new EventEmitter<number>();
  @Output() maxChanged = new EventEmitter<number>();
  @Output() modChanged = new EventEmitter<number>();

  onAgentsChange(value: number) {
    this.agentsChanged.emit(value);
  }

  onMaxChange(value: number) {
    this.maxChanged.emit(value);
  }

  onModChange(value: number) {
    this.modChanged.emit(value);
  }
}