import { Component, Inject, OnInit, Input } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
// import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';
import { RecentItemsService } from '../../../mobilecaddy-angular/src/recent-items-service/recent-items-service';
import { SalesforceRestService } from '../../../mobilecaddy-angular/src/salesforce-rest-service/salesforce-rest-service';

const logTag: string = 'accountDetail.ts';

@IonicPage()
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

    // let obj = {
    //   method: 'GET',
    //   contentType: 'application/json',
    //   path: '/services/data/v36.0/chatter/feeds/news/me/feed-elements',
    //   params: { test: 1 }
    // };
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
