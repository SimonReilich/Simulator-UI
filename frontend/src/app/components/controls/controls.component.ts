import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MinControlsComponent } from './protocols/min/min.controls.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { ModControlsComponent } from './protocols/mod/mod.controls.component';

export interface ControlState {
  protocol: string;
  data: Map<any, any>;
}

@Component({
  selector: 'app-controls',
  imports: [MatIconModule, FormsModule, MatInputModule, MatSlideToggleModule, MatDividerModule, MatFormFieldModule, MatSelectModule, MinControlsComponent, ModControlsComponent, MatSliderModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})
export class ControlsComponent implements OnInit {
  @Output() stateChange = new EventEmitter<ControlState>();
  @Output() startPressed = new EventEmitter<any>();
  @Output() quitPressed = new EventEmitter<void>();

  selected = 'min';
  isRandomSniper = false;
  seedValue: number | null = null;
  isRunning = false;

  map = new Map();

  updateMap(key: string, value: any) {
    this.map.set(key, value);
    this.notifyParent();
  }

  resetMap() {
    this.map.clear();
    this.map.set('randomSniper', this.isRandomSniper);
    this.map.set('seed', this.seedValue);
    this.notifyParent();
  }

  handleAgentsChange(val: number) {
    if (val !== undefined) {
      this.map.set("x", val);
      this.notifyParent();
      console.log('Map updated with x:', val);
    }
  }

  handleMaxChange(val: number) {
    if (val !== undefined) {
      this.map.set("c", val);
      this.notifyParent();
      console.log('Map updated with c:', val);
    }
  }

  handleModChange(val: number) {
    if (val !== undefined) {
      this.map.set("m", val);
      this.notifyParent();
      console.log('Map updated with m:', val);
    }
  }

  onProbChange(val: number) {
    if (val !== undefined) {
      this.map.set("p", val);
      this.notifyParent();
      console.log('Map updated with p:', val);
    }
  }

  onStart() {
    this.map.set('seed', this.seedValue);
    this.isRunning = true;
    this.startPressed.emit({
      protocol: this.selected,
      data: this.map
    });
  }

  onQuit() {
    this.isRunning = false;
    this.quitPressed.emit();
  }

  private notifyParent() {
    this.stateChange.emit({
      protocol: this.selected,
      data: this.map
    });
  }

  ngOnInit() {
    this.map.set("x", 1);
    this.map.set("c", 2);
    this.map.set("m", 2);
    this.map.set("randomSniper", this.isRandomSniper);
    this.map.set("p", 0.2);
    this.map.set("seed", this.seedValue);
    this.notifyParent();
  }
}