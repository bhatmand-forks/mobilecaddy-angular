import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, LoadingController, Loading } from 'ionic-angular';
import { McDataProvider } from '../../../mobilecaddy-angular/src/providers/mc-data/mc-data';
import { Subject } from 'rxjs/Subject';

@IonicPage()
@Component({
  selector: 'page-completed-forms',
  templateUrl: 'completed-forms.html',
})
export class CompletedFormsPage implements OnInit {

  formVersion: any = {};
  formResponses: any = [];
  formResponse: any = {};

  // Enable child component mc-form to have it's form generated
  generateForm: Subject<any> = new Subject();
  // Enable child component mc-form to have it's form populated
  populateForm: Subject<any> = new Subject();
  // Enable child component mc-form to have it's form fields populated
  populateFields: Subject<any> = new Subject();

  constructor(
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private mcDataProvider: McDataProvider
  ) { }

  ngOnInit() {
    let formVersionId = this.navParams.get('id');

    // Create message to display
    let loader: Loading = this.loadingCtrl.create({
      content: 'Loading...',
      duration: 10000
    });

    // Display message and get data
    loader.present().then(() => {
      // Get Form_Version__ap
      // let ids = [];
      // ids.push(formVersionId);
      // ids.push('MC_Proxy%123%123098098098098');
      // this.mcDataProvider.getByFilters('Form_Version__ap', { Id: ids }, null, null, null, null, 'or').then(res => {
        this.mcDataProvider.getByFilters('Form_Version__ap', { Id: formVersionId }).then(res => {
        console.log('Form_Version__ap', res);
        if (res && res.length > 0) {
          this.formVersion = res[0];
          // Now get Form_Response__ap
          return this.mcDataProvider.getByFilters('Form_Response__ap', { mobilecaddy1__Form_Version__c: formVersionId });
        } else {
          return null;
        }
      }).then(res => {
        // console.log('Form_Response__ap', res);
        if (res) {
          this.formResponses = res;
          // Generate the mc-form component
          this.generateForm.next(this.formVersion);
        }
        loader.dismiss();
      }).catch(e => {
        console.error('---->error', e);
        loader.dismiss();
      });
    }).catch(e => {
      console.error('---->error', e);
      loader.dismiss();
    });
  }

  selectFormResponse(formResponse: any) {
    for (let i = 0; i < this.formResponses.length; i++) {
      if (this.formResponses[i].Id == formResponse.Id
        || this.formResponses[i].mobilecaddy1__MC_Proxy_ID__c == formResponse.Id
      ) {
        // Set form response
        this.formResponse = this.formResponses[i];
        console.log('formResponse', this.formResponse);
        // Populate the mc-form component
        this.populateForm.next(this.formResponses[i].mobilecaddy1__Responses__c);
        break;
      }
    }

    // Test populateFields subscribe - change some field values after a timeout
    // Build fieldsModel from this.formResponse.mobilecaddy1__Responses__c
    let responses = JSON.parse(this.formResponse.mobilecaddy1__Responses__c);
    let fields: any = responses[0].fields;
    let fieldsModel: any = {};
    for (let i = 0; i < fields.length; i++) {
      // console.log('fields[i]', fields[i]);
      if (fields[i].type === 'Text' || fields[i].type === 'Textarea') {
        fieldsModel[fields[i].id] = 'overriding value from code';
      } else if (fields[i].type === 'Date') {
        fieldsModel[fields[i].id] = '1972-01-01';
      } else if (fields[i].type === 'Picklist') {
        fieldsModel[fields[i].id] = { label: fields[i].value, score: fields[i].userScore };
      } else {
        fieldsModel[fields[i].id] = fields[i].value;
      }
    }
    console.log('fieldsModel', fieldsModel);
    this.populateFields.next(fieldsModel);
  }

}
