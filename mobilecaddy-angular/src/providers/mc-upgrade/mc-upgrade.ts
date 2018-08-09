import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as vsnUtils from 'mobilecaddy-utils/vsnUtils';
import * as logger from 'mobilecaddy-utils/logger';
import { McLoadingProvider } from '../mc-loading/mc-loading';
import { AlertController, AlertOptions, Loading } from 'ionic-angular';
import { McConfigService } from '../../providers/mc-config/mc-config.service';

@Injectable()
export class McUpgradeProvider {
  
  upgradeOptions = {
    ignoreRepromptPeriod: false,
    maxPostpones: 5,
    noRepromptPeriod: 1000 * 60 * 5,
    popupText: []
  };
  private postponesCount: number = 0;

  constructor(
    private alertCtrl: AlertController,
    private loadingProvider: McLoadingProvider,
    public mcConfig: McConfigService
  ) { }

  upgrade(options?: any): Observable<boolean> {
    return Observable.create(observer => {
      // Check for any config options and merge/override the class options
      let config = this.mcConfig.getConfig();
      if (config.upgradeOptions) {
        Object.assign(this.upgradeOptions, config.upgradeOptions);
      }
      // Check for any option parameters and merge/override the class options
      if (options) {
        Object.assign(this.upgradeOptions, options);
      }
      console.log('upgrade options', this.upgradeOptions);
      // Check for 'dirty' tables (i.e. device hasn't been synced with platform)
      devUtils.dirtyTables().then(tables => {
        console.log('dirtyTables check');
        if (tables && tables.length === 0) {
          console.log('calling upgradeAvailable');
          vsnUtils.upgradeAvailable().then(res => {
            console.log('upgradeAvailable?', res);
            if (res) {
              let prevUpgradeNotification = this.getPrevUpgradeNotification();
              let timeNow = Date.now();
              let repromptPeriodOver: boolean =
                parseInt(prevUpgradeNotification) <
                timeNow - this.upgradeOptions.noRepromptPeriod;
              console.log('repromptPeriodOver', repromptPeriodOver);
              console.log(
                'ignoreRepromptPeriod',
                this.upgradeOptions.ignoreRepromptPeriod
              );
              if (repromptPeriodOver || this.upgradeOptions.ignoreRepromptPeriod) {
                // If we don't have any popup text (or it doesn't have enough items in the array) then set defaults
                // ('popupText' parameter primarily used for apps with translations)
                if (
                  !this.upgradeOptions.popupText ||
                  this.upgradeOptions.popupText.constructor !== Array ||
                  this.upgradeOptions.popupText.length !== 8
                ) {
                  this.upgradeOptions.popupText = this.setDefaultPopupText();
                }
                // Confirm upgrade
                this.confirmUpgrade(
                  this.upgradeOptions.maxPostpones,
                  this.upgradeOptions.popupText,
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
