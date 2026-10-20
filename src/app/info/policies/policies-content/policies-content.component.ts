import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-repository-policies-content',
  templateUrl: './policies-content.component.html',
  styleUrls: ['../../service/service-content/service-content.component.scss'],
  imports: [
    RouterLink,
  ],
})
export class RepositoryPoliciesContentComponent {
}
