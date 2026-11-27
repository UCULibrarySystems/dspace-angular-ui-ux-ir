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
import { ActivatedRoute } from '@angular/router';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { Collection } from '@dspace/core/shared/collection.model';
import { ActivatedRouteStub } from '@dspace/core/testing/active-router.stub';
import { DSONameServiceMock } from '@dspace/core/testing/dso-name.service.mock';
import { of } from 'rxjs';

import { SearchService } from '../../search/search.service';
import { CollectionListElementComponent } from './collection-list-element.component';

let collectionListElementComponent: CollectionListElementComponent;
let fixture: ComponentFixture<CollectionListElementComponent>;

const mockCollectionWithArchivedItems: Collection = Object.assign(new Collection(), {
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'Test title',
      },
    ],
  }, archivedItemsCount: 1,
});

const mockCollectionWithArchivedItemsDisabledAtBackend: Collection = Object.assign(new Collection(), {
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'Test title',
      },
    ],
  }, archivedItemsCount: -1,
});


const mockCollectionWithAbstract: Collection = Object.assign(new Collection(), {
  metadata: {
    'dc.description.abstract': [
      {
        language: 'en_US',
        value: 'Short description',
      },
    ],
  }, archivedItemsCount: 1,
});

const mockCollectionWithoutAbstract: Collection = Object.assign(new Collection(), {
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'Test title',
      },
    ],
  }, archivedItemsCount: 1,
});

describe('CollectionListElementComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CollectionListElementComponent],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: 'objectElementProvider', useValue: (mockCollectionWithAbstract) },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: SearchService, useValue: { search: () => of({ hasCompleted: true, hasSucceeded: true, payload: { pageInfo: { totalElements: 0 } } }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(CollectionListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CollectionListElementComponent);
    collectionListElementComponent = fixture.componentInstance;
  }));

  describe('When the collection has an abstract', () => {
    beforeEach(() => {
      collectionListElementComponent.object = mockCollectionWithAbstract;
      fixture.detectChanges();
    });

    it('should show the description paragraph', () => {
      const collectionAbstractField = fixture.debugElement.query(By.css('div.abstract-text'));
      expect(collectionAbstractField).not.toBeNull();
    });
  });

  describe('When the collection has no abstract', () => {
    beforeEach(() => {
      collectionListElementComponent.object = mockCollectionWithoutAbstract;
      fixture.detectChanges();
    });

    it('should not show the description paragraph', () => {
      const collectionAbstractField = fixture.debugElement.query(By.css('div.abstract-text'));
      expect(collectionAbstractField).toBeNull();
    });
  });


  describe('When the collection has archived items', () => {
    beforeEach(() => {
      collectionListElementComponent.object = mockCollectionWithArchivedItems;
      fixture.detectChanges();
    });

    it('should show the archived items paragraph', () => {
      const field = fixture.debugElement.query(By.css('span.scoped-item-count'));
      expect(field).not.toBeNull();
      expect(field.nativeElement.textContent).toContain('1');
    });
  });

  describe('When the collection archived items are disabled at backend', () => {
    beforeEach(() => {
      collectionListElementComponent.object = mockCollectionWithArchivedItemsDisabledAtBackend;
      fixture.detectChanges();
    });

    it('should show an unavailable label when the fallback scope is missing', () => {
      const field = fixture.debugElement.query(By.css('span.scoped-item-count'));
      expect(field.nativeElement.textContent).toContain('N/A');
    });
  });
});
