import { Component } from '@angular/core';

import { CurationContentComponent } from './curation-content/curation-content.component';

@Component({
  selector: 'ds-base-curation',
  templateUrl: './curation.component.html',
  styleUrls: ['./curation.component.scss'],
  imports: [
    CurationContentComponent,
  ],
})
export class CurationComponent {
}
