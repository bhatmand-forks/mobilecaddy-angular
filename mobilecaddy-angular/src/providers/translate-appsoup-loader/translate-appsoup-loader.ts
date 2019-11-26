import { Injectable } from '@angular/core';
import { TranslateLoader } from "@ngx-translate/core";
import { File } from '@ionic-native/file';
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import * as logger from 'mobilecaddy-utils/logger';
import * as appDataUtils from 'mobilecaddy-utils/appDataUtils';

@Injectable()
export class TranslateAppSoupLoader implements TranslateLoader {

  logTag: string = 'TranslateAppSoupLoader';
  defaultPath: string = '/assets/i18n/';
  suffix: string = '.json';

  constructor(private http: HttpClient, private file: File) {}

  /**
   * Gets the translations from appSoup, if it exists
   */
  public getTranslation(lang: string): Observable<Object> {
    // TODO - Fallback go get from project dir
    console.log(this.logTag, 'getTranslation', lang);

    let storageDirectory = this.getStorageDirectory();

    if ( lang.includes('default') ) {
      let lang2 = lang.substr(8, 2);
      console.log("getting deafult", lang2);
      return this.http.get(`${this.defaultPath}${lang2}${this.suffix}`);
    } else {
      console.log("getting from appSoup");
      return Observable.fromPromise(
        appDataUtils.getCurrentValueFromAppSoup('translations-' + lang).then( trans => {
          console.log('trans', trans);
          return trans;
        })
      );
    }

  }

  private getStorageDirectory() {
    let storageDirectory = localStorage.getItem('mcTranslateFileStorageDirectory');
    if (storageDirectory) {
      return storageDirectory;
    } else {
      if (!this.file) {
        storageDirectory = 'CodeFlow';
      } else if (this.file.documentsDirectory) {
        // iOS
        storageDirectory = this.file.documentsDirectory;
      } else {
        storageDirectory = this.file.dataDirectory;
      }
      localStorage.setItem('mcTranslateFileStorageDirectory', storageDirectory);
      return storageDirectory;
    }
  }
}