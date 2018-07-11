import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as appDataUtils from 'mobilecaddy-utils/appDataUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as syncRefresh from 'mobilecaddy-utils/syncRefresh';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpParams
} from '@angular/common/http';

export interface requestObject {
  method?: string; // HTTP method: GET, POST, etc. Optional - Default is 'GET'
  path: string; // path in to the Salesforce endpoint - Required
  params?: object; // queryString parameters as a map - Optional
  data?: object; // JSON object to send in the request body - Optional
  contentType?: string;
}

@Injectable()
export class SalesforceRestService {
  private logTag: string = 'salesforce-rest-service.ts';
  private oauth;
  private failCount: number = 0;
  private apiVersin: string = 'v40.0';

  constructor(private http: HttpClient) {
    // TODO Take in oprional API version from Config service
  }

  // * P U B L I C    M E T H O D S

  query(soql: string): Promise<any> {
    return new Promise(function(resolve, reject) {
      this.request({
        path: '/services/data/' + this.apiVersion + '/query',
        params: { q: soql }
      })
        .then(result => {
          resolve(result);
        })
        .catch(e => {
          logger.error(this.logTag, 'query', e);
          reject(e);
        });
    });
  }

  request(obj: requestObject): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!window['LOCAL_DEV']) {
        this.setUpOauth()
          .then(r => {
            return this.doRequest(obj);
          })
          .then(r => {
            this.failCount = 0;
            resolve(r);
          })
          .catch(e => {
            logger.error(this.logTag, 'request failed', e);
            if (this.failCount > 0) {
              this.failCount = 0;
              reject(e);
            } else {
              this.failCount++;
              syncRefresh.refreshToken(
                function() {
                  logger.info('refreshToken success');
                  return this.request(obj);
                },
                function(e) {
                  logger.error('refreshToken failed', e);
                  reject(e);
                }
              );
            }
          });
      } else {
        // Use our already instatiated forcejs
        this.forcejsRequest(obj)
          .then(r => {
            resolve(r);
          })
          .catch(e => {
            logger.error(this.logTag, 'request', e);
            reject(e);
          });
      }
    });
  }

  upload(file: File) {
    return new Promise((resolve, reject) => {
      if (!window['LOCAL_DEV']) {
        this.setUpOauth()
          .then(r => {
            return this.doUpload(file);
          })
          .then(result => {
            console.log(this.logTag, 'doUpload Result', result);
            resolve(result);
          })
          .catch(e => {
            logger.error(this.logTag, 'oauth setup failed', e);
            reject(e);
          });
      } else {
        // Use our already instatiated forcejs
        this.forcejsUpload(file)
          .then(result => {
            resolve(result);
          })
          .catch(e => {
            logger.error(this.logTag, 'upload', e);
            reject(e);
          });
      }
    });
  }

  // * P R I V A T E    M E T H O D S

  private doRequest(obj: requestObject): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(this.logTag, 'oauth', this.oauth);
      let method = obj.method || 'GET';

      let headers = new HttpHeaders({
        Authorization: 'Bearer ' + this.oauth.accessToken
      });
      if (obj.contentType) {
        headers.append('Content-Type', obj.contentType);
      }

      const params = new HttpParams(obj.params);

      // dev friendly API: Add leading '/' if missing so url + path concat always works
      if (obj.path.charAt(0) !== '/') {
        obj.path = '/' + obj.path;
      }
      let url = this.oauth.instanceUrl + obj.path;

      const req = new HttpRequest(method, url, obj.data, { headers, params });

      this.http.request(req).subscribe(
        res => {
          resolve(res);
        },
        err => {
          // * Weird here as looks like SF does not return CORS headers for non  200
          if (err.status === 0 && !err.data && !err.statusText) {
            this.oauth = null;
            reject('$http failed with status code 0');
          } else {
            reject(err);
          }
        }
      );
    });
  }

  private forcejsRequest(obj: requestObject): Promise<any> {
    return new Promise((resolve, reject) => {
      window['force'].request(
        obj,
        function(resp) {
          console.log(resp);
          resolve(resp);
        },
        function(e) {
          logger.error('forcejsRequest', e);
          reject(e);
        }
      );
    });
  }

  private doUpload(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      var uploadUrl =
        this.oauth.instanceUrl +
        '/services/data/' +
        this.apiVersin +
        '/connect/files/users/me';

      var headers = new HttpHeaders();
      headers.append('Content-Type', undefined);
      headers.append('Authorization', 'Bearer ' + this.oauth.accessToken);

      var fd = new FormData();
      fd.append('fileData', file);
      fd.append('desc', 'A file I want to upload');
      fd.append('title', 'My File'); // Note: if we live this blank it will take the local filename
      this.http
        .post(uploadUrl, fd, {
          //  transformRequest: angular.identity,
          headers: headers
        })
        .subscribe(
          res => {
            console.log(this.logTag, 'doUpload success');
            resolve(res);
          },
          err => {
            logger.error(this.logTag, 'doUpload', err);
            reject(err);
          }
        );
    });
  }
  private forcejsUpload(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('upload');
      var uploadUrl =
        'http://localhost:3000' +
        '/services/data/' +
        this.apiVersin +
        '/connect/files/users/me';
      let forceOauth = JSON.parse(localStorage.getItem('forceOAuth'));

      console.log('forceOauth', forceOauth);
      let headers = new HttpHeaders();
      // * Had to remove this line as it caused issues - though I have not got this actually uploading yet.
      // * I think it was in so that Salesforce would get the data... as with this removed SF moans that it does not get
      // * the fileData param.
      // headers = headers.set('Content-Type', undefined);
      headers = headers.set('Content-Type', 'multipart/form-data');
      headers = headers.set('Target-URL', forceOauth.instance_url);
      headers = headers.set('Target-Endpoint', forceOauth.instance_url);
      headers = headers.set(
        'Authorization',
        'Bearer ' + forceOauth.access_token
      );
      // let options = new RequestOptions({ headers: headers });

      console.log('headers', headers.getAll('Target-URL'));
      var fd: FormData = new FormData();
      fd.append('fileData', file);
      fd.append('desc', 'A file I want to upload');
      fd.append('title', 'My File'); // Note: if we live this blank it will take the local filename
      this.http
        .post(uploadUrl, fd, {
          //  transformRequest: angular.identity,
          headers: headers
        })
        .subscribe(
          res => {
            console.log(this.logTag, 'forcejsUpload success');
            resolve(res);
          },
          err => {
            logger.error(this.logTag, 'forcejsUpload', err);
            reject(err);
          }
        );
    });
  }

  /**
   * @description Sets up our oauth object from the appSoup. We should only need to do this
   * every now and again as it's a singleton.
   * TODO - At the moment we use the 'appDataUtils', but really we should provide
   *   a non-cached read call into the devUtils. What's here is more of a proof
   *   of concept.
   */
  private setUpOauth(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.oauth) {
        resolve();
      } else {
        console.log(this.logTag, 'Getting oauth details from appSoup');
        appDataUtils
          .getCurrentValueFromAppSoup('accessToken')
          .then(accessToken => {
            this.oauth = { accessToken: accessToken };
            return appDataUtils.getCurrentValueFromAppSoup('refreshToken');
          })
          .then(refreshToken => {
            this.oauth.refreshToken = refreshToken;
            return devUtils.getCachedAppSoupValue('instanceUrl');
          })
          .then(instanceUrl => {
            this.oauth.instanceUrl = instanceUrl;
            resolve();
          })
          .catch(e => {
            this.oauth = null;
            logger.error(this.logTag, 'setUpOauth', e);
            reject(e);
          });
      }
    });
  }
}
