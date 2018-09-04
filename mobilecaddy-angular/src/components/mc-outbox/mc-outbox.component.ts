import { Component, OnInit } from '@angular/core';
import { LoadingController } from 'ionic-angular';

import { McSyncService } from '../../providers/mc-sync/mc-sync.service';
import { McConfigService } from '../../providers/mc-config/mc-config.service';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

export interface outboxSummary {
  name: string;
  count: number;
  displayName: string;
}

@Component({
  selector: 'mc-outbox',
  templateUrl: './mc-outbox.component.html'
  // styleUrls: ['./mc-outbox.component.css']
})
export class OutboxComponent implements OnInit {
  private logTag: string = 'mc-outbox.component.ts';
  dirtyRecordsSummary: outboxSummary[];
  private config: any;
  private syncSub;
  private syncingFlag;

  constructor(
    public loadingCtrl: LoadingController,
    private mcSyncService: McSyncService,
    private McConfigService: McConfigService
  ) {}

  async ngOnInit() {
    this.syncingFlag = false;
    this.config = this.McConfigService.getConfig();
    console.log(this.logTag, 'ngOnInit');
    this.dirtyRecordsSummary = await this.getDirtyRecords();
    console.log(this.logTag, this.dirtyRecordsSummary);

    // Subscribe to updates from the SyncService
    if (this.syncSub) this.syncSub.unsubscribe();
    this.syncSub = this.mcSyncService.getSyncState().subscribe(async res => {
      console.log(this.logTag, 'SyncState Update', res);
      // Update dirty records summary if needed, and set synciingFlag
      if (typeof res.status !== 'undefined') {
        if (res.status == 100400) {
          this.dirtyRecordsSummary = await this.getDirtyRecords();
        } else if (res.status === 0) {
          this.syncingFlag = true;
        }
      } else {
        switch (res) {
          case 'complete':
            this.syncingFlag = false;
            break;
          case 'InitialSyncInProgress':
          case 'syncing':
            this.syncingFlag = true;
            break;
        }
      }
    });
  }

  doSync(event): void {
    console.log(this.logTag, 'doSync2');

    this.mcSyncService.syncTables('forceSync').catch(e => {
      logger.error(e);
    });
  }

  /**
   * @returns Promise Resolves to outboxSummary[]
   */
  private getDirtyRecords(): any {
    return new Promise((resolve, reject) => {
      let knownTables: string[] = this.getKnownTables();
      let tableNameMap = this.getTableNameMap();
      devUtils
        .readRecords('recsToSync', [])
        .then(resObject => {
          let tableCount = _.chain(resObject.records)
            .filter(function(el) {
              return knownTables.includes(el.Mobile_Table_Name) ? true : false;
            })
            .countBy('Mobile_Table_Name')
            .value();

          let summary = [];
          for (var p in tableCount) {
            if (tableCount.hasOwnProperty(p)) {
              summary.push({
                name: p,
                count: tableCount[p],
                displayName: tableNameMap[p]
              });
            }
          }
          resolve(summary);
        })
        .catch(e => {
          logger.error(this.logTag, e);
          reject(e);
        });
    });
  }

  private getKnownTables(): string[] {
    return this.config.outboxTables
      ? this.config.outboxTables.map(el => {
          return el.Name;
        })
      : [];
  }

  private getTableNameMap() {
    let myMap = {};
    this.config.outboxTables.forEach(element => {
      myMap[element.Name] = element.DisplayName;
    });
    return myMap;
  }
}
