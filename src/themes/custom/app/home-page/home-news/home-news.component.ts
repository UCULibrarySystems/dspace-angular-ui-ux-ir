import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { Site } from '@dspace/core/shared/site.model';
import { RouterLink } from '@angular/router';
import {
  combineLatest,
  map,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import { MarkdownViewerComponent } from 'src/app/shared/markdown-viewer/markdown-viewer.component';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';

interface HeroMessage {
  title: string;
  message: string;
  link?: string;
  linkText: string;
}

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html',
  imports: [
    AsyncPipe,
    MarkdownViewerComponent,
    RouterLink,
  ],
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent implements OnInit, OnDestroy {
  activeSlideIndex = 0;
  homeNewsSlides$: Observable<HeroMessage[]>;
  private carouselTimer?: ReturnType<typeof window.setInterval>;
  private slideSubscription?: Subscription;

  constructor(
    route: ActivatedRoute,
    private readonly localeService: LocaleService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    super(route, localeService);
  }

  ngOnInit(): void {
    this.homeNewsSlides$ = combineLatest({
      site$: this.route.data.pipe(
        map((data) => data.site as Site),
      ),
      language$: this.localeService.getCurrentLanguageCode(),
    }).pipe(
      take(1),
      map(({ site$, language$ }) => this.parseHeroMessages(
        site$?.firstMetadataValue('dspace.cms.home-news', { language: language$ }),
      )),
    );

    if (isPlatformBrowser(this.platformId)) {
      this.slideSubscription = this.homeNewsSlides$.subscribe((slides) => {
        if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.carouselTimer = window.setInterval(() => this.nextSlide(slides.length), 8_000);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      window.clearInterval(this.carouselTimer);
    }
    this.slideSubscription?.unsubscribe();
  }

  previousSlide(slideCount: number): void {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + slideCount) % slideCount;
  }

  nextSlide(slideCount: number): void {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % slideCount;
  }

  resourceLink(link?: string): string | undefined {
    if (!link || !/^(?:https?:\/\/|\/)/i.test(link.trim())) {
      return undefined;
    }
    return link.trim();
  }

  isExternalLink(link?: string): boolean {
    return !!link && /^https?:\/\//i.test(link);
  }

  private parseHeroMessages(value?: string): HeroMessage[] {
    if (!value?.trim()) {
      return [this.defaultMessage()];
    }

    const messages = value
      .split(/^---\s*$/m)
      .map((block) => this.parseHeroMessage(block))
      .filter((message): message is HeroMessage => !!message);

    return messages.length > 0 ? messages : [this.defaultMessage()];
  }

  private parseHeroMessage(block: string): HeroMessage | undefined {
    const fields = new Map<string, string>();
    const messageLines: string[] = [];

    block.trim().split(/\r?\n/).forEach((line) => {
      const match = line.match(/^(title|message|link|linkText):\s*(.+)$/i);
      if (match) {
        fields.set(match[1].toLowerCase(), match[2].trim());
      } else if (line.trim()) {
        messageLines.push(line.trim());
      }
    });

    const message = fields.get('message') || messageLines.join('\n');
    const title = fields.get('title') || 'UCU Libraries and Archives';
    if (!message) {
      return undefined;
    }

    return {
      title,
      message,
      link: this.resourceLink(fields.get('link')),
      linkText: fields.get('linktext') || 'Read more',
    };
  }

  private defaultMessage(): HeroMessage {
    return {
      title: 'UCU Libraries and Archives',
      message: 'Uganda Christian University Digital Institutional Repository preserves and shares scholarly, archival, and research outputs.',
      linkText: 'Read more',
    };
  }
}
