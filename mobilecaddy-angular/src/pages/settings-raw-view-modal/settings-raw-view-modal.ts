import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-settings-raw-view-modal',
  templateUrl: 'settings-raw-view-modal.html',
})
export class SettingsRawViewModalPage {

  data: any;
  key: string;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.key = this.navParams.get('key');
    this.data = this.navParams.get('data');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
