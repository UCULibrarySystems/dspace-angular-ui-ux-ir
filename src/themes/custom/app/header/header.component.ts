import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { HostWindowService } from '../../../../app/shared/host-window.service';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { MenuService } from '../../../../app/shared/menu/menu.service';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  imports: [
    AsyncPipe,
    ContextHelpToggleComponent,
    ImpersonateNavbarComponent,
    NgbDropdownModule,
    RouterLink,
    ThemedAuthNavMenuComponent,
    ThemedLangSwitchComponent,
    ThemedNavbarComponent,
    TranslateModule,
  ],
})
export class HeaderComponent extends BaseComponent implements AfterViewInit, OnDestroy, OnInit {
  public isNavBarCollapsed$: Observable<boolean>;
  public isPinned = false;
  public stickyHeaderHeight = 0;
  private headerResizeObserver?: ResizeObserver;

  @ViewChild('stickyHeader')
  stickyHeader?: ElementRef<HTMLElement>;

  constructor(
    menuService: MenuService,
    windowService: HostWindowService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    super(menuService, windowService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
  }

  ngAfterViewInit(): void {
    const header = this.stickyHeader?.nativeElement;
    if (!header || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.headerResizeObserver = new ResizeObserver(() => this.updateStickyHeaderHeight());
    this.headerResizeObserver.observe(header);
    this.updateStickyHeaderHeight();
  }

  ngOnDestroy(): void {
    this.headerResizeObserver?.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const isPinned = window.scrollY > 48;
    if (isPinned && !this.isPinned) {
      this.updateStickyHeaderHeight();
    }
    this.isPinned = isPinned;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateStickyHeaderHeight();
  }

  private updateStickyHeaderHeight(): void {
    const header = this.stickyHeader?.nativeElement;
    const height = header ? Math.ceil(header.offsetHeight) : 0;
    if (height !== this.stickyHeaderHeight) {
      this.stickyHeaderHeight = height;
      this.changeDetectorRef.markForCheck();
    }
  }
}
