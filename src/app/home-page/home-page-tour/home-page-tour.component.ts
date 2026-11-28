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

interface TourBackdropPanel {
  top: number;
  left: number;
  width: number;
  height: number;
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
      title: 'Browse repository sections',
      description: 'Use this navigation to browse communities and collections, explore repository lists, and open statistics.',
    },
    {
      target: '[data-ucu-tour="login"]',
      title: 'Account access',
      description: 'Use these account controls to sign in, register, or access researcher login options. Available choices depend on your account.',
    },
    {
      target: '[data-ucu-tour="updates"]',
      title: 'Research impact and updates',
      description: 'Use this panel to read featured research and repository updates, and follow its links or controls to explore more.',
    },
    {
      target: '[data-ucu-tour="guidance"]',
      title: 'Repository guidance',
      description: 'Choose Deposit guidance, Data reuse, or Governance to learn about submitting work, reusing data, and repository policies.',
    },
    {
      target: '[data-ucu-tour="search"]',
      title: 'Search repository records',
      description: 'Enter keywords to find repository records. Use filters on the results page to narrow your matches.',
    },
    {
      target: '[data-ucu-tour="recent"]',
      title: 'Recently added records',
      description: 'Browse recently added records. Open an item to read its metadata and abstract and access any available files.',
    },
  ];

  isOpen = false;
  activeIndex = 0;
  cardPosition = { top: 16, left: 16 };
  secondsRemaining = 20;
  highlight = { top: 0, left: 0, width: 0, height: 0 };
  backdropPanels: TourBackdropPanel[] = [];

  private readonly storageKey = 'scholar-home-tour-seen-v1';
  private readonly maxTourDuration = 20_000;
  private readonly stepDuration = Math.floor(this.maxTourDuration / this.steps.length);
  private readonly isBrowser: boolean;
  private tourRequestSubscription?: Subscription;
  private startupTimer?: number;
  private positionTimer?: number;
  private focusTimer?: number;
  private countdownTimer?: number;
  private autoAdvanceTimer?: number;

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
        }, 400);
      }
    } catch {
      this.startupTimer = window.setTimeout(() => {
        if (this.isHomePage() && document.querySelector(this.steps[0].target)) {
          this.startTour(true);
        }
      }, 400);
    }
  }

  ngOnDestroy(): void {
    this.clearStartupTimer();
    this.clearPositionTimer();
    this.clearFocusTimer();
    this.clearCountdownTimer();
    this.clearAutoAdvanceTimer();
    this.tourRequestSubscription?.unsubscribe();
  }

  startTour(firstVisit = false): void {
    this.clearStartupTimer();
    this.clearCountdownTimer();
    this.clearAutoAdvanceTimer();
    this.isOpen = true;
    this.activeIndex = 0;
    this.secondsRemaining = Math.ceil(this.maxTourDuration / 1000);
    this.resetHighlight();
    this.countdownTimer = window.setInterval(() => {
      this.secondsRemaining = Math.max(0, this.secondsRemaining - 1);
      if (this.secondsRemaining === 0) {
        this.closeTour();
      }
    }, 1000);
    this.autoAdvanceTimer = window.setInterval(() => this.advanceAutomatically(), this.stepDuration);
    if (firstVisit) {
      this.rememberVisit();
    }
    this.showStep(0);
    this.clearFocusTimer();
    this.focusTimer = window.setTimeout(() => this.tourCard?.nativeElement.focus(), 0);
  }

  next(): void {
    if (this.activeIndex === this.steps.length - 1) {
      this.closeTour();
      return;
    }
    this.showStep(this.activeIndex + 1);
  }

  previous(): void {
    if (this.activeIndex === 0) {
      return;
    }
    this.showStep(this.activeIndex - 1);
  }

  closeTour(): void {
    this.isOpen = false;
    this.clearPositionTimer();
    this.clearFocusTimer();
    this.clearCountdownTimer();
    this.clearAutoAdvanceTimer();
    this.resetHighlight();
    this.rememberVisit();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.isOpen) {
      this.showStep(this.activeIndex, false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeTour();
    }
  }

  /** Updates the copy, counter, spotlight, and card placement as one transition. */
  private showStep(stepIndex: number, scrollToTarget = true, attempts = 0): void {
    this.clearPositionTimer();
    const target = document.querySelector<HTMLElement>(this.steps[stepIndex].target);
    if (!target) {
      if (attempts < 10) {
        this.positionTimer = window.setTimeout(() => this.showStep(stepIndex, scrollToTarget, attempts + 1), 50);
      } else {
        this.resetHighlight();
      }
      return;
    }
    if (scrollToTarget) {
      target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    }
    this.positionTimer = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        this.resetHighlight();
        return;
      }

      const padding = 8;
      const left = Math.min(window.innerWidth, Math.max(0, rect.left - padding));
      const top = Math.min(window.innerHeight, Math.max(0, rect.top - padding));
      const right = Math.min(window.innerWidth, Math.max(left, rect.right + padding));
      const bottom = Math.min(window.innerHeight, Math.max(top, rect.bottom + padding));
      this.highlight = {
        top,
        left,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
      this.backdropPanels = [
        { top: 0, left: 0, width: window.innerWidth, height: top },
        { top, left: 0, width: left, height: bottom - top },
        { top, left: right, width: window.innerWidth - right, height: bottom - top },
        { top: bottom, left: 0, width: window.innerWidth, height: window.innerHeight - bottom },
      ];
      this.activeIndex = stepIndex;
      this.placeCard(left, top, right, bottom);
    }, 0);
  }

  private placeCard(left: number, top: number, right: number, bottom: number): void {
    const cardWidth = Math.min(544, window.innerWidth - 32);
    const estimatedCardHeight = 230;
    const gap = 16;
    const canPlaceBelow = bottom + gap + estimatedCardHeight <= window.innerHeight;
    const cardTop = canPlaceBelow ? bottom + gap : Math.max(gap, top - estimatedCardHeight - gap);
    const cardLeft = Math.min(Math.max(gap, left), Math.max(gap, window.innerWidth - cardWidth - gap));
    this.cardPosition = { top: cardTop, left: cardLeft };
  }

  private advanceAutomatically(): void {
    if (!this.isOpen || this.activeIndex >= this.steps.length - 1) {
      return;
    }
    this.showStep(this.activeIndex + 1);
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

  private resetHighlight(): void {
    this.highlight = { top: 0, left: 0, width: 0, height: 0 };
    this.backdropPanels = [];
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

  private clearCountdownTimer(): void {
    if (this.countdownTimer !== undefined) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  private clearAutoAdvanceTimer(): void {
    if (this.autoAdvanceTimer !== undefined) {
      window.clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = undefined;
    }
  }
}
