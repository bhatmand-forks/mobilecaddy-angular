import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertOptions, ToastOptions } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { McPinChallengeProvider } from '../../providers/mc-pin-challenge/mc-pin-challenge';
import { McUpgradeProvider } from '../../providers/mc-upgrade/mc-upgrade';
import { SettingsDevToolsPage } from '../settings-dev-tools-page/settings-dev-tools-page';
import { McDiagnosticsPage } from '../diagnostics-page/diagnostics-page';
import { McSettingsProvider } from '../../providers/mc-settings/mc-settings';
import { McConfigService } from '../../providers/mc-config/mc-config.service';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings-page.html'
})
export class SettingsPage implements OnInit, OnDestroy {
  readonly logTag: string = 'settings-page.ts';
  isUpgradeAvailable: boolean = false;
  appVsn: string;
  loggingLevelTitle: string;
  loggingLevelOptions: any = [];
  loggingLevelCssClass: string;
  loggingLevel: string;

  // So we can unsubscribe subscriptions on destroy
  private pinChallenge1Subscription: Subscription;
  private pinChallenge2Subscription: Subscription;

  constructor(
    public navCtrl: NavController,
    private mcPinChallengeProvider: McPinChallengeProvider,
    private mcUpgradeProvider: McUpgradeProvider,
    private mcSettingsProvider: McSettingsProvider,
    private mcConfigService: McConfigService
  ) { }

  ngOnInit() {
    this.checkIfUpgradeAvailable();
    this.appVsn = this.mcConfigService.getConfig('version');

    // Get any settings page config
    let settingPageConfig = this.mcConfigService.getConfig('settingsPage');
    console.log('settingPageConfig',settingPageConfig);
    
    // Logging level.
    // Get any existing logging level
    this.loggingLevel = this.getLoggingLevel();

    // Logging level - check to see if options text has been set in config
    if (!settingPageConfig.loggingLevelOptionsText) {
      this.loggingLevelOptions = this.setDefaultLoggingLevelOptions();
    } else{
      // If we have loggingLevelOptionsText set in config then we expect an array of the text (for use in multi-language apps)
      if (settingPageConfig.loggingLevelOptionsText.constructor !== Array || settingPageConfig.loggingLevelOptionsText.length !== 4) {
        this.loggingLevelOptions = this.setDefaultLoggingLevelOptions();
      } else {
        this.loggingLevelOptions = this.buildLoggingLevelOptionsFromConfig(settingPageConfig.loggingLevelOptionsText);
      }
    }

    // Logging level - check if we have a title set in config
    if (settingPageConfig.loggingLevelTitle) {
      this.loggingLevelTitle = settingPageConfig.loggingLevelTitle;
    } else {
      this.loggingLevelTitle = 'Logging Level';
    }

    // Logging level - check if we have a css class set in config
    if (settingPageConfig.loggingLevelCssClass) {
      this.loggingLevelCssClass = settingPageConfig.loggingLevelCssClass;
    }
  }

  ngOnDestroy() {
    if (this.pinChallenge1Subscription) {
      this.pinChallenge1Subscription.unsubscribe();
    }
    if (this.pinChallenge2Subscription) {
      this.pinChallenge2Subscription.unsubscribe();
    }
  }

  openAdminFunctions() {
    let platformPinChallengeOptions = {
      bypassChallenge: true,
      timeoutPeriod: 30000,
      showCancel: true,
      maxAttempts: 5,
      popupText: [],
      alertOptions: null,
      toastOptions: null
    };

    this.mcPinChallengeProvider.setOptions(platformPinChallengeOptions);

    this.pinChallenge1Subscription = this.mcPinChallengeProvider
      .presentPinChallenge()
      .subscribe(result => {
        if (result) {
          this.navCtrl.push(SettingsDevToolsPage);
        }
      });
  }

  openAdminFunctions2() {
    let platformPinChallengeOptions = {
      bypassChallenge: window['LOCAL_DEV'],
      timeoutPeriod: 30000,
      showCancel: true,
      maxAttempts: 5,
      popupText: [],
      alertOptions: null,
      toastOptions: null
    };

    this.mcPinChallengeProvider.setOptions(platformPinChallengeOptions);

    this.pinChallenge2Subscription = this.mcPinChallengeProvider
      .presentPinChallenge()
      .subscribe(result => {
        console.log('openAdminFunctions2', result);
        if (result) {
          this.navCtrl.push(SettingsDevToolsPage);
        }
      });
  }

  checkIfUpgradeAvailable() {
    this.mcUpgradeProvider.isUpgradeAvailable().then(result => {
      console.log('isUpgradeAvailable', result);
      this.isUpgradeAvailable = result;
    });
  }

  upgrade() {
    this.mcUpgradeProvider
      .upgrade({ ignoreRepromptPeriod: true })
      .subscribe(res => { });
  }

  openDiagnostics() {
    this.navCtrl.push(McDiagnosticsPage);
  }

  logout() {
    this.mcSettingsProvider.logout();
  }

  setLoggingLevel(event) {
    // console.log(event);
    if (event == "Off") {
      localStorage.removeItem('logLevel');
    } else {
      localStorage.setItem('logLevel', event);
    }
  }

  getLoggingLevel(): string {
    var loggingLevel = localStorage.getItem('logLevel');
    if (loggingLevel === null) {
      loggingLevel = "Off";
    }
    return loggingLevel;
  }

  setDefaultLoggingLevelOptions(): any {
    let options = [];
    options.push({text: 'Off', value: 'Off', selected: true});
    options.push({text: 'Errors', value: '0', selected: false});
    options.push({text: 'Warnings', value: '1', selected: false});
    options.push({text: 'Logs', value: '2', selected: false});
    return options;
  }

  buildLoggingLevelOptionsFromConfig(loggingLevelOptionsText: any): any {
    let options = [];
    options.push({text: loggingLevelOptionsText[0], value: 'Off', selected: true});
    options.push({text: loggingLevelOptionsText[1], value: '0', selected: false});
    options.push({text: loggingLevelOptionsText[2], value: '1', selected: false});
    options.push({text: loggingLevelOptionsText[3], value: '2', selected: false});
    return options;
  }

  pinChallenge1Example() {
    // pin example, passing in alert & toast options, no cancel button, 3 attempts
    //
    let alertOptions: AlertOptions = {
      // cssClass: 'myapp-class',
      // buttons: [
      //   { /* My button */
      //     text: 'My button override',
      //     handler: data => {
      //       this.test();
      //     }
      //   }
      // ]
    };
    let toastOptions: ToastOptions = {
      // message: 'My toast message',
      duration: 2000
    };

    let platformPinChallengeOptions = {
      bypassChallenge: false,
      timeoutPeriod: 0,
      showCancel: false,
      maxAttempts: 5,
      popupText: [],
      alertOptions: alertOptions,
      toastOptions: toastOptions
    };

    this.mcPinChallengeProvider.setOptions(platformPinChallengeOptions);

    this.pinChallenge1Subscription = this.mcPinChallengeProvider.presentPinChallenge().subscribe(result => {
      console.log('pinChallenge1', result)
      if (result) {
        // alert('Good PIN');
      }
    });
  }

}
