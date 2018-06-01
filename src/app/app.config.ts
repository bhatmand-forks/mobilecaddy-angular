import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  initialSyncTables: string[];
  coldStartSyncTables: SyncTableConfig[];
  forceSyncTables: SyncTableConfig[];
  outboxTables?: OutBoxTableConfig[];
  recentItems?: RecentItemsConfig;
  globalSearch?: any;
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

export interface RecentItemsConfig {
  maxItems?: number;
  encrypted?: boolean;
  tables?: any;
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
  ],

  recentItems: {
    maxItems: 50,
    encrypted: false,
    tables: [
      {
        name: 'Account',
        icon: 'folder',
        href: '/accounts/:Id'
      },
      {
        name: 'Contact',
        icon: 'person',
        href: '/accounts/:AccountId/contacts/:Id'
      }
    ]
  },

  globalSearch: {
    maxItems: 10,
    encrypted: false,
    tables: [
      {
        table: 'Account__ap',
        name: 'Accounts',
        fieldsToQuery: ['Name', 'Description'],
        fieldsToShow: ['Name', 'BillingCountry'],
        icon: 'folder',
        href: '/accounts/:Id'
      },
      {
        table: 'Contact__ap',
        name: 'Contacts',
        fieldsToQuery: ['Name', 'Email'],
        fieldsToShow: ['Name', 'Title'],
        icon: 'person',
        href: '/accounts/:AccountId/contact/:Id'
      }
    ]
  }
};
