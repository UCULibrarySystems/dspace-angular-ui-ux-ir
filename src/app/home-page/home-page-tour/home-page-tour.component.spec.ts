import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HomePageTourComponent } from './home-page-tour.component';
import { HomePageTourService } from './home-page-tour.service';

describe('HomePageTourComponent', () => {
  let fixture: ComponentFixture<HomePageTourComponent>;

  beforeEach(async () => {
    localStorage.removeItem('scholar-home-tour-seen-v1');
    document.body.insertAdjacentHTML('beforeend', '<div data-ucu-tour="navigation"></div>');

    await TestBed.configureTestingModule({
      imports: [HomePageTourComponent],
      providers: [
        HomePageTourService,
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageTourComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('[data-ucu-tour="navigation"]')?.remove();
    localStorage.removeItem('scholar-home-tour-seen-v1');
  });

  it('automatically closes the tour after 20 seconds', fakeAsync(() => {
    fixture.componentInstance.startTour();
    fixture.detectChanges();
    expect(fixture.componentInstance.secondsRemaining).toBe(20);

    tick(5_000);
    expect(fixture.componentInstance.secondsRemaining).toBe(15);

    tick(14_999);

    expect(fixture.componentInstance.isOpen).toBeTrue();
    tick(1);
    expect(fixture.componentInstance.isOpen).toBeFalse();
    expect(fixture.componentInstance.secondsRemaining).toBe(0);
  }));

  it('positions the tour spotlight immediately without smooth scrolling', fakeAsync(() => {
    const target = document.querySelector<HTMLElement>('[data-ucu-tour="navigation"]');
    if (!target) {
      throw new Error('Expected the navigation tour target to exist.');
    }
    spyOn(target, 'getBoundingClientRect').and.returnValue(new DOMRect(100, 100, 200, 50));
    const scrollIntoView = spyOn(target, 'scrollIntoView');

    fixture.componentInstance.startTour();
    tick(0);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center', inline: 'nearest' });
    expect(fixture.componentInstance.highlight.width).toBeGreaterThan(0);
  }));
});
