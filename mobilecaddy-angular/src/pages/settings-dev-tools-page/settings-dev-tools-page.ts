import { Component } from '@angular/core';
import {
  NavController,
  Loading,
  AlertController,
  AlertOptions
} from 'ionic-angular';
// import { SettingsMtiPage } from '../../pages/settings-mti/settings-mti';
// import { SettingsRawViewPage } from '../../pages/settings-raw-view/settings-raw-view';
// import { McRecoveryProvider } from '../../providers/mc-recovery/mc-recovery';
// import { McLoadingProvider } from '../../providers/mc-loading/mc-loading';
// import { McSettingsProvider } from '../../providers/mc-settings/mc-settings'

@Component({
  selector: 'page-settings-dev-tools',
  templateUrl: 'settings-dev-tools-page.html'
})
export class SettingsDevToolsPage {
  constructor(
    public navCtrl: NavController,
    // private mcRecoveryProvider: McRecoveryProvider,
    // private loadingProvider: McLoadingProvider,
    private alertCtrl: AlertController // private mcSettingsProvider: McSettingsProvider
  ) {}

  ionViewDidEnter() {
    // If user has run 'Force Sync' then they should also run the 'Reset Application'
    // if (this.mcSettingsProvider.getHasForceSyncRun()) {
    //   this.showResetWarning();
    // }
  }

  openPageMTI() {
    // this.navCtrl.push(SettingsMtiPage);
  }

  openPageMTIForRecovery() {
    // this.navCtrl.push(SettingsMtiPage, {recovery:true});
  }

  openPageRawView(type: string) {
    // this.navCtrl.push(SettingsRawViewPage, {type:type});
  }

  recoverAllData() {
    // let alert = this.alertCtrl.create({
    //   title: 'Recover All Data',
    //   message: 'Are you sure you want to recover all data?',
    //   buttons: [
    //     {
    //       text: 'No',
    //       role: 'cancel',
    //       handler: () => {
    //       }
    //     },
    //     {
    //       text: 'Yes',
    //       handler: () => {
    //         // Create message to display
    //         let loader: Loading = this.loadingProvider.createLoading('Saving data to device...');
    //         loader.present().then(() => {
    //           // Do the recover
    //           this.mcRecoveryProvider.recoverAllData().then(res => {
    //             // console.log('recoverAllData',res)
    //             loader.dismiss();
    //           }).catch(err => {
    //             console.error('recoverAllData',err);
    //             loader.dismiss();
    //             let alert = this.alertCtrl.create({
    //               title: 'Error',
    //               message: JSON.stringify(err),
    //               buttons: ['OK']
    //             });
    //             alert.present();
    //           });
    //         });
    //       }
    //     }
    //   ]
    // });
    // alert.present();
  }

  resetApplication() {
    // this.mcSettingsProvider.hardReset();
  }

  showResetWarning() {
    // let promptOptions: AlertOptions = {
    //   enableBackdropDismiss: false,
    //   title: 'Force Sync Warning',
    //   message: 'You have performed a Force Sync. Do you need to perform a Reset Application?',
    //   buttons: [
    //     {
    //       text: 'OK',
    //       handler: data => {
    //         // If we're if codeflow then stop the warning message from constantly appearing
    //         if (window['LOCAL_DEV']) {
    //           this.mcSettingsProvider.setHasForceSyncRun(false);
    //         }
    //       }
    //     }
    //   ]
    // };
    // // Create the popup
    // const prompt = this.alertCtrl.create(promptOptions);
    // // Show popup
    // prompt.present();
  }
}
