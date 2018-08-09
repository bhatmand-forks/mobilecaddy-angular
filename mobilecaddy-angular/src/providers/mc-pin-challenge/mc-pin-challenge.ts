import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  AlertController,
  AlertOptions,
  ToastController,
  ToastOptions
} from 'ionic-angular';
import { McConfigService } from '../mc-config/mc-config.service';
import * as logger from 'mobilecaddy-utils/logger';
import * as appDataUtils from 'mobilecaddy-utils/appDataUtils';

@Injectable()
export class McPinChallengeProvider {

  logTag: string = "pin-challenge.ts";

  // Default options
  private platformPinChallengeOptions = {
    bypassChallenge: false,
    timeoutPeriod: 0,
    showCancel: false,
    maxAttempts: 5,
    popupText: [],
    alertOptions: null,
    toastOptions: null
  }

  private lastPinChallenge: number;
  private attemptsCount: number = 0;
  private timeoutPeriod: number;
  private readonly defaultTimeoutPeriod: number = 1000 * 60 * 30;

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public mcConfig: McConfigService
  ) { }

  presentPinChallenge(): Observable<boolean> {
    return Observable.create(observer => {
      // Override/merge config options with the class defaults
      this.setOptions();
      // Check to see if we can bypass the pin challenge (e.g. in codeflow)
      if (this.platformPinChallengeOptions.bypassChallenge) {
        // Emit result
        observer.next(true);
      } else {
        // If we don't have any popup text (or it doesn't have enough items in the array) then set defaults
        // ('popupText' parameter primarily used for apps with translations)
        if (!this.platformPinChallengeOptions.popupText || this.platformPinChallengeOptions.popupText.constructor !== Array || this.platformPinChallengeOptions.popupText.length !== 8) {
          this.platformPinChallengeOptions.popupText = this.setDefaultPopupText();
        }

        // Check to see if we're only giving the user a certain number of attempts at entering a pin.
        // Check for no attempts is passed in
        let isMaxAttemptsUsage = false;
        if (this.platformPinChallengeOptions.maxAttempts === undefined || this.platformPinChallengeOptions.maxAttempts === null) {
          this.platformPinChallengeOptions.maxAttempts = 1;
        } else {
          // We're now using maxAttempts to control how many times the pin can be attempted
          isMaxAttemptsUsage = true;
          // Check for 0 or negative parameter
          if (this.platformPinChallengeOptions.maxAttempts <= 0) {
            this.platformPinChallengeOptions.maxAttempts = 1; // This will force the popup to be closed after 1 attempt
          }
        }

        // Check to see if user has exceeded the maximum attempts
        if (isMaxAttemptsUsage && this.attemptsCount >= this.platformPinChallengeOptions.maxAttempts) {
          let options: ToastOptions = {
            message: this.platformPinChallengeOptions.popupText[7],
            duration: 3000
          };
          // Check to see if we need to add the toastOptions parameter to the toast options
          if (this.platformPinChallengeOptions.toastOptions) {
            Object.assign(options, this.platformPinChallengeOptions.toastOptions);
          }
          const toast = this.toastCtrl.create(options);
          toast.present();
          observer.next(false);
        } else {
          // Determine if user has a period of time before they need to be challenged again
          if (this.platformPinChallengeOptions.timeoutPeriod === undefined || this.platformPinChallengeOptions.timeoutPeriod === null) {
            this.platformPinChallengeOptions.timeoutPeriod = this.defaultTimeoutPeriod;
          }
          // Save tiemout period for future checks by function isWithinTimeoutPeriod
          this.timeoutPeriod = this.platformPinChallengeOptions.timeoutPeriod;
          if (this.lastPinChallenge && this.lastPinChallenge > (Date.now() - this.platformPinChallengeOptions.timeoutPeriod)) {
            // This challenge is within allowed timeout period
            this.lastPinChallenge = Date.now();
            // Emit result
            observer.next(true);
          } else {
            // Show the popup form (passing in generated support pin)
            this.presentPinChallengeForm(observer, this.generateSupportPin());
          }
        }

      }
    });
  }

  setOptions(options?: any) {
    if (options) {
      Object.assign(this.platformPinChallengeOptions, options);
    }
    let config = this.mcConfig.getConfig();
    // Check for any config options and merge/override the class options
    if (config.platformPinChallengeOptions) {
      Object.assign(this.platformPinChallengeOptions, config.platformPinChallengeOptions);
    }
  }

  isWithinTimeoutPeriod(bypassChallenge: boolean, timeoutPeriod?: number): boolean {
    if (bypassChallenge) {
      return true;
    } else {
      // Determine if user has a period of time before they need to be challenged again.
      // If we don't have a timeout passed in then work one out from either the challenge or default
      if (timeoutPeriod === undefined || timeoutPeriod === null) {
        // Check to see if the showPinChallenge function call set a timeout
        if (this.timeoutPeriod !== undefined && this.timeoutPeriod !== null) {
          timeoutPeriod = this.timeoutPeriod;
        } else {
          timeoutPeriod = this.defaultTimeoutPeriod;
        }
      }
      // Now check to see if we're within the timeout period
      if (this.lastPinChallenge && this.lastPinChallenge > (Date.now() - timeoutPeriod)) {
        return true;
      } else {
        return false;
      }
    }
  }

  private presentPinChallengeForm(observer: any, supportPin: string) {
    // Create popup for user to enter the response pin
    let promptOptions: AlertOptions = {
      enableBackdropDismiss: false,
      title: this.platformPinChallengeOptions.popupText[0],
      message: this.platformPinChallengeOptions.popupText[1] + ' <b>' + supportPin + '</b><br/>' + this.platformPinChallengeOptions.popupText[2],
      inputs: [
        {
          name: 'responsePin',
          type: 'password'
        },
      ],
      buttons: [
        { /* Continue button */
          text: this.platformPinChallengeOptions.popupText[4],
          handler: data => {
            // User has entered response pin, now check if it's correct
            this.authenticate(supportPin, data.responsePin).then((result) => {
              if (result) {
                // Set last challenge so user might not have to enter pin again
                this.lastPinChallenge = Date.now();
                // Reset attempt count
                this.attemptsCount = 0;
                // Emit result
                observer.next(true);
              } else {
                // pin was incorrect.
                this.attemptsCount++;
                // Check to see if we're counting attempts
                if (this.platformPinChallengeOptions.maxAttempts !== 1 && this.attemptsCount < this.platformPinChallengeOptions.maxAttempts) {
                  // Inform user that pin was incorrect and that they only have limited attempts left
                  if (this.platformPinChallengeOptions.popupText[5] !== '' && this.platformPinChallengeOptions.popupText[6] !== '') {
                    let options: ToastOptions = {
                      message: this.platformPinChallengeOptions.popupText[5] + ' - ' + (this.platformPinChallengeOptions.maxAttempts - this.attemptsCount) + this.platformPinChallengeOptions.popupText[6],
                      duration: 3000
                    };
                    // Check to see if we need to add the toastOptions parameter to the toast options
                    if (this.platformPinChallengeOptions.toastOptions) {
                      Object.assign(options, this.platformPinChallengeOptions.toastOptions);
                    }
                    const toast = this.toastCtrl.create(options);
                    toast.present();
                  }
                  // Recursively calls this function until maximum pin attempts carried out
                  this.presentPinChallengeForm(observer, supportPin);
                } else {
                  // Inform user that pin was incorrect (as long as if we have a message to display)
                  if (this.platformPinChallengeOptions.popupText[5] !== '') {
                    let options: ToastOptions = {
                      message: this.platformPinChallengeOptions.popupText[5],
                      duration: 3000
                    };
                    // Check to see if we need to add the toastOptions parameter to the toast options
                    if (this.platformPinChallengeOptions.toastOptions) {
                      Object.assign(options, this.platformPinChallengeOptions.toastOptions);
                    }
                    const toast = this.toastCtrl.create(options);
                    toast.present();
                  }
                  // Emit result
                  observer.next(false);
                }
              }
            }).catch(function (e) {
              logger.error(e);
              // Emit result
              observer.next(false);
            });
          }
        }
      ]
    };
    // Check to see if we need to add the Cancel button to the prompt
    if (this.platformPinChallengeOptions.showCancel) {
      promptOptions.buttons.unshift(
        { /* Cancel button */
          text: this.platformPinChallengeOptions.popupText[3],
          handler: data => {
            // Emit result
            observer.next(false);
          }
        }
      )
    }
    // Check to see if we need to add the alertOptions parameter to the prompt
    if (this.platformPinChallengeOptions.alertOptions) {
      Object.assign(promptOptions, this.platformPinChallengeOptions.alertOptions);
    }
    // Create the popup
    const prompt = this.alertCtrl.create(promptOptions);
    // Show popup
    prompt.present();
  }

  private generateSupportPin(): string {
    let supportPin = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
    return supportPin;
  }

  private authenticate(supportPin: string, responsePin: string): Promise<boolean> {
    return new Promise(function (resolve, reject) {
      const _0x47ed = ["", "\x65\x72\x72\x6F\x72", "\x63\x61\x74\x63\x68", "\x6C\x65\x6E\x67\x74\x68", "\x73\x75\x62\x73\x74\x72\x69\x6E\x67", "\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74", "\x67\x65\x74\x55\x54\x43\x44\x61\x74\x65", "\x67\x65\x74\x55\x54\x43\x4D\x6F\x6E\x74\x68", "\x30", "\x74\x68\x65\x6E", "\x61\x75\x64\x49\x64", "\x67\x65\x74\x43\x75\x72\x72\x65\x6E\x74\x56\x61\x6C\x75\x65\x46\x72\x6F\x6D\x41\x70\x70\x53\x6F\x75\x70"];
      let _0x4c81x4 = _0x47ed[0];
      let _0x4c81x5 = 0;

      appDataUtils[_0x47ed[11]](_0x47ed[10])[_0x47ed[9]](function (_0x4c81x7) {
        if (_0x4c81x7[_0x47ed[3]] > 15) {
          _0x4c81x7 = _0x4c81x7[_0x47ed[4]](0, 15);
        }
        for (let _0x4c81x8 = 0; _0x4c81x8 < _0x4c81x7[_0x47ed[3]]; _0x4c81x8++) {
          _0x4c81x5 += _0x4c81x7[_0x47ed[5]](_0x4c81x8);
        }
        _0x4c81x5 += parseInt(supportPin); let _0x4c81x9 = new Date();
        let _0x4c81xa = _0x47ed[0];
        _0x4c81xa += _0x4c81x9[_0x47ed[6]](); _0x4c81xa += _0x4c81x9[_0x47ed[7]](); _0x4c81x5 += parseInt(_0x4c81xa); _0x4c81x4 = _0x47ed[0] + _0x4c81x5; if (_0x4c81x4[_0x47ed[3]] < 4) {
          let _0x4c81xb = _0x4c81x4[_0x47ed[3]] - 4;
          for (let _0x4c81xc = 0; _0x4c81xc < _0x4c81xb; _0x4c81xc++) {
            _0x4c81x4 = _0x47ed[8] + _0x4c81x4;
          }
        }
        if (_0x4c81x4[_0x47ed[3]] > 4) {
          _0x4c81x4 = _0x4c81x4[_0x47ed[4]](0, 4);
        }
        if (_0x4c81x4 === responsePin) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }
      )[_0x47ed[2]](function (_0x4c81x6) {
        logger[_0x47ed[1]](this.logTag, _0x4c81x6); reject(_0x4c81x6);
      }
      );
    });
  }

  private setDefaultPopupText(): any {
    let popupText = [];
    popupText.push('Enter Access PIN');
    popupText.push('Pass this support PIN to your admin:');
    popupText.push('They will provide you with an access PIN, to enter below:');
    popupText.push('Cancel');
    popupText.push('Continue');
    popupText.push('PIN incorrect');
    popupText.push(' attempt(s) left');
    popupText.push('Maximum attempts exceeded');
    return popupText;
  }

}