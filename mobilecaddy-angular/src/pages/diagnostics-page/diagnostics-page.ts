import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SettingsMtiDetailPage } from '../settings-mti-detail/settings-mti-detail';
import { McDiagnosticsProvider } from '../../providers/mc-diagnostics/mc-diagnostics';
import * as logger from 'mobilecaddy-utils/logger';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-diagnostics',
  templateUrl: 'diagnostics-page.html'
})
export class McDiagnosticsPage implements OnInit, OnDestroy {
  cachedFlag: string = '';
  networkStatus: string = '';
  testTitle: string = '';
  testResults: any = {};
  private disconnectSubscription: Subscription;
  private connectSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private mcDiagnosticsProvider: McDiagnosticsProvider,
    private network: Network,
    private appReference: ApplicationRef
  ) {}

  ngOnInit() {
    this.mcDiagnosticsProvider
      .getCachedFlag()
      .then(cachedFlag => {
        this.cachedFlag = cachedFlag;
      })
      .catch(e => {
        logger.error('mcDiagnosticsProvider.getCachedFlag', e);
      });
    console.log('this.network.type', this.network.type);
    this.networkStatus = this.network.type;

    // watch network for a disconnect
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      setTimeout(() => {
        this.networkStatus = this.network.type;
        this.appReference.tick();
      }, 3000);
    });

    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        this.networkStatus = this.network.type;
        this.appReference.tick();
      }, 3000);
    });
  }

  ngOnDestroy() {
    // stop watching for online/offline
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
  }

  openMobileLogsViewer() {
    this.navCtrl.push(SettingsMtiDetailPage, { tableName: 'Mobile_Log__mc' });
  }

  testHeartbeat() {
    this.testTitle = 'Heartbeat in progress...';
    this.mcDiagnosticsProvider
      .testVfRemote()
      .then(res => {
        this.testTitle = 'Heartbeat Result';
        this.testResults = {
          result: JSON.stringify(res['result']),
          event: JSON.stringify(res['event']),
          error: ''
        };
      })
      .catch(e => {
        let err = this.errToObj(e);
        this.testTitle = 'Heartbeat Error';
        this.testResults = {
          result: '-',
          event: '-',
          error: JSON.stringify(err)
        };
        logger.error('testHeartbeat', err);
      });
  }

  /**
   * Convert Error type to std object, if it is one - as it does not play nice
   * with JSON.stringify.
   * @param e a JS Error.
   */
  errToObj(e: Error): Object {
    let err = {};
    if (e instanceof Error) {
      Object.getOwnPropertyNames(e).forEach(key => {
        err[key] = e[key];
      });
    } else {
      err = e;
    }
    return err;
  }
}
