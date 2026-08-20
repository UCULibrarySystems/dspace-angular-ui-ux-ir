import { Component } from '@angular/core';

import { TermsContentComponent } from './terms-content/terms-content.component';

@Component({
  selector: 'ds-base-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  imports: [
    TermsContentComponent,
  ],
})
export class TermsComponent {
}
