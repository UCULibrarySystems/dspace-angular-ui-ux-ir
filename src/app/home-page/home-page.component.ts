import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { Site } from '@dspace/core/shared/site.model';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { SuggestionsPopupComponent } from '../notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../search-page/themed-configuration-search-page.component';
import { HomeCoarComponent } from './home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from './home-news/themed-home-news.component';
import { RecentItemListComponent } from './recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from './top-level-community-list/themed-top-level-community-list.component';

interface ResearchImpactSlide {
  kicker: string;
  title: string;
  subtitle: string;
  summary: string;
  image: string;
  imageAlt: string;
  link: string;
  button: string;
  findings: string[];
}

@Component({
  selector: 'ds-base-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html',
  imports: [
    AsyncPipe,
    HomeCoarComponent,
    NgTemplateOutlet,
    RecentItemListComponent,
    RouterLink,
    SuggestionsPopupComponent,
    ThemedConfigurationSearchPageComponent,
    ThemedHomeNewsComponent,
    ThemedTopLevelCommunityListComponent,
  ],
})
export class HomePageComponent implements OnInit, OnDestroy {

  site$: Observable<Site>;
  recentSubmissionspageSize: number;
  showDiscoverFilters: boolean;
  homeHeaderSlides$: Observable<ResearchImpactSlide[]>;
  activeImpactSlide = 0;
  private impactSlideTimer: ReturnType<typeof setInterval>;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected route: ActivatedRoute,
    private locale: LocaleService,
  ) {
    this.recentSubmissionspageSize = this.appConfig.homePage.recentSubmissions.pageSize;
    this.showDiscoverFilters = this.appConfig.homePage.showDiscoverFilters;
  }

  ngOnInit(): void {
    this.site$ = this.route.data.pipe(
      map((data) => data.site as Site),
    );

    this.homeHeaderSlides$ = combineLatest({
      site: this.site$,
      language: this.locale.getCurrentLanguageCode(),
    }).pipe(
      take(1),
      map(({ site, language }) => this.parseResearchImpactSlides(site?.firstMetadataValue('dspace.cms.home-header', { language }))),
    );

    this.impactSlideTimer = setInterval(() => this.nextImpactSlide(), 8000);
  }

  ngOnDestroy(): void {
    if (this.impactSlideTimer) {
      clearInterval(this.impactSlideTimer);
    }
  }

  setImpactSlide(index: number): void {
    this.activeImpactSlide = index;
  }

  previousImpactSlide(): void {
    this.homeHeaderSlides$.pipe(take(1)).subscribe((slides) => {
      this.activeImpactSlide = slides.length ? (this.activeImpactSlide + slides.length - 1) % slides.length : 0;
    });
  }

  nextImpactSlide(): void {
    this.homeHeaderSlides$.pipe(take(1)).subscribe((slides) => {
      this.activeImpactSlide = slides.length ? (this.activeImpactSlide + 1) % slides.length : 0;
    });
  }

  private parseResearchImpactSlides(value: string): ResearchImpactSlide[] {
    const fallbackSlides = this.getFallbackResearchImpactSlides();

    if (!value?.trim()) {
      return fallbackSlides;
    }

    const blocks = value
      .split(/^---+\s*$/m)
      .map((block) => block.trim())
      .filter((block) => block.length > 0);

    const slides = blocks
      .map((block) => this.parseResearchImpactSlide(block))
      .filter((slide) => slide.title && slide.link);

    return slides.length > 0 ? slides : fallbackSlides;
  }

  private parseResearchImpactSlide(block: string): ResearchImpactSlide {
    const data: { [key: string]: string } = {};
    const findings: string[] = [];
    let readingFindings = false;

    block.split(/\r?\n/).forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line || line.startsWith('#')) {
        return;
      }

      if (/^findings\s*:/i.test(line)) {
        readingFindings = true;
        return;
      }

      if (readingFindings && line.startsWith('-')) {
        findings.push(line.replace(/^-\s*/, '').trim());
        return;
      }

      readingFindings = false;
      const match = line.match(/^([a-zA-Z]+)\s*:\s*(.*)$/);
      if (match) {
        data[match[1].toLowerCase()] = match[2].trim();
      }
    });

    return {
      kicker: data.kicker || 'UCU Research Impact',
      title: data.title || '',
      subtitle: data.subtitle || '',
      summary: data.summary || '',
      image: data.image || 'assets/images/ucu-logo-lib.png',
      imageAlt: data.alt || data.title || 'Uganda Christian University research impact',
      link: this.normalizeInternalLink(data.link || data.url || '/search'),
      button: data.button || 'Read more',
      findings,
    };
  }

  private normalizeInternalLink(link: string): string {
    const trimmed = link?.trim() || '/search';

    if (trimmed.startsWith('http')) {
      try {
        return new URL(trimmed).pathname || '/search';
      } catch {
        return '/search';
      }
    }

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  private getFallbackResearchImpactSlides(): ResearchImpactSlide[] {
    return [
      {
        kicker: 'UCU Research Impact',
        title: 'Discover latest research from Uganda Christian University',
        subtitle: 'Digital Institutional Repository',
        summary: 'Explore publications, theses, dissertations, datasets, and scholarly outputs produced by the UCU academic community.',
        image: 'assets/images/ucu-logo-lib.png',
        imageAlt: 'Uganda Christian University Libraries and Archives',
        link: '/search',
        button: 'Read more',
        findings: [
          'Open access scholarship',
          'Latest repository additions',
          'Research for community impact',
        ],
      },
    ];
  }

}
