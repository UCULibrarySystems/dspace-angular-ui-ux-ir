import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { TermsComponent } from './terms.component';

@Component({
  selector: 'ds-terms',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedTermsComponent extends ThemedComponent<TermsComponent> {
  protected getComponentName(): string {
    return 'TermsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/terms/terms.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./terms.component`);
  }
}
