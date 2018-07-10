import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './components/mobilecaddy-sync-icon/mobilecaddy-sync-icon.component';
import { OutboxComponent } from './components/outbox/outbox.component';
import { GlobalSearch } from './components/global-search/global-search.component';
import { SettingsPage } from './pages/settings-page/settings-page';
import { SettingsDevToolsPage } from './pages/settings-dev-tools-page/settings-dev-tools-page';
import { MCOutboxPage } from './pages/outbox-page/outbox-page';

// Providers
import { MobileCaddySyncService } from './mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { RecentItemsService } from './recent-items-service/recent-items-service';
import { SalesforceRestService } from './salesforce-rest-service/salesforce-rest-service';
import { GlobalSearchProvider } from './global-search-service/global-search.service';
import { MobileCaddyConfigService } from './config-service/config.service';
import { MobileCaddyStartupService } from './startup-service/startup.service';
import { Network } from '@ionic-native/network';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    SettingsPage,
    SettingsDevToolsPage,
    MCOutboxPage
  ],
  exports: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    SettingsPage,
    SettingsDevToolsPage,
    MCOutboxPage
  ],
  entryComponents: [MCOutboxPage, SettingsPage, SettingsDevToolsPage],
  providers: [Network]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [
        MobileCaddyStartupService,
        MobileCaddySyncService,
        RecentItemsService,
        MobileCaddyConfigService,
        SalesforceRestService,
        GlobalSearchProvider
      ]
    };
  }
}
