import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { BrowseByTaxonomyComponent as BaseComponent } from '../../../../../app/browse-by/browse-by-taxonomy/browse-by-taxonomy.component';
import { VocabularyTreeviewComponent } from '../../../../../app/shared/form/vocabulary-treeview/vocabulary-treeview.component';
import { SdgBrowseGridComponent } from './sdg-browse-grid.component';

@Component({
  selector: 'ds-browse-by-taxonomy',
  templateUrl: './browse-by-taxonomy.component.html',
  styleUrls: ['./browse-by-taxonomy.component.scss'],
  imports: [
    RouterLink,
    TranslatePipe,
    VocabularyTreeviewComponent,
    SdgBrowseGridComponent,
  ],
})
export class BrowseByTaxonomyComponent extends BaseComponent {
}
