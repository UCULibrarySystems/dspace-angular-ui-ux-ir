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
    localStorage.removeItem('ucudir-home-tour-seen-v1');
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
    localStorage.removeItem('ucudir-home-tour-seen-v1');
  });

  it('keeps the active step until the user chooses to continue', fakeAsync(() => {
    fixture.componentInstance.startTour();
    fixture.detectChanges();
    tick(6000);

    expect(fixture.componentInstance.isOpen).toBeTrue();
    expect(fixture.componentInstance.activeIndex).toBe(0);

    fixture.componentInstance.next();
    expect(fixture.componentInstance.activeIndex).toBe(1);
  }));
});
