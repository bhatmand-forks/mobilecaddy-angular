/**
 * MobileCaddy Startup Service
 *
 * @description Handles initialising the app (build tables etc), and handling cold starts.
 * Checks to see if an initialSync has been completed. If not it
 * call initialSync using config from /app/app.config. A loader is show whilst the sync
 * is in progress and an event is emitted when complete.
 * If the intialSync has already completed then the 'initialLoadComplete' event is
 * emitted straight away.
 *
 * TODO:
 * - Update once devUtils takes in an array of tables
 *
 * Roadmap:
 * ?
 */
import { Injectable } from '@angular/core';
import { startup, getStatus } from 'mobilecaddy-utils/startup';
import { Platform } from 'ionic-angular';
// import * as devUtils from 'mobilecaddy-utils/devUtils';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MobileCaddyConfigService } from '../config-service/config.service';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';

declare var cordova;

@Injectable()
export class MobileCaddyStartupService {
  private logTag: string = 'startup.service.ts';
  initStatus: BehaviorSubject<string | any> = new BehaviorSubject('');
  private internalInitStatus: '';
  statusPoll: () => void;
  pollId;
  private config: any;
  private runAlready: boolean = false;

  constructor(
    public platform: Platform,
    private MobileCaddyConfigService: MobileCaddyConfigService,
    private mobilecaddySyncService: MobileCaddySyncService
  ) {
    this.initStatus.next(undefined);
  }

  ngOnInit() {}

  startup(config): boolean {
    console.log(this.logTag, 'startup', this.runAlready);
    let isAlreadyRun = false;
    if (this.runAlready !== true) {
      this.runAlready = true;
      // Set our config in config.service, so that it is available to all
      this.MobileCaddyConfigService.setConfig(config);
      this.config = config;

      if (!localStorage.getItem('coldStart'))
        localStorage.setItem('coldStart', 'true');

      if (
        location.hostname == 'localhost' ||
        !navigator.appVersion.includes('obile')
      ) {
        console.log('Running in CodeFlow');

        this.pollId = window.setTimeout(
          (this.statusPoll = () => {
            this.internalInitStatus = getStatus();
            console.log(this.logTag, 'getStatus', this.internalInitStatus);
            this.initStatus.next({
              status: -1,
              info: this.internalInitStatus[0]
            });
            this.pollId = setTimeout(this.statusPoll, 100);
          }),
          100
        );

        // Running in CodeFlow
        startup()
          .then(res => {
            console.log(this.logTag, 'res', res);
            this.runSync();
            window.clearTimeout(this.pollId);
          })
          .catch(e => {
            window.clearTimeout(this.pollId);
            console.error(this.logTag, e);
          });
      } else {
        // On a device, wait for platform.ready()
        this.pollId = window.setTimeout(
          (this.statusPoll = () => {
            this.internalInitStatus = getStatus();
            console.log(this.logTag, 'getStatus', this.internalInitStatus);
            this.initStatus.next({
              status: -1,
              info: this.internalInitStatus[0]
            });
            this.pollId = setTimeout(this.statusPoll, 100);
          }),
          100
        );

        this.platform
          .ready()
          .then(readySource => {
            console.log(this.logTag, 'Platform ready from', readySource);
            return startup();
          })
          .then(res => {
            this.runSync();
            window.clearTimeout(this.pollId);
            console.log(this.logTag, 'res', res);
          })
          .catch(e => {
            window.clearTimeout(this.pollId);
            console.error(this.logTag, e);
          });
      }
    } else {
      isAlreadyRun = true;
    }
    return isAlreadyRun;
  }

  getInitState(): BehaviorSubject<String | any> {
    return this.initStatus;
  }

  private runSync() {
    // TODO Check whether we should do upgrade check prior to sync
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

  private doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');

    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      this.initStatus.next(res);
    });

    this.maybeAlterIndexSpecs().then(_ => {
      this.mobilecaddySyncService.doInitialSync();
    });
  }

  private doColdStartSync(): void {
    console.log(this.logTag, 'doColdStartSync');
    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      this.initStatus.next(res);
    });

    this.mobilecaddySyncService.doColdStartSync();
  }

  private maybeAlterIndexSpecs(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('maybeAlterIndexSpecs', this.config.indexSpecs);
      if (this.config.indexSpecs) {
        const smartstore = cordova.require('com.salesforce.plugin.smartstore');
        const pArray = this.config.indexSpecs.map(element => {
          return new Promise((resolve, reject) => {
            smartstore.alterSoup(
              element.table,
              element.specs,
              true,
              function(r) {
                console.log('AlteredSoup OK');
                resolve('OK');
              },
              function(r) {
                console.error('AlteredSoup FAILED');
                reject(r);
              }
            );
          });
        });
        Promise.all(pArray).then(results => {
          console.log('results', results);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
