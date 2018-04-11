import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// Pages
import { InitPage } from '../pages/init/init';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Components
// import { MobileCaddySyncComponentModule } from '../components/mobilecaddy-sync/mobilecaddy-sync.module';
// import { MobileCaddySyncIconComponentModule } from 'mobilecaddy-angular/sync-icon/mobilecaddy-sync-icon.module';
// import { MobileCaddyModule } from '../../dist/mobilecaddy-angular';
import { MobileCaddyModule } from '../../mobilecaddy-angular/src/lib.module';
// import { MobileCaddyModule } from '@mobilecaddy/angular';
// import { SyncIconModule } from 'mobilecaddy-angular-lib';

// Providers
import { APP_CONFIG, AppConfig } from './app.config';
// import { MobileCaddySyncService } from '../providers/mobilecaddy-sync.service';
import { MobileCaddySyncService } from '../../mobilecaddy-angular/src/mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@NgModule({
  declarations: [MyApp, InitPage, HomePage, ListPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    // MobileCaddySyncComponentModule,
    // SyncIconModule
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, InitPage, HomePage, ListPage],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    MobileCaddySyncService
  ]
})
export class AppModule {}
