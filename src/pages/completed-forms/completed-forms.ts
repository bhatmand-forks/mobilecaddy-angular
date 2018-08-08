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
  generateForm: Subject<boolean> = new Subject();
  // Enable child component mc-form to have it's form populated
  populateForm: Subject<boolean> = new Subject();

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
    loader.present();

    // Display message and get data
    loader.present().then(() => {
      // Get Form_Version__ap
      this.mcDataProvider.getByFilters('Form_Version__ap', { Id: formVersionId }).then(res => {
        // console.log('Form_Version__ap', res);
        this.formVersion = res[0];
        // Now get Form_Response__ap
        return this.mcDataProvider.getByFilters('Form_Response__ap', { mobilecaddy1__Form_Version__c: formVersionId });
      }).then(res => {
        // console.log('Form_Response__ap', res);
        this.formResponses = res;
        // Generate the mc-form component
        this.generateForm.next(this.formVersion);
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
      if (this.formResponses[i].Id == formResponse.Id || this.formResponses[i].mobilecaddy1__MC_Proxy_ID__c == formResponse.Id) {
        // Set form response
        this.formResponse = this.formResponses[i];
        // Populate the mc-form component
        this.populateForm.next(this.formResponses[i].mobilecaddy1__Responses__c);
      }
    }
    // // Create/present a message to display
    // let loader = this.loadingCtrl.create({
    //   content: 'Loading form...' + formResponse.Name,
    //   duration: 10000
    // });
    // loader.present();

    // // Get the form response details
    // this.mcDataProvider.getByFilters('Form_Response__ap', { Id: formResponse.Id }).then(res => {
    //   // console.log('res', res);
    //   if (res) {
    //     this.formResponse = res[0];
    //     // Populate the mc-form component
    //     this.populateForm.next(res[0].mobilecaddy1__Responses__c);
    //   } else {
    //     // Try to get form response using proxy id (sync might have finished but we still have proxy id in the Id field)
    //     this.mcDataProvider.getByFilters('Form_Response__ap', { mobilecaddy1__MC_Proxy_ID__c: formResponse.Id }).then(res => {
    //       if (res) {
    //         this.formResponse = res[0];
    //         // Populate the mc-form component
    //         this.populateForm.next(res[0].mobilecaddy1__Responses__c);
    //       }
    //     });
    //   }
    //   // Dismiss loader message
    //   loader.dismiss();
    // });
  }

}
