import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { startup, getStatus } from 'mobilecaddy-utils/startup';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-init',
  templateUrl: 'init.html'
})
export class InitPage {
  initStatus: '';
  statusPoll: () => void;
  pollId;

  constructor(public navCtrl: NavController, public platform: Platform) {}

  ngOnInit() {
    const logModule = 'InitPage';

    localStorage.setItem('coldStart', 'true');

    if (
      location.hostname == 'localhost' ||
      !navigator.appVersion.includes('obile')
    ) {
      console.log('Running in CodeFlow');

      this.pollId = window.setTimeout(
        (this.statusPoll = () => {
          this.initStatus = getStatus();
          console.log('getStatus', this.initStatus);
          this.pollId = setTimeout(this.statusPoll, 1000);
        }),
        1000
      );

      // Running in CodeFlow
      startup()
        .then(res => {
          console.log('res', res);
          window.clearTimeout(this.pollId);
          this.navCtrl.setRoot(
            HomePage,
            {},
            { animate: true, direction: 'forward' }
          );
        })
        .catch(e => {
          window.clearTimeout(this.pollId);
          console.error(logModule, e);
        });
    } else {
      // On a device, wait for platform.ready()
      this.pollId = window.setTimeout(
        (this.statusPoll = () => {
          this.initStatus = getStatus();
          console.log('getStatus', this.initStatus);
          this.pollId = setTimeout(this.statusPoll, 100);
        }),
        10
      );

      this.platform
        .ready()
        .then(readySource => {
          console.log('Platform ready from', readySource);
          return startup();
        })
        .then(res => {
          window.clearTimeout(this.pollId);
          console.log('res', res);
          this.navCtrl.setRoot(
            HomePage,
            {},
            { animate: true, direction: 'forward' }
          );
        })
        .catch(e => {
          window.clearTimeout(this.pollId);
          console.error(logModule, e);
        });
    }
  }
}
