import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  Input,
} from '@angular/core';
import { Item } from '@dspace/core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';

type CitationStyle = 'apa' | 'mla' | 'chicago';

@Component({
  selector: 'ds-citation-generator',
  templateUrl: './citation-generator.component.html',
  styleUrls: ['./citation-generator.component.scss'],
  imports: [TranslateModule],
})
export class CitationGeneratorComponent {

  @Input() item: Item;

  style: CitationStyle = 'apa';
  copyResult: 'success' | 'failure' | null = null;

  constructor(private clipboard: Clipboard) {
  }

  get citationText(): string {
    const title = this.item?.firstMetadataValue('dc.title') || this.item?.name || '';
    const year = this.getYear();
    const authors = this.getAuthors();
    const source = this.getSource();
    const doi = this.getDoi();

    switch (this.style) {
      case 'mla':
        return this.formatMla(authors, title, source, year, doi);
      case 'chicago':
        return this.formatChicago(authors, title, source, year, doi);
      default:
        return this.formatApa(authors, title, source, year, doi);
    }
  }

  changeStyle(event: Event): void {
    this.style = (event.target as HTMLSelectElement).value as CitationStyle;
    this.copyResult = null;
  }

  copyCitation(): void {
    this.copyResult = this.clipboard.copy(this.citationText) ? 'success' : 'failure';
  }

  private getAuthors(): string[] {
    const authors = this.item?.allMetadataValues('dc.contributor.author') ?? [];
    return authors.length > 0 ? authors : this.item?.allMetadataValues('dc.creator') ?? [];
  }

  private getYear(): string {
    const date = this.item?.firstMetadataValue('dc.date.issued');
    return date?.match(/\d{4}/)?.[0] ?? 'n.d.';
  }

  private getSource(): string {
    const journal = this.item?.firstMetadataValue(['journal.title', 'dc.relation.ispartof']);
    const publisher = this.item?.firstMetadataValue('dc.publisher');
    const volume = this.item?.firstMetadataValue('oaire.citation.volume');
    const issue = this.item?.firstMetadataValue('oaire.citation.issue');
    const firstPage = this.item?.firstMetadataValue('oaire.citation.startPage');
    const lastPage = this.item?.firstMetadataValue('oaire.citation.endPage');
    const pages = firstPage && lastPage ? `${firstPage}-${lastPage}` : firstPage || lastPage;

    if (!journal) {
      return publisher ?? '';
    }

    const volumeIssue = volume ? `${volume}${issue ? `(${issue})` : ''}` : issue ? `(${issue})` : '';
    return [journal, volumeIssue, pages].filter(Boolean).join(', ');
  }

  private getDoi(): string {
    const doi = this.item?.firstMetadataValue('dc.identifier.doi');
    if (doi) {
      return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
    }
    return this.item?.firstMetadataValue('dc.identifier.uri') ?? '';
  }

  private formatApa(authors: string[], title: string, source: string, year: string, doi: string): string {
    const authorText = this.formatApaAuthors(authors);
    const sourceText = source ? `${source}.` : '';
    const prefix = authorText ? `${authorText} ` : '';
    return `${prefix}(${year}). ${title}.${sourceText}${doi ? ` ${doi}` : ''}`.trim();
  }

  private formatMla(authors: string[], title: string, source: string, year: string, doi: string): string {
    const authorText = this.formatMlaAuthors(authors);
    const prefix = authorText ? `${authorText} ` : '';
    const sourceText = source ? ` ${source},` : '';
    return `${prefix}"${title}."${sourceText} ${year}.${doi ? ` ${doi}` : ''}`.trim();
  }

  private formatChicago(authors: string[], title: string, source: string, year: string, doi: string): string {
    const authorText = this.formatMlaAuthors(authors);
    const prefix = authorText ? `${authorText} ` : '';
    const sourceText = source ? ` ${source}` : '';
    return `${prefix}"${title}."${sourceText} (${year}).${doi ? ` ${doi}` : ''}`.trim();
  }

  private formatApaAuthors(authors: string[]): string {
    const formatted = authors.slice(0, 20).map((author) => this.formatApaAuthor(author));
    if (authors.length > 20) {
      formatted.splice(19, 1, '…', this.formatApaAuthor(authors[authors.length - 1]));
    }
    if (formatted.length < 2) {
      return formatted[0] ?? '';
    }
    if (formatted.length === 2) {
      return `${formatted[0]}, & ${formatted[1]}`;
    }
    return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
  }

  private formatApaAuthor(author: string): string {
    const [familyName, ...givenNames] = author.includes(',')
      ? author.split(',').map((part) => part.trim())
      : this.splitName(author);
    const initials = givenNames
      .join(' ')
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((name) => `${name.replace(/\./g, '').charAt(0)}.`)
      .join(' ');
    return initials ? `${familyName}, ${initials}` : familyName;
  }

  private formatMlaAuthors(authors: string[]): string {
    if (authors.length === 0) {
      return '';
    }
    if (authors.length > 2) {
      return `${authors[0]}, et al.`;
    }
    if (authors.length === 2) {
      return `${authors[0]}, and ${authors[1]}`;
    }
    return authors[0];
  }

  private splitName(name: string): string[] {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) {
      return parts;
    }
    return [parts.pop(), parts.join(' ')];
  }
}
