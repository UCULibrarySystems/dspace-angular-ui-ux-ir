import { Component } from '@angular/core';

import { ServiceContentComponent } from './service-content/service-content.component';

@Component({
  selector: 'ds-base-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
  imports: [
    ServiceContentComponent,
  ],
})
export class ServiceComponent {
}
