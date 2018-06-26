import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MobileCaddyConfigService } from '../config-service/config.service';

interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
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

  constructor(private MobileCaddyConfigService: MobileCaddyConfigService) {
    this.initialSyncState.next(localStorage.getItem('initialSyncState'));
    this.syncState.next('undefined');
  }

  doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');
    this.syncState.next('InitialSyncInProgress');
    devUtils
      .initialSync(
        this.MobileCaddyConfigService.getConfig('initialSyncTables'),
        this.syncCallback
      )
      .then(res => {
        localStorage.setItem('initialSyncState', 'InitialLoadComplete');
        console.log(this.logTag, 'InitialLoadComplete');
        this.initialSyncState.next('InitialLoadComplete');
        this.syncState.next('complete');
      });
  }

  doColdStartSync(): void {
    console.log(this.logTag, 'doColdStartSync');
    let mobileLogConfig: SyncTableConfig = {
      Name: 'Mobile_Log__mc',
      syncWithoutLocalUpdates: false
    };
    let coldStartTables = [mobileLogConfig].concat(
      this.MobileCaddyConfigService.getConfig('coldStartSyncTables')
    );
    this.syncTables(coldStartTables);
  }

  syncTables(tablesToSync: any[] | string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(this.logTag, 'syncTables');
      let myTablestoSync =
        typeof tablesToSync == 'string'
          ? this.getTablesToSyncFromSyncPoint(tablesToSync)
          : tablesToSync;
      // TODO - put some local notification stuff in here.
      this.doSyncTables(myTablestoSync).then(res => {
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
        // Set Defaults
        if (typeof table.maxTableAge == 'undefined') {
          table.maxTableAge = 1000 * 60 * 1; // 3 minutes
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
            return resObject;
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

  getTablesToSyncFromSyncPoint(name: string): Array<any> {
    const syncPoints = this.MobileCaddyConfigService.getConfig('syncPoints');
    let tableConf = [];
    if (syncPoints) {
      syncPoints.forEach(el => {
        if (el.name == name) tableConf = el.tableConfig;
      });
      return tableConf;
    } else {
      return tableConf;
    }
  }
}
