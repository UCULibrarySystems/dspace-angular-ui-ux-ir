import {
  AsyncPipe,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  ItemCountState,
  ScopedItemCountService,
} from './scoped-item-count.service';

@Component({
  selector: 'ds-scoped-item-count',
  templateUrl: './scoped-item-count.component.html',
  styleUrls: ['./scoped-item-count.component.scss'],
  imports: [
    AsyncPipe,
    DecimalPipe,
  ],
})
export class ScopedItemCountComponent implements OnChanges {
  @Input() scopeId?: string;
  @Input() archivedItemsCount?: number;

  itemCount$: Observable<ItemCountState> = of({ status: 'loading' });

  constructor(private readonly itemCountService: ScopedItemCountService) {}

  ngOnChanges(): void {
    if (typeof this.archivedItemsCount === 'number' && this.archivedItemsCount >= 0) {
      this.itemCount$ = of({ status: 'success', count: this.archivedItemsCount });
    } else if (this.scopeId) {
      this.itemCount$ = this.itemCountService.getItemCount(this.scopeId);
    } else {
      this.itemCount$ = of({ status: 'unavailable' });
    }
  }
}
