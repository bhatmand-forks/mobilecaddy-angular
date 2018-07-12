import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  Loading
} from 'ionic-angular';
import * as smartStoreUtils from 'mobilecaddy-utils/smartStoreUtils';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';
import * as logger from 'mobilecaddy-utils/logger';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as _ from 'underscore';
import { McLoadingProvider } from '../../providers/mc-loading/mc-loading';
import { McSettingsProvider } from '../../providers/mc-settings/mc-settings';
import { SettingsMtiDetailPage } from '../../pages/settings-mti-detail/settings-mti-detail';

@Component({
  selector: 'page-settings-mti',
  templateUrl: 'settings-mti-page.html'
})
export class SettingsMtiPage {
  tables: any = [];
  isRecovery: boolean = false;
  rstTableName: string = 'recsToSync';
  rtsTables: any = [];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingProvider: McLoadingProvider,
    private mcSettingsProvider: McSettingsProvider
  ) {}

  ngOnInit() {
    this.isRecovery = this.navParams.get('recovery') ? true : false;
    // Create message to display during load
    let loader: Loading = this.loadingProvider.createLoading('Loading...');

    loader.present().then(() => {
      // Get table names
      this.getTables()
        .then(res => {
          this.tables = res;
          // If in recovery mode then get the table names from the RTS table
          if (!this.isRecovery) {
            return null;
          } else {
            return devUtils.readRecords(this.rstTableName);
          }
        })
        .then(res => {
          if (res) {
            // In recovery mode - get unique table names to display at top of page
            let remappedRecords = this.mcSettingsProvider.remapToNameValue(
              res['records']
            );
            this.rtsTables = this.getUniqueTableName(remappedRecords);
          }
          loader.dismiss();
        })
        .catch(e => {
          logger.error('ngOnInit', e);
          loader.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Load failed',
            message: 'Error: ' + JSON.stringify(e),
            buttons: ['OK']
          });
          alert.present();
        });
    });
  }

  getTables() {
    return new Promise((resolve, reject) => {
      let tables = [];

      // Add other system tables
      tables.push({ Name: 'syncLib_system_data' });
      tables.push({ Name: 'appSoup' });
      tables.push({ Name: 'cacheSoup' });
      tables.push({ Name: 'recsToSync' });

      smartStoreUtils.listMobileTables(
        smartStoreUtils.ALPHA,
        // listMobileTables success callback
        function(tableNames) {
          tableNames.forEach(tableName => {
            tables.push({ Name: tableName });
            smartStoreUtils.getTableDefnColumnValue(
              tableName,
              'Snapshot Data Required',
              // getTableDefnColumnValue success callback
              function(snapshotValue) {
                // Create the snapshot table too, if required
                if (snapshotValue == 'Yes') {
                  tables.push({ Name: 'SnapShot_' + tableName });
                }
                return tables;
              },
              // getTableDefnColumnValue success callback
              function(e) {
                console.error(
                  'getTableDefnColumnValue -> ' + JSON.stringify(e)
                );
                reject(e);
              }
            );
          });

          resolve(tables);
        },
        // listMobileTables error callback
        function(e) {
          console.error('listMobileTables -> ' + JSON.stringify(e));
          reject(e);
        }
      );
    });
  }

  showTable(tableName: string) {
    this.navCtrl.push(SettingsMtiDetailPage, { tableName: tableName });
  }

  isSyncAvailable(table: any): boolean {
    return (
      (table.Name.indexOf('__ap') >= 0 || table.Name.indexOf('__mc') >= 0) &&
      table.Name.indexOf('SnapShot') < 0
    );
  }

  isSaveToMLAvailable(table: any): boolean {
    return (
      table.Name.indexOf('SnapShot') < 0 &&
      table.Name.indexOf('syncLib') < 0 &&
      !this.isRecovery
    );
  }

  confirmSyncTable(tableName: string) {
    let alert = this.alertCtrl.create({
      title: 'Sync Table ' + tableName,
      message: 'Are you sure you want to sync?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.syncTable(tableName);
          }
        }
      ]
    });
    alert.present();
  }

  private syncTable(tableName: string) {
    // Create message to display during sync
    let loader: Loading = this.loadingProvider.createLoading(
      'Syncing ' + tableName + ' ...'
    );

    loader.present().then(() => {
      // Check whether we're doing a sync after a recovery
      if (this.isRecovery) {
        syncRefresh
          .m2pRecoveryUpdateMobileTable(tableName)
          .then(resObject => {
            let alert;
            if (resObject.status == devUtils.SYNC_OK) {
              let resJson = JSON.parse(resObject.result);
              let resMsg = '';
              if (resJson.is) {
                resMsg += '<p>Insert Success: ' + resJson.is.length + '</p>';
              }
              if (resObject.us) {
                resMsg += '<p>Update Success: ' + resJson.us.length + '</p>';
              }
              alert = this.alertCtrl.create({
                title: 'Force Sync Success',
                message: resMsg,
                buttons: [
                  {
                    text: 'Done',
                    role: 'cancel'
                  },
                  {
                    text: 'Show Full Resp',
                    handler: () => {
                      let alert = this.alertCtrl.create({
                        title: 'Full Response',
                        message:
                          '<p>Returned with:</p><p><pre>' +
                          JSON.stringify(resObject) +
                          '</pre></p>'
                      });
                      alert.present();
                    }
                  }
                ]
              });
            } else {
              alert = this.alertCtrl.create({
                title: 'Force Sync Success',
                message:
                  'Status: ' +
                  resObject.status +
                  '<br/>Additional Status: ' +
                  resObject.mc_add_status,
                buttons: [
                  {
                    text: 'Done',
                    role: 'cancel'
                  }
                ]
              });
            }
            loader.dismiss();
            this.mcSettingsProvider.setHasForceSyncRun(true);
            alert.present();
          })
          .catch(e => {
            logger.error(
              'syncRefresh.m2pRecoveryUpdateMobileTable from settings',
              tableName,
              e
            );
            loader.dismiss();
            let msg = '';
            if (e.status && e.mc_add_status) {
              msg = e.status + ' - ' + e.mc_add_status;
            } else {
              msg = JSON.stringify(e);
            }
            let alert = this.alertCtrl.create({
              title: 'Sync failed',
              message: 'Error: ' + msg,
              buttons: ['OK']
            });
            alert.present();
          });
      } else {
        // Standard sync
        devUtils
          .syncMobileTable(tableName)
          .then(resObject => {
            loader.dismiss();
          })
          .catch(e => {
            logger.error('syncTable from settings', tableName, e);
            loader.dismiss();
            let msg = '';
            if (e.status && e.mc_add_status) {
              msg = e.status + ' - ' + e.mc_add_status;
            } else {
              msg = JSON.stringify(e);
            }
            let alert = this.alertCtrl.create({
              title: 'Sync failed',
              message: 'Error: ' + msg,
              buttons: ['OK']
            });
            alert.present();
          });
      }
    });
  }

  confirmSaveTable(tableName: string) {
    let alert = this.alertCtrl.create({
      title: 'Save Table ' + tableName,
      message: 'Are you sure you want to save the table to the Mobile Log?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.saveTable(tableName);
          }
        }
      ]
    });
    alert.present();
  }

  private saveTable(tableName: string) {
    // Create message to display during save
    let loader: Loading = this.loadingProvider.createLoading(
      'Saving ' + tableName + ' ...'
    );

    loader.present().then(() => {
      // Read the table records
      devUtils
        .readRecords(tableName)
        .then(res => {
          let remappedRecords = this.mcSettingsProvider.remapToNameValue(
            res['records']
          );
          this.mcSettingsProvider.insertMobileLog(remappedRecords);
        })
        .then(res => {
          loader.dismiss();
        })
        .catch(e => {
          logger.error('saveTable', tableName, e);
          loader.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Save failed',
            message: 'Error: ' + JSON.stringify(e),
            buttons: ['OK']
          });
          alert.present();
        });
    });
  }

  private getUniqueTableName(remappedRecords): any {
    // console.log(remappedRecords);
    let tableNames = [];
    remappedRecords.forEach(rec => {
      Object.keys(rec).forEach(key => {
        if (rec[key].Name === 'Mobile_Table_Name') {
          tableNames.push(rec[key].Value);
        }
      });
    });
    // Count unique table names
    let counts = _.countBy(tableNames);

    // Build array for page display
    let uniqueTables = [];
    Object.keys(counts).forEach(key =>
      uniqueTables.push({ name: key, count: counts[key] })
    );

    return uniqueTables;
  }
}
