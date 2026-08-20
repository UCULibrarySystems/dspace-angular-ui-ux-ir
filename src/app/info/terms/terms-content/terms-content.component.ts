import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-terms-content',
  templateUrl: './terms-content.component.html',
  styleUrls: ['../../service/service-content/service-content.component.scss'],
  imports: [
    RouterLink,
  ],
})
export class TermsContentComponent {
}
