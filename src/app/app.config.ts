import { InjectionToken } from '@angular/core';

import { SettingsPage } from '../../mobilecaddy-angular/src/pages/settings-page/settings-page';
import { McMenuFormsPage } from '../../mobilecaddy-angular/src/pages/mc-menu-forms/mc-menu-forms';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  version: string;
  menuItems: menuItemsConfig[];
  indexSpecs?: indexSpecConfig[];
  initialSyncTables: string[];
  syncPoints: SyncPointConfig[];
  outboxTables?: OutBoxTableConfig[];
  recentItems?: RecentItemsConfig;
  globalSearch?: any;
  onResume?: OnResumeConfig;
  onNavigation?: OnNavigationConfig;
  onColdStart?: OnColdStartConfig;
  upgradeOptions?: UpgradeOptionsConfig;
  lockScreenOptions?: LockScreenOptionsConfig;
  platformPinChallengeOptions?: PlatformPinChallengeOptionsConfig;
  settingsPage?: settingsPageConfig;
  mcMenuFormsPage?: McMenuFormsPageConfig;
  mcCompletedFormsPage?: McCompletedFormsPageConfig;
  // tmp line for calling the platform for config
  usePlatformConfig?: boolean;
}

export interface menuItemsConfig {
  name?: string;
  title: string;
  component: any;
  icon?: any;
}

export interface indexSpecConfig {
  table: string;
  specs: Array<{ path: string; type: string }>;
}

export interface SyncPointConfig {
  name: string;
  skipSyncPeriod?: number; // Seconds
  tableConfig: SyncTableConfig[];
}

export interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
  maxRecsPerCall?: number; // Note, overrides the SyncPointConfig.skipSyncPeriod
  skipP2M?: boolean;
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

export interface PageConfig {
  id: string; // Name of the page from the navCtrl
  syncPoint?: string;
  showSyncLoader?: boolean; // default false
  skipSyncPeriod?: number; // Number of secs - If last successful sync was in this time then we don’t sync
  allowUpgrade?: boolean;
}

export interface OnResumeConfig {
  checkPausePeriod?: boolean;
  maxPausePeriod?: number;
  presentLockScreen?: boolean;
  pages?: PageConfig[];
}

export interface OnNavigationConfig {
  checkPausePeriod?: boolean;
  maxPausePeriod?: number;
  presentLockScreen?: boolean;
  pages?: PageConfig[];
}

export interface OnColdStartConfig {
  checkPausePeriod?: boolean;
  maxPausePeriod?: number;
  presentLockScreen?: boolean;
  showSyncLoader?: boolean;
  showBuildMsgs?: boolean;
  upgradeCheck?: boolean;
}

export interface UpgradeOptionsConfig {
  ignoreRepromptPeriod?: boolean;
  maxPostpones?: number;
  noRepromptPeriod?: number;
  popupText?: string[];
}

export interface LockScreenOptionsConfig {
  lockScreenText?: string[];
  lockScreenAttempts?: number;
  getCodePopupText?: string[];
}

export interface PlatformPinChallengeOptionsConfig {
  bypassChallenge?: boolean;
  timeoutPeriod?: number;
  showCancel?: boolean;
  maxAttempts?: number;
  popupText?: string[];
  alertOptions?: any;
  toastOptions?: any;
}

export interface settingsPageConfig {
  loggingLevelTitle?: string;
  loggingLevelOptionsText?: string[];
  loggingLevelCssClass?: string;
}
export interface McMenuFormsPageConfig {
  formVersionFields?: any;
  iconsStart?: any;
  buttonsEnd?: any;
  showSearch?: boolean;
  searchPlaceholder?: string;
  noDataMsg?: string;
  loaderMsg?: string;
}

export interface McCompletedFormsPageConfig {
  formVersionFields?: any;
  showSearch?: boolean;
  searchPlaceholder?: string;
  noDataMsg?: string;
  loaderMsg?: string;
  subTitleField?: string;
}

// const fourHours: number = 1000 * 60 * 60 * 4;
const oneMinute: number = 1000 * 60;

export const AppConfig: IAppConfig = {
  // Our app's version
  version: '1.0.0',

  menuItems: [
    { title: 'Home', component: '' },
    { title: 'Outbox', component: 'OutboxPage' },
    { title: 'Search', component: 'SearchPage' },
    { title: 'Test mc-list', component: 'TestMcListPage' },
    { title: 'Test mc-list images', component: 'TestMcListImagePage' },
    { title: 'Test mc-form', component: 'TestMcFormPage' },
    { title: 'Test Lock Screen', component: 'TestMcLockScreenPage' },
    { title: 'Test Resume/Nav/Cold', component: 'TestMcResumePage' },
    { title: 'Menu Forms', component: McMenuFormsPage },
    { title: 'Settings', component: SettingsPage }
  ],

  // Set our own indexSpecs
  indexSpecs: [
    {
      table: 'Account__ap',
      specs: [
        { path: 'Id', type: 'string' },
        { path: 'Name', type: 'string' },
        { path: 'Description', type: 'string' },
        { path: 'BillingCountry', type: 'string' }
      ]
    }
  ],

  // Tables to sync on initialSync
  initialSyncTables: [
    'Account__ap',
    'Contact__ap',
    'Form_Version__ap',
    'Form_Response__ap'
  ],

  syncPoints: [
    {
      name: 'coldStart',
      tableConfig: [
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
      ]
    },
    {
      name: 'forceSync',
      tableConfig: [
        {
          Name: 'Account__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        },
        {
          Name: 'Contact__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        },
        {
          Name: 'Form_Response__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        }
      ]
    },
    {
      name: 'mySync',
      skipSyncPeriod: 20,
      tableConfig: [
        {
          Name: 'Account__ap'
        },
        {
          Name: 'Contact__ap'
        }
      ]
    }
  ],

  outboxTables: [
    { Name: 'Account__ap', DisplayName: 'Accounts' },
    { Name: 'Contact__ap', DisplayName: 'Contacts' },
    { Name: 'Form_Response__ap', DisplayName: 'Form Response' }
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
        displayFields: [
          {
            fields: ['Name'],
            tags: ['h2']
          },
          {
            fields: ['BillingState', 'Type'],
            tags: ['', 'p'],
            classes: ['desc']
          }
        ],
        icon: 'folder',
        pageName: 'AccountDetailPage',
        navParamName: 'account'
      },
      {
        table: 'Contact__ap',
        name: 'Contacts',
        fieldsToQuery: ['Name', 'Email'],
        displayFields: [
          {
            fields: ['Name'],
            tags: ['h2']
          },
          {
            fields: ['Title'],
            tags: ['p', 'p']
          }
        ],
        icon: 'folder',
        pageName: 'ContactDetailPage',
        navParamName: 'contact'
      }
    ]
  },

  onResume: {
    checkPausePeriod: true,
    maxPausePeriod: 0,
    presentLockScreen: true,
    pages: [
      {
        id: 'test-mc-resume.ts',
        syncPoint: 'mySync',
        showSyncLoader: true,
        allowUpgrade: true
      }
    ]
  },

  onNavigation: {
    checkPausePeriod: false,
    maxPausePeriod: 0,
    presentLockScreen: false,
    pages: [
      {
        id: 'test-mc-resume.ts',
        syncPoint: 'mySync',
        showSyncLoader: true,
        allowUpgrade: true
      }
    ]
  },

  onColdStart: {
    checkPausePeriod: true,
    maxPausePeriod: 0,
    presentLockScreen: true,
    showSyncLoader: false,
    showBuildMsgs: false,
    upgradeCheck: true
  },

  upgradeOptions: {
    ignoreRepromptPeriod: false,
    maxPostpones: 5,
    noRepromptPeriod: 1000 * 60 * 5,
    popupText: []
  },

  settingsPage: {},

  mcMenuFormsPage: {},

  mcCompletedFormsPage: {},

  // tmp line for calling the platform for config
  usePlatformConfig: true
};
