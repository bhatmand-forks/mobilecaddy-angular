import { Component, Inject, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';
import { MobileCaddySyncService } from '../../../mobilecaddy-angular/src/mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { MobileCaddyStartupService } from '../../../mobilecaddy-angular/src/startup-service/startup.service';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import * as _ from 'underscore';

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
    private mobilecaddyStartupService: MobileCaddyStartupService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig
  ) {}

  ngOnInit() {
    // As we are the first page, we check to see when the initialSync is completed.
    this.loader = this.loadingCtrl.create({
      content: 'Preparing data...',
      duration: 120000
    });
    this.loader.present();

    this.mobilecaddyStartupService.startup(this.appConfig);

    this.mobilecaddyStartupService.getInitState().subscribe(res => {
      console.log(logTag, 'Init Update', res);
      if (res) {
        if (res.status === -1) this.loader.setContent(res.info);
        if (res.status === 0) this.loader.setContent('Syncing ' + res.table);
      }
    });

    this.mobilecaddySyncService
      .getInitialSyncState()
      .subscribe(initialSyncState => {
        console.log(logTag, 'initialSyncState Update', initialSyncState);
        if (initialSyncState == 'InitialLoadComplete') {
          this.showAccounts();
        }
      });
  }

  ionViewDidEnter() {
    // As we are the root our URL may not be updated if coming here via the 'back' button.
    // Maybe we can get rid of this is we Lazy load the home page?
    history.pushState({}, 'Home', '/');
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
      '}';
    devUtils.smartSql(soql).then(res => {
      console.log('res', res);
      // Sort by Name
      this.accounts = _.sortBy(res.records, el => {
        return el[1];
      });
      this.accounts = res.records;
      this.loader.dismiss();
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

    this.mobilecaddySyncService.syncTables('mySync2').then(r => {
      this.loader.dismiss();
    });
  }

  goToAccount(a): void {
    console.log(logTag, 'goToAccount', a);
    this.navCtrl.push('AccountDetailPage', {
      id: a[0], // We set this as well, for our IonicPage segment
      account: { Id: a[0], Name: a[1] }
    });
  }
}
