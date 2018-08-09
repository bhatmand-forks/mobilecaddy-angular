/**
 * Based on: https://github.com/saimon24/Ionic-Lock-Screen-Component
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavParams, MenuController, Platform } from 'ionic-angular';
import { McLockScreenProvider } from '../../providers/mc-lock-screen/mc-lock-screen';

@Component({
  selector: 'mc-lock-screen',
  templateUrl: 'mc-lock-screen.html'
})
export class McLockScreenComponent implements OnInit, OnDestroy {

  _showLockScreen: boolean;
  ACDelbuttons: boolean;
  passcodeWrong: boolean;
  passcodeAttempts: number = 0;
  enteredPasscode: string = '';
  passcode: string;
  passcodeLabel: string;
  acLabel: string;
  delLabel: string;
  onCorrect: any;
  onWrong: any;

  // Property used to store the callback of the event handler to unregister to it when leaving this component
  unregisterBackButtonAction: any;

  constructor(
    public navParams: NavParams,
    public menu: MenuController,
    public platform: Platform,
    public mcLockScreenProvider: McLockScreenProvider
  ) {
    this._showLockScreen = true;
    this.ACDelbuttons = navParams.data.ACDelbuttons || false;
    this.passcode = navParams.data.code;
    this.onCorrect = navParams.data.onCorrect || null;
    this.onWrong = navParams.data.onWrong || null;
    this.passcodeLabel = navParams.data.passcodeLabel || 'Enter Passcode';
    this.acLabel = navParams.data.acLabel || 'AC';
    this.delLabel = navParams.data.delLabel || 'DEL';
  }

  ngOnInit() {
    this.menu.swipeEnable(false);
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 501);
  }

  ngOnDestroy() {
    this.menu.swipeEnable(true);
    // Unregister the custom back button action for this component
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  allClear(): void {
    this.enteredPasscode = '';
  }

  remove(): void {
    this.enteredPasscode = this.enteredPasscode.slice(0, -1);
  }

  digit(digit: any): void {
    if (this.passcodeWrong) {
      return;
    }
    this.enteredPasscode += '' + digit;

    if (this.enteredPasscode.length >= 4) {
      let enteredCode = this.mcLockScreenProvider.hashCode(this.enteredPasscode);
      if (enteredCode === ('' + this.passcode)) {
        this.enteredPasscode = '';
        this.passcodeAttempts = 0;
        this._showLockScreen = false;
        this.onCorrect && this.onCorrect();
      } else {
        // Entered code is the right length but is incorrect
        this.passcodeWrong = true;
        this.passcodeAttempts++;
        // Timeout for the 'shake' of passcode circles when incorrect
        setTimeout(() => {
          this.enteredPasscode = '';
          this.passcodeWrong = false;
        }, 500);
        this.onWrong && this.onWrong(this.passcodeAttempts);
      }
    }
  }

}