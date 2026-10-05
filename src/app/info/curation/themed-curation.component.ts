import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { CurationComponent } from './curation.component';

/**
 * Themed wrapper for CurationComponent.
 */
@Component({
  selector: 'ds-curation',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedCurationComponent extends ThemedComponent<CurationComponent> {
  protected getComponentName(): string {
    return 'CurationComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/curation/curation.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./curation.component');
  }
}
