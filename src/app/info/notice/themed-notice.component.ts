import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { NoticeComponent } from './notice.component';

@Component({
  selector: 'ds-notice',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedNoticeComponent extends ThemedComponent<NoticeComponent> {
  protected getComponentName(): string {
    return 'NoticeComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/info/notice/notice.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./notice.component`);
  }
}
