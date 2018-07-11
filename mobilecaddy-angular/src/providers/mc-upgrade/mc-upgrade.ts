import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as vsnUtils from 'mobilecaddy-utils/vsnUtils';
import * as logger from 'mobilecaddy-utils/logger';
import { McLoadingProvider } from '../mc-loading/mc-loading';
import { AlertController, AlertOptions, Loading } from 'ionic-angular';

@Injectable()
export class McUpgradeProvider {
  options: any = {
    ignoreRepromptPeriod: false,
    maxPostpones: 5,
    noRepromptPeriod: 1000 * 60 * 5,
    popupText: []
  };
  private readonly defaultNoRepromptPeriod: number = 1000 * 60 * 5; // 5 minutes
  private readonly defaultMaxPostpones: number = 5;
  private postponesCount: number = 0;

  constructor(
    private alertCtrl: AlertController,
    private loadingProvider: McLoadingProvider
  ) {}

  upgrade(options?: any): Observable<boolean> {
    return Observable.create(observer => {
      // Check for any option parameters and merge/override the class options
      if (options) {
        Object.assign(this.options, options);
      }
      console.log('upgrade options', this.options);
      // Check for 'dirty' tables (i.e. device hasn't been synced with platform)
      devUtils.dirtyTables().then(tables => {
        console.log('dirtyTables check');
        if (tables && tables.length === 0) {
          console.log('calling upgradeAvailable');
          vsnUtils.upgradeAvailable().then(res => {
            console.log('upgradeAvailable?', res);
            if (res) {
              // We can choose to ignore the upgrade prompt period.
              // If true, then user is always prompted to upgrade reagrdless of reprompt period.
              // This is useful when in Settings area and upgrade popup needs to be displayed everytime button is tapped
              if (
                this.options.ignoreRepromptPeriod == 'undefined' ||
                this.options.ignoreRepromptPeriod == 'null'
              ) {
                this.options.ignoreRepromptPeriod = false;
              }
              // Have many times can the user postpone the upgrade?
              if (
                this.options.maxPostpones == 'undefined' ||
                this.options.maxPostpones == 'null'
              ) {
                this.options.maxPostpones = this.defaultMaxPostpones;
              }
              // Determine whether the user should be prompted to upgrade.
              // User can postpone the upgrade for a period of time (determined by 'noRepromptPeriod')
              if (
                this.options.noRepromptPeriod == 'undefined' ||
                this.options.noRepromptPeriod == 'null'
              ) {
                this.options.noRepromptPeriod = this.defaultNoRepromptPeriod;
              }
              let prevUpgradeNotification = this.getPrevUpgradeNotification();
              let timeNow = Date.now();
              let repromptPeriodOver: boolean =
                parseInt(prevUpgradeNotification) <
                timeNow - this.options.noRepromptPeriod;
              console.log('repromptPeriodOver', repromptPeriodOver);
              console.log(
                'ignoreRepromptPeriod',
                this.options.ignoreRepromptPeriod
              );
              if (repromptPeriodOver || this.options.ignoreRepromptPeriod) {
                // If we don't have any popup text (or it doesn't have enough items in the array) then set defaults
                // ('popupText' parameter primarily used for apps with translations)
                if (
                  !this.options.popupText ||
                  this.options.popupText.constructor !== Array ||
                  this.options.popupText.length !== 8
                ) {
                  this.options.popupText = this.setDefaultPopupText();
                }
                // Confirm upgrade
                this.confirmUpgrade(
                  this.options.maxPostpones,
                  this.options.popupText,
                  timeNow,
                  observer
                );
              } else {
                observer.next(false);
              }
            } else {
              observer.next(false);
            }
          });
        } else {
          // console.log('dirtyTables found');
          observer.next(false);
        }
      });
    });
  }

  isUpgradeAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      vsnUtils
        .upgradeAvailable()
        .then(res => {
          if (res) {
            return devUtils.dirtyTables();
          } else {
            return null;
          }
        })
        .then(tables => {
          var filteredTables;
          // We can upgrade if we there are no dirty tables apart from Mobile Logs
          if (tables) {
            filteredTables = tables.filter(table => {
              return table !== 'Mobile_Log__mc';
            });
          }
          if (filteredTables && filteredTables.length === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  private confirmUpgrade(
    maxPostpones: number,
    popupText: any,
    timeNow: any,
    observer: any
  ) {
    // Create popup for user to either upgrade or postpone it
    let promptOptions: AlertOptions = {
      enableBackdropDismiss: false,
      title: popupText[0],
      message: popupText[1],
      buttons: [
        {
          /* Upgrade button */
          text: popupText[3],
          handler: data => {
            // Create message to display while we upgrade (if we still can)
            let loader: Loading = this.loadingProvider.createLoading(
              popupText[4]
            );
            loader.present().then(() => {
              // Clear out any previous upgrade notification time
              localStorage.removeItem('prevUpgradeNotification');
              // Reset counter
              this.postponesCount = 0;
              // Perform upgrade (as long as it can still be done)
              console.log('calling upgradeIfAvailable');
              vsnUtils
                .upgradeIfAvailable()
                .then(res => {
                  console.log('upgradeIfAvailable res', res);
                  if (!res) {
                    // Couldn't upgrade (e.g. sync in progress)
                    loader.dismiss();
                    let alert = this.alertCtrl.create({
                      title: popupText[5],
                      subTitle: popupText[6],
                      buttons: [popupText[7]]
                    });
                    alert.present();
                    observer.next(false);
                  } else {
                    loader.dismiss();
                    observer.next(true);
                  }
                })
                .catch(e => {
                  logger.error('vsnUtils.upgradeIfAvailable', e);
                  loader.dismiss();
                  observer.next(false);
                });
            });
          }
        }
      ]
    };
    console.log('maxPostpones', maxPostpones);
    console.log('this.postponesCount', this.postponesCount);
    // Only add the Cancel button to the alert if user hasn't exceeded the maximum allowed postponements
    if (this.postponesCount < maxPostpones) {
      promptOptions.buttons.unshift({
        /* Cancel button */
        text: popupText[2],
        handler: data => {
          this.postponesCount++;
          localStorage.setItem('prevUpgradeNotification', timeNow);
          observer.next(false);
        }
      });
    }
    // Create the popup
    const prompt = this.alertCtrl.create(promptOptions);
    // Show popup
    prompt.present();
  }

  private setDefaultPopupText(): any {
    let popupText = [];
    popupText.push('Upgrade available');
    popupText.push('Would you like to upgrade now?');
    popupText.push('Not just now');
    popupText.push('Yes');
    popupText.push('Upgrading...');
    popupText.push('Upgrade');
    popupText.push(
      'The upgrade could not take place due to sync in progress. Please try again later.'
    );
    popupText.push('OK');
    return popupText;
  }

  private getPrevUpgradeNotification(): string {
    let prevUpgradeNotification = localStorage.getItem(
      'prevUpgradeNotification'
    );
    if (prevUpgradeNotification === null) {
      prevUpgradeNotification = '0';
    }
    return prevUpgradeNotification;
  }
}
