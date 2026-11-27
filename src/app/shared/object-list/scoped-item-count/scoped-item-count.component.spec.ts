import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DSpaceObjectType } from '@dspace/core/shared/dspace-object-type.model';
import { of } from 'rxjs';

import { SearchService } from '../../search/search.service';
import { ScopedItemCountComponent } from './scoped-item-count.component';

describe('ScopedItemCountComponent', () => {
  let fixture: ComponentFixture<ScopedItemCountComponent>;
  let searchSpy: jasmine.Spy;

  beforeEach(async () => {
    searchSpy = jasmine.createSpy('search').and.returnValue(of({
      hasCompleted: true,
      hasSucceeded: true,
      payload: {
        pageInfo: {
          totalElements: 23,
        },
      },
    }));

    await TestBed.configureTestingModule({
      imports: [ScopedItemCountComponent],
      providers: [
        { provide: SearchService, useValue: { search: searchSpy } },
      ],
    }).compileComponents();
  });

  it('fetches scoped item totals when the REST count is unavailable', () => {
    fixture = TestBed.createComponent(ScopedItemCountComponent);
    fixture.componentRef.setInput('scopeId', 'collection-id');
    fixture.componentRef.setInput('archivedItemsCount', -1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('23');
    expect(searchSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      scope: 'collection-id',
      dsoTypes: [DSpaceObjectType.ITEM],
      pagination: jasmine.objectContaining({
        currentPage: 1,
        pageSize: 1,
      }),
    }));
  });

  it('uses the REST count when available without making a search request', () => {
    fixture = TestBed.createComponent(ScopedItemCountComponent);
    fixture.componentRef.setInput('scopeId', 'collection-id');
    fixture.componentRef.setInput('archivedItemsCount', 7);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('7');
    expect(searchSpy).not.toHaveBeenCalled();
  });
});
