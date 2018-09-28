import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
})
export class OutboxComponent implements OnInit, OnDestroy {
  private logTag: string = 'mc-outbox.component.ts';

  @Input('showAllTables') showAllTables: boolean = false;

  dirtyRecordsSummary: outboxSummary[];
  private config: any;
  private syncSub;
  private syncingFlag;

  constructor(
    public loadingCtrl: LoadingController,
    private mcSyncService: McSyncService,
    private mcConfigService: McConfigService
  ) { }

  async ngOnInit() {
    this.syncingFlag = false;
    this.config = this.mcConfigService.getConfig();
    // console.log(this.logTag, 'ngOnInit');

    this.dirtyRecordsSummary = await this.getDirtyRecords();
    // console.log(this.logTag, this.dirtyRecordsSummary);

    // Subscribe to updates from the SyncService
    if (this.syncSub) this.syncSub.unsubscribe();
    this.syncSub = this.mcSyncService.getSyncState().subscribe(async res => {
      // console.log(this.logTag, 'SyncState Update', res);
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
    // console.log(this.logTag, 'doSync2');
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
      // console.log('knownTables', knownTables);

      let tableNameMap = this.getTableNameMap();
      // console.log('tableNameMap', tableNameMap);

      // Read dirty records
      devUtils
        .readRecords('recsToSync', [])
        .then(resObject => {
          // Dirty record count by table name
          let tableCount = _.chain(resObject.records)
            .filter(function (el) {
              return knownTables.includes(el.Mobile_Table_Name) ? true : false;
            })
            .countBy('Mobile_Table_Name')
            .value();
          // console.log('tableCount', tableCount);

          // Create the summary - input param dictates whether all tables (with zero counts) are shown
          let summary: outboxSummary[] = [];
          if (this.showAllTables) {
            // Iterate over all the 'outbox' tables
            for (let i = 0; i < knownTables.length; i++) {
              let knownTable = knownTables[i];
              // See if the table has dirty records
              let count: number = tableCount[knownTable] ? tableCount[knownTable] : 0;
              // Add to summary
              summary.push({
                name: knownTable,
                count: count,
                displayName: tableNameMap[knownTable]
              });
            }
          } else {
            // Iterate over just the dirty records
            for (var p in tableCount) {
              if (tableCount.hasOwnProperty(p)) {
                summary.push({
                  name: p,
                  count: tableCount[p],
                  displayName: tableNameMap[p]
                });
              }
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

  ngOnDestroy() {
    // console.log('ngOnDestroy');
    this.syncSub.unsubscribe();
  }
}
