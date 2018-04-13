import { Component, Input, OnInit } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

@Component({
  selector: 'mobilecaddy-outbox',
  templateUrl: './outbox.component.html'
  // styleUrls: ['./outbox.component.css']
})
export class OutboxComponent implements OnInit {
  private logTag: string = 'outbox.component.ts';
  dirtyRecordsSummary: any[];
  @Input() config: any;

  constructor(
    public loadingCtrl: LoadingController,
    private mobilecaddySyncService: MobileCaddySyncService
  ) {}

  async ngOnInit() {
    console.log(this.logTag, 'ngOnInit');
    this.dirtyRecordsSummary = await this.getDirtyRecords();
    console.log(this.logTag, this.dirtyRecordsSummary);
  }

  doSync(event): void {
    console.log(this.logTag, 'doSync2');
    let loader = this.loadingCtrl.create({
      content: 'Running Sync...',
      duration: 120000
    });
    loader.present();

    this.mobilecaddySyncService
      .syncTables(this.config.coldStartSyncTables)
      .then(r => {
        loader.dismiss();
        alert(r.status);
      })
      .catch(e => {
        console.error(e);
        loader.dismiss();
      });
  }

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

          console.log(tableCount);
          let summary = [];
          for (var p in tableCount) {
            if (tableCount.hasOwnProperty(p)) {
              // res += p + " , " + records[p] + "\n";
              summary.push({
                name: p,
                count: tableCount[p],
                displayName: tableNameMap[p]
              });
            }
          }
          // let summary = records.map(el => {
          //   el.displayName = tableNameMap[el.Name];
          // });
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
