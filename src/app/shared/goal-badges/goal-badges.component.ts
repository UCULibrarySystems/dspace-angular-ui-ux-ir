import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { GoalBadgeSetConfig } from '@dspace/config/goal-badge-config.interface';
import { Item } from '@dspace/core/shared/item.model';
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
import {
  GOAL_CODE_MATCHERS,
  GoalCodeMatcher,
} from './goal-code-matchers';

interface ItemGoalBadge {
  code: string;
  value: string;
}

interface GoalBadgeCountResult {
  counts: Record<string, number>;
  facetAvailable: boolean;
}

const SET_TITLES: Record<string, string> = {
  sdg: 'Sustainable Development Goals',
  ndp: 'Uganda Vision 2040 goals',
  agenda2063: 'African Union Agenda 2063 goals',
};

/** Renders any configured metadata-driven goal framework on an item page. */
@Component({
  selector: 'ds-goal-badges',
  templateUrl: './goal-badges.component.html',
  styleUrls: ['./goal-badges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class GoalBadgesComponent implements OnChanges {
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly searchConfigurationService = inject(SearchConfigurationService);
  private readonly searchService = inject(SearchService);

  @Input() item: Item;
  @Input() set = 'sdg';

  counts: Record<string, number> = {};
  /** Null while checking; false when the configured Discovery facet is unavailable. */
  facetAvailable: boolean | null = null;
  missingImages = new Set<string>();

  get config(): GoalBadgeSetConfig | undefined {
    return this.appConfig.goalBadges?.[this.set];
  }

  get enabled(): boolean {
    return this.config?.enabled === true;
  }

  get title(): string {
    return SET_TITLES[this.set] ?? this.set;
  }

  get badges(): ItemGoalBadge[] {
    const config = this.config;
    const matcher = GOAL_CODE_MATCHERS[this.set];
    if (!this.item || !config?.enabled || !matcher) {
      return [];
    }

    const matches = new Map<string, string>();
    config.metadataFields.forEach((field) => {
      this.item.allMetadataValues(field).forEach((value) => {
        const code = matcher(value);
        if (code && config.codes.includes(code) && !matches.has(code)) {
          matches.set(code, value);
        }
      });
    });

    return config.codes
      .filter((code) => matches.has(code))
      .map((code) => ({ code, value: matches.get(code) }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item || changes.set) {
      this.counts = {};
      this.facetAvailable = null;
      this.missingImages = new Set<string>();
      this.loadCounts();
    }
  }

  imagePath(code: string): string {
    const config = this.config;
    return `assets/images/${config.imageFolder}/${config.imagePrefix}${code.toLowerCase()}.png`;
  }

  imageUnavailable(code: string): void {
    this.missingImages.add(code);
    this.changeDetectorRef.markForCheck();
  }

  searchParams(value: string): Record<string, string> {
    return { [`f.${this.config.countSearchFilter}`]: `${value},equals` };
  }

  private loadCounts(): void {
    const config = this.config;
    const badges = this.badges;
    const matcher = GOAL_CODE_MATCHERS[this.set];
    if (!config?.enabled || badges.length === 0 || !matcher) {
      return;
    }

    this.searchConfigurationService.getConfig().pipe(
      filter((response) => response.hasCompleted),
      take(1),
      switchMap((response) => {
        const facet = response.payload?.find((filterConfig) => filterConfig.name === config.countSearchFilter);
        if (!response.hasSucceeded || !facet) {
          return of({ counts: {}, facetAvailable: false } as GoalBadgeCountResult);
        }
        const facetWithAllValues = Object.assign(new SearchFilterConfig(), facet, { pageSize: 100 });
        return this.searchService.getFacetValuesFor(facetWithAllValues, 1).pipe(
          filter((facetResponse) => facetResponse.hasCompleted),
          take(1),
          map((facetResponse) => {
            if (!facetResponse.hasSucceeded) {
              return { counts: {}, facetAvailable: false } as GoalBadgeCountResult;
            }
            const displayedCodes = new Set(badges.map((badge) => badge.code));
            const counts = (facetResponse.payload.page ?? []).reduce((counts, facetValue) => {
              const code = matcher(facetValue.value);
              if (code && displayedCodes.has(code)) {
                counts[code] = (counts[code] ?? 0) + facetValue.count;
              }
              return counts;
            }, {} as Record<string, number>);
            return { counts, facetAvailable: true } as GoalBadgeCountResult;
          }),
        );
      }),
      catchError(() => of({ counts: {}, facetAvailable: false } as GoalBadgeCountResult)),
    ).subscribe((result) => {
      this.counts = result.counts;
      this.facetAvailable = result.facetAvailable;
      this.changeDetectorRef.markForCheck();
    });
  }
}
