import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { ServiceComponent } from './service.component';

@Component({
  selector: 'ds-service',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedServiceComponent extends ThemedComponent<ServiceComponent> {
  protected getComponentName(): string {
    return 'ServiceComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/service/service.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./service.component`);
  }
}
