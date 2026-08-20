import { Component } from '@angular/core';

import { PreservationContentComponent } from './preservation-content/preservation-content.component';

@Component({
  selector: 'ds-base-preservation',
  templateUrl: './preservation.component.html',
  styleUrls: ['./preservation.component.scss'],
  imports: [
    PreservationContentComponent,
  ],
})
export class PreservationComponent {
}
