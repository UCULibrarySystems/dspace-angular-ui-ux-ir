import { PLATFORM_ID } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { of } from 'rxjs';

import { HomeNewsComponent } from './home-news.component';

describe('HomeNewsComponent', () => {
  const cmsValue = [
    'title: Research story one',
    'message: Details about the first story.',
    'link: /items/first-item',
    'linkText: Read story',
    '---',
    'title: Research story two',
    'message: Details about the second story.',
    'link: https://ucu.ac.ug/research',
    'linkText: Learn more',
  ].join('\n');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomeNewsComponent],
      providers: [
        { provide: APP_CONFIG, useValue: { homePage: { editHomeNews: true } } },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ site: { firstMetadataValue: () => cmsValue } }) },
        },
        { provide: LocaleService, useValue: { getCurrentLanguageCode: () => of('en') } },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();
  }));

  it('parses multiple CMS news stories and allows visitors to navigate between them', () => {
    const fixture = TestBed.createComponent(HomeNewsComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    let titles: string[] = [];
    let links: string[] = [];
    component.homeNewsSlides$.subscribe((slides) => {
      titles = slides.map((slide) => slide.title);
      links = slides.map((slide) => slide.link ?? '');
    });

    expect(titles).toEqual(['Research story one', 'Research story two']);
    expect(links).toEqual(['/items/first-item', 'https://ucu.ac.ug/research']);

    component.nextSlide(titles.length);
    expect(component.activeSlideIndex).toBe(1);
    component.previousSlide(titles.length);
    expect(component.activeSlideIndex).toBe(0);

    fixture.destroy();
  });
});
