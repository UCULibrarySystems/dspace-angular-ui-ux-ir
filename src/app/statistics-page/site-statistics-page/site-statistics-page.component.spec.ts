import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { AuthService } from '@dspace/core/auth/auth.service';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { DSpaceObjectDataService } from '@dspace/core/data/dspace-object-data.service';
import { SiteDataService } from '@dspace/core/data/site-data.service';
import { Site } from '@dspace/core/shared/site.model';
import { UsageReport } from '@dspace/core/statistics/models/usage-report.model';
import { UsageReportDataService } from '@dspace/core/statistics/usage-report-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { StatisticsTableComponent } from '../statistics-table/statistics-table.component';
import { SiteStatisticsPageComponent } from './site-statistics-page.component';

describe('SiteStatisticsPageComponent', () => {

  let component: SiteStatisticsPageComponent;
  let de: DebugElement;
  let fixture: ComponentFixture<SiteStatisticsPageComponent>;
  let searchStatisticsSpy: jasmine.Spy;
  let getStatisticSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {

    const activatedRoute = {
    };

    const router = {
    };

    searchStatisticsSpy = jasmine.createSpy('searchStatistics').and.returnValue(of([
        Object.assign(
          new UsageReport(), {
            id: `site_id-TotalVisits-report`,
            reportType: 'TotalVisits',
            points: [],
          },
        ),
      ]));
    getStatisticSpy = jasmine.createSpy('getStatistic').and.returnValue(of(
      Object.assign(new UsageReport(), {
        id: 'site_id-TotalVisitsPerMonth-report',
        reportType: 'TotalVisitsPerMonth',
        points: [
          {
            id: 'May_2026',
            label: 'May 2026',
            type: 'date',
            values: { views: 4 },
          },
          {
            id: 'November_2026',
            label: 'November 2026',
            type: 'date',
            values: { views: 8 },
          },
        ],
      }),
    ));
    const usageReportService = {
      searchStatistics: searchStatisticsSpy,
      getStatistic: getStatisticSpy,
    };

    const nameService = {
      getName: () => of('test dso name'),
    };

    const siteService = {
      find: () => of(Object.assign(new Site(), {
        id: 'site_id',
        _links: {
          self: {
            href: 'test_site_link',
          },
        },
      })),
    };

    const authService = jasmine.createSpyObj('authService', {
      isAuthenticated: of(true),
      setRedirectUrl: {},
    });

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CommonModule,
        SiteStatisticsPageComponent,
        StatisticsTableComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router },
        { provide: UsageReportDataService, useValue: usageReportService },
        { provide: DSpaceObjectDataService, useValue: {} },
        { provide: DSONameService, useValue: nameService },
        { provide: SiteDataService, useValue: siteService },
        { provide: AuthService, useValue: authService },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteStatisticsPageComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve to the correct site', () => {
    expect(de.query(By.css('.header')).nativeElement.id)
      .toEqual('site_id');
  });

  it('should show a statistics table for each usage report', () => {
    expect(de.query(By.css('ds-statistics-table.site_id-TotalVisits-report')).nativeElement)
      .toBeTruthy();
  });

  it('should keep monthly statistics visible with month and year labels', () => {
    const monthlyTable = de.query(By.css('ds-statistics-table.site_id-TotalVisitsPerMonth-report'));

    expect(monthlyTable.nativeElement.textContent).toContain('May 2026');
    expect(monthlyTable.nativeElement.textContent).toContain('November 2026');
    expect(searchStatisticsSpy).toHaveBeenCalledTimes(1);
    expect(getStatisticSpy).toHaveBeenCalledWith('site_id', 'TotalVisitsPerMonth');
  });
});
