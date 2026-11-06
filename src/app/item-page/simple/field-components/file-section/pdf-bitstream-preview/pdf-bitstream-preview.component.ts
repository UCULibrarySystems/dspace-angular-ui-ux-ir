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
import { FileService } from '@dspace/core/shared/file.service';
import { RESTURLCombiner } from '@dspace/core/url-combiner/rest-url-combiner';
import { TranslateModule } from '@ngx-translate/core';
import {
  getDocument,
  GlobalWorkerOptions,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
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
  switchMap,
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
  currentPageNumber = 1;
  totalPages = 0;

  private pagesElement?: HTMLDivElement;
  private activePreview?: PdfPreview;
  private previewSubscription?: Subscription;
  private loadingTask?: PDFDocumentLoadingTask;
  private pdfDocument?: PDFDocumentProxy;
  private pageRenderTask?: RenderTask;
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
        if (widthChanged && this.pdfDocument && width > 0) {
          this.rerenderCurrentPage();
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
    private fileService: FileService,
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
      switchMap(([format, canDownload, accessStatus]) => {
        const mimetype = format?.mimetype?.toLowerCase();
        const name = this.dsoNameService.getName(this.bitstream);
        const isPdf = mimetype === 'application/pdf' || name?.toLowerCase().endsWith('.pdf');
        const contentUrl = this.getContentUrl();

        if (!this.isBrowser || !isPdf || !contentUrl) {
          return of(undefined);
        }

        const preview: PdfPreview = {
          title: `PDF preview: ${name}`,
          url: undefined,
          canDownload,
          accessStatus,
        };

        if (!canDownload) {
          return of(preview);
        }

        // Use DSpace's short-lived link for authenticated files; PDF.js can then
        // make range requests directly to the configured REST server.
        return this.fileService.retrieveFileDownloadLink(contentUrl).pipe(
          map((url) => ({ ...preview, url })),
        );
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
    void this.loadingTask?.destroy();
    this.loadingTask = undefined;
    this.pageRenderTask?.cancel();
    this.pageRenderTask = undefined;
    this.pdfDocument = undefined;
    this.pagesElement?.replaceChildren();
    this.isLoading = false;
    this.currentPageNumber = 1;
    this.totalPages = 0;
  }

  private async loadPreview(preview: PdfPreview): Promise<void> {
    if (!preview.url) {
      return;
    }
    this.renderId++;
    const renderId = this.renderId;
    void this.loadingTask?.destroy();
    this.loadingTask = undefined;
    this.pageRenderTask?.cancel();
    this.pageRenderTask = undefined;
    this.pdfDocument = undefined;
    this.totalPages = 0;
    this.pagesElement?.replaceChildren();
    this.previewError = false;
    this.isLoading = true;

    await this.renderPdf(preview.url, renderId);
  }

  private async renderPdf(url: string, renderId: number): Promise<void> {
    try {
      GlobalWorkerOptions.workerSrc = new URL('assets/pdfjs/pdf.worker.min.mjs', document.baseURI).toString();
      this.loadingTask = getDocument({
        url,
        withCredentials: false,
        disableRange: false,
        disableStream: true,
        disableAutoFetch: true,
        rangeChunkSize: 65536,
      });
      this.pdfDocument = await this.loadingTask.promise;
      this.totalPages = this.pdfDocument.numPages;
      this.currentPageNumber = Math.min(this.currentPageNumber, this.totalPages);
      if (renderId === this.renderId) {
        await this.renderPage(this.currentPageNumber, renderId);
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

  changePage(offset: number): void {
    const nextPage = this.currentPageNumber + offset;
    if (!this.pdfDocument || nextPage < 1 || nextPage > this.totalPages) {
      return;
    }

    this.currentPageNumber = nextPage;
    this.renderId++;
    this.pageRenderTask?.cancel();
    this.pageRenderTask = undefined;
    this.pagesElement?.replaceChildren();
    this.isLoading = true;
    this.previewError = false;
    void this.renderPage(nextPage, this.renderId);
  }

  private rerenderCurrentPage(): void {
    this.renderId++;
    this.pageRenderTask?.cancel();
    this.pageRenderTask = undefined;
    this.pagesElement?.replaceChildren();
    this.isLoading = true;
    this.previewError = false;
    void this.renderPage(this.currentPageNumber, this.renderId);
  }

  private async renderPage(pageNumber: number, renderId: number): Promise<void> {
    try {
      if (!this.pdfDocument || !this.pagesElement) {
        return;
      }
      const page = await this.pdfDocument.getPage(pageNumber);
      if (renderId !== this.renderId || !this.pagesElement) {
        return;
      }

      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(1, this.pagesElement.clientWidth - 32);
      const scale = Math.min(2, availableWidth / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const deviceScale = Math.min(window.devicePixelRatio || 1, 1.5);
      const maxCanvasPixels = 8_000_000;
      const pixelScale = Math.sqrt(maxCanvasPixels / (viewport.width * viewport.height));
      const outputScale = Math.min(deviceScale, pixelScale);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Unable to create a PDF canvas context');
      }

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = 'auto';
      canvas.style.maxWidth = '100%';
      canvas.setAttribute('aria-label', `PDF page ${pageNumber}`);

      this.pageRenderTask = page.render({
        canvasContext: context,
        viewport,
        transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      });
      await this.pageRenderTask.promise;

      if (renderId === this.renderId && this.pagesElement) {
        this.pagesElement.appendChild(canvas);
      }
    } catch {
      this.setPreviewError(renderId);
    } finally {
      if (renderId === this.renderId) {
        this.pageRenderTask = undefined;
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
    // The REST API supplies this URL for the specific backend and bitstream.
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
