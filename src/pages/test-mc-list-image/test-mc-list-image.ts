import { Component, OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-test-mc-list-image',
  templateUrl: 'test-mc-list-image.html'
})
export class TestMcListImagePage implements OnInit {
  // private logTag: string = 'test-mc-list-image.ts';

  // mc-list parameters for contacts
  sqlParms: any;
  contactFields: any;
  loaderMsg: string = 'Loading data...'; /* optional parameter */
  isImageCard: boolean = true; /* optional parameter */
  imagesStart: any; /* optional parameter */
  iconsEnd: any; /* optional parameter */
  buttonsEnd: any; /* optional parameter */
  itemClass: string; /* optional parameter */
  contactListHeight: string = '500px'; /* optional parameter */
  addCardStart: any; /* optional parameter */
  addCardEnd: any; /* optional parameter */

  imagePath: string = window['RESOURCE_ROOT'] + '/assets/imgs/';

  constructor() {
    // Contacts mc-list (component will read Contact__ap data and populate list)
    this.setUpContactList();
  }

  ngOnInit() {}

  setUpContactList() {
    // As we're using the 'sqlParms' parameter to mc-list, specify the field index e.g. [1] is equivalent to 'Name'
    this.sqlParms = {
      tableName: 'Contact__ap',
      fields: ['Id', 'Name', 'LeadSource', 'CreatedDate'],
      orderBy: { Name: 'ASC' }
    };
    this.contactFields = [
      {
        fields: [1] /* represents: 'Name' */,
        tags: ['h2'],
        classes: []
      },
      {
        fields: [2, 3] /* represents: 'LeadSource' and 'CreatedDate' */,
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
    this.imagesStart = {
      class: 'web-image-start', // optional - apply class 'web-image-start' to images
      field: 4, // mandatory for live scenario, optional if testing using 'value' below
      // (we've not specified field 4 in the above sqlParms, but this would be something like field name 'Display_Image__c')
      // value: 'asset.png', // optional, for testing, so we can pass in hard coded image name
      path: this.imagePath // mandatory
    };
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
