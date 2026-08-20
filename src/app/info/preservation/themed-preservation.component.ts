import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { PreservationComponent } from './preservation.component';

@Component({
  selector: 'ds-preservation',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedPreservationComponent extends ThemedComponent<PreservationComponent> {
  protected getComponentName(): string {
    return 'PreservationComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/preservation/preservation.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./preservation.component`);
  }
}
