import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomePageTourService {
  private readonly startRequests = new Subject<void>();

  readonly startRequests$ = this.startRequests.asObservable();

  requestStart(): void {
    this.startRequests.next();
  }
}
