import {
  AsyncPipe,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { UsageReport } from '@dspace/core/statistics/models/usage-report.model';
import { UsageReportDataService } from '@dspace/core/statistics/usage-report-data.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';

interface ItemUsageMetrics {
  views: number;
  downloads: number;
}

@Component({
  selector: 'ds-item-usage-metrics',
  templateUrl: './item-usage-metrics.component.html',
  styleUrls: ['./item-usage-metrics.component.scss'],
  imports: [
    AsyncPipe,
    DecimalPipe,
    TranslateModule,
  ],
})
export class ItemUsageMetricsComponent implements OnChanges {

  @Input() itemId: string;

  metrics$: Observable<ItemUsageMetrics> = of({ views: 0, downloads: 0 });

  constructor(private usageReportService: UsageReportDataService) {
  }

  ngOnChanges(): void {
    if (!this.itemId) {
      this.metrics$ = of({ views: 0, downloads: 0 });
      return;
    }

    const views$ = this.usageReportService.getStatistic(this.itemId, 'TotalVisits').pipe(
      map((report) => this.totalViews(report)),
      catchError(() => of(0)),
    );
    const downloads$ = this.usageReportService.getStatistic(this.itemId, 'TotalDownloads').pipe(
      map((report) => this.totalViews(report)),
      catchError(() => of(0)),
    );
    this.metrics$ = combineLatest([views$, downloads$]).pipe(
      map(([views, downloads]) => ({ views, downloads })),
    );
  }

  private totalViews(report: UsageReport): number {
    return report.points.reduce((total, point) => total + point.values.reduce((sum, value) => sum + value.views, 0), 0);
  }
}
