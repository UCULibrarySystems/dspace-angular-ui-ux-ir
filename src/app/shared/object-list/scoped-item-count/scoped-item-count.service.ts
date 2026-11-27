import { Injectable } from '@angular/core';
import { PaginationComponentOptions } from '@dspace/core/pagination/pagination-component-options.model';
import { DSpaceObjectType } from '@dspace/core/shared/dspace-object-type.model';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { PaginatedSearchOptions } from '@dspace/core/shared/search/models/paginated-search-options.model';
import { catchError } from 'rxjs/operators';
import {
  finalize,
  map,
  Observable,
  of,
  shareReplay,
} from 'rxjs';

import { SearchService } from '../../search/search.service';

export type ItemCountState =
  | { status: 'loading' }
  | { status: 'success', count: number }
  | { status: 'unavailable' };

@Injectable({ providedIn: 'root' })
export class ScopedItemCountService {
  private readonly pendingCounts = new Map<string, Observable<ItemCountState>>();

  constructor(private readonly searchService: SearchService) {}

  getItemCount(scopeId: string): Observable<ItemCountState> {
    const pendingCount = this.pendingCounts.get(scopeId);
    if (pendingCount) {
      return pendingCount;
    }

    const pagination = Object.assign(new PaginationComponentOptions(), {
      currentPage: 1,
      pageSize: 1,
    });
    const request = this.searchService.search(new PaginatedSearchOptions({
      scope: scopeId,
      dsoTypes: [DSpaceObjectType.ITEM],
      pagination,
    })).pipe(
      getFirstCompletedRemoteData(),
      map((response) => {
        const totalElements = response.payload?.pageInfo?.totalElements;
        if (response.hasSucceeded && typeof totalElements === 'number' && Number.isFinite(totalElements)) {
          return { status: 'success', count: totalElements } as const;
        }

        console.error(`Unable to retrieve item count for scope ${scopeId}`, response.errorMessage);
        return { status: 'unavailable' } as const;
      }),
      catchError((error) => {
        console.error(`Unable to retrieve item count for scope ${scopeId}`, error);
        return of({ status: 'unavailable' } as const);
      }),
      finalize(() => this.pendingCounts.delete(scopeId)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.pendingCounts.set(scopeId, request);
    return request;
  }
}
