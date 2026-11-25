import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { MetadataValue } from '@dspace/core/shared/metadata.models';
import { Item } from '@dspace/core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';

import { MetadataFieldWrapperComponent } from '../../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { MarkdownDirective } from '../../../../../shared/utils/markdown.directive';
import { NormalizeLanguageCodePipe } from '../../../../../shared/utils/normalize-language-code.pipe';
import { ItemPageFieldComponent } from '../item-page-field.component';

interface AbstractParagraph {
  value: string;
  language: string;
}

@Component({
  selector: 'ds-item-page-abstract-field',
  templateUrl: './item-page-abstract-field.component.html',
  styleUrls: ['./item-page-abstract-field.component.scss'],
  imports: [
    MarkdownDirective,
    MetadataFieldWrapperComponent,
    NormalizeLanguageCodePipe,
    TranslateModule,
  ],
})
/**
 * This component is used for displaying the abstract (dc.description.abstract) of an item
 */
export class ItemPageAbstractFieldComponent extends ItemPageFieldComponent implements OnChanges {

  @Input() item: Item;

  fields: string[] = [
    'dc.description.abstract',
  ];

  label = 'item.page.abstract';

  abstractParagraphs: AbstractParagraph[] = [];
  isExpanded = false;

  ngOnChanges(): void {
    this.abstractParagraphs = (this.item?.allMetadata(this.fields) ?? [])
      .flatMap((metadata: MetadataValue) => this.splitParagraphs(metadata.value)
        .map((value) => ({ value, language: metadata.language })));
    this.isExpanded = false;
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  private splitParagraphs(value: string): string[] {
    if (!value?.trim()) {
      return [];
    }

    return value
      .replace(/\r\n?/g, '\n')
      .replace(/<\/p>\s*(?=<p(?:\s|>))/gi, '</p>\n\n')
      .split(/\n\s*\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }
}
