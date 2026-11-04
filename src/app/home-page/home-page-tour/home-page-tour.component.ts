import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private startupTimer?: number;
  private advanceTimer?: number;
  private positionTimer?: number;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      if (localStorage.getItem(this.storageKey) !== 'true') {
        this.startupTimer = window.setTimeout(() => this.startTour(true), 900);
      }
    } catch {
      this.startupTimer = window.setTimeout(() => this.startTour(true), 900);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.clearStartupTimer();
  }

  startTour(firstVisit = false): void {
    this.clearStartupTimer();
    this.isOpen = true;
    this.activeIndex = 0;
    if (firstVisit) {
      this.rememberVisit();
    }
    this.showCurrentStep();
    this.scheduleAdvance();
  }

  next(): void {
    if (this.activeIndex === this.steps.length - 1) {
      this.closeTour();
      return;
    }
    this.activeIndex += 1;
    this.showCurrentStep();
    this.scheduleAdvance();
  }

  previous(): void {
    if (this.activeIndex === 0) {
      return;
    }
    this.activeIndex -= 1;
    this.showCurrentStep();
    this.scheduleAdvance();
  }

  closeTour(): void {
    this.isOpen = false;
    this.clearTimers();
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

  private showCurrentStep(scrollToTarget = true): void {
    this.clearPositionTimer();
    const target = document.querySelector<HTMLElement>(this.steps[this.activeIndex].target);
    if (!target) {
      this.highlight = { top: 8, left: 8, width: Math.max(0, window.innerWidth - 16), height: 1 };
      return;
    }
    if (scrollToTarget) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      target.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
    }
    this.positionTimer = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      this.highlight = {
        top: Math.max(4, rect.top - 6),
        left: Math.max(4, rect.left - 6),
        width: Math.min(rect.width + 12, window.innerWidth - Math.max(8, rect.left)),
        height: rect.height + 12,
      };
    }, scrollToTarget ? 350 : 0);
  }

  private scheduleAdvance(): void {
    this.clearAdvanceTimer();
    this.advanceTimer = window.setTimeout(() => this.next(), 5000);
  }

  private rememberVisit(): void {
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch {
      // Tour completion still works when browser storage is restricted.
    }
  }

  private clearTimers(): void {
    this.clearAdvanceTimer();
    this.clearPositionTimer();
  }

  private clearStartupTimer(): void {
    if (this.startupTimer !== undefined) {
      window.clearTimeout(this.startupTimer);
      this.startupTimer = undefined;
    }
  }

  private clearAdvanceTimer(): void {
    if (this.advanceTimer !== undefined) {
      window.clearTimeout(this.advanceTimer);
      this.advanceTimer = undefined;
    }
  }

  private clearPositionTimer(): void {
    if (this.positionTimer !== undefined) {
      window.clearTimeout(this.positionTimer);
      this.positionTimer = undefined;
    }
  }
}
