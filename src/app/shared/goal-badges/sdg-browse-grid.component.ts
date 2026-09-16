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

const SDG_TILES = [
  ['01', 'No Poverty'], ['02', 'Zero Hunger'], ['03', 'Good Health and Well-being'], ['04', 'Quality Education'],
  ['05', 'Gender Equality'], ['06', 'Clean Water and Sanitation'], ['07', 'Affordable and Clean Energy'],
  ['08', 'Decent Work and Economic Growth'], ['09', 'Industry, Innovation and Infrastructure'],
  ['10', 'Reduced Inequalities'], ['11', 'Sustainable Cities and Communities'],
  ['12', 'Responsible Consumption and Production'], ['13', 'Climate Action'], ['14', 'Life Below Water'],
  ['15', 'Life on Land'], ['16', 'Peace, Justice and Strong Institutions'], ['17', 'Partnerships for the Goals'],
].map(([code, title]) => ({ code, title }));

/** Visual browse page for the SDG controlled vocabulary and Discovery facet. */
@Component({
  selector: 'ds-sdg-browse-grid',
  templateUrl: './sdg-browse-grid.component.html',
  styleUrls: ['./sdg-browse-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class SdgBrowseGridComponent implements OnInit {
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly searchConfigurationService = inject(SearchConfigurationService);
  private readonly searchService = inject(SearchService);

  readonly tiles = SDG_TILES;
  counts: Record<string, number> = {};
  facetValues: Record<string, string> = {};
  facetAvailable: boolean | null = null;
  missingImages = new Set<string>();

  get filterName(): string {
    return this.appConfig.goalBadges?.sdg?.countSearchFilter ?? 'sdg';
  }

  ngOnInit(): void {
    this.searchConfigurationService.getConfig().pipe(
      filter((response) => response.hasCompleted), take(1),
      switchMap((response) => {
        const facet = response.payload?.find((candidate) => candidate.name === this.filterName);
        if (!response.hasSucceeded || !facet) {
          return of({ counts: {}, values: {}, available: false });
        }
        return this.searchService.getFacetValuesFor(Object.assign(new SearchFilterConfig(), facet, { pageSize: 100 }), 1).pipe(
          filter((facetResponse) => facetResponse.hasCompleted), take(1),
          map((facetResponse) => {
            if (!facetResponse.hasSucceeded) {
              return { counts: {}, values: {}, available: false };
            }
            const result = (facetResponse.payload.page ?? []).reduce((accumulator, value) => {
              const code = GOAL_CODE_MATCHERS.sdg(value.value);
              if (code) {
                accumulator.counts[code] = (accumulator.counts[code] ?? 0) + value.count;
                accumulator.values[code] ??= value.authorityKey ?? value.value;
              }
              return accumulator;
            }, { counts: {} as Record<string, number>, values: {} as Record<string, string> });
            return { ...result, available: true };
          }),
        );
      }),
      catchError(() => of({ counts: {}, values: {}, available: false })),
    ).subscribe((result) => {
      this.counts = result.counts;
      this.facetValues = result.values ?? {};
      this.facetAvailable = result.available;
      this.changeDetectorRef.markForCheck();
    });
  }

  queryParams(code: string): Record<string, string> {
    const facetValue = this.facetValues[code];
    return { [`f.${this.filterName}`]: facetValue?.startsWith('sdg:') ? `${facetValue},authority` : `${facetValue ?? `SDG${code}`},equals` };
  }

  imageUnavailable(code: string): void {
    this.missingImages.add(code);
    this.changeDetectorRef.markForCheck();
  }
}
