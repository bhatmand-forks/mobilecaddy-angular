import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { NavController, Loading, LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
// import { mcSyncService } from '../../providers/mobilecaddy-sync.service';
import { McLockScreenProvider } from '../../../mobilecaddy-angular/src/providers/mc-lock-screen/mc-lock-screen';
import { McLockScreenComponent } from '../../../mobilecaddy-angular/src/components/mc-lock-screen/mc-lock-screen';
import { McResumeProvider } from '../../../mobilecaddy-angular/src/providers/mc-resume/mc-resume';
import { McSyncService } from '../../../mobilecaddy-angular/src/providers/mc-sync/mc-sync.service';
import { McStartupService } from '../../../mobilecaddy-angular/src/providers/mc-startup/mc-startup.service';
import { McConfigService } from '../../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';
import { Subscription } from 'rxjs/Subscription';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import * as _ from 'underscore';
import * as fileUtils from 'mobilecaddy-utils/fileUtils';
import { DomSanitizer } from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

const logTag: string = 'home.ts';

interface buttonGridItem {
  component? : any,
  icon?: string,
  id?: string,
  instanceId?: string,
  name?: string,
  order?: number,
  page?: string,
  translationKey?: string,
  label?: string
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  readonly logTag: string = 'home.ts';
  private loader: Loading;
  private activated: boolean  = false
  // So we can unsubscribe subscriptions on destroy
  private getInitialSyncStateSubscription: Subscription;
  private getInitStateSubscription: Subscription;
  private onNavigationSubscription: Subscription;
  private onColdStartSubscription: Subscription;
  // mcStartupService.startup status
  private runState = {
    InitialSync: 0,
    ColdStart: 1,
    Running: 2
  };
  private startupStatus;

  homeImage: any;
  titleImage: any;
  btnTranslationKey: string = 'a0n0X00000VIm37QAD.OK_BTN';
  buttonGridItems:Array<Array<buttonGridItem>>;

  constructor(
    private mcStartupService: McStartupService,
    private mcSyncService: McSyncService,
    private loadingCtrl: LoadingController,
    @Inject(APP_CONFIG) private appConfig: IAppConfig,
    private navCtrl: NavController,
    private mcResumeProvider: McResumeProvider,
    private mcLockScreenProvider: McLockScreenProvider,
    private configService: McConfigService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Subscribe to initial sync state
    this.getInitialSyncStateSubscription = this.mcSyncService
      .getInitialSyncState()
      .subscribe(initialSyncState => {
        // console.log(this.logTag, 'initialSyncState', initialSyncState);
        // If the initialSync is NOT completed then display message
        if (initialSyncState !== 'InitialLoadComplete') {
          this.setLoadingMsg('Preparing data...');
        }
      });

    // Subscribe to the observable so we can update our loader
    this.getInitStateSubscription = this.mcStartupService
      .getInitState()
      .subscribe(res => {
        // console.log(this.logTag, 'getInitState', res);
        if (res) {
          // Build messages check
          if (res.status === -1) {
            if (this.startupStatus === this.runState.ColdStart) {
              if (this.appConfig.onColdStart.showBuildMsgs) {
                this.setLoadingMsg(res.info);
              }
            } else {
              this.setLoadingMsg(res.info);
            }
          } else {

          }
          // Syncing messages check
          if (res.status === 0) {
            this.activate();
            if (this.startupStatus === this.runState.ColdStart) {
              if (this.appConfig.onColdStart.showSyncLoader) {
                this.setLoadingMsg('Syncing ' + res.table);
              }
            } else if (this.startupStatus === this.runState.Running) {
              // this.setLoadingMsg('Syncing ' + res.table);
            } else {
              this.setLoadingMsg('Syncing ' + res.table);
            }
          }
          // Sync complete check
          if (res === 'complete') {
            if (this.loader) {
              this.loader.dismiss();
              this.loader = null;
            }
          }
        }
      });

    // REMOVED THIS AS IT GETS IN THE WAY OF LOCAL TESTING
    // Do we need to capture the screen lock pin?
    // this.mcLockScreenProvider.getCode().then(code => {
    //   if (!code) {
    //     // No => implies first time into page on initial install
    //     this.mcLockScreenProvider.setupLockScreenCode().then(res => {
    //       // console.log(this.logTag, 'setupLockScreenCode res',res);
    //     });
    //   }
    // });

    // On navigation / on cold start
    if (this.startupStatus === this.runState.Running) {
      // What do we want to do on navigation to this page?
      this.onNavigationSubscription = this.mcResumeProvider
        .onNavigation(this.logTag)
        .subscribe(res => {
          // console.log(this.logTag, 'mcResumeProvider.onNavigation res', res);
        });
    } else if (this.startupStatus === this.runState.ColdStart) {
      // What do we want to do on cold start?
      this.onColdStartSubscription = this.mcResumeProvider
        .onColdStart(McLockScreenComponent)
        .subscribe(res => {
          // console.log(this.logTag, 'mcResumeProvider.onColdStart res', res);
        });
    }


  }

  activate(){
    if (!this.activated) {
      // Set header image
      const homeModuleConf = this.configService.getConfig('App_Page1')[0];
      const headerImageConf = homeModuleConf.config.Detail1[0].media[0].config;
      fileUtils
      .readAsDataURL(headerImageConf.cv + '.png')
      .then(res => {
        console.log('readAsDataURL res: ' + res);
        this.titleImage = this.sanitizer.bypassSecurityTrustUrl(res);
      })
      .catch(err => {
        console.error('readAsDataURL err', err);
        // logger.error('Error', err);
      });

      this.buttonGridItems = this.getButtonGridItems(homeModuleConf.config.Detail1[1].blocks);
      console.log("this.buttonGridItems", this.buttonGridItems);

      // TEMP - Create custom styles and add to doc.
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.home-button-custom { background-color: red; }';
      document.getElementsByTagName('head')[0].appendChild(style);

      this.activated = true;
    }
  }

  ngOnDestroy() {
    this.getInitialSyncStateSubscription.unsubscribe();
    this.getInitStateSubscription.unsubscribe();
    if (this.onNavigationSubscription) {
      this.onNavigationSubscription.unsubscribe();
    }
    if (this.onColdStartSubscription) {
      this.onColdStartSubscription.unsubscribe();
    }
  }

  setLoadingMsg(msg: string) {
    if (!this.loader) {
      this.loader = this.loadingCtrl.create({
        content: msg,
        duration: 120000
      });
      this.loader.present();
    } else {
      this.loader.setContent(msg);
    }
  }

  getButtonGridItems(config){
    const allConf = this.configService.getConfig();

    const buttonGridItemsPerRow:number = 2;
    let buttonGridItems = [];
    let buttonGridRow = [];
    config.forEach(el => {
      let itemConf:buttonGridItem = {
        id: el.id,
        // instanceId: el.config.instanceId,
        translationKey: el.id  + ".Name",
        order: el.order,
        label: null
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
      buttonGridRow.push(itemConf);
      if (buttonGridRow.length == buttonGridItemsPerRow) {
        buttonGridItems.push(buttonGridRow);
        buttonGridRow = [];
      }
    });
    console.log("buttonGridItems", buttonGridItems);
    return buttonGridItems;
  }


}
