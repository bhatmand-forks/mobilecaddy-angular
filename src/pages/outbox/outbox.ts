import { Component, Inject } from '@angular/core';
// import { NavController, NavParams } from 'ionic-angular';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';

@Component({
  selector: 'page-outbox',
  templateUrl: 'outbox.html'
})
export class OutboxPage {
  config: IAppConfig;

  constructor(@Inject(APP_CONFIG) private appConfig: IAppConfig) {}

  ngOnInit() {
    this.config = this.appConfig;
  }
}
