import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { BrowseService } from '@dspace/core/browse/browse.service';
import { BrowseDefinitionDataService } from '@dspace/core/browse/browse-definition-data.service';
import { VocabularyService } from '@dspace/core/submission/vocabularies/vocabulary.service';
import { BrowseDefinitionDataServiceStub } from '@dspace/core/testing/browse-definition-data-service.stub';
import { BrowseServiceStub } from '@dspace/core/testing/browse-service.stub';
import { TranslateLoaderMock } from '@dspace/core/testing/translate-loader.mock';
import { Item } from '@dspace/core/shared/item.model';
import { MetadataValue } from '@dspace/core/shared/metadata.models';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { environment } from '../../../../../../environments/environment';
import { ItemPageAbstractFieldComponent } from './item-page-abstract-field.component';

let comp: ItemPageAbstractFieldComponent;
let fixture: ComponentFixture<ItemPageAbstractFieldComponent>;
const vocabularyServiceMock = {
  getPublicVocabularyEntryByID: jasmine.createSpy('getPublicVocabularyEntryByID'),
};

describe('ItemPageAbstractFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        ItemPageAbstractFieldComponent,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: BrowseDefinitionDataService, useValue: BrowseDefinitionDataServiceStub },
        { provide: BrowseService, useValue: BrowseServiceStub },
        { provide: VocabularyService, useValue: vocabularyServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemPageAbstractFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {

    fixture = TestBed.createComponent(ItemPageAbstractFieldComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('renders abstracts as justified content with a faded second paragraph and an expand control', () => {
    const item = new Item();
    spyOn(item, 'allMetadata').and.returnValue([
      Object.assign(new MetadataValue(), {
        language: 'en',
        value: 'First paragraph.\n\nSecond paragraph.',
      }),
    ]);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();

    expect(comp.abstractParagraphs.map((paragraph) => paragraph.value)).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ]);
    expect(fixture.debugElement.query(By.css('.ucu-abstract-content'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.ucu-abstract-teaser'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.ucu-abstract-toggle')).nativeElement.getAttribute('aria-expanded')).toBe('false');

    fixture.debugElement.query(By.css('.ucu-abstract-toggle')).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ucu-abstract-teaser'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.ucu-abstract-toggle')).nativeElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not add an expand control when an abstract has only one paragraph', () => {
    const item = new Item();
    spyOn(item, 'allMetadata').and.returnValue([
      Object.assign(new MetadataValue(), {
        language: 'en',
        value: 'A single paragraph.',
      }),
    ]);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ucu-abstract-teaser'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.ucu-abstract-toggle'))).toBeNull();
  });
});
