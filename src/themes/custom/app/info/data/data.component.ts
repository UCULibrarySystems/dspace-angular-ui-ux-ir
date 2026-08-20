import { Component } from '@angular/core';

import { DataComponent as BaseComponent } from '../../../../../app/info/data/data.component';
import { DataContentComponent } from '../../../../../app/info/data/data-content/data-content.component';

@Component({
  selector: 'ds-themed-data',
  styleUrls: ['../../../../../app/info/data/data.component.scss'],
  templateUrl: '../../../../../app/info/data/data.component.html',
  imports: [
    DataContentComponent,
  ],
})
export class DataComponent extends BaseComponent {
}
