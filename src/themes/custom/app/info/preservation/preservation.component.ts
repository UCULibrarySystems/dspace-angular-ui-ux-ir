import { Component } from '@angular/core';

import { PreservationComponent as BaseComponent } from '../../../../../app/info/preservation/preservation.component';
import { PreservationContentComponent } from '../../../../../app/info/preservation/preservation-content/preservation-content.component';

@Component({
  selector: 'ds-themed-preservation',
  styleUrls: ['../../../../../app/info/preservation/preservation.component.scss'],
  templateUrl: '../../../../../app/info/preservation/preservation.component.html',
  imports: [
    PreservationContentComponent,
  ],
})
export class PreservationComponent extends BaseComponent {
}
