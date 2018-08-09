import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { McLockScreenProvider } from '../../../mobilecaddy-angular/src/providers/mc-lock-screen/mc-lock-screen';
import { McLockScreenComponent } from '../../../mobilecaddy-angular/src/components/mc-lock-screen/mc-lock-screen'

@IonicPage()
@Component({
  selector: 'page-test-mc-lock-screen',
  templateUrl: 'test-mc-lock-screen.html',
})
export class TestMcLockScreenPage {

  pinSet: boolean;

  constructor(
    private mcLockScreenProvider: McLockScreenProvider
  ) {
    // Has pin already been set?
    this.mcLockScreenProvider.getCode().then(code => {
      if (!code) {
        this.pinSet = false;
      } else {
        this.pinSet = true;
      }
    });
  }

  setCode() {
    // Set the lock screen pin?
    this.mcLockScreenProvider.getCode().then(code => {
      if (!code) {
        this.mcLockScreenProvider.setupLockScreenCode().then(res => {
          console.log('setupLockScreenCode',res);
        });
      }
      this.pinSet = true;
    });
  }

  removeCode() {
    this.mcLockScreenProvider.removeCode();
    this.pinSet = false;
  }

  presentLockScreen() {
    this.mcLockScreenProvider.presentLockScreen(McLockScreenComponent).then(res => {
    });
  }

}
