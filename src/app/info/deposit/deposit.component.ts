import { Component } from '@angular/core';

import { DepositContentComponent } from './deposit-content/deposit-content.component';

@Component({
  selector: 'ds-base-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  imports: [
    DepositContentComponent,
  ],
})
/**
 * Component displaying repository deposit information.
 */
export class DepositComponent {
}
