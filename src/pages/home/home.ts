import { Component, Inject, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
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

  constructor(
    public navCtrl: NavController,
    private mobilecaddySyncService: MobileCaddySyncService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig
  ) {}

  ngOnInit() {
    // As we are the first page, we check to see when the initialSync is completed.
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
    devUtils.readRecords(this.accountTable).then(res => {
      console.log('res', res);
      this.accounts = res.records;
    });
  }

  doSync(event): void {
    console.log(logTag, 'doSync');
    this.mobilecaddySyncService
      .syncTables([{ Name: this.accountTable }])
      .then(function(r) {
        alert(r.status);
      });
  }

  goToAccount(a): void {
    console.log(logTag, 'goToAccount', a);
    this.navCtrl.push(AccountDetailPage, {
      account: a
    });
  }
}
