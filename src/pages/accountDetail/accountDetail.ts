import { Component, Inject, OnInit, Input } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';

const logTag: string = 'accountDetail.ts';

@IonicPage({
  segment: 'account/:id'
})
@Component({
  selector: 'page-account-detail',
  templateUrl: 'accountDetail.html'
})
export class AccountDetailPage implements OnInit {
  private logTag: string = 'accountDetailPage.ts';
  accountTable: string = 'Account__ap';
  account = this.navParams.get('account');
  @Input() file: File;

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ngOnInit() {
    console.log(this.logTag, 'ngOnInit', this.account);
    if (!this.account) this.account = { Id: this.navParams.get('id') };
    console.log('id', this.navParams.get('id'));
    // TODO Check if we have a full object, or just an Id (as we may have come here via search)
    let soql =
      'SELECT * FROM {' +
      this.accountTable +
      '} WHERE {' +
      this.accountTable +
      ":Id} = '" +
      this.account.Id +
      "'";
    devUtils.smartSql(soql).then(res => {
      console.log('res', res);
      this.account = res.records[0];
    });
  }
}
