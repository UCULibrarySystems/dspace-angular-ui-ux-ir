import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { UsageReport } from '@dspace/core/statistics/models/usage-report.model';
import { UsageReportDataService } from '@dspace/core/statistics/usage-report-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ItemUsageMetricsComponent } from './item-usage-metrics.component';

describe('ItemUsageMetricsComponent', () => {
  let fixture: ComponentFixture<ItemUsageMetricsComponent>;
  let usageReportService: jasmine.SpyObj<UsageReportDataService>;

  beforeEach(async () => {
    usageReportService = jasmine.createSpyObj('UsageReportDataService', ['searchStatistics']);
    await TestBed.configureTestingModule({
      imports: [
        ItemUsageMetricsComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UsageReportDataService, useValue: usageReportService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemUsageMetricsComponent);
  });

  it('shows per-item visit and download totals', async () => {
    usageReportService.searchStatistics.and.returnValue(of([
      Object.assign(new UsageReport(), {
        reportType: 'TotalVisits',
        points: [{ values: [{ views: 2406 }] }],
      }),
      Object.assign(new UsageReport(), {
        reportType: 'TotalDownloads',
        points: [
          { values: [{ views: 285 }] },
          { values: [{ views: 4 }] },
          { values: [{ views: 2 }] },
        ],
      }),
    ]));
    fixture.componentRef.setInput('itemUri', 'https://rest.api/server/api/core/items/item-uuid');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2,406');
    expect(text).toContain('291');
    expect(usageReportService.searchStatistics).toHaveBeenCalledWith('https://rest.api/server/api/core/items/item-uuid', 0, 10);
  });

  it('shows zero totals when reports are unavailable', async () => {
    usageReportService.searchStatistics.and.returnValue(throwError(() => new Error('Unavailable')));
    fixture.componentRef.setInput('itemUri', 'https://rest.api/server/api/core/items/item-uuid');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
