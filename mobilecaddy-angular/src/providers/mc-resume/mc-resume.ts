import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { LoadingController, Loading } from 'ionic-angular';
import { McUpgradeProvider } from '../../providers/mc-upgrade/mc-upgrade';
import { McLockScreenProvider } from '../../providers/mc-lock-screen/mc-lock-screen';
import { McSyncService } from '../../providers/mc-sync/mc-sync.service';
import { McConfigService } from '../../providers/mc-config/mc-config.service';

@Injectable()
export class McResumeProvider {

  // Set default options
  onResumeOptions = {
    checkPausePeriod: false,
    maxPausePeriod: 0,
    presentLockScreen: false,
    pages: []
  }

  onNavigationOptions = {
    checkPausePeriod: false,
    maxPausePeriod: 0,
    presentLockScreen: false,
    pages: []
  }

  onColdStartOptions = {
    checkPausePeriod: false,
    maxPausePeriod: 0,
    presentLockScreen: false,
    showSyncLoader: true,
    showBuildMsgs: true
  }

  upgradeOptions = {
    ignoreRepromptPeriod: false,
    maxPostpones: 5,
    noRepromptPeriod: 1000 * 60 * 5,
    popupText: []
  }

  // This provider can be called for various processing,
  PROCESS_TYPES = {
    ON_RESUME: 'onResume',
    ON_NAVIGATION: 'onNavigation',
    ON_COLD_START: 'onColdStart'
  }

  // The current processing type
  processType: string;

  private readonly PAUSE_TIME = 'pauseTime';

  constructor(
    public loadingCtrl: LoadingController,
    public mcUpgradeProvider: McUpgradeProvider,
    public mcLockScreenProvider: McLockScreenProvider,
    public mcSyncService: McSyncService,
    public mcConfig: McConfigService
  ) { }

  onResume(pageId?: string, lockScreenComponent?: any): Observable<any> {
    return this.processOptions(this.PROCESS_TYPES.ON_RESUME, pageId, lockScreenComponent);
  }

  onNavigation(pageId?: string, lockScreenComponent?: any): Observable<any> {
    return this.processOptions(this.PROCESS_TYPES.ON_NAVIGATION, pageId, lockScreenComponent);
  }

  onColdStart(lockScreenComponent?: any): Observable<any> {
    return this.processOptions(this.PROCESS_TYPES.ON_COLD_START, null, lockScreenComponent);
  }

  processOptions(processType: string, pageId?: string, lockScreenComponent?: any): Observable<any> {
    return Observable.create(observer => {
      // Override/merge config options with the class defaults
      let options = this.getOptions(processType);

      // Flag indicating whether further checks (e.g. lock screen) should be carried out
      let carryOutChecks = true;
      // Do we need to check how long the app has been paused?
      if (options.checkPausePeriod) {
        // Check whether we've exceeded the period allowed for app to be in background
        if (!this.isPausePeriodExceeded(options.maxPausePeriod)) {
          carryOutChecks = false;
        }
      }

      // Should we carry out any checks (lock screen, upgrade, sync)?
      if (carryOutChecks) {
        // See if we have any configuration for the active page
        let pageInfo = this.getPageInfo(pageId, options.pages);

        // Do we need to show the lock screen? (we must also have a component passed to us)
        if (options.presentLockScreen && lockScreenComponent) {
          // Present lock screen
          this.mcLockScreenProvider.presentLockScreen(lockScreenComponent).then(res => {
            // Check lock screen pin result
            if (res) {
              // Pin is ok.
              this.syncOrUpgrade(observer, processType, pageInfo);
            } else {
              // console.log('pin wrong / no pin found / lock screen already presented');
              observer.next(1);
            }
          });
        } else {
          // No Pin lock screen.
          this.syncOrUpgrade(observer, processType, pageInfo);
        }
      } else {
        // No checks to carry out
        observer.next(2);
      }
    });
  }

  private syncOrUpgrade(observer: any, processType: string, pageInfo: any) {
    // If cold start then we don't have a pages in it's config so we can check for upgrade staight away
    if (processType == this.PROCESS_TYPES.ON_COLD_START) {
      if (this.upgradeOptions) {
        let upgradeSubscription: Subscription = this.mcUpgradeProvider.upgrade(this.upgradeOptions).subscribe(res => {
          // We don't have any more actions for cold start.
          // User would have either said yes to upgrade, or postponed
          upgradeSubscription.unsubscribe();
          observer.next(3);
        });
      } else {
        observer.next(4);
      }
    } else {
      // resume or navigation - confirm that the active page has configuration
      if (pageInfo) {
        // Check to see if upgrade is allowed via the page config
        if (pageInfo.allowUpgrade) {
          let upgradeSubscription: Subscription = this.mcUpgradeProvider.upgrade(this.upgradeOptions).subscribe(res => {
            upgradeSubscription.unsubscribe();
            // Check result of upgrade
            if (!res) {
              // User has postponed upgrade (or it failed).
              // Now run sync point from the page config
              if (pageInfo.syncPoint) {
                this.doSync(pageInfo);
              }
              // console.log('no lock screen; upgrade postponed; page sync point: ' + pageInfo.syncPoint);
              observer.next(5);
            } else {
              // console.log('no lock screen; upgrade options for page');
              observer.next(6);
            }
          });
        } else {
          // No upgrade options, now run sync point from the page config
          if (pageInfo.syncPoint) {
            this.doSync(pageInfo);
          }
          observer.next(7);
        }
      } else {
        // No page config for active page
        observer.next(8);
      }
    }
  }

  isPausePeriodExceeded(maxPausePeriod: number): boolean {
    let pauseTime = this.getPauseTime();
    if (!pauseTime) {
      pauseTime = 0;
    }
    return parseInt(pauseTime) < (Date.now() - maxPausePeriod);
  }

  setPauseTime(pauseTime: number) {
    localStorage.setItem(this.PAUSE_TIME, pauseTime.toString());
  }

  getPauseTime(): any {
    return localStorage.getItem(this.PAUSE_TIME);
  }

  getOptions(processType: string): any {
    let options: any;
    let config = this.mcConfig.getConfig();
    // Check for any config options and merge/override the class options
    if (processType === this.PROCESS_TYPES.ON_RESUME) {
      if (config.onResume) {
        Object.assign(this.onResumeOptions, config.onResume);
      }
      options = this.onResumeOptions;
    } else if (processType === this.PROCESS_TYPES.ON_NAVIGATION) {
      if (config.onNavigation) {
        Object.assign(this.onNavigationOptions, config.onNavigation);
      }
      // console.log('onNavigationOptions',this.onNavigationOptions);
      options = this.onNavigationOptions;
    } else {
      // On cold start
      if (config.onColdStart) {
        Object.assign(this.onColdStartOptions, config.onColdStart);
      }
      // console.log('onColdStartOptions',this.onColdStartOptions);
      options = this.onColdStartOptions;
    }
    // Upgrade options
    this.setUpgradeOptions(config);
    return options;
  }

  setUpgradeOptions(config: any) {
    if (config.upgradeOptions) {
      Object.assign(this.upgradeOptions, config.upgradeOptions);
    }
  }

  private getPageInfo(pageId?: string, pages?: any): any {
    if (pageId && pages) {
      for (let page of pages) {
        if (page.id && page.id.toLowerCase() == pageId.toLowerCase()) {
          return page;
        }
      }
    }
    return null;
  }

  private doSync(pageInfo: any): void {
    let loader: Loading;
    let getSyncStateSubscription: Subscription;

    if (pageInfo.showSyncLoader) {
      // Default the text displayed when syncing
      let syncText = ['Syncing...', 'Syncing '];
      // Has any display text been passed in?
      if (pageInfo.syncText && pageInfo.syncText.constructor === Array) {
        if (pageInfo.syncText.length >= 1) {
          syncText[0] = pageInfo.syncText[0];
        }
        if (pageInfo.syncText.length == 2) {
          syncText[1] = pageInfo.syncText[1];
        }
      }
      // Create and present loader
      loader = this.loadingCtrl.create({
        content: syncText[0],
        duration: 120000
      });
      loader.present();
      // Update the loader text when syncing table
      getSyncStateSubscription = this.mcSyncService.getSyncState().subscribe(res => {
        // console.log('McResumeProvider doSync getSyncState', res);
        if (syncText[1] !== '') {
          if (res.status === 0) loader.setContent(syncText[1] + res.table);
        }
      });
    }

    this.mcSyncService.syncTables(pageInfo.syncPoint).then(res => {
      if (getSyncStateSubscription) {
        getSyncStateSubscription.unsubscribe();
      }
      if (loader) {
        loader.dismiss();
      }
    });
  }

}