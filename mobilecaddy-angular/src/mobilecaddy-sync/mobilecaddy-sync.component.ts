/**
 * MobileCaddy Sync Component
 *
 * @description Checks to see if an initialSync has been completed. If not it
 * call initialSync using config from /app/app.config. A loader is show whilst the sync
 * is in progress and an event is emitted when complete.
 * If the intialSync has already completed then the 'initialLoadComplete' event is
 * emitted straight away.
 *
 * TODO:
 * - Broadcast events for each initial sync - or is this in the actual SyncService?.
 *   This needs an update to devUtils to expose some sort of callback that can give us updates.
 * - Update once devUtils takes in an array of tables
 *
 * Roadmap:
 * - Update UI with "Table x of y", or "downloading Contacts"
 *   This needs an update to devUtils to expose some sort of callback that can give us updates.
 */

import { Component, Input, OnInit } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@Component({
  selector: 'mobilecaddy-sync',
  templateUrl: 'mobilecaddy-sync.component.html'
})
export class MobileCaddySyncComponent implements OnInit {
  logTag: string = 'mobilecaddy-sync.ts';
  @Input() config: any;

  constructor(
    public loadingCtrl: LoadingController,
    private mobilecaddySyncService: MobileCaddySyncService
  ) {}

  ngOnInit() {
    if (this.mobilecaddySyncService.hasInitialSynCompleted()) {
      const coldStart = localStorage.getItem('coldStart')
        ? localStorage.getItem('coldStart')
        : false;
      if (coldStart) {
        localStorage.removeItem('coldStart');
        this.doColdStartSync();
      }
    } else {
      localStorage.removeItem('coldStart');
      this.doInitialSync();
    }
  }

  doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');
    let loader = this.loadingCtrl.create({
      content: 'Running Sync...',
      duration: 120000
    });
    loader.present();

    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(this.logTag, 'SyncState Update', res);
      if (res == 'complete') {
        loader.dismiss();
      }
    });

    this.mobilecaddySyncService.doInitialSync(this.config.initialSyncTables);
  }

  doColdStartSync(): void {
    console.log(
      this.logTag,
      'doColdStartSync',
      this.config.coldStartSyncTables
    );
    this.mobilecaddySyncService.syncTables(this.config.coldStartSyncTables);
  }
}
