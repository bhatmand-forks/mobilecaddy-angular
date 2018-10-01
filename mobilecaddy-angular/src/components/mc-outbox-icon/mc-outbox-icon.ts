/**
 * MobileCaddy Outbox Icon Component
 *
 * @description Manages the outbox icon, representing 'dirty'/'failed' records in Outbox
 *
 */

import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { NavController, ToastController, ToastOptions } from 'ionic-angular';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { McConfigService } from '../../providers/mc-config/mc-config.service';
import { McSyncService } from '../../providers/mc-sync/mc-sync.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { Subscription } from 'rxjs/Subscription';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';

@Component({
  selector: 'mc-outbox-icon',
  templateUrl: 'mc-outbox-icon.html',
  styles: [
    `
      .mc-outbox-icon-button {
        height: 32px;
        position: relative;
        width: 48px;
        top: 1px;
        right: 1px;
        overflow: visible;
        margin-bottom: 0px;
        margin-top: 0px;
        box-shadow: none;
        -webkit-box-shadow: none;
      }
      .mc-outbox-icon-badge {
        font-size: 11px;
        position: absolute;
        top: 0px;
        right: 0px;
        border-radius: 100%;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class McOutboxIconComponent implements OnInit, OnDestroy {
  // Does tapping the icon take the user to the OutboxPage? (true)
  // ...or does it show a Toast? (false)
  @Input('tapAllowed') tapAllowed: boolean = true;

  @Input('iconName') iconName: string = 'ios-cloud-upload';
  @Input('buttonClass') buttonClass: string = 'mc-outbox-icon-button';
  @Input('iconClass') iconClass: string = 'mc-outbox-icon';
  @Input('badgeClass') badgeClass: string = 'mc-outbox-icon-badge';
  @Input('badgeColor') badgeColor: string = 'danger';
  @Input('outboxPage') outboxPage: string = 'OutboxPage';
  @Input('toastOptions') toastOptions: ToastOptions;
  @Input('interval') interval: number = 1000;

  // N.B. 'yellow' needs to be added to $colors array in variables.scss,
  // or, pass in another colour that exists in the $colors array
  @Input('failedColor') failedColor: string = 'yellow';
  @Input('failedText') failedText: string = '!';

  // Developer might want us to emit an event rather than go directly to 'OutboxPage'
  // i.e. they control tap navigation in code
  @Input('useEvent') useEvent: boolean = false;
  @Output() outboxTapped: EventEmitter<any> = new EventEmitter();

  private logTag: string = 'mc-outbox-icon.ts';

  private defaultToastOptions = {
    message: 'You cannot view the Outbox from this screen',
    duration: 3000,
    position: 'top'
  };

  // So we can show the outbox icon and count
  dirtyRecordsCount: number = 0;

  // The text displayed in the badge
  displayText: string;

  // The outbox tables from the app.config.ts
  private outboxTables: any;

  // Subscription for the interval reading the dirty records
  private pollingDirtyRecs: Subscription;

  // Subscription for initial sync
  private getInitStateSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private mcDataProvider: McDataProvider,
    private mcConfig: McConfigService,
    private mcSyncService: McSyncService,
    private toastCtrl: ToastController,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Check to see if our initial sync has completed. If so, we can create interval
    this.getInitStateSubscription = this.mcSyncService.getInitialSyncState().subscribe(initialSyncState => {
      // console.log(this.logTag, 'getInitialSyncState subscribe', initialSyncState);
      if (initialSyncState == 'InitialLoadComplete') {
        // Get outbox tables from config
        this.outboxTables = this.mcConfig.getConfig('outboxTables');
        // console.log(this.logTag, 'outboxTables', outboxTables);

        // Setup the interval subscription
        this.pollingDirtyRecs = Observable.interval(this.interval).subscribe(() => {
          this.checkForUnsyncedRecords();
        });
      }
    });
  }

  ngOnDestroy() {
    this.getInitStateSubscription.unsubscribe();
    if (this.pollingDirtyRecs) {
      this.pollingDirtyRecs.unsubscribe();
    }
    this.cd.detach();
  }

  private checkForUnsyncedRecords() {
    // console.log(this.logTag, 'checkForUnsyncedRecords');
    if (this.outboxTables && this.outboxTables.length > 0) {
      // Extract tables name for ease of processing
      let tableNames = this.outboxTables.map(el => {
        return el.Name;
      });
      // console.log(this.logTag, 'tableNames', tableNames);
      // Get the recs to sync
      this.mcDataProvider.getByFilters('recsToSync').then(recsToSync => {
        // console.log(this.logTag, 'recsToSync', recsToSync);
        let dirtyRecordsCount = 0;
        if (recsToSync && recsToSync.length > 0) {
          for (let i = 0; i < recsToSync.length; i++) {
            for (let j = 0; j < tableNames.length; j++) {
              if (recsToSync[i].Mobile_Table_Name === tableNames[j]) {
                dirtyRecordsCount++;
                break
              }
            }
          }
        }
        // Check for change of dirty records count
        if (dirtyRecordsCount != this.dirtyRecordsCount) {
          this.dirtyRecordsCount = dirtyRecordsCount;
          this.displayText = dirtyRecordsCount.toString();
          if (!this.cd['destroyed']) {
            this.cd.detectChanges();
          }
          // console.log(this.logTag, 'this.dirtyRecordsCount', this.dirtyRecordsCount);
        }
        // Check for record failures
        let failures: any = syncRefresh.getSyncRecFailures();
        // console.log(this.logTag, 'failures', failures);
        if (failures && failures.length > 0) {
          this.badgeColor = this.failedColor;
          this.displayText = this.failedText;
          if (!this.cd['destroyed']) {
            this.cd.detectChanges();
          }
        }
      });
    }
  }

  gotoOutbox() {
    if (this.tapAllowed) {
      if (this.useEvent) {
        this.outboxTapped.emit();
      } else {
        this.navCtrl.push(this.outboxPage);
      }
    } else {
      // Merge toast options passed in with defaults
      let options = Object.assign(this.defaultToastOptions, this.toastOptions);
      // Show toast
      this.toastCtrl.create(options).present();
    }
  }

}