import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MobileCaddyModule } from '../../mobilecaddy-angular/src/lib.module';

// Pages
// import { InitPage } from '../pages/init/init';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

// MobileCaddy
// import { SettingsPage } from '../../mobilecaddy-angular/src/settings-page/settings-page';
// import { MCOutboxPage } from '../../mobilecaddy-angular/src/outbox-page/outbox-page';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';

// Components
// import { GlobalSearch } from '../components/global-search/global-search.component';

// Providers
import { APP_CONFIG, AppConfig } from './app.config';
import { MobileCaddySyncService } from '../../mobilecaddy-angular/src/providers/mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { RecentItemsService } from '../../mobilecaddy-angular/src/providers/recent-items-service/recent-items-service';
import { SalesforceRestService } from '../../mobilecaddy-angular/src/providers/salesforce-rest-service/salesforce-rest-service';
import { McGlobalSearchProvider } from '../../mobilecaddy-angular/src/providers/mc-global-search/mc-global-search.service';

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    MobileCaddySyncService,
    RecentItemsService,
    SalesforceRestService,
    McGlobalSearchProvider,
    Device,
    File
  ]
})
export class AppModule {}
