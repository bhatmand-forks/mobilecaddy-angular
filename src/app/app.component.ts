import { Component, Inject, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

// import { InitPage } from '../pages/init/init';

import { APP_CONFIG, IAppConfig } from './app.config';
import { McStartupService } from '../../mobilecaddy-angular/src/providers/mc-startup/mc-startup.service';
import { McConfigService } from '../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';

import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../../mobilecaddy-angular/src/pages/settings-page/settings-page';

// DEV STUFF
import { isDevMode } from '@angular/core';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';
import * as logger from 'mobilecaddy-utils/logger';
import * as appDataUtils from 'mobilecaddy-utils/appDataUtils';
import * as _ from 'underscore';

if (isDevMode()) {
  window['devUtils'] = devUtils;
  window['logger'] = logger;
  window['syncRefresh'] = syncRefresh;
  window['_'] = _;
}

interface menuConfItem {
  component? : any,
  icon?: string,
  id?: string,
  instanceId?: string,
  name?: string,
  order?: number,
  page?: string,
  translationKey?: string
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string; component: any }>;
  config: IAppConfig;

  private getInitStateSubscription: Subscription;
  private menuConf: Array<menuConfItem>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private configService: McConfigService,
    private mcStartupService: McStartupService,
    public translate: TranslateService,
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
    // let mergedConfig: any;

    // TODO - get config from file and merge with local config
    // mergedConfig = this.mergeConfig();

    // this.pages = mergedConfig.menuItems;

    this.mcStartupService.startup(this.appConfig);

    this.statusBar.styleDefault();
    // this.splashScreen.hide();


    // Subscribe to the initState observable so we can define our menu items once we have the config
    this.getInitStateSubscription = this.mcStartupService
      .getInitState()
      .subscribe(res => {
        let pagesSet: Boolean = false!

;
        if (res) {
          // Syncing messages check
          if (res.status === 0 && !pagesSet) {
            // Update translations
            console.log('Updating translations')
            // TODO - set langs? - MOVE into startup service
            appDataUtils.getCurrentValueFromAppSoup('locale').then(locale => {
              this.translate.use(locale);
            })

            let menuItems = [];
            // Set page components to imported components from Strings
            this.menuConf = this.buildMenuConf();
            console.log("menuConf", this.menuConf);
            this.menuConf.forEach(el => {
              if (el.name == 'Home') el.component = HomePage;
              if (el.name == 'Settings') el.component = SettingsPage;
              menuItems.push(el);
            });
            this.pages = menuItems;
            pagesSet = true;
          }
        }
      });
  }

  private mergeConfig(): any {
    this.appConfig.menuItems[0].component = HomePage;
    return this.appConfig;
  }


  private buildMenuConf(): Array<menuConfItem> {
    let allConf = this.configService.getConfig();
    console.log("allConf", allConf);
    let menuConf = allConf.Side_Menu1[0].config.Detail1[1].modules.map(el => {
      let itemConf:menuConfItem = {
        id: el.id,
        instanceId: el.config.instanceId,
        order: el.order,
        //  page: el.page,
      }
      let obj = this.getObjectById(allConf, this.getObjectById(allConf, el.id).config.instanceId);
      itemConf.name = obj.name;
      itemConf.translationKey = obj.config.General1[0].id  + ".Name";
      if (obj.config.General1[0].config) {
        itemConf.icon = obj.config.General1[0].config.icon;
      }
      if (obj.parentType) {
        // TODO This component will come an ID (at SideMenu level) that will point to a "Datablock" that will define the type of page to get to. TEMP using this parentType.
        itemConf.component = obj.parentType;
      }
      console.log("itemConf", itemConf);
      return itemConf;
    });
    return menuConf;
  }

  // Utility function to get an object from an Array/Object via an Id.
  // Also passes the parent prop back - we use this to route to the type of page
  private getObjectById(theObjects, id:string, parentType?: string) {
    var result = null;
    if(theObjects instanceof Array) {
        for(var i = 0; i < theObjects.length; i++) {
            result = this.getObjectById(theObjects[i], id, parentType);
            if (result) {
                break;
            }
        }
    }
    else
    {
        for(var prop in theObjects) {
            if(prop == 'id') {
                if(theObjects[prop] == id) {
                    theObjects.parentType = parentType;
                    return theObjects;
                }
            }
            if(theObjects[prop] instanceof Object || theObjects[prop] instanceof Array) {
                result = this.getObjectById(theObjects[prop], id, prop);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
  }
}
