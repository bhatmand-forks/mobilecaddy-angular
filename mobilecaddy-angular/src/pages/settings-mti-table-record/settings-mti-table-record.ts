import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController, Loading, Modal, ModalController } from 'ionic-angular';
import { McLoadingProvider } from '../../providers/mc-loading/mc-loading';
import { McSettingsProvider } from '../../providers/mc-settings/mc-settings';

@Component({
  selector: 'page-settings-mti-table-record',
  templateUrl: 'settings-mti-table-record.html'
})
export class SettingsMtiTableRecordPage {
  data: any;
  rec: any;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    public loadingProvider: McLoadingProvider,
    public mcSettingsProvider: McSettingsProvider,
    public modalCtrl: ModalController
  ) {
    this.data = this.navParams.get('data');
    // console.log('this.data.record', this.data.record);
    // Convert the 'record' to an array of '{name: x value: y}' objects
    this.rec = [];
    if (this.data.record.displayFields) {
      // We are coming from displaying an MTI record list (using virtual scrolling).
      // this.data.record is an array of field/value, and a 'displayFields' node 
      for (let i = 0, len = this.data.record.length; i < len; i++) {
        // console.log('this.data.record[i]', this.data.record[i]);
        if (this.data.record[i].Name) {
          this.rec.push({ name: this.data.record[i].Name, value: this.data.record[i].Value });
        }
      }
    } else {
      Object.keys(this.data.record).forEach(key => {
        // console.log('key', key);
        this.rec.push({ name: key, value: this.data.record[key] });
      });
    }
    // console.log('this.rec', this.rec);
  }

  dismissShowTableRecord() {
    this.viewCtrl.dismiss();
  }

  showFieldValue(value) {
    let alert = this.alertCtrl.create({
      title: 'Field Value',
      inputs: [
        {
          name: 'value',
          value: value,
          type: 'text'
        }
      ],
      buttons: ['OK']
    });
    alert.present();
  }

  showSoupRecord = function (rec, soupRecordId) {
    // Create message to display during load
    let loader: Loading = this.loadingProvider.createLoading('Loading...');

    loader.present().then(() => {
      var tableName;
      for (let i = 0, len = rec.length; i < len; i++) {
        if (rec[i].name == 'Mobile_Table_Name') {
          tableName = rec[i].value;
          break;
        }
      }
      this.mcSettingsProvider
        .getRecordForSoupEntryId(tableName, soupRecordId)
        .then(
          record => {
            if (record) {
              this.showTableRecord(tableName, record, soupRecordId);
              loader.dismiss();
            } else {
              loader.dismiss();
              let alert = this.alertCtrl.create({
                title: 'No record found',
                buttons: ['OK']
              });
              alert.present();
            }
          },
          function (e) {
            loader.dismiss();
            console.error('getRecordForSoupEntryId', e);
          }
        );
    });
  }

  showTableRecord(tableName, record, soupRecordId) {
    // console.log(record);
    let data = {
      tableName: tableName,
      record: record,
      soupRecordId: soupRecordId
    };
    // Display modal
    const myModal: Modal = this.modalCtrl.create(SettingsMtiTableRecordPage, {
      data: data
    });
    myModal.present();
  }

}
