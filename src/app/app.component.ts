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
    this.nav.setRoot(page.component, {target: page});
  }

  private doInitApp() {
    // let mergedConfig: any;

    // TODO - tmp stuff to populate localStorge with some recs (tbc replace dataservice)
    this.populateCodeFlowRecs();

    // TODO - get config from file and merge with local config
    // mergedConfig = this.mergeConfig();

    // this.pages = mergedConfig.menuItems;

    this.mcStartupService.startup(this.appConfig);

    this.statusBar.styleDefault();
    // this.splashScreen.hide();

    let pagesSet: Boolean = false;

    // Subscribe to the initState observable so we can define our menu items once we have the config
    this.getInitStateSubscription = this.mcStartupService
      .getInitState()
      .subscribe(res => {
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
    let menuConf = allConf.Side_Menu1[0].config.Detail1[1].blocks.map(el => {
      let itemConf:menuConfItem = {
        id: el.id,
        // instanceId: el.config.instanceId,
        translationKey: el.id  + ".Name",
        order: el.order,
        //  page: el.page,
      }
      if (el.iconConnectors) {
        itemConf.icon = this.configService.getConfigById(allConf,el.iconConnectors[0].config.blockId).config.icon;
      }
      const moduleInstanceId = (el.modules)
        ? el.modules[0].config.instanceId
        : el.dataConnectors[0].config.instanceId;
      itemConf.instanceId = moduleInstanceId;
      let obj = this.configService.getConfigById(allConf, moduleInstanceId);
      itemConf.name = obj.name;
      if (obj.parentType) {
        if ( el.dataConnectors ) {
          const dataBlock = this.configService.getConfigById(obj,  el.dataConnectors[0].config.dataBlockId);
          if ( dataBlock.groups ) {
            itemConf.component = dataBlock.groups[0].config.page;
          } else {
            itemConf.component = obj.parentType;
          }
        } else {
          itemConf.component = obj.parentType;
        }
      }
      console.log("itemConf", itemConf);
      return itemConf;
    });
    return menuConf;
  }


  populateCodeFlowRecs() {

    localStorage.setItem("forceOAuth", JSON.stringify({
      access_toked: "123"
    }))

    localStorage.setItem("a0n0X00000VK9vdQAD-List1", JSON.stringify([{"Id":"AAA111","Name":"MR12-50-S","Code__c":"code__c","Custom_Rich_Text_2k_1__c":"MR12-50-S Rover","MC_File_Image_Path__c":"0680X00000CoGBPQA3.jpg"},{"Id":"AAA111","Name":"MR12-50-S","Code__c":"LR10-20-S","Custom_Rich_Text_2k_1__c":"Standard Rover","MC_File_Image_Path__c":"0680X00000CowMvQAJ.jpg"}]));

    localStorage.setItem("a0n0X00000W24leQAB-List1", JSON.stringify(
      [{"Id":"a0k0X00001A9ACoQAN","Manual_Name__c":"JM new book"},{"Id":"a0k0X00000dvG2qQAE","Manual_Name__c":"jm test","Version_Name__c":"Autumn 19","External_Description__c":"<p>External...</p>"},{"Id":"a0k0X000019h7GdQAI","Manual_Name__c":"Jm test"},{"Id":"a0k0X000019h4guQAA","Manual_Name__c":"jm test"},{"Id":"a0k0X00000dvH7XQAU","Manual_Name__c":"jm test publish"},{"Id":"a0k0X00000dvH7DQAU","Manual_Name__c":"new j"},{"Id":"a0k0X00000dvGWVQA2","Manual_Name__c":"New Structure Test","Version_Name__c":"2.2.x EN","External_Description__c":"<p>The new external description field in the manual to allow this to be mobilised. This is the original structure manual re-built with the language and sections and SF records.</p>"},{"Id":"a0k0X00000dvGRvQAM","Manual_Name__c":"test groups"},{"Id":"a0k0X00000dvGN5QAM","Manual_Name__c":"Test manual name update","Version_Name__c":"summer 19","External_Description__c":"<ul><li>point y</li><li>point z</li></ul><ol><li>1</li><li>2</li></ol>"},{"Id":"a0k0X00000dvH73QAE","Manual_Name__c":"test publish"}]
    ));

    localStorage.setItem("a0n0X00000W1lT0QAJ-List1", JSON.stringify(
      [{"Id":"a0m0X00000lFzuaQAC","MC_File_Image_Path__c":"0680X00000E0jFmQAJ.png","Name":"MR24-10-M","Short_Description__c":"Multi tool exploration rover with communication pod"},{"Id":"a0m0X00000lFzg7QAC","MC_File_Image_Path__c":"0680X00000E0ipjQAB.png","Name":"MR12-50-S","Short_Description__c":"Communication rover for mars long duration missions"},{"Id":"a0m0X00000lFzfxQAC","MC_File_Image_Path__c":"0680X00000E0ipbQAB.png","Name":"MR06-20-S","Short_Description__c":"Mars rover wide wheel based nuclear powered for surface sampling"},{"Id":"a0m0X00000lFzfsQAC","MC_File_Image_Path__c":"0680X00000E0ipaQAB.png","Name":"LR12-50-S","Short_Description__c":"Scouting rover with solar power and collection unit"},{"Id":"a0m0X00000lFzfnQAC","MC_File_Image_Path__c":"0680X00000E0ipeQAB.png","Name":"LR12-50-N","Short_Description__c":"Lunar exploration rover with nuclear power plant and 6 rugged wheels."},{"Id":"a0m0X00000lFzfiQAC","MC_File_Image_Path__c":"0680X00000E0ipZQAR.png","Name":"LR10-20-S","Short_Description__c":"Nuclear powered 6 wheeled rover for lunar exploration"},{"Id":"a0m0X00000lFzfdQAC","MC_File_Image_Path__c":"0680X00000E0ipUQAR.png","Name":"LR06-50-S","Short_Description__c":"Solar powered 6 wheeled rover for lunar exploration"},{"Id":"a0m0X00000lFzfEQAS","MC_File_Image_Path__c":"0680X00000E0imkQAB.png","Name":"LR-06-20-S","Short_Description__c":"6 wheeled exploratory Lunar Rover ."}]
    ));


    localStorage.setItem("a0n0X00000W24leQAB-Tree1", JSON.stringify(
      [{"Id":"a0k0X00000dvG2qQAE","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvG35QAE\",\"disabled\":false,\"expanded\":true,\"items\":[{\"type\":\"section\",\"recId\":\"a0k0X00000dvG3ZQAU\",\"label\":\"s1\",\"name\":\"2\",\"expanded\":true,\"disabled\":false,\"items\":[{\"type\":\"article\",\"recId\":\"a0k0X00000dvG3eQAE\",\"label\":\"a1\",\"name\":\"3\",\"expanded\":false,\"disabled\":false,\"items\":[]}],\"metatext\":\"(Section)\"},{\"type\":\"section\",\"recId\":\"a0k0X00000dvG3tQAE\",\"label\":\"s2\",\"name\":\"4\",\"expanded\":false,\"disabled\":false,\"items\":[],\"metatext\":\"(Section)\"},{\"type\":\"direct_self_serve\",\"recId\":\"a0k0X00000dvGDeQAM\",\"label\":\"direct\",\"name\":\"5\",\"expanded\":false,\"disabled\":false,\"items\":[]}]}]"},{"Id":"a0k0X00000dvGN5QAM","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvGN6QAM\",\"disabled\":false,\"expanded\":true,\"items\":[{\"type\":\"section\",\"recId\":\"a0k0X00000dvGNAQA2\",\"label\":\"s1\",\"name\":\"6\",\"expanded\":false,\"disabled\":false,\"items\":[],\"metatext\":\"(Section)\"},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGNFQA2\",\"label\":\"\",\"name\":\"7\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGOXQA2\",\"label\":\"a1\",\"name\":\"8\",\"expanded\":false,\"disabled\":false,\"items\":[]}]}]"},{"Id":"a0k0X00000dvGRvQAM","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvGS0QAM\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X00000dvGWVQA2","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvGWZQA2\",\"disabled\":false,\"expanded\":true,\"items\":[{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWbQAM\",\"label\":\"Introduction\",\"name\":\"2\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWWQA2\",\"label\":\"About this Manual\",\"name\":\"3\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"section\",\"recId\":\"a0k0X00000dvGWcQAM\",\"label\":\"Safety Messages\",\"name\":\"4\",\"expanded\":true,\"disabled\":false,\"items\":[{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWaQAM\",\"label\":\"Safety Messages Overview\",\"name\":\"5\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWMQA2\",\"label\":\"Danger Messages\",\"name\":\"6\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWYQA2\",\"label\":\"Warning Messages\",\"name\":\"7\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWNQA2\",\"label\":\"Caution Messages\",\"name\":\"9\",\"expanded\":false,\"disabled\":false,\"items\":[]}],\"metatext\":\"(Section)\"},{\"type\":\"section\",\"recId\":\"a0k0X00000dvGWOQA2\",\"label\":\"Operation Controls\",\"name\":\"10\",\"expanded\":true,\"disabled\":false,\"items\":[{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWRQA2\",\"label\":\"Main Panel - Top\",\"name\":\"11\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWPQA2\",\"label\":\"Main Panel - Side\",\"name\":\"12\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGWSQA2\",\"label\":\"Side Panel\",\"name\":\"13\",\"expanded\":false,\"disabled\":false,\"items\":[]}],\"metatext\":\"(Section)\"},{\"type\":\"section\",\"recId\":\"a0k0X00000dvGWQQA2\",\"label\":\"Test Section for Direct Fragments\",\"name\":\"14\",\"expanded\":true,\"disabled\":false,\"items\":[{\"type\":\"direct_self_serve\",\"recId\":\"a0k0X00000dvGXAQA2\",\"label\":\"Direct Connection to Fragment\",\"name\":\"22\",\"expanded\":false,\"disabled\":false,\"items\":[]},{\"type\":\"article\",\"recId\":\"a0k0X00000dvGXBQA2\",\"label\":\"Test Article with Fragment\",\"name\":\"23\",\"expanded\":false,\"disabled\":false,\"items\":[]}],\"metatext\":\"(Section)\"}]}]"},{"Id":"a0k0X00000dvH73QAE","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvH78QAE\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X00000dvH7DQAU","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvH7IQAU\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X00000dvH7XQAU","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00000dvH7cQAE\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X000019h4guQAA","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X000019h4gtQAA\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X000019h7GdQAI","Tree_Structure__c":"[{\"label\":\"COLLECTION\",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X000019h7GcQAI\",\"disabled\":false,\"expanded\":true,\"items\":[]}]"},{"Id":"a0k0X00001A9ACoQAN","Tree_Structure__c":"[{\"label\":\"BOOK \",\"name\":\"1\",\"type\":\"section\",\"recId\":\"a0k0X00001A9ACnQAN\",\"disabled\":false,\"expanded\":true,\"items\":[{\"type\":\"article\",\"recId\":\"a0k0X00001AITsMQAX\",\"label\":\"a \",\"name\":\"6\",\"expanded\":true,\"disabled\":false,\"items\":[]}]}]"}]
    ));
  }
}
