import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, Loading } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { McSyncService } from '../../providers/mc-sync/mc-sync.service'

@Component({
  selector: 'page-mc-form-detail',
  templateUrl: 'mc-form-detail.html',
})
export class McFormDetailPage implements OnInit {

  title: string;
  subTitle: string;
  readOnly: boolean;
  formVersionId: string;

  // Enable child component mc-form to have it's form generated
  generateForm: Subject<boolean> = new Subject();

  // Enable child component mc-form to 'submit' (mc-form will emit an event with result)
  submit: Subject<boolean> = new Subject();

  // Indicates whether any fields have been edited on the mc-form component
  editingBegan: boolean = false;

  // Enable child component mc-form to have it's form populated
  populateForm: Subject<boolean> = new Subject();


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public mcDataProvider: McDataProvider,
    public alertCtrl: AlertController,
    public mcSyncService: McSyncService
  ) { }

  ngOnInit() {
    this.title = this.navParams.get('title') ? this.navParams.get('title') : '';
    this.readOnly = this.navParams.get('readOnly') ? true : false;
    this.loadForm(this.navParams.get('formVersion'), this.navParams.get('formResponse'));
  }

  loadForm(formVersion: any, formResponse?: any) {
    // console.log('formVersion',formVersion);
    this.formVersionId = formVersion.Id;
    this.subTitle = formVersion.mobilecaddy1__Label__c;

    // Create a message to display
    let loader = this.loadingCtrl.create({
      content: 'Loading...',
      duration: 10000
    });
    loader.present();

    // Get the form version details
    this.mcDataProvider.getByFilters('Form_Version__ap', { Id: formVersion.Id }).then(res => {
      // console.log('res', res);
      if (res) {
        // Load the mc-form component with fields relevant to the form version
        this.generateForm.next(res[0]);
        // Populate the mc-form component fields (if response passed into page)
        if (formResponse && formResponse.mobilecaddy1__Responses__c) {
          this.populateForm.next(formResponse.mobilecaddy1__Responses__c);
        }
      }
      // Dismiss loader message
      loader.dismiss();
    });
  }

  onEditingBegan(editingBegan: boolean) {
    this.editingBegan = editingBegan;
  }

  doSubmit() {
    // This will cause the mc-form to validate the form and fire event (in mc-form) to run 'onSubmit' below
    this.submit.next();
  }

  onSubmit(result: any) {
    // console.log('onSubmit result', result);
    if (result.error) {
      this.showAlert('Submit Error', result.error);
    } else {
      this.saveFormResponse(result);
    }
  }

  confirmSubmit() {
    this.alertCtrl.create({
      title: 'Submit',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Submit',
          handler: () => {
            this.doSubmit();
          }
        },
        {
          text: 'No',
          handler: () => {
          }
        }
      ]
    }).present();
  }

  saveFormResponse(result: any) {
    // Create message to display
    let loader: Loading = this.loadingCtrl.create({
      content: 'Saving...',
      duration: 10000
    });
    loader.present();

    // Display 'saving' message and attempt to save record
    loader.present().then(() => {
      // Build record to save
      let record: any = {};
      record.Name = "TMP-" + new Date().valueOf();
      record.mobilecaddy1__Form_Version__c = this.formVersionId;
      record.mobilecaddy1__Responses__c = result.formResponse;
      // Insert
      this.mcDataProvider.insert('Form_Response__ap', record).then(res => {
        // console.log('res', res);
        loader.dismiss();
        // Sync table
        this.mcSyncService.syncTables('mc-new-form-response').then(res => {
          // console.log('syncTables res', res);
        });
        // Set flag so cancel will exit
        this.editingBegan = false;
        this.cancel();
      });
    }).catch(e => {
      console.error('---->error', e);
      loader.dismiss();
    });
  }

  cancel() {
    // Only confirm Cancel if user has changed a field
    if (this.editingBegan) {
      this.alertCtrl.create({
        title: 'Cancel',
        message: 'Are you sure?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.navCtrl.pop();
            }
          },
          {
            text: 'No',
            handler: () => {
            }
          }
        ]
      }).present();
    } else {
      this.navCtrl.pop();
    }
  }

  showAlert(title, message) {
    this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['OK']
    }).present();
  }

}
