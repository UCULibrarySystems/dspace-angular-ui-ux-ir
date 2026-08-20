import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { DepositComponent } from './deposit.component';

/**
 * Themed wrapper for DepositComponent.
 */
@Component({
  selector: 'ds-deposit',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedDepositComponent extends ThemedComponent<DepositComponent> {
  protected getComponentName(): string {
    return 'DepositComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/deposit/deposit.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./deposit.component`);
  }

}
