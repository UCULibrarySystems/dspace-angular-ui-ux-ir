import { Component } from '@angular/core';
import { AuthMethodType } from '@dspace/core/auth/models/auth.method-type';
import { TranslateModule } from '@ngx-translate/core';

import { LogInExternalProviderComponent as BaseComponent } from '../../../../../../../app/shared/log-in/methods/log-in-external-provider/log-in-external-provider.component';
import { renderAuthMethodFor } from '../../../../../../../app/shared/log-in/methods/log-in.methods-decorator';

@Component({
  selector: 'ds-log-in-external-provider',
  templateUrl: './log-in-external-provider.component.html',
  styleUrls: ['./log-in-external-provider.component.scss'],
  imports: [
    TranslateModule,
  ],
})
@renderAuthMethodFor(AuthMethodType.Orcid)
export class LogInExternalProviderComponent extends BaseComponent {
  public isOrcidLogin(): boolean {
    return this.authMethod?.authMethodType === AuthMethodType.Orcid;
  }
}
