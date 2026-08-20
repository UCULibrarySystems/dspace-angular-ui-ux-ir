import { Component } from '@angular/core';

import { NoticeComponent as BaseComponent } from '../../../../../app/info/notice/notice.component';
import { NoticeContentComponent } from '../../../../../app/info/notice/notice-content/notice-content.component';

@Component({
  selector: 'ds-themed-notice',
  styleUrls: ['../../../../../app/info/notice/notice.component.scss'],
  templateUrl: '../../../../../app/info/notice/notice.component.html',
  imports: [
    NoticeContentComponent,
  ],
})
export class NoticeComponent extends BaseComponent {
}
