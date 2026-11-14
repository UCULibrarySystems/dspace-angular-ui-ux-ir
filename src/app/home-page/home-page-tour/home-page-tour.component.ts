import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ViewChild,
} from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

import { HomePageTourService } from './home-page-tour.service';

interface TourStep {
  target: string;
  title: string;
  description: string;
}

@Component({
  selector: 'ds-home-page-tour',
  templateUrl: './home-page-tour.component.html',
  styleUrls: ['./home-page-tour.component.scss'],
})
export class HomePageTourComponent implements AfterViewInit, OnDestroy {
  readonly steps: TourStep[] = [
    {
      target: '[data-ucu-tour="navigation"]',
      title: 'Explore the repository',
      description: 'Use the main navigation to browse repository communities, collections, and research records.',
    },
    {
      target: '[data-ucu-tour="login"]',
      title: 'Choose how to sign in',
      description: 'Researchers can sign in with ORCID. Authorized reviewers and repository managers use management login.',
    },
    {
      target: '[data-ucu-tour="updates"]',
      title: 'Research impact and updates',
      description: 'Read featured UCU research updates. Use a resource link or the arrows to explore more stories.',
    },
    {
      target: '[data-ucu-tour="guidance"]',
      title: 'Guides and policies',
      description: 'Open deposit instructions, learn about data reuse, or review repository governance information.',
    },
    {
      target: '[data-ucu-tour="search"]',
      title: 'Search the collection',
      description: 'Search for publications, theses, datasets, authors, and other scholarly work held in UCUDIR.',
    },
    {
      target: '[data-ucu-tour="recent"]',
      title: 'Recently added research',
      description: 'Browse the latest items added to the repository, then open any record for its full details and files.',
    },
  ];

  isOpen = false;
  activeIndex = 0;
  highlight = { top: 0, left: 0, width: 0, height: 0 };

  private readonly storageKey = 'ucudir-home-tour-seen-v1';
  private readonly isBrowser: boolean;
  private tourRequestSubscription?: Subscription;
  private startupTimer?: number;
  private positionTimer?: number;
  private focusTimer?: number;

  @ViewChild('tourCard')
  private tourCard?: ElementRef<HTMLElement>;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private tourService: HomePageTourService,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.tourRequestSubscription = this.tourService.startRequests$.subscribe(() => this.startTour());
    try {
      if (localStorage.getItem(this.storageKey) !== 'true') {
        this.startupTimer = window.setTimeout(() => {
          if (this.isHomePage() && document.querySelector(this.steps[0].target)) {
            this.startTour(true);
          }
        }, 900);
      }
    } catch {
      this.startupTimer = window.setTimeout(() => {
        if (this.isHomePage() && document.querySelector(this.steps[0].target)) {
          this.startTour(true);
        }
      }, 900);
    }
  }

  ngOnDestroy(): void {
    this.clearStartupTimer();
    this.clearPositionTimer();
    this.clearFocusTimer();
    this.tourRequestSubscription?.unsubscribe();
  }

  startTour(firstVisit = false): void {
    this.clearStartupTimer();
    this.isOpen = true;
    this.activeIndex = 0;
    if (firstVisit) {
      this.rememberVisit();
    }
    this.showCurrentStep();
    this.clearFocusTimer();
    this.focusTimer = window.setTimeout(() => this.tourCard?.nativeElement.focus(), 0);
  }

  next(): void {
    if (this.activeIndex === this.steps.length - 1) {
      this.closeTour();
      return;
    }
    this.activeIndex += 1;
    this.showCurrentStep();
  }

  previous(): void {
    if (this.activeIndex === 0) {
      return;
    }
    this.activeIndex -= 1;
    this.showCurrentStep();
  }

  closeTour(): void {
    this.isOpen = false;
    this.clearPositionTimer();
    this.clearFocusTimer();
    this.rememberVisit();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.isOpen) {
      this.showCurrentStep(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeTour();
    }
  }

  private showCurrentStep(scrollToTarget = true, attempts = 0): void {
    this.clearPositionTimer();
    const target = document.querySelector<HTMLElement>(this.steps[this.activeIndex].target);
    if (!target) {
      if (attempts < 20) {
        this.positionTimer = window.setTimeout(() => this.showCurrentStep(scrollToTarget, attempts + 1), 100);
      } else {
        this.highlight = { top: 0, left: 0, width: 0, height: 0 };
      }
      return;
    }
    if (scrollToTarget) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      target.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
    }
    this.positionTimer = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        this.highlight = { top: 0, left: 0, width: 0, height: 0 };
        return;
      }

      const left = Math.min(Math.max(4, rect.left - 6), Math.max(4, window.innerWidth - 4));
      const top = Math.max(4, rect.top - 6);
      this.highlight = {
        top,
        left,
        width: Math.max(0, Math.min(rect.width + 12, window.innerWidth - left - 4)),
        height: Math.max(0, Math.min(rect.height + 12, window.innerHeight - top - 4)),
      };
    }, scrollToTarget ? 350 : 0);
  }

  private isHomePage(): boolean {
    const segments = this.router.parseUrl(this.router.url).root.children[PRIMARY_OUTLET]?.segments;
    return segments?.[0]?.path === 'home';
  }

  private rememberVisit(): void {
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch {
      // Tour completion still works when browser storage is restricted.
    }
  }

  private clearStartupTimer(): void {
    if (this.startupTimer !== undefined) {
      window.clearTimeout(this.startupTimer);
      this.startupTimer = undefined;
    }
  }

  private clearPositionTimer(): void {
    if (this.positionTimer !== undefined) {
      window.clearTimeout(this.positionTimer);
      this.positionTimer = undefined;
    }
  }

  private clearFocusTimer(): void {
    if (this.focusTimer !== undefined) {
      window.clearTimeout(this.focusTimer);
      this.focusTimer = undefined;
    }
  }
}
