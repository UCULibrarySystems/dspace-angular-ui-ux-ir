import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  Component,
  DOCUMENT,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';

type ColorMode = 'normal' | 'dark' | 'light' | 'high' | 'high-saturation' | 'low-saturation' | 'monochrome';

type TogglePreference =
  'highlightTitles' |
  'highlightLinks' |
  'dyslexiaFont' |
  'letterSpacing' |
  'lineHeight' |
  'fontWeight' |
  'alignLeft' |
  'readingGuide' |
  'stopAnimations' |
  'bigCursor' |
  'focusHighlight';

interface SitewideAccessibilityPreferences {
  fontSize: number;
  readingSpeed: number;
  voiceURI: string;
  colorMode: ColorMode;
  highlightTitles: boolean;
  highlightLinks: boolean;
  dyslexiaFont: boolean;
  letterSpacing: boolean;
  lineHeight: boolean;
  fontWeight: boolean;
  alignLeft: boolean;
  readingGuide: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  focusHighlight: boolean;
}

const DEFAULT_PREFERENCES: SitewideAccessibilityPreferences = {
  fontSize: 100,
  readingSpeed: 1,
  voiceURI: '',
  colorMode: 'normal',
  highlightTitles: false,
  highlightLinks: false,
  dyslexiaFont: false,
  letterSpacing: false,
  lineHeight: false,
  fontWeight: false,
  alignLeft: false,
  readingGuide: false,
  stopAnimations: false,
  bigCursor: false,
  focusHighlight: false,
};

@Component({
  selector: 'ds-sitewide-accessibility',
  templateUrl: './sitewide-accessibility.component.html',
  styleUrls: ['./sitewide-accessibility.component.scss'],
  imports: [
    A11yModule,
    CommonModule,
  ],
})
export class SitewideAccessibilityComponent implements OnInit, OnDestroy {
  private readonly storageKey = 'ucu-sitewide-accessibility-v1';

  panelOpen = false;
  preferences: SitewideAccessibilityPreferences = { ...DEFAULT_PREFERENCES };
  voices: SpeechSynthesisVoice[] = [];
  guideY = 0;
  statusMessage = '';
  currentLanguage = 'en';
  readonly languages = environment.languages.filter(language => language.active);

  private lastSpokenText = '';
  private voiceListener: () => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private localeService: LocaleService,
    private router: Router,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.currentLanguage = this.translateService.getCurrentLang() || environment.fallbackLanguage;
    this.restorePreferences();
    this.applyPreferences();
    this.loadVoices();

    if ('speechSynthesis' in window) {
      this.voiceListener = () => this.loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', this.voiceListener);
    }
  }

  ngOnDestroy(): void {
    if (this.voiceListener && 'speechSynthesis' in window) {
      window.speechSynthesis.removeEventListener('voiceschanged', this.voiceListener);
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.panelOpen) {
      this.panelOpen = false;
      this.statusMessage = 'Accessibility menu closed.';
    }
  }

  @HostListener('document:mousemove', ['$event'])
  moveReadingGuide(event: MouseEvent): void {
    if (this.preferences.readingGuide) {
      this.guideY = event.clientY;
    }
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    this.statusMessage = `Accessibility menu ${this.panelOpen ? 'opened' : 'closed'}.`;
  }

  toggle(preference: TogglePreference): void {
    this.preferences = {
      ...this.preferences,
      [preference]: !this.preferences[preference],
    };
    this.commit(`${this.preferenceLabel(preference)} ${this.preferences[preference] ? 'enabled' : 'disabled'}.`);
  }

  setColorMode(mode: ColorMode): void {
    this.preferences = {
      ...this.preferences,
      colorMode: this.preferences.colorMode === mode ? 'normal' : mode,
    };
    this.commit(this.preferences.colorMode === 'normal' ? 'Color adjustments disabled.' : `${this.colorModeLabel(mode)} enabled.`);
  }

  changeFontSize(change: number): void {
    const fontSize = Math.min(150, Math.max(80, this.preferences.fontSize + change));
    this.preferences = { ...this.preferences, fontSize };
    this.commit(`Font size set to ${fontSize} percent.`);
  }

  setReadingSpeed(event: Event): void {
    const readingSpeed = Number((event.target as HTMLInputElement).value);
    this.preferences = { ...this.preferences, readingSpeed };
    this.commit(`Reading speed set to ${readingSpeed.toFixed(2)} times.`);
  }

  setVoice(event: Event): void {
    const voiceURI = (event.target as HTMLSelectElement).value;
    this.preferences = { ...this.preferences, voiceURI };
    this.commit('Reader voice updated.');
  }

  changeLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value;
    this.currentLanguage = language;
    this.localeService.setCurrentLanguageCode(language);
    this.localeService.refreshAfterChangeLanguage();
  }

  toggleProfile(profile: 'epilepsy' | 'seizure' | 'adhd' | 'low-vision'): void {
    const active = this.isProfileActive(profile);

    switch (profile) {
      case 'epilepsy':
        this.preferences = {
          ...this.preferences,
          stopAnimations: !active,
          colorMode: active ? 'normal' : 'low-saturation',
        };
        break;
      case 'seizure':
        this.preferences = {
          ...this.preferences,
          stopAnimations: !active,
          colorMode: active ? 'normal' : 'monochrome',
        };
        break;
      case 'adhd':
        this.preferences = {
          ...this.preferences,
          readingGuide: !active,
          highlightTitles: !active,
          focusHighlight: !active,
        };
        break;
      case 'low-vision':
        this.preferences = {
          ...this.preferences,
          fontSize: active ? 100 : 125,
          colorMode: active ? 'normal' : 'high',
          bigCursor: !active,
          highlightLinks: !active,
        };
        break;
    }

    this.commit(`${this.profileLabel(profile)} profile ${active ? 'disabled' : 'enabled'}.`);
  }

  isProfileActive(profile: 'epilepsy' | 'seizure' | 'adhd' | 'low-vision'): boolean {
    switch (profile) {
      case 'epilepsy':
        return this.preferences.stopAnimations && this.preferences.colorMode === 'low-saturation';
      case 'seizure':
        return this.preferences.stopAnimations && this.preferences.colorMode === 'monochrome';
      case 'adhd':
        return this.preferences.readingGuide && this.preferences.highlightTitles && this.preferences.focusHighlight;
      case 'low-vision':
        return this.preferences.fontSize >= 125 && this.preferences.colorMode === 'high' && this.preferences.bigCursor;
    }
  }

  startReader(replay = false): void {
    if (!('speechSynthesis' in window)) {
      this.statusMessage = 'Text-to-speech is not supported by this browser.';
      return;
    }

    const content = this.document.querySelector('#main-content');
    const text = replay && this.lastSpokenText ? this.lastSpokenText : this.readableText(content);

    if (!text) {
      this.statusMessage = 'No readable page content was found.';
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.preferences.readingSpeed;
    utterance.lang = this.currentLanguage;

    const selectedVoice = this.voices.find(voice => voice.voiceURI === this.preferences.voiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    utterance.onend = () => this.statusMessage = 'Page reader finished.';
    utterance.onerror = () => this.statusMessage = 'The page reader could not finish reading.';
    this.lastSpokenText = text;
    window.speechSynthesis.speak(utterance);
    this.statusMessage = replay ? 'Replaying page content.' : 'Reading page content.';
  }

  stopReader(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.statusMessage = 'Page reader stopped.';
  }

  navigate(path: string): void {
    this.panelOpen = false;
    void this.router.navigateByUrl(path);
  }

  contactLibrary(): void {
    window.location.href = 'mailto:library@ucu.ac.ug?subject=Digital%20Repository%20support';
  }

  startTour(): void {
    this.panelOpen = false;
    const mainContent = this.document.querySelector<HTMLElement>('#main-content');
    mainContent?.setAttribute('tabindex', '-1');
    mainContent?.focus({ preventScroll: false });
    this.statusMessage = 'Main repository content selected. Use Tab to move through links and controls.';
  }

  resetAll(): void {
    this.stopReader();
    this.preferences = { ...DEFAULT_PREFERENCES };
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Preferences still reset for the current page when browser storage is unavailable.
    }
    this.applyPreferences();
    this.statusMessage = 'All accessibility settings reset.';
  }

  private commit(message: string): void {
    this.applyPreferences();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch {
      // Keep the setting active for this page when browser storage is unavailable.
    }
    this.statusMessage = message;
  }

  private restorePreferences(): void {
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey));
      this.preferences = { ...DEFAULT_PREFERENCES, ...stored };
    } catch {
      this.preferences = { ...DEFAULT_PREFERENCES };
    }
  }

  private applyPreferences(): void {
    const root = this.document.documentElement;
    root.style.setProperty('--ucu-a11y-font-size', `${this.preferences.fontSize}%`);

    const toggles: Array<[TogglePreference, string]> = [
      ['highlightTitles', 'ucu-a11y-highlight-titles'],
      ['highlightLinks', 'ucu-a11y-highlight-links'],
      ['dyslexiaFont', 'ucu-a11y-dyslexia-font'],
      ['letterSpacing', 'ucu-a11y-letter-spacing'],
      ['lineHeight', 'ucu-a11y-line-height'],
      ['fontWeight', 'ucu-a11y-font-weight'],
      ['alignLeft', 'ucu-a11y-align-left'],
      ['stopAnimations', 'ucu-a11y-stop-animations'],
      ['bigCursor', 'ucu-a11y-big-cursor'],
      ['focusHighlight', 'ucu-a11y-focus-highlight'],
    ];

    toggles.forEach(([preference, className]) => root.classList.toggle(className, this.preferences[preference]));

    const colorClasses = ['dark', 'light', 'high', 'high-saturation', 'low-saturation', 'monochrome'];
    colorClasses.forEach(mode => root.classList.toggle(`ucu-a11y-${mode}`, this.preferences.colorMode === mode));
  }

  private loadVoices(): void {
    if (!('speechSynthesis' in window)) {
      return;
    }

    this.voices = window.speechSynthesis.getVoices()
      .slice()
      .sort((left, right) => left.lang.localeCompare(right.lang) || left.name.localeCompare(right.name));

    if (!this.preferences.voiceURI && this.voices.length > 0) {
      const matchingVoice = this.voices.find(voice => voice.lang.toLowerCase().startsWith(this.currentLanguage.toLowerCase()));
      this.preferences.voiceURI = matchingVoice?.voiceURI || this.voices[0].voiceURI;
    }
  }

  private readableText(container: Element): string {
    if (!container) {
      return '';
    }

    return Array.from(container.querySelectorAll('h1, h2, h3, h4, p, li, dt, dd, figcaption'))
      .filter(element => (element as HTMLElement).offsetParent !== null)
      .map(element => element.textContent.trim())
      .filter(Boolean)
      .join('. ')
      .slice(0, 30000);
  }

  private preferenceLabel(preference: TogglePreference): string {
    const labels: Record<TogglePreference, string> = {
      highlightTitles: 'Title highlighting',
      highlightLinks: 'Link highlighting',
      dyslexiaFont: 'Dyslexia-friendly font',
      letterSpacing: 'Letter spacing',
      lineHeight: 'Line height',
      fontWeight: 'Heavier font weight',
      alignLeft: 'Left text alignment',
      readingGuide: 'Reading guide',
      stopAnimations: 'Animation pause',
      bigCursor: 'Large cursor',
      focusHighlight: 'Keyboard focus highlighting',
    };
    return labels[preference];
  }

  private colorModeLabel(mode: ColorMode): string {
    return mode.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  }

  private profileLabel(profile: 'epilepsy' | 'seizure' | 'adhd' | 'low-vision'): string {
    const labels = {
      epilepsy: 'Epilepsy safe',
      seizure: 'Seizure safe',
      adhd: 'ADHD support',
      'low-vision': 'Low vision',
    };
    return labels[profile];
  }
}
