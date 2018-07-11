import { Injectable } from '@angular/core';
import * as smartStoreUtils from 'mobilecaddy-utils/smartStoreUtils';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as vsnUtils from 'mobilecaddy-utils/vsnUtils';
import * as _ from 'underscore';
import { AlertController, AlertOptions, Loading } from 'ionic-angular';
import { McLoadingProvider } from '../mc-loading/mc-loading';

@Injectable()
export class McSettingsProvider {
  private hasForceSyncRun: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private loadingProvider: McLoadingProvider
  ) {}

  remapToNameValue(records: any): any {
    let remappedRecords = [];
    records.forEach(record => {
      let tableRec = [];
      for (let fieldDef in record) {
        let field = {
          Name: fieldDef,
          Value: record[fieldDef],
          ID_flag: this.isId(record[fieldDef])
        };
        tableRec.push(field);
      }
      remappedRecords.push(tableRec);
    });
    return remappedRecords;
  }

  insertMobileLog(recs) {
    return new Promise((resolve, reject) => {
      let remainingData = JSON.stringify(recs);
      let dataToInsert = [];
      // Push 'chunks' of data to array for processing further down
      while (remainingData.length > 0) {
        dataToInsert.push(remainingData.substring(0, 32767));
        remainingData = remainingData.substring(32767);
      }
      // Iterate over the data 'chunks', inserting each 'chunk' into the Mobile_Log_mc table
      let sequence = Promise.resolve();
      dataToInsert.forEach(data => {
        sequence = sequence
          .then(() => {
            let mobileLog = {};
            mobileLog['Name'] = 'TMP-' + new Date().valueOf();
            mobileLog['mobilecaddy1__Error_Text__c'] = data;
            mobileLog['SystemModstamp'] = new Date().getTime();

            return new Promise(function(resolve, reject) {
              smartStoreUtils.insertRecords(
                'Mobile_Log__mc',
                [mobileLog],
                function(res) {
                  resolve(res);
                },
                function(err) {
                  reject(err);
                }
              );
            });
            // return this.insertRecordUsingSmartStoreUtils('Mobile_Log__mc', mobileLog);
          })
          .then(resObject => {
            resolve(resObject);
          })
          .catch(res => {
            reject(res);
          });
      });
    });
  }

  insertRecordUsingSmartStoreUtils(tableName, rec) {
    return new Promise((resolve, reject) => {
      smartStoreUtils.insertRecords(
        tableName,
        [rec],
        function(res) {
          resolve(res);
        },
        function(err) {
          reject(err);
        }
      );
    });
  }

  getRecordForSoupEntryId(tableName, soupRecordId) {
    return new Promise((resolve, reject) => {
      devUtils
        .readRecords(tableName)
        .then(res => {
          let record = _.findWhere(res['records'], {
            _soupEntryId: soupRecordId
          });
          resolve(record);
        })
        .catch(function(res) {
          reject(res);
        });
    });
  }

  /**
   * Works out if val is likely a Salesforce Id based on it's format
   */
  isId(val) {
    if (typeof val !== 'string') {
      return false;
    }
    let patt = /^[a-zA-Z0-9]{18}$/;
    return patt.test(val);
  }

  logout(popupText?: any) {
    // If we don't have any popup text (or it doesn't have enough items in the array) then set defaults
    // ('popupText' parameter primarily used for apps with translations)
    if (
      !popupText ||
      popupText.constructor !== Array ||
      popupText.length !== 3
    ) {
      popupText = [];
      popupText.push('Logout');
      popupText.push('Are you sure you want to logout?');
      popupText.push('Cancel');
      popupText.push('Logout');
    }
    // Set the popup message options
    let promptOptions: AlertOptions = {
      enableBackdropDismiss: false,
      title: popupText[0],
      message: popupText[1],
      buttons: [
        {
          /* Cancel button */
          text: popupText[2]
        },
        {
          /* Logout button */
          text: popupText[3],
          handler: data => {
            devUtils.logout();
          }
        }
      ]
    };
    // Create the popup
    const prompt = this.alertCtrl.create(promptOptions);
    // Show popup
    prompt.present();
  }

  hardReset() {
    // Set the popup message options
    let promptOptions: AlertOptions = {
      enableBackdropDismiss: false,
      title: 'Reset App Data',
      message: 'Are you sure you want to reset ALL application data?',
      buttons: [
        {
          /* Cancel button */
          text: 'Cancel'
        },
        {
          /* Reset button */
          text: 'Reset',
          handler: data => {
            let loader: Loading = this.loadingProvider.createLoading(
              'Reseting app...'
            );
            loader.present().then(() => {
              vsnUtils
                .hardReset()
                .then(res => {
                  loader.dismiss();
                })
                .catch(function(e) {
                  console.error(e);
                  loader.dismiss();
                });
            });
          }
        }
      ]
    };
    // Create the popup
    const prompt = this.alertCtrl.create(promptOptions);
    // Show popup
    prompt.present();
  }

  getHasForceSyncRun(): boolean {
    return this.hasForceSyncRun;
  }

  setHasForceSyncRun(hasForceSyncRun) {
    this.hasForceSyncRun = hasForceSyncRun;
  }
}
