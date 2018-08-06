/**
 * MobileCaddy Sync Icon Component
 *
 * @description Manages the sync icon, representing the connection state, sync
 *  state, and outbox state.
 *  Note - we're using OnPush change detection, as it wasn't working with the automatic approach
 *
 * TODO:
 * - Outbox state
 *
 * Roadmap:
 * -
 */

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync-service/mobilecaddy-sync-service.service';
import { Network } from '@ionic-native/network';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

const logTag: string = 'mc-sync-icon.component.ts';

@Component({
  selector: 'mc-sync-icon',
  templateUrl: 'mc-sync-icon.component.html',
  styles: [
    `
      ion-buttons {
        display: block;
        float: right;
      }
      @-webkit-keyframes anim-rotate {
        0% {
          -webkit-transform: rotate(0);
          transform: rotate(0);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes anim-rotate {
        0% {
          -webkit-transform: rotate(0);
          transform: rotate(0);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      .spinner {
        -webkit-animation: 1.6s linear infinite anim-rotate;
        animation: 1.6s linear infinite anim-rotate;
      }
      .spinner--steps {
        -webkit-animation: 0.8s steps(8) infinite anim-rotate;
        animation: 0.8s steps(8) infinite anim-rotate;
      }
      .spinner--steps2 {
        -webkit-animation: 0.8s steps(12) infinite anim-rotate;
        animation: 0.8s steps(12) infinite anim-rotate;
      }
    `
  ],
  /*  Using Inline styles at the moment. Doing this as I can't work out how to use scss
   or css, and still have the module live-reload. Maybe I could do this using custom sass scripts also. */
  // styleUrls: ['mobilecaddy-sync-icon.component.css']
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileCaddySyncIconComponent implements OnInit, OnDestroy {
  iconName: string = 'cloud-done';
  spinnerClass: string = '';
  private syncStateSubscription: Subscription;
  private disconnectSubscription: Subscription;
  private connectSubscription: Subscription;

  constructor(
    private mobilecaddySyncService: MobileCaddySyncService,
    private network: Network,
    private cd: ChangeDetectorRef
  ) {}
  // constructor() {}

  ngOnInit() {
    console.log(this.network.type);
    this.syncStateSubscription = this.mobilecaddySyncService
      .getSyncState()
      .subscribe(res => {
        console.log(logTag, 'SyncState', res);
        switch (res) {
          case 'complete':
            switch (this.network.type) {
              case 'none':
                this.iconName = 'cloud-outline';
                break;
              default:
                this.iconName = 'cloud-done';
            }
            this.spinnerClass = '';
            break;
          case 'InitialSyncInProgress':
          case 'syncing':
            this.iconName = 'refresh';
            this.spinnerClass = 'spinner';
            break;
        }
        // Below line errors when syncing when coming back to the page
        if (!this.cd['destroyed']) {
          this.cd.detectChanges();
        }
      });

    // watch network for a disconnect
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('MC network was disconnected :-(');
      this.iconName = 'cloud-outline';
      this.spinnerClass = '';
      this.cd.detectChanges();
    });

    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('MC network connected!');
      // Only set to a cloud if we're not currently syncing
      if (this.iconName != 'refresh') {
        this.spinnerClass = '';
        this.iconName = 'cloud-done';
      }
      this.cd.detectChanges();
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('MC we got a wifi connection, woohoo!');
        }
      }, 3000);
    });
  }

  ngOnDestroy() {
    // stop watching for online/offline
    console.log('ngnOnDestroy');
    this.syncStateSubscription.unsubscribe();
    this.cd.detach();
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
  }
}
