import { Component } from '@angular/core';

import { NoticeContentComponent } from './notice-content/notice-content.component';

@Component({
  selector: 'ds-base-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss'],
  imports: [
    NoticeContentComponent,
  ],
})
export class NoticeComponent {
}
