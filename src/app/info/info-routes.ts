import {
  Route,
  Routes,
} from '@angular/router';
import { i18nBreadcrumbResolver } from '@dspace/core/breadcrumbs/i18n-breadcrumb.resolver';
import { notifyInfoGuard } from '@dspace/core/coar-notify/notify-info/notify-info.guard';
import { feedbackGuard } from '@dspace/core/feedback/feedback.guard';
import {
  ACCESSIBILITY_SETTINGS_PATH,
  COAR_NOTIFY_SUPPORT,
  DATA_REUSE_PATH,
  DEPOSIT_PATH,
  END_USER_AGREEMENT_PATH,
  FEEDBACK_PATH,
  NOTICE_TAKEDOWN_PATH,
  PRESERVATION_PATH,
  PRIVACY_PATH,
  QUALITY_ASSURANCE_PATH,
  SERVICE_LEVEL_PATH,
  TERMS_PATH,
} from '@dspace/core/router/info-routing-paths';
import { hasValue } from '@dspace/shared/utils/empty.util';

import { environment } from '../../environments/environment';
import { AccessibilitySettingsComponent } from './accessibility-settings/accessibility-settings.component';
import { ThemedDataComponent } from './data/themed-data.component';
import { ThemedDepositComponent } from './deposit/themed-deposit.component';
import { ThemedEndUserAgreementComponent } from './end-user-agreement/themed-end-user-agreement.component';
import { ThemedFeedbackComponent } from './feedback/themed-feedback.component';
import { ThemedNoticeComponent } from './notice/themed-notice.component';
import { NotifyInfoComponent } from './notify-info/notify-info.component';
import { ThemedPreservationComponent } from './preservation/themed-preservation.component';
import { ThemedPrivacyComponent } from './privacy/themed-privacy.component';
import { ThemedQualityComponent } from './quality/themed-quality.component';
import { ThemedServiceComponent } from './service/themed-service.component';
import { ThemedTermsComponent } from './terms/themed-terms.component';


export const ROUTES: Routes = [
  {
    path: FEEDBACK_PATH,
    component: ThemedFeedbackComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.feedback.title', breadcrumbKey: 'info.feedback' },
    canActivate: [feedbackGuard],
  },
  {
    path: DEPOSIT_PATH,
    component: ThemedDepositComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.deposit.title', breadcrumbKey: 'info.deposit' },
  },
  {
    path: DATA_REUSE_PATH,
    component: ThemedDataComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.data.title', breadcrumbKey: 'info.data' },
  },
  {
    path: SERVICE_LEVEL_PATH,
    component: ThemedServiceComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.service.title', breadcrumbKey: 'info.service' },
  },
  {
    path: TERMS_PATH,
    component: ThemedTermsComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.terms.title', breadcrumbKey: 'info.terms' },
  },
  {
    path: PRESERVATION_PATH,
    component: ThemedPreservationComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.preservation.title', breadcrumbKey: 'info.preservation' },
  },
  {
    path: NOTICE_TAKEDOWN_PATH,
    component: ThemedNoticeComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.notice.title', breadcrumbKey: 'info.notice' },
  },
  {
    path: QUALITY_ASSURANCE_PATH,
    component: ThemedQualityComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.quality.title', breadcrumbKey: 'info.quality' },
  },
  {
    path: ACCESSIBILITY_SETTINGS_PATH,
    component: AccessibilitySettingsComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.accessibility-settings.title', breadcrumbKey: 'info.accessibility-settings' },
  },
  environment.info.enableEndUserAgreement ? {
    path: END_USER_AGREEMENT_PATH,
    component: ThemedEndUserAgreementComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.end-user-agreement.title', breadcrumbKey: 'info.end-user-agreement' },
  } : undefined,
  environment.info.enablePrivacyStatement ? {
    path: PRIVACY_PATH,
    component: ThemedPrivacyComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.privacy.title', breadcrumbKey: 'info.privacy' },
  } : undefined,
  environment.info.enableCOARNotifySupport ? {
    path: COAR_NOTIFY_SUPPORT,
    component: NotifyInfoComponent,
    canActivate: [notifyInfoGuard],
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    data: {
      title: 'info.coar-notify-support.title',
      breadcrumbKey: 'info.coar-notify-support',
    },
  } : undefined,
].filter((route: Route) => hasValue(route));
