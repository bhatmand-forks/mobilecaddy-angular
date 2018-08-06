import { Component, OnInit } from '@angular/core';
import { NavController, AlertOptions, ToastOptions } from 'ionic-angular';
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
export class SettingsPage implements OnInit {
  readonly logTag: string = 'settings-page.ts';
  isUpgradeAvailable: boolean = false;
  appVsn: string;

  constructor(
    public navCtrl: NavController,
    private mcPinChallengeProvider: McPinChallengeProvider,
    private mcUpgradeProvider: McUpgradeProvider,
    private mcSettingsProvider: McSettingsProvider,
    private mcConfigService: McConfigService
  ) {}

  ngOnInit() {
    this.checkIfUpgradeAvailable();
    this.appVsn = this.mcConfigService.getConfig('version');
  }

  openAdminFunctions() {
    this.mcPinChallengeProvider
      .presentPinChallenge(true, 30000, true, undefined, undefined)
      .subscribe(result => {
        if (result) {
          this.navCtrl.push(SettingsDevToolsPage);
        }
      });
  }

  openAdminFunctions2() {
    this.mcPinChallengeProvider
      .presentPinChallenge(
        window['LOCAL_DEV'],
        30000,
        true,
        undefined,
        undefined
      )
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
      .subscribe(res => {});
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
    this.mcPinChallengeProvider
      .presentPinChallenge(
        false,
        0,
        false,
        3,
        undefined,
        alertOptions,
        toastOptions
      )
      .subscribe(result => {
        console.log('pinChallenge1', result);
        if (result) {
          // alert('Good PIN');
        }
      });
  }

  pinChallenge2Example() {
    // pin example, 10 second 'window' in which no pin isrequired again
    //
    this.mcPinChallengeProvider
      .presentPinChallenge(false, 10000, true, undefined, undefined)
      .subscribe(result => {
        console.log('pinChallenge2', result);
        if (result) {
          // alert('Good PIN');
        }
      });
  }
}
