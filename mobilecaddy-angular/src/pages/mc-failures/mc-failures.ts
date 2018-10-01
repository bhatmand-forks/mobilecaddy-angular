import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-mc-failures',
  templateUrl: 'mc-failures.html'
})
export class McFailuresPage {

  data: any;

  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.data = navParams.get('data');
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
