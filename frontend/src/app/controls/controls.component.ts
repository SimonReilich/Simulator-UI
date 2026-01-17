import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MinControlsComponent } from './protocols/min/min.controls.component';
import { MatDividerModule } from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-controls',
  imports: [MatIconModule, FormsModule, MatInputModule, MatSlideToggleModule, MatDividerModule, MatFormFieldModule, MatSelectModule, MinControlsComponent],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})
export class ControlsComponent {
  selected = 'option2';
}
