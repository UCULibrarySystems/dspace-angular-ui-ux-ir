import { Component } from '@angular/core';

import { ServiceComponent as BaseComponent } from '../../../../../app/info/service/service.component';
import { ServiceContentComponent } from '../../../../../app/info/service/service-content/service-content.component';

@Component({
  selector: 'ds-themed-service',
  styleUrls: ['../../../../../app/info/service/service.component.scss'],
  templateUrl: '../../../../../app/info/service/service.component.html',
  imports: [
    ServiceContentComponent,
  ],
})
export class ServiceComponent extends BaseComponent {
}
