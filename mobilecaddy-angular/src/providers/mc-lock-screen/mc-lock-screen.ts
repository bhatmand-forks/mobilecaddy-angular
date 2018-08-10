import { Injectable } from '@angular/core';
import { ToastController, ModalController, AlertController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { McConfigService } from '../mc-config/mc-config.service';
import { McPinChallengeProvider } from '../../providers/mc-pin-challenge/mc-pin-challenge';

@Injectable()
export class McLockScreenProvider {

  // Default options
  lockScreenOptions = {
    lockScreenText: [],
    lockScreenAttempts: 3,
    getCodePopupText: []
  }

  private isLockScreenPresented: boolean = false;

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public mcPinChallengeProvider: McPinChallengeProvider,
    public mcConfig: McConfigService
  ) { }

  setupLockScreenCode(getCodePopupText?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check to see if any text for alert has been passed in (e.g. for translations).
      let text;
      // Check if parameter contains text
      if (getCodePopupText && getCodePopupText.constructor === Array && getCodePopupText.length === 8) {
        text = getCodePopupText;
      } else {
        // Set default text
        text = [
          'Secure your App',
          'Please set your Lock Code for this App. (4 numbers only):',
          'Set Code',
          'Set Code',
          'Both codes need to match and be 4 numbers',
          'OK',
          'Code...',
          'Verify code...'
        ];
      }
      // Create alert to capture new passcode
      let inputAlert = this.alertCtrl.create({
        title: text[0],
        message: text[1],
        enableBackdropDismiss: false,
        inputs: [
          {
            placeholder: text[6],
            name: 'code1',
            type: 'password'
          },
          {
            placeholder: text[7],
            name: 'code2',
            type: 'password'
          }
        ],
        buttons: [
          {
            text: text[2],
            handler: data => {
              let fourDigits = /^([0-9]){4}$/;
              if (!fourDigits.test(data.code1) || !fourDigits.test(data.code2) || data.code1 !== data.code2) {
                let alert = this.alertCtrl.create({
                  title: text[3],
                  message: text[4],
                  buttons: [text[5]]
                });
                alert.present();
                return false;
              } else {
                this.setCode(data.code1);
                resolve(true);
                return true;
              }
            }
          }
        ]
      });
      inputAlert.present();
    });
  }

  presentLockScreen(lockScreenComponent: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Only allow one lock screen to presented
      if (this.isLockScreenPresented) {
        resolve(false);
      } else {
        // Override/merge config options with the class defaults
        this.setOptions();
        // Get the previously set screen lock passcode
        this.getCode().then(code => {
          if (code) {
            // Check for overriding text for the modal/toast
            let text = ['Unlock App', ' wrong passcode attempt(s)', 'AC', 'DEL']; // defaults
            if (this.lockScreenOptions.lockScreenText && this.lockScreenOptions.lockScreenText.constructor === Array) {
              if (this.lockScreenOptions.lockScreenText.length >= 1) {
                text[0] = this.lockScreenOptions.lockScreenText[0];
              }
              if (this.lockScreenOptions.lockScreenText.length >= 2) {
                text[1] = this.lockScreenOptions.lockScreenText[1];
              }
              if (this.lockScreenOptions.lockScreenText.length >= 3) {
                text[2] = this.lockScreenOptions.lockScreenText[2];
              }
              if (this.lockScreenOptions.lockScreenText.length == 4) {
                text[3] = this.lockScreenOptions.lockScreenText[3];
              }
            }
            // Define lock screen component options
            let lockScreenComponentOptions = {
              code: code,
              ACDelbuttons: true,
              passcodeLabel: text[0],
              acLabel: text[2],
              delLabel: text[3],
              onCorrect: () => {
                modal.dismiss();
                this.isLockScreenPresented = false;
                resolve(true);
              },
              onWrong: (attempts) => {
                // Show toast with number of attempts (as long as we have message to display)
                if (text[1] !== '') {
                  let toast = this.toastCtrl.create({
                    message: attempts + text[1],
                    duration: 2000
                  });
                  toast.present();
                }
                // If screen lock attempts is above our limit then user must enter a pin supplied by Salesforce administrator
                if (attempts > this.lockScreenOptions.lockScreenAttempts) {
                  let pinChallengeSubscription: Subscription = this.mcPinChallengeProvider.presentPinChallenge().subscribe(res => {
                    if (res) {
                      // User has successfully entered a pin provided by the administrator (from Salesforce platform).
                      // Remove the old screen lock pin (user had forgotten) and get them to enter a new one
                      this.removeCode();
                      modal.dismiss();
                      this.isLockScreenPresented = false;
                      this.setupLockScreenCode(this.lockScreenOptions.getCodePopupText);
                      pinChallengeSubscription.unsubscribe();
                      resolve(true);
                    }
                  });
                }
              }
            };
            // Define modal options
            let modalOptions = {
              showBackdrop: false,
              enableBackdropDismiss: false,
              cssClass: 'mc-screen-lock-modal'
            };
            // Create and present lock screen as modal
            let modal = this.modalCtrl.create(lockScreenComponent, lockScreenComponentOptions, modalOptions);
            modal.present();
            // Only allow one lock screen to be presented
            this.isLockScreenPresented = true;
          } else {
            // No screen lock passcode found
            resolve(false);
          }
        });
      }
    });
  }

  setOptions() {
    let config = this.mcConfig.getConfig();
    // Check for any config options and merge/override the class options
    if (config.lockScreenOptions) {
      Object.assign(this.lockScreenOptions, config.lockScreenOptions);
    }
  }

  hashCode(s: string): string {
    let h = 0, l = s.length, i = 0;
    if (l > 0) {
      while (i < l) {
        h = (h << 5) - h + s.charCodeAt(i++) | 0;
      }
    }
    return h.toString();
  }

  setCode(code: string) {
    localStorage.setItem('slcode', this.hashCode(code));
  }

  getCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve(localStorage.getItem('slcode'));
    });
  }

  removeCode() {
    localStorage.removeItem('slcode');
  }

}