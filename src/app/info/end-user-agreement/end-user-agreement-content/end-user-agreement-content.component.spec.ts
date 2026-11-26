import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { APP_DATA_SERVICES_MAP } from '@dspace/core/data-services-map-type';
import { SiteDataService } from '@dspace/core/data/site-data.service';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { MetadataValue } from '@dspace/core/shared/metadata.models';
import { ResourceType } from '@dspace/core/shared/resource-type';
import { Site } from '@dspace/core/shared/site.model';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  of,
  Subject,
} from 'rxjs';

import { environment } from '../../../../environments/environment.test';
import { EndUserAgreementContentComponent } from './end-user-agreement-content.component';

const TEST_MODEL = new ResourceType('testmodel');
const LANGUAGE_LIST = ['en;q=1', 'de;q=0.8'];
const MOCK_DATA_MAP = new Map([
  [TEST_MODEL.value, () => import('../../../core/testing/test-data-service.mock').then(m => m.TestDataService)],
]);
const INITIAL_STATE = {
  core: {
    auth: {
      authenticated: false,
      loaded: false,
      blocking: undefined,
      loading: false,
      authMethods: [],
    },
  },
};


describe('EndUserAgreementContentComponent', () => {
  let component: EndUserAgreementContentComponent;
  let fixture: ComponentFixture<EndUserAgreementContentComponent>;
  let localeServiceSpy: jasmine.SpyObj<LocaleService>;
  let siteDataServiceSpy: jasmine.SpyObj<SiteDataService>;
  let siteSubject: Subject<Site>;

  beforeEach(waitForAsync(() => {
    siteSubject = new Subject<Site>();
    siteDataServiceSpy = jasmine.createSpyObj('SiteDataService', ['find']);
    siteDataServiceSpy.find.and.returnValue(siteSubject.asObservable());
    localeServiceSpy = jasmine.createSpyObj('LocaleService', [
      'getCurrentLanguageCode',
      'getLanguageCodeList',
    ]);

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        EndUserAgreementContentComponent,
      ],
      providers: [
        provideMockStore({ initialState: INITIAL_STATE }),
        { provide: APP_DATA_SERVICES_MAP, useValue: MOCK_DATA_MAP },
        { provide: APP_CONFIG, useValue: environment },
        { provide: SiteDataService, useValue: siteDataServiceSpy },
        { provide: LocaleService, useValue: localeServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EndUserAgreementContentComponent, {
        remove: {
          imports: [RouterLink],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUserAgreementContentComponent);
    component = fixture.componentInstance;
    localeServiceSpy.getCurrentLanguageCode.and.returnValue(of('en'));
    localeServiceSpy.getLanguageCodeList.and.returnValue(of(LANGUAGE_LIST));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the UCU agreement when the site has no agreement text', () => {
    component.userAgreementText$.next('');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('About this agreement');
    expect(fixture.nativeElement.textContent).toContain('Data Protection and Privacy Act, 2019');
  });

  it('removes obsolete draft notices from the stored agreement metadata', () => {
    const agreement = new MetadataValue();
    agreement.language = 'en';
    agreement.value = '<p class="alert alert-warning" role="note"><strong>Draft for institutional review.</strong> This proposed End User Agreement has not been formally approved.</p><p><strong>Last reviewed for this draft:</strong> 6 November 2026</p><h2>1. About this agreement</h2><p>' + 'Approved agreement terms. '.repeat(25) + '</p>';
    const site = new Site();
    site.metadata = { 'dc.rights': [agreement] };

    siteSubject.next(site);

    expect(component.userAgreementText$.value).not.toContain('Draft for institutional review');
    expect(component.userAgreementText$.value).not.toContain('Last reviewed for this draft');
    expect(component.userAgreementText$.value).toContain('1. About this agreement');
  });
});
