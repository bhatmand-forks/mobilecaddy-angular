import { Component, OnInit } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';
import { McDataProvider } from '../../../mobilecaddy-angular/src/providers/mc-data/mc-data';

// Note. We populate two mc-list components in two different ways.
// 1. Accounts mc-list is populated using the 'recs' parameter after reading the data
//    in the ngOnInit method below.
// 2. Contacts mc-list is populated using the 'sqlParms' parameter
//    (which forces the component to do the data read)

@IonicPage()
@Component({
  selector: 'page-test-mc-list',
  templateUrl: 'test-mc-list.html',
})
export class TestMcListPage implements OnInit {
  private logTag: string = 'test-mc-list.ts';
  // mc-list parameters for accounts
  accounts: any = [];
  accountFields: any;

  accountsLoaded: boolean = false;

  // mc-list parameters for contacts
  sqlParms: any;
  contactFields: any;
  loaderMsg: string = 'Loading data...'; /* optional parameter */
  iconsStart: any; /* optional parameter */
  iconsEnd: any; /* optional parameter */
  buttonsEnd: any; /* optional parameter */
  itemClass: string; /* optional parameter */
  contactListHeight: string; /* optional parameter */
  addCardStart: any /* optional parameter */
  addCardEnd: any /* optional parameter */

  constructor(
    private loadingCtrl: LoadingController,
    private mcDataProvider: McDataProvider) {
    // Contacts mc-list (component will read Contact__ap data and populate list)
    this.setUpContactList();
  }

  ngOnInit() {
    console.log(this.logTag);

    // Create/present a message to display
    let loader = this.loadingCtrl.create({
      content: this.loaderMsg,
      duration: 10000
    });
    loader.present();

    setTimeout(() => {
      console.log('test dynamically changing contact list height');
      this.contactListHeight = "200px";
      // Test delay showing accounts
      this.accountsLoaded = true;

      console.log('delayed loading accounts list');
      // Get accounts for the list
      this.mcDataProvider.getByFilters('Account__ap').then(res => {
        console.log('res', res);
        // Accounts mc-list - sets the 'recs' component parameter which causes it to populate list
        this.setUpAccountList(res);
        // Dismiss loader message
        loader.dismiss();
      });
    }, 3000);
  }

  setUpAccountList(res) {
    // As we're using the 'recs' parameter to mc-list, specify the actual field names
    this.accountFields = [
      {
        fields: ['Name', 'BillingLatitude']
      },
      {
        fields: ['BillingCity', 'BillingState'],
        pipes: [{ suffix: ',' }] /* suffix 'BillingCity' with a ',' */
      }
    ];
    this.accounts = res;
  }

  setUpContactList() {
    // As we're using the 'sqlParms' parameter to mc-list, specify the field index e.g. [1] is equivalent to 'Name'
    this.sqlParms = { tableName: 'Contact__ap', fields: ['Id', 'Name', 'LeadSource', 'CreatedDate'], orderBy: { 'Name': 'ASC' } };
    this.contactFields = [
      {
        fields: [1], /* represents: 'Name' */
        tags: ['h2'],
        classes: []
      },
      {
        fields: [2, 3], /* represents: 'LeadSource' and 'CreatedDate' */
        tags: [],
        classes: [],
        // the second field for this row ('CreatedDate') is to be formated using DatePipe
        pipes: [null, { name: 'date', format: 'dd/MM/yyyy' }],
        conditions: [
          [
            // when field 2 = Web then add class 'web' to tag containing field
            {
              value: 'Web',
              class: 'web'
            },
            // when field 2 = Other then add class 'other' to tag containing field
            {
              value: 'Other',
              class: 'other'
            }
          ]
        ]
      }
    ];
    this.iconsStart = [
      {
        name: 'checkmark-circle',
        color: 'primary',
        class: 'web-icon-start',
        conditions: [
          {
            field: 2,
            value: 'Web'
          }
        ]
      },
      {
        name: 'clock',
        color: 'secondary',
        conditions: [
          {
            field: 2,
            value: 'Public Relations'
          }
        ]
      }
    ];
    this.iconsEnd = [
      {
        name: 'create',
        color: 'primary',
        class: 'web-icon-end',
        conditions: [
          {
            field: 2,
            value: 'Web'
          }
        ]
      },
      {
        name: 'color-wand',
        color: 'secondary',
        class: 'other-icon-end',
        conditions: [
          {
            field: 2,
            value: 'Word of mouth'
          }
        ]
      }
    ];
    this.buttonsEnd = [
      {
        name: 'Complete',
        class: 'web-button-end',
        conditions: [
          {
            field: 2,
            value: 'Web'
          }
        ]
      },
      {
        name: '',
        class: 'other-button-end',
        conditions: [
          {
            field: 2,
            value: 'Other'
          }
        ]
      }
    ];
    this.itemClass = 'my-item-class';
    this.contactListHeight = "250px";
    this.addCardStart = {
      text: 'Add Contact',
      icon: 'add',
      itemClass: 'add-card-item'
    };
    this.addCardEnd = {
      text: 'Add Contact',
      icon: 'person'
    };
  }

  showDetail(rec): void {
    console.log('showDetail rec', rec);
  }

  buttonEndClicked(rec) {
    console.log('buttonEndClicked rec', rec);
  }

  iconStartClicked(rec) {
    console.log('iconStartClicked rec', rec);
  }

  iconEndClicked(rec) {
    console.log('iconEndClicked rec', rec);
  }

  addCardStartClicked() {
    console.log('addCardStartClicked');
  }

  addCardEndClicked() {
    console.log('addCardEndClicked');
  }

}
