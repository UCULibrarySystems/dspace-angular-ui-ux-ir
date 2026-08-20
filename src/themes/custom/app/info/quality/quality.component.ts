import { Component } from '@angular/core';

import { QualityComponent as BaseComponent } from '../../../../../app/info/quality/quality.component';
import { QualityContentComponent } from '../../../../../app/info/quality/quality-content/quality-content.component';

@Component({
  selector: 'ds-themed-quality',
  styleUrls: ['../../../../../app/info/quality/quality.component.scss'],
  templateUrl: '../../../../../app/info/quality/quality.component.html',
  imports: [
    QualityContentComponent,
  ],
})
export class QualityComponent extends BaseComponent {
}
