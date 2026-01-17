import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'min-controls',
  imports: [MatSliderModule, MatDividerModule],
  templateUrl: './min.controls.component.html',
  styleUrl: './min.controls.component.css'
})
export class MinControlsComponent {
    
}
