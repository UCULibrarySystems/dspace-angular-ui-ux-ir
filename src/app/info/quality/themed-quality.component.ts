import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { QualityComponent } from './quality.component';

@Component({
  selector: 'ds-quality',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedQualityComponent extends ThemedComponent<QualityComponent> {
  protected getComponentName(): string {
    return 'QualityComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/quality/quality.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./quality.component`);
  }
}
