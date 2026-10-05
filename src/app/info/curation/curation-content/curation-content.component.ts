import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-curation-content',
  templateUrl: './curation-content.component.html',
  styleUrls: ['../../service/service-content/service-content.component.scss'],
  imports: [
    RouterLink,
  ],
})
export class CurationContentComponent {
}
