import { Component } from '@angular/core';

import { TermsComponent as BaseComponent } from '../../../../../app/info/terms/terms.component';
import { TermsContentComponent } from '../../../../../app/info/terms/terms-content/terms-content.component';

@Component({
  selector: 'ds-themed-terms',
  styleUrls: ['../../../../../app/info/terms/terms.component.scss'],
  templateUrl: '../../../../../app/info/terms/terms.component.html',
  imports: [
    TermsContentComponent,
  ],
})
export class TermsComponent extends BaseComponent {
}
