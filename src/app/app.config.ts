import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  initialSyncTables: string[];
  coldStartSyncTables: SyncTableConfig[];
  forceSyncTables: SyncTableConfig[];
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
  // Tables to sync on initialSync
  initialSyncTables: ['Account__ap', 'Contact__ap'],

  // Tables to sync on Cold Start
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

  // Tables used in Outbox and Settings Sync
  forceSyncTables: [
    {
      Name: 'Account__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: 0
    },
    {
      Name: 'Contact__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: 0
    }
  ],
  outboxTables: [
    { Name: 'Account__ap', DisplayName: 'Accounts' },
    { Name: 'Contact__ap', DisplayName: 'Contacts' }
  ]
};
