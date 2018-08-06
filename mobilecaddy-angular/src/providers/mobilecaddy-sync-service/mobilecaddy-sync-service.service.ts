import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { McConfigService } from '../mc-config/mc-config.service';
import * as _ from 'underscore';

interface SyncPointConfig {
  name: string;
  skipSyncPeriod?: number; // Seconds
  tableConfig: SyncTableConfig[];
}

export interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
  maxRecsPerCall?: number; // Note, overrides the SyncPointConfig.skipSyncPeriod
  skipP2M?: boolean;
}

@Injectable()
export class MobileCaddySyncService {
  private logTag: string = 'mobilecaddy-sync.service.ts';
  initialSyncState: BehaviorSubject<string> = new BehaviorSubject('');
  syncState: BehaviorSubject<string | any> = new BehaviorSubject('');
  _syncState: string = '';
  // This callback is fired when a table starts syncing, and when it completes
  private syncCallback: Function = state => {
    this.syncState.next(state);
  };

  constructor(private mobileCaddyConfigService: McConfigService) {
    this.initialSyncState.next(localStorage.getItem('initialSyncState'));
    this.syncState.next('undefined');
  }

  doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');
    this.syncState.next('InitialSyncInProgress');
    devUtils
      .initialSync(
        this.mobileCaddyConfigService.getConfig('initialSyncTables'),
        this.syncCallback
      )
      .then(res => {
        localStorage.setItem('initialSyncState', 'InitialLoadComplete');
        console.log(this.logTag, 'InitialLoadComplete');
        this.initialSyncState.next('InitialLoadComplete');
        this.syncState.next('complete');

        let timeNow = new Date().valueOf().toString();
        localStorage.setItem('lastSyncSuccess', timeNow);
      });
  }

  doColdStartSync(): void {
    console.log(this.logTag, 'doColdStartSync');
    let mobileLogConfig: SyncTableConfig = {
      Name: 'Mobile_Log__mc',
      syncWithoutLocalUpdates: false
    };
    let coldStartTables = [mobileLogConfig].concat(
      this.getConfigFromSyncPoint('coldStart').tableConfig
    );
    this.syncTables(coldStartTables);
  }

  /**
   * @description Gets the tables to sync (from param or config). If from config it also
   *  checks for dirty records and whether or not the sync is not needed due to last sync
   *  being within the configured window.
   *
   * @param tablesToSync Either a string of a syncPoint or and array of table config.
   */
  syncTables(tablesToSync: SyncTableConfig[] | string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(this.logTag, 'syncTables', tablesToSync);
      if (typeof tablesToSync == 'string') {
        // We have a syncPoint name
        let syncPointConfig: SyncPointConfig = this.getConfigFromSyncPoint(
          tablesToSync
        );
        this.getDirtyTables().then(dirtyTables => {
          if (
            syncPointConfig.skipSyncPeriod &&
            localStorage.getItem('lastSyncSuccess') &&
            dirtyTables.length === 0
          ) {
            var timeNow = new Date().valueOf();
            if (
              timeNow >
              parseInt(localStorage.getItem('lastSyncSuccess')) +
                syncPointConfig.skipSyncPeriod * 1000
            ) {
              this.doSyncTables1(syncPointConfig.tableConfig, dirtyTables)
                .then(r => resolve(r))
                .catch(e => reject(e));
            } else {
              resolve('not-syncing:too-soon');
            }
          } else {
            this.doSyncTables1(syncPointConfig.tableConfig, dirtyTables)
              .then(r => resolve(r))
              .catch(e => reject(e));
          }
        });
      } else {
        // We have an array of tables... so let's just sync
        this.doSyncTables(tablesToSync).then(res => {
          this.setSyncState('complete');
          if (!res || res.status == 100999) {
            // LocalNotificationService.setLocalNotification();
          } else {
            // LocalNotificationService.cancelNotification();
          }
          resolve(res);
        });
      }
    });
  }

  /**
   * @description Sorts dirtyTables to front of array, calls our sync, and updates the 'lastSyncSuccess',
   *  if applicable.
   * @param tablesToSync Array of config for our tables that we want to sync
   * @param dirtyTables Array of names of dirty tables.
   */
  doSyncTables1(
    tablesToSync: SyncTableConfig[],
    dirtyTables: String[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let tablesToSync2 = this.maybeReorderTables(tablesToSync, dirtyTables);
      this.doSyncTables(tablesToSync2).then(res => {
        this.setSyncState('complete');
        if (
          res.length == tablesToSync2.length &&
          (res[res.length - 1].status == devUtils.SYNC_OK ||
            res[res.length - 1].status == 100497)
        ) {
          let timeNow = new Date().valueOf().toString();
          localStorage.setItem('lastSyncSuccess', timeNow);
        }
        resolve(res);
      });
    });
  }

  doSyncTables(tablesToSync: SyncTableConfig[]): Promise<any> {
    // Check that we not syncLocked or have a sync in progress
    let syncLock = this.getSyncLock();
    // let syncState = this.getSyncState();
    if (syncLock == 'true' || this._syncState == 'syncing') {
      return Promise.resolve({ status: 100999 });
    } else {
      this.setSyncState('syncing');
      // $rootScope.$broadcast('syncTables', { result: 'StartSync' });
      //   this.tableSyncStatus.emit({ result: 'StartSync' });

      let stopSyncing = false;
      const sequence = Promise.resolve();

      let accum = [];
      return tablesToSync.reduce((sequence, table) => {
        // Set Defaults
        if (typeof table.maxTableAge == 'undefined') {
          // table.maxTableAge = 1000 * 60 * 1; // 3 minutes
          table.maxTableAge = 0; // 0
        }
        if (typeof table.maxRecsPerCall == 'undefined') {
          table.maxRecsPerCall = 200;
        }
        if (typeof table.skipP2M == 'undefined') {
          table.skipP2M = false;
        }
        return sequence
          .then(res => {
            console.log(
              this.logTag,
              'doSyncTables inSequence',
              table,
              res,
              stopSyncing
            );
            // this.tableSyncStatus.emit({
            //   result: 'TableComplete ' + table.Name
            // });
            if (!stopSyncing) {
              return devUtils.syncMobileTable(
                table.Name,
                table.syncWithoutLocalUpdates,
                table.maxTableAge,
                table.maxRecsPerCall,
                table.skipP2M,
                this.syncCallback
              );
            } else {
              //console.log("skipping sync");
              return { status: 100999 };
            }
          })
          .then(resObject => {
            console.log(this.logTag, resObject);
            switch (resObject.status) {
              case devUtils.SYNC_NOK:
              case devUtils.SYNC_ALREADY_IN_PROGRESS:
                if (
                  typeof resObject.mc_add_status == 'undefined' ||
                  resObject.mc_add_status != 'no-sync-no-updates'
                ) {
                  stopSyncing = true;
                  this.setSyncState('complete');
                }
            }
            // this.tableSyncStatus.emit({
            //   table: table.Name,
            //   result: resObject.status
            // });
            accum.push(resObject);
            return accum;
          })
          .catch(e => {
            console.error(this.logTag, 'doSyncTables', e);
            if (e.status != devUtils.SYNC_UNKONWN_TABLE) {
              stopSyncing = true;
              //   this.tableSyncStatus.emit({
              //     table: table.Name,
              //     result: e.status
              //   });
              this.setSyncState('complete');
            }
            return e;
          });
      }, Promise.resolve());
    }
  }

  getSyncLock(syncLockName = 'syncLock'): string {
    var syncLock = localStorage.getItem(syncLockName);
    if (syncLock === null) {
      syncLock = 'false';
      localStorage.setItem(syncLockName, syncLock);
    }
    return syncLock;
  }

  setSyncLock(syncLockName: string, status: string): void {
    if (!status) {
      status = syncLockName;
      syncLockName = 'syncLock';
    }
    localStorage.setItem(syncLockName, status);
  }

  getInitialSyncState(): BehaviorSubject<String> {
    return this.initialSyncState;
  }

  hasInitialSynCompleted(): boolean {
    return localStorage.getItem('initialSyncState') ? true : false;
  }

  getSyncState(): BehaviorSubject<String | any> {
    var syncState = localStorage.getItem('syncState');
    if (syncState === null) {
      syncState = 'complete';
      localStorage.setItem('syncState', syncState);
    }
    // return syncState;
    return this.syncState;
  }

  setSyncState(status: string): void {
    localStorage.setItem('syncState', status);
    this._syncState = status;
    this.syncState.next(status);
  }

  private getConfigFromSyncPoint(name: string): SyncPointConfig {
    const syncPoints = this.mobileCaddyConfigService.getConfig('syncPoints');
    let conf = {
      name: '',
      tableConfig: []
    };
    if (syncPoints) {
      syncPoints.forEach(el => {
        if (el.name == name) conf = el;
      });
      return conf;
    } else {
      return conf;
    }
  }

  /**
   * @returns Promise Resolves to outboxSummary[]
   */
  private getDirtyTables(): Promise<String[]> {
    return new Promise((resolve, reject) => {
      let dirtyTables = [];
      devUtils
        .readRecords('recsToSync', [])
        .then(resObject => {
          let tableCount = _
            .chain(resObject.records)
            .countBy('Mobile_Table_Name')
            .value();

          let summary = [];
          for (var p in tableCount) {
            if (tableCount.hasOwnProperty(p) && p != 'Connection_Session__mc') {
              dirtyTables.push(p);
            }
          }
          resolve(dirtyTables);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  /**
   *
   * @param tablesToSync Array of table config from app.config
   * @param dirtyTables Array of table names that are dirty
   */
  private maybeReorderTables(
    tablesToSync: SyncTableConfig[],
    dirtyTables: String[]
  ) {
    let orderedTables = [];
    tablesToSync.forEach((t, idx) => {
      if (dirtyTables.includes(t.Name)) {
        orderedTables.push(t);
        tablesToSync.splice(idx, 1);
      }
    });
    return orderedTables.concat(tablesToSync);
  }
}
