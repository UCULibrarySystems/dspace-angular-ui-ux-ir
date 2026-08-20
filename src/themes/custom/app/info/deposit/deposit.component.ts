import { Component } from '@angular/core';

import { DepositComponent as BaseComponent } from '../../../../../app/info/deposit/deposit.component';
import { DepositContentComponent } from '../../../../../app/info/deposit/deposit-content/deposit-content.component';

@Component({
  selector: 'ds-themed-deposit',
  styleUrls: ['../../../../../app/info/deposit/deposit.component.scss'],
  templateUrl: '../../../../../app/info/deposit/deposit.component.html',
  imports: [
    DepositContentComponent,
  ],
})
export class DepositComponent extends BaseComponent {
}
