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
