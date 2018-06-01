import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './mobilecaddy-sync-icon/mobilecaddy-sync-icon.component';
import { MobileCaddySyncComponent } from './mobilecaddy-sync/mobilecaddy-sync.component';
import { OutboxComponent } from './outbox/outbox.component';
import { SettingsPage } from './settings-page/settings-page';
import { MCOutboxPage } from './outbox-page/outbox-page';

// Providers
import { MobileCaddySyncService } from './mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { RecentItemsService } from './recent-items-service/recent-items-service';
import { SalesforceRestService } from './salesforce-rest-service/salesforce-rest-service';
import { MobileCaddyConfigService } from './config-service/config.service';
import { Network } from '@ionic-native/network';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    MobileCaddySyncComponent,
    MobileCaddySyncIconComponent,
    OutboxComponent,
    SettingsPage,
    MCOutboxPage
  ],
  exports: [
    MobileCaddySyncComponent,
    MobileCaddySyncIconComponent,
    OutboxComponent,
    SettingsPage,
    MCOutboxPage
  ],
  providers: [Network]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [
        MobileCaddySyncService,
        RecentItemsService,
        MobileCaddyConfigService,
        SalesforceRestService
      ]
    };
  }
}
