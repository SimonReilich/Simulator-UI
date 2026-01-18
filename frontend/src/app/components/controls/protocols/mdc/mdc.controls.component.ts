import { Component, EventEmitter, Output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'mdc-controls',
  standalone: true,
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './mdc.controls.component.html',
  styleUrl: './mdc.controls.component.css'
})
export class MdcControlsComponent {
  @Output() agents1Changed = new EventEmitter<number>();
  @Output() max1Changed = new EventEmitter<number>();
  @Output() mod1Changed = new EventEmitter<number>();

  onAgents1Change(value: number) {
    this.agents1Changed.emit(value);
  }

  onMax1Change(value: number) {
    this.max1Changed.emit(value);
  }

  onMod1Change(value: number) {
    this.mod1Changed.emit(value);
  }

  @Output() agents2Changed = new EventEmitter<number>();
  @Output() max2Changed = new EventEmitter<number>();
  @Output() mod2Changed = new EventEmitter<number>();

  onAgents2Change(value: number) {
    this.agents2Changed.emit(value);
  }

  onMax2Change(value: number) {
    this.max2Changed.emit(value);
  }

  onMod2Change(value: number) {
    this.mod2Changed.emit(value);
  }
}