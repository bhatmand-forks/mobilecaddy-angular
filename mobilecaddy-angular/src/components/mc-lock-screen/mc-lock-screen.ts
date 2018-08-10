/**
 * Based on: https://github.com/saimon24/Ionic-Lock-Screen-Component
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavParams, MenuController, Platform } from 'ionic-angular';
import { McLockScreenProvider } from '../../providers/mc-lock-screen/mc-lock-screen';

@Component({
  selector: 'mc-lock-screen',
  templateUrl: 'mc-lock-screen.html',
  styles: [
    `
      /* Animations */
      @keyframes ILS_shake {
        from, to {
          transform: translate3d(0, 0, 0);
        }
        10%, 30%, 50%, 70%, 90% {
          transform: translate3d(-10px, 0, 0);
        }
        20%, 40%, 60%, 80% {
          transform: translate3d(10px, 0, 0);
        }
      }
      @keyframes ILS_buttonPress {
        0% {
          background-color: #E0E0E0;
        }
        100% {
          background-color: #F1F1F1;
        }
      }
      /* Lock Screen Layout */
      .ILS_lock {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 999;
        background-color: #F1F1F1;
      }
      .ILS_lock-hidden {
        display: none;
      }
      .ILS_label-row {
        height: 50px;
        width: 100%;
        text-align: center;
        font-size: 23px;
        padding-top: 10px;
        color: #464646;
      }
      .ILS_circles-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 60px;
      }
      .ILS_circle {
        background-color: #F1F1F1 !important;
        border-radius: 50%;
        width: 10px;
        height: 10px;
        border:solid 1px #464646;
        margin: 0 15px;
      }
      .ILS_numbers-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100px;
      }
      .ILS_digit {
        margin: 0 14px;
        width: 80px;
        border-radius: 10%;
        height: 80px;
        text-align: center;
        padding-top: 29px;
        font-size: 21px;
        color: #464646;
        background-color: #bed7ef;
      }
      .ILS_digit.activated {
        -webkit-animation-name: ILS_buttonPress;
        animation-name: ILS_buttonPress;
        -webkit-animation-duration: 0.3;
        animation-duration: 0.3s;
      }
      .ILS_ac {
        color: #464646;
        background-color: #F8F8F8;
      }
      .ILS_del {
        color: #464646;
        background-color: #F8F8F8;
      }
      .ILS_full {
        background-color: #464646 !important;
      }
      .ILS_shake {
        -webkit-animation-name: ILS_shake;
        animation-name: ILS_shake;
        -webkit-animation-duration: 0.5;
        animation-duration: 0.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
      }
    `
  ]
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