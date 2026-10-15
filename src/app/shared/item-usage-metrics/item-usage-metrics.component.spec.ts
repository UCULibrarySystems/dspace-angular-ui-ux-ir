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
    usageReportService = jasmine.createSpyObj('UsageReportDataService', ['getStatistic']);
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
    usageReportService.getStatistic.and.callFake((_itemId: string, type: string) => of({
      points: [{ values: [{ views: type === 'TotalVisits' ? 3249 : 4 }] }],
    } as UsageReport));
    fixture.componentRef.setInput('itemId', 'item-uuid');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('3,249');
    expect(text).toContain('4');
    expect(usageReportService.getStatistic).toHaveBeenCalledWith('item-uuid', 'TotalVisits');
    expect(usageReportService.getStatistic).toHaveBeenCalledWith('item-uuid', 'TotalDownloads');
  });

  it('shows zero totals when reports are unavailable', async () => {
    usageReportService.getStatistic.and.returnValue(throwError(() => new Error('Unavailable')));
    fixture.componentRef.setInput('itemId', 'item-uuid');

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('0');
  });
});
