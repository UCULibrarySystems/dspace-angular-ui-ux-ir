import { Component } from '@angular/core';

import { RepositoryPoliciesContentComponent } from './policies-content/policies-content.component';

@Component({
  selector: 'ds-repository-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['../service/service.component.scss'],
  imports: [
    RepositoryPoliciesContentComponent,
  ],
})
export class RepositoryPoliciesComponent {
}
