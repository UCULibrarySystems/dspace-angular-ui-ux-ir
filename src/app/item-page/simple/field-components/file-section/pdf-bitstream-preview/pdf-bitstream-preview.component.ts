import { HttpClient } from '@angular/common/http';
import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { APP_CONFIG, AppConfig } from '@dspace/config/app-config.interface';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { RESTURLCombiner } from '@dspace/core/url-combiner/rest-url-combiner';
import { TranslateModule } from '@ngx-translate/core';
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
  url: string;
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

  preview$: Observable<PdfPreview>;

  isLoading = false;
  previewError = false;

  private pagesElement?: HTMLDivElement;
  private activePreview?: PdfPreview;
  private previewSubscription?: Subscription;
  private fetchSubscription?: Subscription;
  private loadingTask?: import('pdfjs-dist/types/src/display/api').PDFDocumentLoadingTask;
  private renderId = 0;
  private readonly isBrowser: boolean;

  @ViewChild('pdfPages')
  set pdfPages(element: ElementRef<HTMLDivElement> | undefined) {
    this.pagesElement = element?.nativeElement;
    if (this.pagesElement && this.activePreview) {
      void this.loadPreview(this.activePreview);
    }
  }

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private authorizationService: AuthorizationDataService,
    private dsoNameService: DSONameService,
    private http: HttpClient,
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

    this.preview$ = combineLatest([format$, canDownload$]).pipe(
      map(([format, canDownload]) => {
        const mimetype = format?.mimetype?.toLowerCase();
        const name = this.dsoNameService.getName(this.bitstream);
        const isPdf = mimetype === 'application/pdf' || name?.toLowerCase().endsWith('.pdf');
        const contentUrl = this.getContentUrl();

        if (!this.isBrowser || !canDownload || !isPdf || !contentUrl) {
          return undefined;
        }

        return {
          title: `PDF preview: ${name}`,
          url: contentUrl,
        };
      }),
    );

    this.previewSubscription = this.preview$.pipe(
      distinctUntilChanged((previous, current) => previous?.url === current?.url),
    ).subscribe((preview) => {
      this.activePreview = preview;
      if (!preview) {
        this.clearPreview();
      } else if (this.pagesElement) {
        void this.loadPreview(preview);
      }
    });
  }

  ngOnDestroy(): void {
    this.previewSubscription?.unsubscribe();
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
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('assets/pdfjs/pdf.worker.min.mjs', document.baseURI).toString();
      this.loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
      const pdf = await this.loadingTask.promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (renderId !== this.renderId || !this.pagesElement) {
          return;
        }

        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, (this.pagesElement.clientWidth || baseViewport.width) / baseViewport.width);
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
        }
      }
    } catch {
      this.setPreviewError(renderId);
    } finally {
      if (renderId === this.renderId) {
        this.isLoading = false;
      }
    }
  }

  private setPreviewError(renderId: number): void {
    if (renderId === this.renderId) {
      this.previewError = true;
      this.isLoading = false;
    }
  }

  private getContentUrl(): string {
    const uuid = this.bitstream?.uuid;
    if (uuid && this.appConfig.rest?.baseUrl) {
      return new RESTURLCombiner(this.appConfig.rest.baseUrl, `/core/bitstreams/${uuid}/content`).toString();
    }

    return this.bitstream?._links?.content?.href;
  }
}
