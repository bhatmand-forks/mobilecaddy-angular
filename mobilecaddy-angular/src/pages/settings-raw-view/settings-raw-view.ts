import { Component, OnInit } from '@angular/core';
import { NavParams, Loading, ModalController, Modal } from 'ionic-angular';
import { McLoadingProvider } from '../../providers/mc-loading/mc-loading';
import { McRecoveryProvider } from '../../providers/mc-recovery/mc-recovery';
import { SettingsRawViewModalPage } from '../../pages/settings-raw-view-modal/settings-raw-view-modal';
import * as _ from 'underscore';

@Component({
  selector: 'page-settings-raw-view',
  templateUrl: 'settings-raw-view.html',
})
export class SettingsRawViewPage implements OnInit {

  type: string;
  viewContent: any = '';
  rawData: any = '';
  loader: Loading;
  expanded : any= [];
  isPrettyDisplay: boolean = true;

  constructor(
    private navParams: NavParams,
    private mcRecoveryProvider: McRecoveryProvider,
    private loadingProvider: McLoadingProvider,
    private modalCtrl: ModalController
  ) {
    this.type = this.navParams.get('type');
  }

  ngOnInit() {
    this.loader = this.loadingProvider.createLoading('Loading...');
    this.loader.present().then(() => {
      this.loadData();
    });
  }

  loadData() {
    switch (this.type) {
      case 'tables':
        this.loadTableData();
        break;
      case 'localStorage':
        this.loadLocalStorageData();
        break;
    }
  }

  loadTableData() {
    this.mcRecoveryProvider.getAllTableData().then(data => {
      let tables = [];
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          tables.push({key: key, data: JSON.stringify(data[key])});
        }
      }
      this.viewContent = tables;
      this.rawData = JSON.stringify(data);
      this.loader.dismiss();
    });
  }

  loadLocalStorageData() {
    this.mcRecoveryProvider.getAllLocalStorageData().then(data => {
      let sorted = _.sortBy(data, function (i) { return i.key.toLowerCase(); });
      // console.log(sorted);
      this.viewContent = sorted;
      this.rawData = JSON.stringify(data);
      this.loader.dismiss();
    });
  }

  toggleExpanded(i) {
    this.expanded[i] = !this.expanded[i];
  }

  showRawData() {
    this.loader = this.loadingProvider.createLoading('Loading...');
    this.loader.present().then(() => {
      this.isPrettyDisplay = !this.isPrettyDisplay;
      this.loader.dismiss();
    });
  }

  showRawDataModal(key,data) {
    const myModal: Modal = this.modalCtrl.create(SettingsRawViewModalPage,{'key': key, 'data': data});
    myModal.present();
  }

}
