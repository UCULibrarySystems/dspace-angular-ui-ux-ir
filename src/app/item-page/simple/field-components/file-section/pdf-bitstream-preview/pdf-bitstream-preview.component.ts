import { AsyncPipe } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { APP_CONFIG, AppConfig } from '@dspace/config/app-config.interface';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '@dspace/core/data/feature-authorization/feature-id';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { RESTURLCombiner } from '@dspace/core/url-combiner/rest-url-combiner';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import { map } from 'rxjs/operators';

interface PdfPreview {
  title: string;
  url: SafeResourceUrl;
}

@Component({
  selector: 'ds-pdf-bitstream-preview',
  templateUrl: './pdf-bitstream-preview.component.html',
  styleUrls: ['./pdf-bitstream-preview.component.scss'],
  imports: [
    AsyncPipe,
  ],
})
export class PdfBitstreamPreviewComponent implements OnInit {
  @Input() bitstream: Bitstream;

  preview$: Observable<PdfPreview>;

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private authorizationService: AuthorizationDataService,
    private sanitizer: DomSanitizer,
    private dsoNameService: DSONameService,
  ) {
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

        if (!canDownload || !isPdf || !contentUrl) {
          return undefined;
        }

        return {
          title: `PDF preview: ${name}`,
          url: this.sanitizer.bypassSecurityTrustResourceUrl(contentUrl),
        };
      }),
    );
  }

  private getContentUrl(): string {
    const uuid = this.bitstream?.uuid;
    if (uuid && this.appConfig.rest?.baseUrl) {
      return new RESTURLCombiner(this.appConfig.rest.baseUrl, `/core/bitstreams/${uuid}/content`).toString();
    }

    return this.bitstream?._links?.content?.href;
  }
}
