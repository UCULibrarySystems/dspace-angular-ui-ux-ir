import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { DataComponent } from './data.component';

/**
 * Themed wrapper for DataComponent.
 */
@Component({
  selector: 'ds-data',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedDataComponent extends ThemedComponent<DataComponent> {
  protected getComponentName(): string {
    return 'DataComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/data/data.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./data.component`);
  }

}
