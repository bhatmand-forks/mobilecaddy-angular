import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './components/mc-sync-icon/mc-sync-icon.component';
import { OutboxComponent } from './components/mc-outbox/mc-outbox.component';
import { GlobalSearch } from './components/mc-global-search/mc-global-search.component';
import { McListComponent } from './components/mc-list/mc-list';
import { McFormComponent } from './components/mc-form/mc-form';
import { McLockScreenComponent } from './components/mc-lock-screen/mc-lock-screen';

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
import { McMenuFormsPage } from './pages/mc-menu-forms/mc-menu-forms'
import { McFormDetailPage } from './pages/mc-form-detail/mc-form-detail'
import { McCompletedFormsPage } from './pages/mc-completed-forms/mc-completed-forms'

// Providers
import { McSyncService } from './providers/mc-sync/mc-sync.service';
import { McRecentItemsService } from './providers/mc-recent-items/mc-recent-items.service';
import { McSfRestService } from './providers/mc-sf-rest/mc-sf-rest.service';
import { McGlobalSearchProvider } from './providers/mc-global-search/mc-global-search.service';
import { McConfigService } from './providers/mc-config/mc-config.service';
import { McStartupService } from './providers/mc-startup/mc-startup.service';
import { McPinChallengeProvider } from './providers/mc-pin-challenge/mc-pin-challenge';
import { McLoadingProvider } from './providers/mc-loading/mc-loading';
import { McSettingsProvider } from './providers/mc-settings/mc-settings';
import { McUpgradeProvider } from './providers/mc-upgrade/mc-upgrade';
import { McRecoveryProvider } from './providers/mc-recovery/mc-recovery';
import { McDiagnosticsProvider } from './providers/mc-diagnostics/mc-diagnostics';
import { McDataProvider } from './providers/mc-data/mc-data';
import { McFormProvider } from './providers/mc-form/mc-form';
import { McLockScreenProvider } from './providers/mc-lock-screen/mc-lock-screen';
import { McResumeProvider } from './providers/mc-resume/mc-resume';
import { Network } from '@ionic-native/network';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    McListComponent,
    McFormComponent,
    McLockScreenComponent,
    SettingsPage,
    SettingsDevToolsPage,
    McDiagnosticsPage,
    SettingsMtiPage,
    SettingsMtiTableRecordPage,
    SettingsMtiDetailPage,
    SettingsRawViewPage,
    SettingsRawViewModalPage,
    MCOutboxPage,
    McMenuFormsPage,
    McFormDetailPage,
    McCompletedFormsPage
  ],
  exports: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    McListComponent,
    McFormComponent,
    McLockScreenComponent,
    SettingsPage,
    SettingsDevToolsPage,
    McDiagnosticsPage,
    SettingsMtiPage,
    SettingsMtiTableRecordPage,
    SettingsMtiDetailPage,
    SettingsRawViewPage,
    SettingsRawViewModalPage,
    MCOutboxPage,
    McMenuFormsPage,
    McFormDetailPage,
    McCompletedFormsPage
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
    McDiagnosticsPage,
    McLockScreenComponent,
    McMenuFormsPage,
    McFormDetailPage,
    McCompletedFormsPage
  ],
  providers: [Network]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [
        McStartupService,
        McSyncService,
        McRecentItemsService,
        McConfigService,
        McSfRestService,
        McGlobalSearchProvider,
        McPinChallengeProvider,
        McLoadingProvider,
        McSettingsProvider,
        McUpgradeProvider,
        McRecoveryProvider,
        McDiagnosticsProvider,
        McDataProvider,
        McFormProvider,
        McLockScreenProvider,
        McResumeProvider
      ]
    };
  }
}
