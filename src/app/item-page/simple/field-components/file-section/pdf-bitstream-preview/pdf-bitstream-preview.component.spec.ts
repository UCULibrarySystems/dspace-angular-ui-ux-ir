import {
  Component,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DSONameService } from '@dspace/core/breadcrumbs/dso-name.service';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { FileService } from '@dspace/core/shared/file.service';
import { Item } from '@dspace/core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ThemedFileDownloadLinkComponent } from '../../../../../shared/file-download-link/themed-file-download-link.component';
import { PdfBitstreamPreviewComponent } from './pdf-bitstream-preview.component';

@Component({
  selector: 'ds-file-download-link',
  standalone: true,
  template: '<a [class]="cssClasses"><ng-content></ng-content></a>',
})
class MockFileDownloadLinkComponent {
  @Input() bitstream: Bitstream;
  @Input() item: Item;
  @Input() showIcon: boolean;
  @Input() showAccessStatusBadge: boolean;
  @Input() enableRequestACopy: boolean;
  @Input() cssClasses: string;
}

describe('PdfBitstreamPreviewComponent', () => {
  let fixture: ComponentFixture<PdfBitstreamPreviewComponent>;
  let component: PdfBitstreamPreviewComponent;
  const bitstream = Object.assign(new Bitstream(), {
    _links: {
      self: { href: 'https://rest.example.org/api/core/bitstreams/test' },
    },
  });
  const item = new Item();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        PdfBitstreamPreviewComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: AuthorizationDataService, useValue: { isAuthorized: () => of(true) } },
        { provide: DSONameService, useValue: { getName: () => 'document.pdf' } },
        { provide: FileService, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).overrideComponent(PdfBitstreamPreviewComponent, {
      remove: { imports: [ThemedFileDownloadLinkComponent] },
      add: { imports: [MockFileDownloadLinkComponent] },
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(PdfBitstreamPreviewComponent);
    component = fixture.componentInstance;
    component.bitstream = bitstream;
    component.item = item;
    fixture.detectChanges();
  });

  it('shows the authorized PDF download link for the displayed bitstream', () => {
    component.preview$ = of({ title: 'PDF preview: document.pdf', canDownload: true });
    fixture.detectChanges();

    const downloadLink = fixture.debugElement.query(By.directive(MockFileDownloadLinkComponent))
      .componentInstance as MockFileDownloadLinkComponent;

    expect(downloadLink.bitstream).toBe(bitstream);
    expect(downloadLink.item).toBe(item);
    expect(downloadLink.showIcon).toBeTrue();
    expect(downloadLink.showAccessStatusBadge).toBeFalse();
    expect(downloadLink.enableRequestACopy).toBeFalse();
    expect(downloadLink.cssClasses).toContain('btn');
  });

  it('does not show the download link when downloading is not authorized', () => {
    component.preview$ = of({ title: 'PDF preview: document.pdf', canDownload: false });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockFileDownloadLinkComponent))).toBeNull();
  });
});
