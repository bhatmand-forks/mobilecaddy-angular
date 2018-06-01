import { Component, Inject, OnInit, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';
import { RecentItemsService } from '../../../mobilecaddy-angular/src/recent-items-service/recent-items-service';
import { SalesforceRestService } from '../../../mobilecaddy-angular/src/salesforce-rest-service/salesforce-rest-service';

const logTag: string = 'accountDetail.ts';

@Component({
  selector: 'page-account-detail',
  templateUrl: 'accountDetail.html'
})
export class AccountDetailPage implements OnInit {
  private logTag: string = 'accountDetailPage.ts';
  accountTable: string = 'Account__ap';
  account = this.navParams.get('account');
  @Input() file: File;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public recentItems: RecentItemsService,
    public sfRestService: SalesforceRestService
  ) {}

  ngOnInit() {
    console.log(this.logTag, 'ngOnInit', this.account);
    // let recentItemsConfig = this.recentItems.getConfigForType('Contact');
    // console.log('recentItemsConfig', recentItemsConfig);
    this.recentItems.addRecentItem('Account', this.account);
    console.log(this.recentItems.getRecentItems('Account', 2, true));
    console.log(this.recentItems.getRecentItems('Account'));
    let obj = {
      method: 'GET',
      contentType: 'application/json',
      path: '/services/data/v36.0/chatter/feeds/news/me/feed-elements',
      params: { test: 1 }
    };
    // this.sfRestService
    //   .request(obj)
    //   .then(result => {
    //     console.log(this.logTag, result);
    //   })
    //   .catch(e => {
    //     console.error('getLatestChatter error', e);
    //   });
  }

  fileSelected(event: EventTarget) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    this.file = files[0];
    console.log(this.file);
    this.uploadFile();
  }

  uploadFile() {
    console.log(this.logTag, 'uploadFile', this.file);
    this.sfRestService
      .upload(this.file)
      .then(r => {
        console.log(this.logTag, 'uploadFile', r);
      })
      .catch(e => {
        logger.error(this.logTag, 'uploadFile', e);
      });
  }
}
