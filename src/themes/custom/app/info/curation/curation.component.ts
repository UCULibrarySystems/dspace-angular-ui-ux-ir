import { Component } from '@angular/core';

import { CurationComponent as BaseComponent } from '../../../../../app/info/curation/curation.component';
import { CurationContentComponent } from '../../../../../app/info/curation/curation-content/curation-content.component';

@Component({
  selector: 'ds-themed-curation',
  styleUrls: ['../../../../../app/info/curation/curation.component.scss'],
  templateUrl: '../../../../../app/info/curation/curation.component.html',
  imports: [
    CurationContentComponent,
  ],
})
export class CurationComponent extends BaseComponent {
}
