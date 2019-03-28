import { Component, Inject, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// import { InitPage } from '../pages/init/init';

import { APP_CONFIG, IAppConfig } from './app.config';
import { McStartupService } from '../../mobilecaddy-angular/src/providers/mc-startup/mc-startup.service';

import { HomePage } from '../pages/home/home';

// DEV STUFF
import { isDevMode } from '@angular/core';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

if (isDevMode()) {
  window['devUtils'] = devUtils;
  window['logger'] = logger;
  window['syncRefresh'] = syncRefresh;
  window['_'] = _;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string; component: any }>;
  config: IAppConfig;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private mcStartupService: McStartupService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig
  ) {
    this.initializeApp();
  }

  initializeApp() {
    if (
      location.hostname == 'localhost' ||
      !navigator.appVersion.includes('obile')
    ) {
      // Running in CodeFlow - so no platform.ready()
      this.doInitApp();
    } else {
      this.platform.ready().then(() => {
        this.doInitApp();
      });
    }
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  private doInitApp() {
    let mergedConfig: any;

    // TODO - get config from file and merge with local config
    mergedConfig = this.mergeConfig();

    this.pages = mergedConfig.menuItems;

    this.mcStartupService.startup(mergedConfig);

    this.statusBar.styleDefault();
    // this.splashScreen.hide();
  }

  private mergeConfig(): any {
    this.appConfig.menuItems[0].component = HomePage;
    return this.appConfig;
  }
}
