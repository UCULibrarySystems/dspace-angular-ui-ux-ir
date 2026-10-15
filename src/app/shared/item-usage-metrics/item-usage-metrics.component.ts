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
import { Observable, of } from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';

interface ItemUsageMetrics {
  views: number | null;
  downloads: number | null;
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

  @Input() itemUri: string;

  metrics$: Observable<ItemUsageMetrics | null> = of(null);

  constructor(private usageReportService: UsageReportDataService) {
  }

  ngOnChanges(): void {
    if (!this.itemUri) {
      this.metrics$ = of(null);
      return;
    }

    this.metrics$ = this.usageReportService.searchStatistics(this.itemUri, 0, 10).pipe(
      map((reports) => {
        const visitsReport = reports.find((report) => report.reportType === 'TotalVisits');
        const downloadsReport = reports.find((report) => report.reportType === 'TotalDownloads');

        if (!visitsReport && !downloadsReport) {
          return null;
        }

        return {
          views: this.totalViews(visitsReport),
          downloads: this.totalViews(downloadsReport),
        };
      }),
      catchError(() => of(null)),
    );
  }

  private totalViews(report?: UsageReport): number | null {
    if (!report) {
      return null;
    }

    return (report.points ?? []).reduce((total, point) => total + point.values.reduce((sum, value) => sum + value.views, 0), 0);
  }
}
