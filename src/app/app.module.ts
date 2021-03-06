import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
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
import { McSyncService } from '../../mobilecaddy-angular/src/providers/mc-sync/mc-sync.service';
import { McRecentItemsService } from '../../mobilecaddy-angular/src/providers/mc-recent-items/mc-recent-items.service';
import { McSfRestService } from '../../mobilecaddy-angular/src/providers/mc-sf-rest/mc-sf-rest.service';
import { McGlobalSearchProvider } from '../../mobilecaddy-angular/src/providers/mc-global-search/mc-global-search.service';
import { TranslateAppSoupLoader } from '../../mobilecaddy-angular/src/providers/translate-appsoup-loader/translate-appsoup-loader';

// AoT requires an exported function for factories
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http);
// }
export function AppSoupLoaderFactory(http: HttpClient, file: File) {
  return new TranslateAppSoupLoader(http, file);
}

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: AppSoupLoaderFactory,
            deps: [HttpClient]
        }
    }),
    IonicModule.forRoot(MyApp),
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    McSyncService,
    McRecentItemsService,
    McSfRestService,
    McGlobalSearchProvider,
    Device,
    File
  ]
})
export class AppModule { }
