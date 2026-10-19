import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { APP_CONFIG, AppConfig } from '@dspace/config/app-config.interface';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { AccessStatusObject } from '@dspace/core/shared/access-status.model';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { RESTURLCombiner } from '@dspace/core/url-combiner/rest-url-combiner';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  map,
} from 'rxjs/operators';

interface PdfPreview {
  title: string;
  url?: string;
  safeUrl?: SafeResourceUrl;
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
export class PdfBitstreamPreviewComponent implements OnInit {
  @Input() bitstream: Bitstream;

  preview$: Observable<PdfPreview | undefined>;

  private readonly isBrowser: boolean;

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private authorizationService: AuthorizationDataService,
    private dsoNameService: DSONameService,
    private sanitizer: DomSanitizer,
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
          safeUrl: canDownload ? this.sanitizer.bypassSecurityTrustResourceUrl(contentUrl) : undefined,
          canDownload,
          accessStatus,
        };
      }),
    );

  }

  getAccessStatusTranslationKey(status: string): string {
    const normalizedStatus = status.toLowerCase().replace(/[-_]/g, '.');
    const displayStatus = normalizedStatus === 'closed' || normalizedStatus === 'closed.access'
      ? 'restricted'
      : normalizedStatus;
    return `access-status.${displayStatus}.listelement.badge`;
  }

  private getContentUrl(): string | undefined {
    const uuid = this.bitstream?.uuid;
    if (this.bitstream?._links?.content?.href) {
      return this.bitstream._links.content.href;
    }

    if (uuid && this.appConfig.rest?.baseUrl) {
      return new RESTURLCombiner(this.appConfig.rest.baseUrl, `/core/bitstreams/${uuid}/content`).toString();
    }

    return undefined;
  }
}
