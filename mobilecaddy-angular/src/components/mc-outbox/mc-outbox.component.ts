import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LoadingController, ModalController } from 'ionic-angular';

import { McSyncService } from '../../providers/mc-sync/mc-sync.service';
import { McConfigService } from '../../providers/mc-config/mc-config.service';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';

import { McFailuresPage } from '../../pages/mc-failures/mc-failures';

export interface outboxSummary {
  name: string;
  count: number;
  displayName: string;
  startIcon: string;
  startIconColor: string;
  endIcon: string
  endIconColor: string;
  errorCount: number;
}

@Component({
  selector: 'mc-outbox',
  templateUrl: './mc-outbox.component.html'
})
export class OutboxComponent implements OnInit, OnDestroy {
  private logTag: string = 'mc-outbox.component.ts';

  // Do we show all tables or just the ones to be synced?
  @Input('showAllTables') showAllTables: boolean = false;

  // Where do we show the sync button(s)?
  @Input('showSyncButtonTop') showSyncButtonTop: boolean = false;
  @Input('showSyncButtonBottom') showSyncButtonBottom: boolean = true;

  // Name of icon to be shown at start on table line
  @Input('okIconName') okIconName: string = 'checkmark';
  @Input('toSyncIconName') toSyncIconName: string = 'ios-cloud-upload-outline';
  @Input('errorIconName') errorIconName: string = 'close';

  // Color of icon to be shown at start on table line
  @Input('okIconColor') okIconColor: string = 'primary';
  @Input('toSyncIconColor') toSyncIconColor: string = 'secondary';
  @Input('errorIconColor') errorIconColor: string = 'danger';

  // Name of icon to be shown at end on table line if an error found
  @Input('errorEndIconName') errorEndIconName: string = 'arrow-forward';
  @Input('errorEndIconColor') errorEndIconColor: string = 'danger';

  // Name of color for error text (i.e. 'View errors')
  @Input('errorColor') errorColor: string = 'danger';

  dirtyRecordsSummary: outboxSummary[];
  syncingFlag;
  private config: any;
  private syncSub;

  // The failures returned by syncRefresh.getSyncRecFailures()
  private failures: any;

  constructor(
    public loadingCtrl: LoadingController,
    private mcSyncService: McSyncService,
    private mcConfigService: McConfigService,
    private modalCtrl: ModalController
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

  ngOnDestroy() {
    // console.log('ngOnDestroy');
    this.syncSub.unsubscribe();
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

      // Check for record failures
      this.failures = syncRefresh.getSyncRecFailures();
      // console.log(this.logTag, 'failures', this.failures);

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
              let dirtyCount: number = tableCount[knownTable] ? tableCount[knownTable] : 0;
              // Add to summary
              summary.push(this.buildSummary(knownTable, dirtyCount, tableNameMap[knownTable]));
            }
          } else {
            // Iterate over just the dirty records
            for (var p in tableCount) {
              if (tableCount.hasOwnProperty(p)) {
                // Add to summary
                summary.push(this.buildSummary(p, tableCount[p], tableNameMap[p]));
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

  private buildSummary(tableName: string, dirtyCount: number, displayName: string): outboxSummary {
    // See if table has any failures
    let errors: number = this.getTableErrorsCount(tableName);
    // Set icons and colors depending on counts
    let startIcon = this.okIconName; /* default to ok */
    if (errors > 0) {
      startIcon = this.errorIconName;
    } else if (dirtyCount > 0) {
      startIcon = this.toSyncIconName;
    }
    let startIconColor = this.okIconColor; /* default to ok */
    if (errors > 0) {
      startIconColor = this.errorIconColor;
    } else if (dirtyCount > 0) {
      startIconColor = this.toSyncIconColor;
    }
    // Return summary
    return {
      name: tableName,
      count: dirtyCount,
      displayName: displayName,
      startIcon: startIcon,
      startIconColor: startIconColor,
      endIcon: errors > 0 ? this.errorEndIconName : '',
      endIconColor: errors > 0 ? this.errorEndIconColor : '',
      errorCount: errors
    }
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

  private getTableErrorsCount(tableName: string): number {
    let result: number = 0;
    for (let i = 0; i < this.failures.length; i++) {
      if (this.failures[i].table == tableName) {
        Object.keys(this.failures[i].failures).map(failure => {
          result++;
        });
        break;
      }
    }
    return result;
  }

  private getTableFailures(tableName: string): any {
    // Get the table failures into an array
    let tablefailures: any = [];
    for (let i = 0; i < this.failures.length; i++) {
      if (this.failures[i].table == tableName) {
        Object.keys(this.failures[i].failures).map(failure => {
          tablefailures.push(this.failures[i].failures[failure]);
        });
        break;
      }
    }
    return tablefailures;
  }

  showFailure(summary: outboxSummary, event: any) {
    event.stopPropagation();
    // console.log('summary', summary);
    if (summary.errorCount > 0) {
      let data = {
        failures: this.getTableFailures(summary.name),
        displayName: summary.displayName
      }
      this.modalCtrl
        .create(McFailuresPage, { data: data })
        .present();
    }

  }

}