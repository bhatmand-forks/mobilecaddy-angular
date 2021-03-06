import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { MobileCaddySyncIconComponent } from './components/mc-sync-icon/mc-sync-icon.component';
import { OutboxComponent } from './components/mc-outbox/mc-outbox.component';
import { GlobalSearch } from './components/mc-global-search/mc-global-search.component';
import { McListComponent } from './components/mc-list/mc-list';
import { McTreeComponent } from './components/mc-tree/mc-tree';
import { McFormComponent } from './components/mc-form/mc-form';
import { McForm2Component } from './components/mc-form2/mc-form2';
import { McLockScreenComponent } from './components/mc-lock-screen/mc-lock-screen';
import { McOutboxIconComponent } from './components/mc-outbox-icon/mc-outbox-icon';

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
import { McMenuFormsPage } from './pages/mc-menu-forms/mc-menu-forms';
import { McFormDetailPage } from './pages/mc-form-detail/mc-form-detail';
import { McCompletedFormsPage } from './pages/mc-completed-forms/mc-completed-forms';
import { McFailuresPage } from './pages/mc-failures/mc-failures';

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
import { TranslateAppSoupLoader } from './providers/translate-appsoup-loader/translate-appsoup-loader';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  declarations: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    McListComponent,
    McTreeComponent,
    McFormComponent,
    McForm2Component,
    McLockScreenComponent,
    McOutboxIconComponent,
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
    McCompletedFormsPage,
    McFailuresPage
  ],
  exports: [
    MobileCaddySyncIconComponent,
    OutboxComponent,
    GlobalSearch,
    McListComponent,
    McTreeComponent,
    McFormComponent,
    McForm2Component,
    McLockScreenComponent,
    McOutboxIconComponent,
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
    McCompletedFormsPage,
    McFailuresPage
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
    McCompletedFormsPage,
    McFailuresPage
  ],
  providers: [Network]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [
        McStartupService,
        // McSyncService,
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
        McResumeProvider,
        TranslateAppSoupLoader
      ]
    };
  }
}
