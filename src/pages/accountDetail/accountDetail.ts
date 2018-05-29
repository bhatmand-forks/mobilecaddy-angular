import { Component, Inject, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';
import { RecentItemsService } from '../../../mobilecaddy-angular/src/recent-items-service/recent-items-service';

const logTag: string = 'accountDetail.ts';

@Component({
  selector: 'page-account-detail',
  templateUrl: 'accountDetail.html'
})
export class AccountDetailPage implements OnInit {
  private logTag: string = 'accountDetailPage.ts';
  accountTable: string = 'Account__ap';
  account = this.navParams.get('account');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public recentItems: RecentItemsService
  ) {}

  ngOnInit() {
    console.log(this.logTag, 'ngOnInit', this.account);
    // let recentItemsConfig = this.recentItems.getConfigForType('Contact');
    // console.log('recentItemsConfig', recentItemsConfig);
    this.recentItems.addRecentItem('Account', this.account);
    console.log(this.recentItems.getRecentItems('Account', 2, true));
    console.log(this.recentItems.getRecentItems('Account'));
  }
}
