import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';

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
    private alertCtrl: AlertController
  ) {
    this.data = this.navParams.get('data');
    // Convert the 'record' to an array of name/value objects
    this.rec = [];
    Object.keys(this.data.record).forEach(key =>
      this.rec.push({ name: key, value: this.data.record[key] })
    );
    // console.log('this.rec',this.rec);
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
}
