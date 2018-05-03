import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MobileCaddyModule } from '../../mobilecaddy-angular/src/lib.module';

// Pages
import { InitPage } from '../pages/init/init';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { OutboxPage } from '../pages/outbox/outbox';
import { SettingsPage } from '../../mobilecaddy-angular/src/settings-page/settings-page';
import { MCOutboxPage } from '../../mobilecaddy-angular/src/outbox-page/outbox-page';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Components

// Providers
import { APP_CONFIG, AppConfig } from './app.config';
import { MobileCaddySyncService } from '../../mobilecaddy-angular/src/mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@NgModule({
  declarations: [MyApp, InitPage, HomePage, OutboxPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitPage,
    HomePage,
    OutboxPage,
    SettingsPage,
    MCOutboxPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    MobileCaddySyncService
  ]
})
export class AppModule {}
