import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-service-content',
  templateUrl: './service-content.component.html',
  styleUrls: ['./service-content.component.scss'],
  imports: [
    RouterLink,
  ],
})
/**
 * Component displaying UCU repository service level information.
 */
export class ServiceContentComponent {
}
