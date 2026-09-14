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
import { SearchConfigurationService } from '../../../../../app/shared/search/search-configuration.service';
import { SearchService } from '../../../../../app/shared/search/search.service';
import {
  catchError,
  filter,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';

import { GOAL_CODE_MATCHERS } from '../../../../../app/shared/goal-badges/goal-code-matchers';

interface SdgTile {
  code: string;
  title: string;
}

const SDG_TILES: SdgTile[] = [
  ['01', 'No Poverty'], ['02', 'Zero Hunger'], ['03', 'Good Health and Well-being'],
  ['04', 'Quality Education'], ['05', 'Gender Equality'], ['06', 'Clean Water and Sanitation'],
  ['07', 'Affordable and Clean Energy'], ['08', 'Decent Work and Economic Growth'],
  ['09', 'Industry, Innovation and Infrastructure'], ['10', 'Reduced Inequalities'],
  ['11', 'Sustainable Cities and Communities'], ['12', 'Responsible Consumption and Production'],
  ['13', 'Climate Action'], ['14', 'Life Below Water'], ['15', 'Life on Land'],
  ['16', 'Peace, Justice and Strong Institutions'], ['17', 'Partnerships for the Goals'],
].map(([code, title]) => ({ code, title }));

/** A visual SDG browse page backed by the configured Discovery SDG facet. */
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
  facetAvailable: boolean | null = null;
  missingImages = new Set<string>();

  get countSearchFilter(): string {
    return this.appConfig.goalBadges?.sdg?.countSearchFilter ?? 'sdg';
  }

  ngOnInit(): void {
    this.searchConfigurationService.getConfig().pipe(
      filter((response) => response.hasCompleted),
      take(1),
      switchMap((response) => {
        const facet = response.payload?.find((candidate) => candidate.name === this.countSearchFilter);
        if (!response.hasSucceeded || !facet) {
          return of({ counts: {}, available: false });
        }
        const facetWithValues = Object.assign(new SearchFilterConfig(), facet, { pageSize: 100 });
        return this.searchService.getFacetValuesFor(facetWithValues, 1).pipe(
          filter((facetResponse) => facetResponse.hasCompleted),
          take(1),
          map((facetResponse) => {
            if (!facetResponse.hasSucceeded) {
              return { counts: {}, available: false };
            }
            const counts = (facetResponse.payload.page ?? []).reduce((result, value) => {
              const code = GOAL_CODE_MATCHERS.sdg(value.value);
              if (code) {
                result[code] = (result[code] ?? 0) + value.count;
              }
              return result;
            }, {} as Record<string, number>);
            return { counts, available: true };
          }),
        );
      }),
      catchError(() => of({ counts: {}, available: false })),
    ).subscribe((result) => {
      this.counts = result.counts;
      this.facetAvailable = result.available;
      this.changeDetectorRef.markForCheck();
    });
  }

  imageUnavailable(code: string): void {
    this.missingImages.add(code);
    this.changeDetectorRef.markForCheck();
  }

  searchParams(code: string): Record<string, string> {
    return { [`f.${this.countSearchFilter}`]: `SDG${code},equals` };
  }
}
