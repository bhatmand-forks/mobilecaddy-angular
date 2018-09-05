import { Injectable } from '@angular/core';

// interface SyncTableConfig {
//   Name: string;
//   syncWithoutLocalUpdates?: boolean;
//   maxTableAge?: number;
// }

@Injectable()
export class McConfigService {
  private logTag: string = 'mc-config.service.ts';
  private config;
  private configKey: string = 'mc-config';
  test: string;

  constructor() {}

  setConfig(config: any): void {
    console.log(this.logTag, 'setConfig', config);
    this.config = config;
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  getConfig(key?: string): any {
    if (this.config) {
      console.log(this.logTag, 'getConfig from "this"');
      const res = key ? this.config[key] : this.config;
      return typeof res == 'object' ? JSON.parse(JSON.stringify(res)) : res;
    } else {
      console.log(this.logTag, 'getConfig from "localStorage"');
      this.config = JSON.parse(localStorage.getItem(this.configKey));
      const res = key ? this.config[key] : this.config;
      return typeof res == 'object' ? JSON.parse(JSON.stringify(res)) : res;
    }
  }
}
