export const END_USER_AGREEMENT_PATH = 'end-user-agreement';
export const PRIVACY_PATH = 'privacy';
export const DEPOSIT_PATH = 'deposit';
export const DATA_REUSE_PATH = 'data';
export const SERVICE_LEVEL_PATH = 'service';
export const TERMS_PATH = 'terms';
export const PRESERVATION_PATH = 'preservation';
export const NOTICE_TAKEDOWN_PATH = 'notice';
export const QUALITY_ASSURANCE_PATH = 'quality';
export const FEEDBACK_PATH = 'feedback';
export const COAR_NOTIFY_SUPPORT = 'coar-notify-support';
export const ACCESSIBILITY_SETTINGS_PATH = 'accessibility';

export function getEndUserAgreementPath() {
  return getSubPath(END_USER_AGREEMENT_PATH);
}

export function getPrivacyPath() {
  return getSubPath(PRIVACY_PATH);
}

export function getDepositPath() {
  return getSubPath(DEPOSIT_PATH);
}

export function getDataReusePath() {
  return getSubPath(DATA_REUSE_PATH);
}

export function getServiceLevelPath() {
  return getSubPath(SERVICE_LEVEL_PATH);
}

export function getTermsPath() {
  return getSubPath(TERMS_PATH);
}

export function getPreservationPath() {
  return getSubPath(PRESERVATION_PATH);
}

export function getNoticeTakedownPath() {
  return getSubPath(NOTICE_TAKEDOWN_PATH);
}

export function getQualityAssurancePath() {
  return getSubPath(QUALITY_ASSURANCE_PATH);
}

export function getFeedbackPath() {
  return getSubPath(FEEDBACK_PATH);
}

export function getCOARNotifySupportPath(): string {
  return getSubPath(COAR_NOTIFY_SUPPORT);
}

export function getAccessibilitySettingsPath() {
  return getSubPath(ACCESSIBILITY_SETTINGS_PATH);
}

export const INFO_MODULE_PATH = 'info';

export function getInfoModulePath() {
  return `/${INFO_MODULE_PATH}`;
}

function getSubPath(path: string) {
  return `${getInfoModulePath()}/${path}`;
}
