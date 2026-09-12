import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { Item } from '@dspace/core/shared/item.model';
import { PaginationComponentOptions } from '@dspace/core/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '@dspace/core/shared/search/models/paginated-search-options.model';
import { SearchFilter } from '@dspace/core/shared/search/models/search-filter.model';
import {
  catchError,
  filter,
  forkJoin,
  map,
  of,
  take,
} from 'rxjs';

import { SearchService } from '../search/search.service';

interface SustainableDevelopmentGoal {
  image: string;
  name: string;
  number: number;
}

interface ItemSustainableDevelopmentGoal extends SustainableDevelopmentGoal {
  metadataField: string;
  metadataValue: string;
}

const GOALS: SustainableDevelopmentGoal[] = [
  { number: 1, name: 'No Poverty', image: 'assets/images/sdg/sdg-01.png' },
  { number: 2, name: 'Zero Hunger', image: 'assets/images/sdg/sdg-02.png' },
  { number: 3, name: 'Good Health and Well-being', image: 'assets/images/sdg/sdg-03.png' },
  { number: 4, name: 'Quality Education', image: 'assets/images/sdg/sdg-04.png' },
  { number: 5, name: 'Gender Equality', image: 'assets/images/sdg/sdg-05.png' },
  { number: 6, name: 'Clean Water and Sanitation', image: 'assets/images/sdg/sdg-06.png' },
  { number: 7, name: 'Affordable and Clean Energy', image: 'assets/images/sdg/sdg-07.png' },
  { number: 8, name: 'Decent Work and Economic Growth', image: 'assets/images/sdg/sdg-08.png' },
  { number: 9, name: 'Industry, Innovation and Infrastructure', image: 'assets/images/sdg/sdg-09.png' },
  { number: 10, name: 'Reduced Inequalities', image: 'assets/images/sdg/sdg-10.png' },
  { number: 11, name: 'Sustainable Cities and Communities', image: 'assets/images/sdg/sdg-11.png' },
  { number: 12, name: 'Responsible Consumption and Production', image: 'assets/images/sdg/sdg-12.png' },
  { number: 13, name: 'Climate Action', image: 'assets/images/sdg/sdg-13.png' },
  { number: 14, name: 'Life Below Water', image: 'assets/images/sdg/sdg-14.png' },
  { number: 15, name: 'Life on Land', image: 'assets/images/sdg/sdg-15.png' },
  { number: 16, name: 'Peace, Justice and Strong Institutions', image: 'assets/images/sdg/sdg-16.png' },
  { number: 17, name: 'Partnerships for the Goals', image: 'assets/images/sdg/sdg-17.png' },
];

/** Displays the UN Sustainable Development Goals recorded in item metadata. */
@Component({
  selector: 'ds-sdg-badges',
  templateUrl: './sdg-badges.component.html',
  styleUrls: ['./sdg-badges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class SDGBadgesComponent implements OnChanges {
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly searchService = inject(SearchService);

  @Input() item: Item;

  counts: Record<number, number> = {};

  get enabled(): boolean {
    return this.appConfig.sdg.enabled;
  }

  get goals(): ItemSustainableDevelopmentGoal[] {
    if (!this.item || !this.enabled) {
      return [];
    }

    const goalValues = new Map<number, { field: string, value: string }>();
    this.appConfig.sdg.metadataFields.forEach((field) => {
      this.item.allMetadataValues(field).forEach((value) => {
        const number = this.goalNumber(value);
        if (number && !goalValues.has(number)) {
          goalValues.set(number, { field, value });
        }
      });
    });
    return GOALS
      .filter((goal) => goalValues.has(goal.number))
      .map((goal) => ({
        ...goal,
        metadataField: goalValues.get(goal.number).field,
        metadataValue: goalValues.get(goal.number).value,
      }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.counts = {};
      this.loadCounts();
    }
  }

  private loadCounts(): void {
    const goals = this.goals;
    if (!this.enabled || goals.length === 0) {
      return;
    }

    forkJoin(goals.map((goal) => this.countFor(goal).pipe(
      map((count) => ({ number: goal.number, count })),
    ))).subscribe((results) => {
      this.counts = results.reduce((counts, result) => ({
        ...counts,
        [result.number]: result.count,
      }), {} as Record<number, number>);
      this.changeDetectorRef.markForCheck();
    });
  }

  private countFor(goal: ItemSustainableDevelopmentGoal) {
    const options = new PaginatedSearchOptions({
      filters: [new SearchFilter(`f.${this.appConfig.sdg.countSearchFilter}`, [goal.metadataValue], 'equals')],
      pagination: Object.assign(new PaginationComponentOptions(), { currentPage: 1, pageSize: 1 }),
    });

    return this.searchService.search(options).pipe(
      filter((response) => response.hasCompleted),
      take(1),
      map((response) => response.hasSucceeded ? response.payload.pageInfo.totalElements : 0),
      catchError(() => of(0)),
    );
  }

  private goalNumber(value: string): number | undefined {
    const normalised = value.trim().toLowerCase();
    const numberedGoal = normalised.match(/^(?:sdg\s*)?0?([1-9]|1[0-7])(?:\D|$)/i);
    if (numberedGoal) {
      return Number(numberedGoal[1]);
    }
    return GOALS.find((goal) => normalised === goal.name.toLowerCase())?.number;
  }
}
