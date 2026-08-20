import { Component } from '@angular/core';

import { QualityContentComponent } from './quality-content/quality-content.component';

@Component({
  selector: 'ds-base-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.scss'],
  imports: [
    QualityContentComponent,
  ],
})
export class QualityComponent {
}
