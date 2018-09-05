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

  // Options used by processOptions function - these will be either 'onResume', 'onNavigation' or 'onColdStart'
  options: any;

  ON_RESUME = 'onResume';
  ON_NAVIGATION = 'onNavigation';
  ON_COLD_START = 'onColdStart';
  private readonly PAUSE_TIME = 'pauseTime';

  constructor(
    public loadingCtrl: LoadingController,
    public mcUpgradeProvider: McUpgradeProvider,
    public mcLockScreenProvider: McLockScreenProvider,
    public mcSyncService: McSyncService,
    public mcConfig: McConfigService
  ) { }

  onResume(pageId?: string, lockScreenComponent?: any): Observable<any> {
    // Override/merge config options with the class defaults
    this.setOptions(this.ON_RESUME);
    // Process the options
    return this.processOptions(pageId, lockScreenComponent);
  }

  onNavigation(pageId?: string, lockScreenComponent?: any): Observable<any> {
    // Override/merge config options with the class defaults
    this.setOptions(this.ON_NAVIGATION);
    // Process the options
    return this.processOptions(pageId, lockScreenComponent);
  }

  onColdStart(lockScreenComponent?: any): Observable<any> {
    // Override/merge config options with the class defaults
    this.setOptions(this.ON_COLD_START);
    // Process the options
    return this.processOptions(null, lockScreenComponent);
  }

  processOptions(pageId?: string, lockScreenComponent?: any): Observable<any> {
    return Observable.create(observer => {
      // Flag indicating whether further checks (e.g. lock screen) should be carried out
      let carryOutChecks = true;
      // Do we need to check how long the app has been paused?
      if (this.options.checkPausePeriod) {
        // Check whether we've exceeded the period allowed for app to be in background
        if (!this.isPausePeriodExceeded()) {
          carryOutChecks = false;
        }
      }

      // Should we carry out any checks (lock screen, upgrade, sync)?
      if (carryOutChecks) {
        // See if we have any upgrade or sync point info associated with the pageId passed in
        let pageInfo = this.getPageInfo(pageId, this.options.pages);

        // Do we need to show the lock screen? (we must also have a component passed to us)
        if (this.options.presentLockScreen && lockScreenComponent) {
          // Present lock screen
          this.mcLockScreenProvider.presentLockScreen(lockScreenComponent).then(res => {
            // Check lock screen pin result
            if (res) {
              // If pin is ok then see if we need to check for upgrade
              if (this.upgradeOptions) {
                let upgradeSubscription: Subscription = this.mcUpgradeProvider.upgrade(this.upgradeOptions).subscribe(res => {
                  if (!res) {
                    // User has postponed upgrade (or it failed).
                    // Now check to see if a sync point was specified for the page
                    if (pageInfo && pageInfo.syncPoint) {
                      this.doSync(pageInfo);
                      // console.log('lock screen; upgrade postponed; page sync point: ' + pageInfo.syncPoint);
                      observer.next(12);
                    } else {
                      // console.log('lock screen; upgrade postponed; no page sync point');
                      observer.next(11);
                    }
                  } else {
                    // console.log('lock screen; upgrade options for page');
                    observer.next(10);
                  }
                  upgradeSubscription.unsubscribe();
                });
              } else {
                // No upgrade, now check if we have a sync point for the page
                if (pageInfo && pageInfo.syncPoint) {
                  this.doSync(pageInfo);
                  // console.log('lock screen; no upgrade options for page; page sync point: ' + pageInfo.syncPoint);
                  observer.next(9);
                } else {
                  // console.log('lock screen; no upgrade options for page; no page sync point');
                  observer.next(8);
                }
              }
            } else {
              // console.log('pin wrong / no pin found / lock screen already presented');
              observer.next(7);
            }
          });
        } else {
          // No lock screen, check for upgrade
          if (this.upgradeOptions) {
            let upgradeSubscription: Subscription = this.mcUpgradeProvider.upgrade(this.upgradeOptions).subscribe(res => {
              if (!res) {
                // User has postponed upgrade (or it failed).
                // Now check to see if a sync point was specified for the page
                if (pageInfo && pageInfo.syncPoint) {
                  this.doSync(pageInfo);
                  // console.log('no lock screen; upgrade postponed; page sync point: ' + pageInfo.syncPoint);
                  observer.next(6);
                } else {
                  // console.log('no lock screen; upgrade postponed; no page sync point');
                  observer.next(5);
                }
              } else {
                // console.log('no lock screen; upgrade options for page');
                observer.next(4);
              }
              upgradeSubscription.unsubscribe();
            });
          } else {
            // No upgrade, now check if we have a sync point for the page
            if (pageInfo && pageInfo.syncPoint) {
              this.doSync(pageInfo);
              // console.log('no lock screen; no upgrade options for page; page sync point: ' + pageInfo.syncPoint);
              observer.next(3);
            } else {
              // console.log('no lock screen; no upgrade options for page; no page sync point');
              observer.next(2);
            }
          }
        }
      } else {
        // console.log('no checks carried out');
        observer.next(1);
      }
    });
  }

  isPausePeriodExceeded(): boolean {
    let pauseTime = this.getPauseTime();
    if (!pauseTime) {
      pauseTime = 0;
    }
    return parseInt(pauseTime) < (Date.now() - this.options.maxPausePeriod);
  }

  setPauseTime(pauseTime: number) {
    localStorage.setItem(this.PAUSE_TIME, pauseTime.toString());
  }

  getPauseTime(): any {
    return localStorage.getItem(this.PAUSE_TIME);
  }

  setOptions(functionName: string) {
    let config = this.mcConfig.getConfig();
    // Check for any config options and merge/override the class options
    if (functionName === this.ON_RESUME) {
      if (config.onResume) {
        Object.assign(this.onResumeOptions, config.onResume);
      }
      this.options = this.onResumeOptions;
    } else if (functionName === this.ON_NAVIGATION) {
      if (config.onNavigation) {
        Object.assign(this.onNavigationOptions, config.onNavigation);
      }
      // console.log('onNavigationOptions',this.onNavigationOptions);
      this.options = this.onNavigationOptions;
    } else {
      // On cold start
      if (config.onColdStart) {
        Object.assign(this.onColdStartOptions, config.onColdStart);
      }
      // console.log('onColdStartOptions',this.onColdStartOptions);
      this.options = this.onColdStartOptions;
    }
    // Upgrade options
    this.setUpgradeOptions(config);
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