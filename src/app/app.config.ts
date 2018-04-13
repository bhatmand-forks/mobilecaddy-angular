import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  initialSyncTables: string[];
  coldStartSyncTables: SyncTableConfig[];
  outboxTables?: OutBoxTableConfig[];
}

export interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
}

export interface OutBoxTableConfig {
  Name: string;
  DisplayName: string;
}

// const fourHours: number = 1000 * 60 * 60 * 4;
const oneMinute: number = 1000 * 60;

export const AppConfig: IAppConfig = {
  initialSyncTables: ['Account__ap', 'Contact__ap'],
  coldStartSyncTables: [
    {
      Name: 'Account__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: oneMinute
    },
    {
      Name: 'Contact__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: oneMinute
    }
  ],
  outboxTables: [
    { Name: 'Account__ap', DisplayName: 'Accounts' }
    // { Name: 'Contact__ap', DisplayName: 'Contacts' }
  ]
};
