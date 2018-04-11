/**
 * MobileCaddy Sync Icon Component
 *
 * @description Manages the sync icon, representing the connection state, sync
 *  state, and outbox state
 *
 * TODO:
 * - Connectivity state
 * - Outbox state
 * - Syncing spin icon
 *
 * Roadmap:
 * -
 */

import { Component, OnInit } from '@angular/core';
import { MobileCaddySyncService } from '../mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@Component({
  selector: 'mobilecaddy-sync-icon',
  templateUrl: 'mobilecaddy-sync-icon.component.html',
  styles: [
    `ion-buttons{display:block;float:right}@-webkit-keyframes anim-rotate{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes anim-rotate{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.spinner{-webkit-animation:1.6s linear infinite anim-rotate;animation:1.6s linear infinite anim-rotate}.spinner--steps{-webkit-animation:.8s steps(8) infinite anim-rotate;animation:.8s steps(8) infinite anim-rotate}.spinner--steps2{-webkit-animation:.8s steps(12) infinite anim-rotate;animation:.8s steps(12) infinite anim-rotate}`
  ]
  /*  Using Inline styles at the moment. Doing this as I can't work out how to use scss
   or css, and still have the module live-reload. Maybe I could do this using custom sass scripts also. */
  // styleUrls: ['mobilecaddy-sync-icon.component.css']
})
export class MobileCaddySyncIconComponent implements OnInit {
  logTag: string = 'mobilecaddy-sync-icon.component.ts';
  iconName: string = 'cloud-done';
  spinnerClass: string = '';

  constructor(private mobilecaddySyncService: MobileCaddySyncService) {}
  // constructor() {}

  ngOnInit() {
    this.iconName = 'cloud-done';
    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(this.logTag, 'SyncState Update1', res);
      switch (res) {
        case 'complete':
          this.iconName = 'cloud-done';
          this.spinnerClass = '';
          break;
        case 'InitialSyncInProgress':
        case 'syncing':
          this.iconName = 'refresh';
          this.spinnerClass = 'spinner';
          break;
      }
    });
  }
}
