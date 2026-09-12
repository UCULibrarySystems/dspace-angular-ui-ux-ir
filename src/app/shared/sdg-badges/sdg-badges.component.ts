import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';

import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { Item } from '@dspace/core/shared/item.model';

interface SustainableDevelopmentGoal {
  color: string;
  name: string;
  number: number;
}

const GOALS: SustainableDevelopmentGoal[] = [
  { number: 1, name: 'No Poverty', color: '#e5243b' },
  { number: 2, name: 'Zero Hunger', color: '#dda63a' },
  { number: 3, name: 'Good Health and Well-being', color: '#4c9f38' },
  { number: 4, name: 'Quality Education', color: '#c5192d' },
  { number: 5, name: 'Gender Equality', color: '#ff3a21' },
  { number: 6, name: 'Clean Water and Sanitation', color: '#26bde2' },
  { number: 7, name: 'Affordable and Clean Energy', color: '#fcc30b' },
  { number: 8, name: 'Decent Work and Economic Growth', color: '#a21942' },
  { number: 9, name: 'Industry, Innovation and Infrastructure', color: '#fd6925' },
  { number: 10, name: 'Reduced Inequalities', color: '#dd1367' },
  { number: 11, name: 'Sustainable Cities and Communities', color: '#fd9d24' },
  { number: 12, name: 'Responsible Consumption and Production', color: '#bf8b2e' },
  { number: 13, name: 'Climate Action', color: '#3f7e44' },
  { number: 14, name: 'Life Below Water', color: '#0a97d9' },
  { number: 15, name: 'Life on Land', color: '#56c02b' },
  { number: 16, name: 'Peace, Justice and Strong Institutions', color: '#00689d' },
  { number: 17, name: 'Partnerships for the Goals', color: '#19486a' },
];

/** Displays the UN Sustainable Development Goals recorded in item metadata. */
@Component({
  selector: 'ds-sdg-badges',
  templateUrl: './sdg-badges.component.html',
  styleUrls: ['./sdg-badges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class SDGBadgesComponent {
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);

  @Input() item: Item;

  get enabled(): boolean {
    return this.appConfig.sdg.enabled;
  }

  get goals(): SustainableDevelopmentGoal[] {
    if (!this.item || !this.enabled) {
      return [];
    }

    const goalNumbers = new Set<number>();
    this.item.allMetadataValues(this.appConfig.sdg.metadataFields).forEach((value) => {
      const number = this.goalNumber(value);
      if (number) {
        goalNumbers.add(number);
      }
    });
    return GOALS.filter((goal) => goalNumbers.has(goal.number));
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
