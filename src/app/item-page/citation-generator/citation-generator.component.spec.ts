import { Clipboard } from '@angular/cdk/clipboard';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { Item } from '@dspace/core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';

import { CitationGeneratorComponent } from './citation-generator.component';

describe('CitationGeneratorComponent', () => {
  let fixture: ComponentFixture<CitationGeneratorComponent>;
  let clipboard: jasmine.SpyObj<Clipboard>;

  beforeEach(async () => {
    clipboard = jasmine.createSpyObj('Clipboard', ['copy']);
    await TestBed.configureTestingModule({
      imports: [
        CitationGeneratorComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: Clipboard, useValue: clipboard },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CitationGeneratorComponent);
    fixture.componentRef.setInput('item', Object.assign(new Item(), {
      metadata: {
        'dc.title': [{ value: 'Kinetic Analysis Reveals the Role of Secondary Nucleation in Regenerated Silk Fibroin Self-Assembly' }],
        'dc.contributor.author': [{ value: 'Kamada, A.' }, { value: 'Knowles, T. P. J.' }],
        'dc.date.issued': [{ value: '2023' }],
        'journal.title': [{ value: 'Macromolecules' }],
        'oaire.citation.volume': [{ value: '24' }],
        'oaire.citation.endPage': [{ value: 'Article 4' }],
        'dc.identifier.doi': [{ value: '10.1021/acs.biomac.2c01479' }],
      },
    }));
    fixture.detectChanges();
  });

  it('generates an APA citation from item metadata', () => {
    expect(fixture.componentInstance.citationText).toContain('Kamada, A., & Knowles, T. P. J. (2023).');
    expect(fixture.componentInstance.citationText).toContain('https://doi.org/10.1021/acs.biomac.2c01479');
  });

  it('copies the generated citation', () => {
    clipboard.copy.and.returnValue(true);

    fixture.componentInstance.copyCitation();

    expect(clipboard.copy).toHaveBeenCalledWith(fixture.componentInstance.citationText);
    expect(fixture.componentInstance.copyResult).toBe('success');
  });
});
