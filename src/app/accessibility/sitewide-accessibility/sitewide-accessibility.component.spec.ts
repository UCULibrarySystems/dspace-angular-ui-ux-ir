import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { TranslateService } from '@ngx-translate/core';

import { HomePageTourService } from '../../home-page/home-page-tour/home-page-tour.service';
import { SitewideAccessibilityComponent } from './sitewide-accessibility.component';

describe('SitewideAccessibilityComponent', () => {
  afterEach(() => {
    localStorage.removeItem('ucu-sitewide-accessibility-v1');
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
  });

  it('keeps the settings panel open while applying multiple accessibility settings', async () => {
    const fixture = await createFixture();
    const component = fixture.componentInstance;

    component.togglePanel();
    component.toggle('highlightLinks');
    component.changeFontSize(10);

    expect(component.panelOpen).toBeTrue();
    expect(component.preferences.fontSize).toBe(110);
    expect(document.documentElement.classList.contains('ucu-a11y-highlight-links')).toBeTrue();

    fixture.destroy();
  });

  it('sanitizes invalid saved preferences before applying them', async () => {
    localStorage.setItem('ucu-sitewide-accessibility-v1', JSON.stringify({
      fontSize: 999,
      readingSpeed: 3,
      colorMode: 'invalid',
      highlightLinks: 'yes',
    }));

    const fixture = await createFixture();
    const { preferences } = fixture.componentInstance;

    expect(preferences.fontSize).toBe(150);
    expect(preferences.readingSpeed).toBe(2);
    expect(preferences.colorMode).toBe('normal');
    expect(preferences.highlightLinks).toBeFalse();

    fixture.destroy();
  });
});

async function createFixture(): Promise<ComponentFixture<SitewideAccessibilityComponent>> {
  await TestBed.configureTestingModule({
    imports: [SitewideAccessibilityComponent],
    providers: [
      provideRouter([]),
      HomePageTourService,
      { provide: LocaleService, useValue: { setCurrentLanguageCode: jasmine.createSpy(), refreshAfterChangeLanguage: jasmine.createSpy() } },
      { provide: TranslateService, useValue: { getCurrentLang: () => 'en' } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SitewideAccessibilityComponent);
  fixture.detectChanges();
  return fixture;
}
