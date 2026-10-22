import { HttpClient } from '@angular/common/http';
import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { APP_CONFIG, AppConfig } from '@dspace/config/app-config.interface';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { AccessStatusObject } from '@dspace/core/shared/access-status.model';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { RESTURLCombiner } from '@dspace/core/url-combiner/rest-url-combiner';
import { TranslateModule } from '@ngx-translate/core';
import {
  getDocument,
  GlobalWorkerOptions,
  PDFDocumentLoadingTask,
} from 'pdfjs-dist';
import {
  combineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

interface PdfPreview {
  title: string;
  url?: string;
  canDownload: boolean;
  accessStatus?: AccessStatusObject;
}

@Component({
  selector: 'ds-pdf-bitstream-preview',
  templateUrl: './pdf-bitstream-preview.component.html',
  styleUrls: ['./pdf-bitstream-preview.component.scss'],
  imports: [
    AsyncPipe,
    TranslateModule,
  ],
})
export class PdfBitstreamPreviewComponent implements OnInit, OnDestroy {
  @Input() bitstream: Bitstream;

  preview$: Observable<PdfPreview | undefined>;

  isLoading = false;
  previewError = false;

  private pagesElement?: HTMLDivElement;
  private activePreview?: PdfPreview;
  private previewSubscription?: Subscription;
  private fetchSubscription?: Subscription;
  private loadingTask?: PDFDocumentLoadingTask;
  private resizeObserver?: ResizeObserver;
  private previousPagesWidth = 0;
  private renderId = 0;
  private readonly isBrowser: boolean;

  @ViewChild('pdfPages')
  set pdfPages(element: ElementRef<HTMLDivElement> | undefined) {
    this.resizeObserver?.disconnect();
    this.pagesElement = element?.nativeElement;
    if (this.pagesElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        const widthChanged = this.previousPagesWidth > 0 && Math.abs(width - this.previousPagesWidth) > 1;
        this.previousPagesWidth = width;
        if (widthChanged && this.activePreview?.url) {
          void this.loadPreview(this.activePreview);
        }
      });
      this.resizeObserver.observe(this.pagesElement);
    }
    if (this.pagesElement && this.activePreview?.url) {
      void this.loadPreview(this.activePreview);
    }
  }

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private authorizationService: AuthorizationDataService,
    private dsoNameService: DSONameService,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const format$ = this.bitstream?.format?.pipe(
      map((formatRD) => formatRD?.payload),
    ) ?? of(undefined);

    const canDownload$ = this.authorizationService.isAuthorized(
      FeatureID.CanDownload,
      this.bitstream?.self,
    );
    const accessStatus$ = this.bitstream?.accessStatus?.pipe(
      map((statusRD) => statusRD?.payload),
    ) ?? of(undefined);

    this.preview$ = combineLatest([format$, canDownload$, accessStatus$]).pipe(
      map(([format, canDownload, accessStatus]) => {
        const mimetype = format?.mimetype?.toLowerCase();
        const name = this.dsoNameService.getName(this.bitstream);
        const isPdf = mimetype === 'application/pdf' || name?.toLowerCase().endsWith('.pdf');
        const contentUrl = this.getContentUrl();

        if (!this.isBrowser || !isPdf || !contentUrl) {
          return undefined;
        }

        return {
          title: `PDF preview: ${name}`,
          url: canDownload ? contentUrl : undefined,
          canDownload,
          accessStatus,
        };
      }),
    );

    this.previewSubscription = this.preview$.pipe(
      distinctUntilChanged((previous, current) => previous?.url === current?.url),
    ).subscribe((preview) => {
      this.activePreview = preview;
      if (!preview?.url) {
        this.clearPreview();
      } else if (this.pagesElement) {
        void this.loadPreview(preview);
      }
    });
  }

  ngOnDestroy(): void {
    this.previewSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.clearPreview();
  }

  private clearPreview(): void {
    this.renderId++;
    this.fetchSubscription?.unsubscribe();
    this.fetchSubscription = undefined;
    void this.loadingTask?.destroy();
    this.loadingTask = undefined;
    this.pagesElement?.replaceChildren();
    this.isLoading = false;
  }

  private loadPreview(preview: PdfPreview): void {
    if (!preview.url) {
      return;
    }
    this.renderId++;
    const renderId = this.renderId;
    this.fetchSubscription?.unsubscribe();
    void this.loadingTask?.destroy();
    this.loadingTask = undefined;
    this.pagesElement?.replaceChildren();
    this.previewError = false;
    this.isLoading = true;

    this.fetchSubscription = this.http.get(preview.url, { responseType: 'arraybuffer' }).subscribe({
      next: (data) => void this.renderPdf(data, renderId),
      error: () => this.setPreviewError(renderId),
    });
  }

  private async renderPdf(data: ArrayBuffer, renderId: number): Promise<void> {
    try {
      GlobalWorkerOptions.workerSrc = new URL('assets/pdfjs/pdf.worker.min.mjs', document.baseURI).toString();
      this.loadingTask = getDocument({ data: new Uint8Array(data) });
      const pdf = await this.loadingTask.promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (renderId !== this.renderId || !this.pagesElement) {
          return;
        }

        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(1, this.pagesElement.clientWidth - 32);
        const scale = Math.min(3, availableWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Unable to create a PDF canvas context');
        }

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.setAttribute('aria-label', `PDF page ${pageNumber}`);

        await page.render({
          canvasContext: context,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        }).promise;

        if (renderId === this.renderId) {
          this.pagesElement.appendChild(canvas);
          this.zone.run(() => this.changeDetector.detectChanges());
        }
      }
    } catch {
      this.setPreviewError(renderId);
    } finally {
      if (renderId === this.renderId) {
        this.zone.run(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        });
      }
    }
  }

  private setPreviewError(renderId: number): void {
    if (renderId === this.renderId) {
      this.zone.run(() => {
        this.previewError = true;
        this.isLoading = false;
        this.changeDetector.detectChanges();
      });
    }
  }

  getAccessStatusTranslationKey(status: string): string {
    const normalizedStatus = status.toLowerCase().replace(/[-_]/g, '.');
    const displayStatus = normalizedStatus === 'closed' || normalizedStatus === 'closed.access'
      ? 'restricted'
      : normalizedStatus;
    return `access-status.${displayStatus}.listelement.badge`;
  }

  private getContentUrl(): string {
    // Prefer the HAL link supplied with the bitstream. It preserves the API
    // origin and path that granted access to this specific file, including
    // https://demo.dspace.org/server/api/core/bitstreams/<uuid>/content.
    const contentLink = this.bitstream?._links?.content?.href;
    if (contentLink) {
      return contentLink;
    }

    const uuid = this.bitstream?.uuid;
    if (uuid && this.appConfig.rest?.baseUrl) {
      return new RESTURLCombiner(this.appConfig.rest.baseUrl, `/core/bitstreams/${uuid}/content`).toString();
    }

    return undefined;
  }
}
