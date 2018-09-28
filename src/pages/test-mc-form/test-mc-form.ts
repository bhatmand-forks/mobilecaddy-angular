import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { IonicPage, LoadingController, AlertController, Loading, NavController, Content } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { McDataProvider } from '../../../mobilecaddy-angular/src/providers/mc-data/mc-data';
import { McSyncService } from '../../../mobilecaddy-angular/src/providers/mc-sync/mc-sync.service';

@IonicPage()
@Component({
  selector: 'page-test-mc-form',
  templateUrl: 'test-mc-form.html',
})
export class TestMcFormPage implements OnInit {

  private readonly tableName: string = 'Form_Version__ap';
  formVersions: any = [];
  formVersion: any = {};
  formVersionLoaded: boolean = false;
  showSummary: boolean = false;

  // Data returned from mc-form (if valid form)
  formResponse: string = ''
  passMark: number = 0;
  maxScore: number = 0;
  incorrectQuestions = [];

  // Enable child component mc-form to have it's form generated
  generateForm: Subject<boolean> = new Subject();

  // Enable child component mc-form to 'save in progress' (mc-form will emit an event with result)
  saveInProgress: Subject<boolean> = new Subject();

  // Enable child component mc-form to 'submit' (mc-form will emit an event with result)
  submit: Subject<boolean> = new Subject();

  // Indicates whether any fields have been edited on the mc-form component
  editingBegan: boolean = false;

  // Score returned from mc-form and successful validation
  score: number = 0;

  // So we can change height of lists to fit within it's container
  @ViewChild(Content) content: Content;
  @HostListener('window:resize') onResize() {
  }

  tabs: any = [];

  // Enable child component mc-form to change tab
  selectTab: Subject<any> = new Subject();

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private mcDataProvider: McDataProvider,
    private mcSyncService: McSyncService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Create/present a message to display
    let loader = this.loadingCtrl.create({
      content: 'Getting forms...',
      duration: 10000
    });
    loader.present();

    // Get all the form versions
    this.mcDataProvider.getByFilters(this.tableName).then(res => {
      console.log('res', res);
      this.formVersions = res;
      // Dismiss loader message
      loader.dismiss();
    });
  }

  ionViewDidEnter() {
  }

  selectFormVersion(formVersion: any) {
    console.log('formVersion',formVersion);
    // Create/present a message to display
    let loader = this.loadingCtrl.create({
      content: 'Loading form...' + formVersion.Name,
      duration: 10000
    });
    loader.present();

    // Get the form version details
    this.mcDataProvider.getByFilters(this.tableName, { Id: formVersion.Id }).then(res => {
      console.log('form version details', res);
      if (res) {
        this.formVersion = res[0];
        // Refresh the mc-form component
        this.generateForm.next(res[0]);
        // Set passmark
        if (res[0].mobilecaddy1__Pass_Score__c) {
          this.passMark = res[0].mobilecaddy1__Pass_Score__c;
        } else {
          this.passMark = 0;
        }
        // Reset edit flag
        this.editingBegan = false;
        // Reset flag so form is always shown first
        this.showSummary = false;
        // Show the footer
        this.formVersionLoaded = true;
      }
      // Dismiss loader message
      loader.dismiss();
    });
  }

  cancel() {
    this.formVersionLoaded = false;
    this.formVersion.Id = null;
  }

  onEditingBegan(editingBegan: boolean) {
    this.editingBegan = editingBegan;
  }

  doSaveInProgress() {
    this.saveInProgress.next();
  }

  onSaveInProgress(result: any) {
    console.log('onSaveInProgress result', result);
  }

  doSubmit() {
    this.submit.next();
  }

  onSubmit(result: any) {
    console.log('onSubmit result', result);
    if (result.error) {
      this.showAlert('Submit Error', result.error);
    } else {
      // Set fields returned from mc-form component
      this.formResponse = result.formResponse;
      this.score = result.score;
      this.maxScore = result.maxScore;
      this.incorrectQuestions = result.incorrectQuestions;
      // Show the summary details before final submit
      this.showSummary = true;
    }
  }

  confirmFinalSubmit() {
    let alert = this.alertCtrl.create({
      title: 'Submit - are you sure?',
      message: 'If you submit this will mark the certification process as submitted and you will not be able to review or edit.',
      buttons: [
        {
          text: 'Submit',
          handler: () => {
            this.doFinalSubmit();
          }
        },
        {
          text: 'No',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }

  doFinalSubmit() {
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
      record.mobilecaddy1__Form_Version__c = this.formVersion.Id;
      record.mobilecaddy1__Responses__c = this.formResponse;
      // Insert
      this.mcDataProvider.insert('Form_Response__ap', record).then(res => {
        console.log('res', res);
        this.showForm();
        loader.dismiss();
        // Sync table
        this.mcSyncService.syncTables('new-form-response').then(res => {
        });
      });
    }).catch(e => {
      console.error('---->error', e);
      loader.dismiss();
    });
  }

  showAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  showForm() {
    this.showSummary = false;
  }

  showCompleted() {
    this.navCtrl.push('CompletedFormsPage', { id: this.formVersion.Id });
  }

  onTabTapped(event) {
    console.log('onTabTapped event', event);
  }

  onTabsBuilt(event) {
    console.log('onTabsBuilt event', event);
    this.tabs = event;
  }
  
  tabSelected(tabId) {
    console.log('tabSelected tabId', tabId);
    this.selectTab.next(tabId);
  }

}