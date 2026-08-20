import { Component } from '@angular/core';

import { DataContentComponent } from './data-content/data-content.component';

@Component({
  selector: 'ds-base-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  imports: [
    DataContentComponent,
  ],
})
/**
 * Component displaying repository data reuse information.
 */
export class DataComponent {
}
