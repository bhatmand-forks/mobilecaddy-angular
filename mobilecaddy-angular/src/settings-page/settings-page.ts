import { Component } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
import {
  AlertController,
  LoadingController,
  NavController
} from 'ionic-angular';
import * as vsnUtils from 'mobilecaddy-utils/vsnUtils';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';

import { MCOutboxPage } from '../outbox-page/outbox-page';

export interface vsnInfo {
  buildName: string;
  buildVersion: string;
  dynVersionNumber: string;
  appVersion: string;
}

@Component({
  selector: 'page-settings-page',
  templateUrl: 'settings-page.html',
  styles: [`.button{display: block;}.button ion-icon {margin-right: 0.5em;}`]
})
export class SettingsPage {
  private logTag: string = 'mc.settings-page.ts';
  vsnInfo: vsnInfo;
  upgradeAvailable: boolean = false;
  outboxPage: MCOutboxPage;
  private settingsTab: string = 'basic';

  constructor(
    public loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private mobilecaddySyncService: MobileCaddySyncService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.vsnInfo = await this.getVersionInfo();
    vsnUtils.upgradeAvailable().then(res => {
      this.upgradeAvailable = res;
    });
    console.log(this.logTag, this.vsnInfo);
  }

  doSync(event): void {
    console.log(this.logTag, 'doSync2');
    let loader = this.loadingCtrl.create({
      content: 'Running Sync...',
      duration: 120000
    });
    loader.present();

    this.mobilecaddySyncService
      .syncTables('forceSyncTables')
      .then(r => {
        loader.dismiss();
      })
      .catch(e => {
        console.error(e);
        loader.dismiss();
      });
  }

  navToOutbox(): void {
    console.log(this.logTag, 'navTo');
    this.navCtrl.push(MCOutboxPage);
  }

  upgrade(): void {
    let alert = this.alertCtrl.create({
      title: 'Upgrade Now',
      message: 'Are you sure you want to upgrade?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            vsnUtils.upgradeIfAvailable().then(function(res) {
              console.log('upgrade: upgradeIfAvailable? ' + res);
              if (res) {
                let loader = this.loadingCtrl.create({
                  content: 'Initialising upgrade...',
                  duration: 30000
                });
                loader.present();
              } else {
                alert = this.alertCtrl.create({
                  title: 'Upgrade failed',
                  subTitle:
                    'The upgrade could not take place due to sync in progress. Please try again later.',
                  buttons: ['Dismiss']
                });
                alert.present();
              }
            });
          }
        }
      ]
    });
    alert.present();
  }

  logout(): void {
    let alert = this.alertCtrl.create({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            devUtils.logout();
          }
        }
      ]
    });
    alert.present();
  }

  selectedBasic(): void {
    this.settingsTab = 'basic';
  }

  selectedDiagnostics(): void {
    this.settingsTab = 'diagnostics';
  }

  selectedAdvanced(): void {
    this.settingsTab = 'advanced';
  }

  private getVersionInfo(): Promise<vsnInfo> {
    return new Promise((resolve, reject) => {
      resolve({
        buildName: '0.0.0',
        buildVersion: '1.1.1',
        dynVersionNumber: '1.1.1',
        appVersion: '1.1.1'
      });
    });
  }
}
