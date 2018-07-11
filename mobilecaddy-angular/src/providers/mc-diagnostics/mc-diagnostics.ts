import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

@Injectable()
export class McDiagnosticsProvider {
  constructor() {}

  /**
   * Returns whether or not we have a "cached" or "preBootstrap-cached" entry in the cacheSoup
   */
  getCachedFlag(): Promise<string> {
    return new Promise((resolve, reject) => {
      devUtils
        .readRecords('cacheSoup')
        .then(result => {
          let cachedRecord = _.find(result.records, function(rec) {
            return (
              rec.Description === 'cached' ||
              rec.Description === 'preBootstrap-cached'
            );
          });
          console.log('cachedRecord', cachedRecord);
          if (cachedRecord) {
            resolve('True');
          } else {
            resolve('False');
          }
        })
        .catch(e => {
          logger.error(e);
          reject(e);
        });
    });
  }

  /**
   * Does a low-level call to the MobileCaddy heartbeat
   */
  testVfRemote() {
    return new Promise((resolve, reject) => {
      try {
        window['Visualforce'].remoting.Manager.invokeAction(
          'mobilecaddy1.MobileCaddyStartPageController001_mc.heartBeat',
          function(result, event) {
            if (event.status) {
              resolve({ result: result, event: event });
            } else {
              reject(event);
            }
          },
          { escape: false, timeout: 30000 }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}
