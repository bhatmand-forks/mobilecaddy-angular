import { Component, Inject, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';
import { MobileCaddySyncService } from '../../../mobilecaddy-angular/src/mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';

import { AccountDetailPage } from '../accountDetail/accountDetail';

const logTag: string = 'home.ts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  accounts;
  accountTable: string = 'Account__ap';
  config: IAppConfig;
  private loader: any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private mobilecaddySyncService: MobileCaddySyncService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig
  ) {}

  ngOnInit() {
    // As we are the first page, we check to see when the initialSync is completed.
    this.loader = this.loadingCtrl.create({
      content: 'Preparing data...',
      duration: 120000
    });
    this.loader.present();

    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(logTag, 'SyncState Update', res);
      if (res.status === 0) this.loader.setContent('Syncing ' + res.table);
    });

    this.mobilecaddySyncService
      .getInitialSyncState()
      .subscribe(initialSyncState => {
        console.log(logTag, 'initialSyncState Update', initialSyncState);
        if (initialSyncState == 'InitialLoadComplete') {
          this.showAccounts();
        }
      });
    this.config = this.appConfig;
  }

  showAccounts(): void {
    this.loader.setContent('Fetching records');
    let soql =
      'SELECT {' +
      this.accountTable +
      ':Id}, {' +
      this.accountTable +
      ':Name} FROM {' +
      this.accountTable +
      '} ORDER BY NAME';
    devUtils.smartSql(soql).then(res => {
      console.log('res', res);
      this.loader.dismiss();
      this.accounts = res.records;
    });
  }

  doSync(event): void {
    console.log(logTag, 'doSync');

    // You're unlikely to really want to show a loader whilst a background sync takes place,
    // but this is an example of using the mobilecaddySyncService.getSyncState() observable.
    this.loader = this.loadingCtrl.create({
      content: 'Syncing...',
      duration: 120000
    });
    this.loader.present();

    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(logTag, 'SyncState Update', res);
      if (res.status === 0) this.loader.setContent('Syncing ' + res.table);
    });

    this.mobilecaddySyncService
      .syncTables([{ Name: this.accountTable }])
      .then(r => {
        this.loader.dismiss();
      });
  }

  goToAccount(a): void {
    console.log(logTag, 'goToAccount', a);
    this.navCtrl.push('AccountDetailPage', {
      account: { Id: a[0], Name: a[1] }
    });
  }
}
