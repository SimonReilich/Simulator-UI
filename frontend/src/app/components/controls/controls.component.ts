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
import { CmbControlsComponent } from './protocols/cmb/cmb.controls.component';
import { MdcControlsComponent } from './protocols/mdc/mdc.controls.component';
import { PblControlsComponent } from './protocols/pbl/pbl.controls.component';

export interface ControlState {
  protocol: string;
  data: Map<any, any>;
}

@Component({
  selector: 'app-controls',
  imports: [MatIconModule, PblControlsComponent, FormsModule, MatInputModule, MatSlideToggleModule, MatDividerModule, MatFormFieldModule, MatSelectModule, MdcControlsComponent, MinControlsComponent, ModControlsComponent, MatSliderModule, CmbControlsComponent],
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

  handleAgents1Change(val: number) {
    if (val !== undefined) {
      this.map.set("x1", val);
      this.notifyParent();
      console.log('Map updated with x1:', val);
    }
  }

  handleMax1Change(val: number) {
    if (val !== undefined) {
      this.map.set("c1", val);
      this.notifyParent();
      console.log('Map updated with c1:', val);
    }
  }

  handleMod1Change(val: number) {
    if (val !== undefined) {
      this.map.set("m1", val);
      this.notifyParent();
      console.log('Map updated with m1:', val);
    }
  }

  handleAgents2Change(val: number) {
    if (val !== undefined) {
      this.map.set("x2", val);
      this.notifyParent();
      console.log('Map updated with x2:', val);
    }
  }

  handleMax2Change(val: number) {
    if (val !== undefined) {
      this.map.set("c2", val);
      this.notifyParent();
      console.log('Map updated with c2:', val);
    }
  }

  handleMod2Change(val: number) {
    if (val !== undefined) {
      this.map.set("m2", val);
      this.notifyParent();
      console.log('Map updated with m2:', val);
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
    this.map.set("x1", 1);
    this.map.set("c1", 2);
    this.map.set("m1", 2);
    this.map.set("x2", 1);
    this.map.set("c2", 2);
    this.map.set("m2", 2);
    this.map.set("randomSniper", this.isRandomSniper);
    this.map.set("p", 0.2);
    this.map.set("seed", this.seedValue);
    this.notifyParent();
  }
}