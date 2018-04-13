import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
}

const logTag: string = 'mobilecaddy-sync.service.ts';

@Injectable()
export class MobileCaddySyncService {
  initialSyncState: BehaviorSubject<string> = new BehaviorSubject('');
  syncState: BehaviorSubject<string> = new BehaviorSubject('');
  _syncState: string = '';

  constructor() {
    this.initialSyncState.next(localStorage.getItem('initialSyncState'));
    this.syncState.next('undefined');
  }

  doInitialSync(config: any[]): void {
    console.log(logTag, 'Calling initialSync');
    this.syncState.next('InitialSyncInProgress');
    devUtils.initialSync(config).then(res => {
      localStorage.setItem('initialSyncState', 'InitialLoadComplete');
      console.log(logTag, 'InitialLoadComplete');
      this.initialSyncState.next('InitialLoadComplete');
      this.syncState.next('complete');
    });
  }

  doColdStartSync(coldStartTables: any): void {
    console.log(logTag, 'doColdStartSync', coldStartTables);
    let mobileLogConfig: SyncTableConfig = {
      Name: 'Mobile_Log__mc',
      syncWithoutLocalUpdates: false
    };
    coldStartTables = [mobileLogConfig].concat(coldStartTables);
    this.syncTables(coldStartTables);
  }

  syncTables(tablesToSync: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(logTag, 'syncTables');
      // TODO - put some local notification stuff in here.
      this.doSyncTables(tablesToSync).then(res => {
        this.setSyncState('complete');
        if (!res || res.status == 100999) {
          // LocalNotificationService.setLocalNotification();
        } else {
          // LocalNotificationService.cancelNotification();
        }
        resolve(res);
      });
    });
  }

  doSyncTables(tablesToSync: any[]): Promise<any> {
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

      return tablesToSync.reduce((sequence, table) => {
        if (typeof table.maxTableAge == 'undefined') {
          table.maxTableAge = 1000 * 60 * 1; // 3 minutes
        }
        return sequence
          .then(res => {
            console.log(
              logTag,
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
                table.maxTableAge
              );
            } else {
              //console.log("skipping sync");
              return { status: 100999 };
            }
          })
          .then(resObject => {
            console.log(logTag, resObject);
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
            return resObject;
          })
          .catch(e => {
            console.error(logTag, 'doSyncTables', e);
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

  getSyncState(): BehaviorSubject<String> {
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
}
