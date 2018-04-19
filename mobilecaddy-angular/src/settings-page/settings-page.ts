import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoadingController } from 'ionic-angular';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';

interface vsnInfo {
  buildName: string;
  buildVersion: string;
  dynVersionNumber: string;
  appVersion: string;
}

@Component({
  selector: 'page-settings-page',
  templateUrl: 'settings-page.html'
  // styleUrls: ['./settings-page.css']
})
export class SettingsPage {
  private logTag: string = 'mc.settings-page.ts';
  vsnInfo: vsnInfo;

  constructor(
    public loadingCtrl: LoadingController,
    private mobilecaddySyncService: MobileCaddySyncService
  ) {}

  async ngOnInit() {
    this.vsnInfo = await this.getVersionInfo();
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
        alert(r.status);
      })
      .catch(e => {
        console.error(e);
        loader.dismiss();
      });
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
