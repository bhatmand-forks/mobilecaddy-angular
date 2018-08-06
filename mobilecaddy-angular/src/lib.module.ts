import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './components/mc-sync-icon/mc-sync-icon.component';
import { OutboxComponent } from './components/mc-outbox/mc-outbox.component';
import { GlobalSearch } from './components/mc-global-search/mc-global-search.component';

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
import { McSyncService } from './providers/mc-sync/mc-sync.service';
import { McRecentItemsService } from './providers/mc-recent-items/mc-recent-items.service';
import { SalesforceRestService } from './providers/salesforce-rest-service/salesforce-rest-service';
import { McGlobalSearchProvider } from './providers/mc-global-search/mc-global-search.service';
import { McConfigService } from './providers/mc-config/mc-config.service';
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
        McSyncService,
        McRecentItemsService,
        McConfigService,
        SalesforceRestService,
        McGlobalSearchProvider,
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
