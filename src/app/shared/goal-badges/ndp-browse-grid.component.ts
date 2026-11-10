import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { SearchFilterConfig } from '@dspace/core/shared/search/models/search-filter-config.model';
import {
  catchError,
  filter,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';

import { SearchConfigurationService } from '../search/search-configuration.service';
import { SearchService } from '../search/search.service';
import { GOAL_CODE_MATCHERS } from './goal-code-matchers';

interface NdpCategory {
  prefix: string;
  title: string;
  image: string;
}

interface NdpBrowseResult {
  counts: Record<string, number>;
  filters: Record<string, string[]>;
  available: boolean;
}

const NDP_CATEGORIES: NdpCategory[] = [
  { prefix: 'OPP', title: 'Strategic Opportunities', image: 'Strategic%20Opportunities.png' },
  { prefix: 'FUND', title: 'Development Fundamentals', image: 'Development%20Fundamentals.png' },
  { prefix: 'SOC', title: 'Social Transformation', image: 'Social%20Transformation.png' },
  { prefix: 'GOV', title: 'Governance', image: 'Governance.png' },
].map((category) => ({
  ...category,
  image: `assets/images/NPV%20badges/${category.image}`,
}));

/** Browse NDP categories with live counts from the configured Discovery facet. */
@Component({
  selector: 'ds-ndp-browse-grid',
  templateUrl: './ndp-browse-grid.component.html',
  styleUrls: ['./ndp-browse-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class NdpBrowseGridComponent implements OnInit {
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly searchConfigurationService = inject(SearchConfigurationService);
  private readonly searchService = inject(SearchService);

  readonly categories = NDP_CATEGORIES;
  counts: Record<string, number> = {};
  filters: Record<string, string[]> = {};
  facetAvailable: boolean | null = null;
  missingImages = new Set<string>();

  get countSearchFilter(): string {
    return this.appConfig.goalBadges?.ndp?.countSearchFilter ?? 'visiongoal';
  }

  ngOnInit(): void {
    this.searchConfigurationService.getConfig().pipe(
      filter((response) => response.hasCompleted),
      take(1),
      switchMap((response) => {
        const facet = response.payload?.find((candidate) => candidate.name === this.countSearchFilter);
        if (!response.hasSucceeded || !facet) {
          return of({ counts: {}, filters: {}, available: false } as NdpBrowseResult);
        }
        const facetWithValues = Object.assign(new SearchFilterConfig(), facet, { pageSize: 100 });
        return this.searchService.getFacetValuesFor(facetWithValues, 1).pipe(
          filter((facetResponse) => facetResponse.hasCompleted),
          take(1),
          map((facetResponse) => {
            if (!facetResponse.hasSucceeded) {
              return { counts: {}, filters: {}, available: false } as NdpBrowseResult;
            }
            const result = (facetResponse.payload.page ?? []).reduce((accumulator, value) => {
              const code = GOAL_CODE_MATCHERS.ndp(value.value);
              const category = this.categories.find((entry) => code?.startsWith(entry.prefix));
              if (category && code && this.appConfig.goalBadges?.ndp?.codes.includes(code)) {
                accumulator.counts[category.prefix] = (accumulator.counts[category.prefix] ?? 0) + value.count;
                const filterValue = value.authorityKey ? `${value.authorityKey},authority` : `${value.value},equals`;
                accumulator.filters[category.prefix] ??= [];
                if (!accumulator.filters[category.prefix].includes(filterValue)) {
                  accumulator.filters[category.prefix].push(filterValue);
                }
              }
              return accumulator;
            }, { counts: {}, filters: {} } as Pick<NdpBrowseResult, 'counts' | 'filters'>);
            return { ...result, available: true } as NdpBrowseResult;
          }),
        );
      }),
      catchError(() => of({ counts: {}, filters: {}, available: false } as NdpBrowseResult)),
    ).subscribe((result) => {
      this.counts = result.counts;
      this.filters = result.filters;
      this.facetAvailable = result.available;
      this.changeDetectorRef.markForCheck();
    });
  }

  queryParams(category: NdpCategory): Record<string, string[]> {
    const categoryFilters = this.filters[category.prefix];
    return {
      [`f.${this.countSearchFilter}`]: categoryFilters?.length
        ? categoryFilters
        : (this.appConfig.goalBadges?.ndp?.codes ?? [])
          .filter((code) => code.startsWith(category.prefix))
          .map((code) => `${code},equals`),
    };
  }

  imageUnavailable(prefix: string): void {
    this.missingImages.add(prefix);
    this.changeDetectorRef.markForCheck();
  }
}
