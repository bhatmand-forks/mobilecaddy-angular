import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './components/mobilecaddy-sync-icon/mobilecaddy-sync-icon.component';
import { OutboxComponent } from './components/outbox/outbox.component';
import { GlobalSearch } from './components/global-search/global-search.component';

// Pages
import { SettingsPage } from './pages/settings-page/settings-page';
import { SettingsDevToolsPage } from './pages/settings-dev-tools-page/settings-dev-tools-page';
import { McDiagnosticsPage } from './pages/diagnostics-page/diagnostics-page';
import { SettingsMtiTableRecordPage } from './pages/settings-mti-table-record/settings-mti-table-record';
import { SettingsMtiDetailPage } from './pages/settings-mti-detail/settings-mti-detail';
import { SettingsMtiPage } from './pages/settings-mti/settings-mti-page';
import { SettingsRawViewPage } from './pages/settings-raw-view/settings-raw-view';
import { SettingsRawViewModalPage } from './pages/settings-raw-view-modal/settings-raw-view-modal';
import { MCOutboxPage } from './pages/outbox-page/outbox-page';

// Providers
import { MobileCaddySyncService } from './providers/mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { RecentItemsService } from './providers/recent-items-service/recent-items-service';
import { SalesforceRestService } from './providers/salesforce-rest-service/salesforce-rest-service';
import { GlobalSearchProvider } from './providers/global-search-service/global-search.service';
import { MobileCaddyConfigService } from './providers/config-service/config.service';
import { MobileCaddyStartupService } from './providers/startup-service/startup.service';
import { McPinChallengeProvider } from './providers/mc-pin-challenge/mc-pin-challenge';
import { McLoadingProvider } from './providers/mc-loading/mc-loading';
import { McSettingsProvider } from './providers/mc-settings/mc-settings';
import { McUpgradeProvider } from './providers/mc-upgrade/mc-upgrade';
import { McRecoveryProvider } from './providers/mc-recovery/mc-recovery';
import { McDiagnosticsProvider } from './providers/mc-diagnostics/mc-diagnostics';
import { Network } from '@ionic-native/network';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    SettingsPage,
    SettingsDevToolsPage,
    McDiagnosticsPage,
    SettingsMtiPage,
    SettingsMtiTableRecordPage,
    SettingsMtiDetailPage,
    SettingsRawViewPage,
    SettingsRawViewModalPage,
    MCOutboxPage
  ],
  exports: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    SettingsPage,
    SettingsDevToolsPage,
    McDiagnosticsPage,
    SettingsMtiPage,
    SettingsMtiTableRecordPage,
    SettingsMtiDetailPage,
    SettingsRawViewPage,
    SettingsRawViewModalPage,
    MCOutboxPage
  ],
  entryComponents: [
    MCOutboxPage,
    SettingsPage,
    SettingsDevToolsPage,
    SettingsMtiPage,
    SettingsMtiTableRecordPage,
    SettingsMtiDetailPage,
    SettingsRawViewPage,
    SettingsRawViewModalPage,
    McDiagnosticsPage
  ],
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
        GlobalSearchProvider,
        McPinChallengeProvider,
        McLoadingProvider,
        McSettingsProvider,
        McUpgradeProvider,
        McRecoveryProvider,
        McDiagnosticsProvider
      ]
    };
  }
}
