import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { NavController, Loading, LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
// import { mcSyncService } from '../../providers/mobilecaddy-sync.service';
import { McLockScreenProvider } from '../../../mobilecaddy-angular/src/providers/mc-lock-screen/mc-lock-screen';
import { McLockScreenComponent } from '../../../mobilecaddy-angular/src/components/mc-lock-screen/mc-lock-screen';
import { McResumeProvider } from '../../../mobilecaddy-angular/src/providers/mc-resume/mc-resume';
import { McSyncService } from '../../../mobilecaddy-angular/src/providers/mc-sync/mc-sync.service';
import { McStartupService } from '../../../mobilecaddy-angular/src/providers/mc-startup/mc-startup.service';
import { Subscription } from 'rxjs/Subscription';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import * as _ from 'underscore';

const logTag: string = 'home.ts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  readonly logTag: string = 'home.ts';
  private loader: Loading;
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

  homeImage: string = window['RESOURCE_ROOT'] + '/assets/imgs/home.png';
  titleImage: string = window['RESOURCE_ROOT'] + '/assets/imgs/brent_logo.png';
  btnTranslationKey: string = 'a0n0X00000VIm37QAD.OK_BTN';

  constructor(
    private mcStartupService: McStartupService,
    private mcSyncService: McSyncService,
    private loadingCtrl: LoadingController,
    @Inject(APP_CONFIG) private appConfig: IAppConfig,
    private navCtrl: NavController,
    private mcResumeProvider: McResumeProvider,
    private mcLockScreenProvider: McLockScreenProvider
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
          }
          // Syncing messages check
          if (res.status === 0) {
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

}
