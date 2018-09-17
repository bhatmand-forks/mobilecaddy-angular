import { Component, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { McFormProvider } from '../../providers/mc-form/mc-form';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'mc-form2',
  templateUrl: 'mc-form2.html',
  styles: [
    `
      .mc-form2-tab-container {
        width: 100%;
      }
      .mc-form2-tab-container ion-grid {
        background-color: lightgray;
      }
      .mc-form2-tab-container ion-grid,
      .mc-form2-tab-container ion-col {
        padding: 0;
      }
      .mc-form2-tab-container ion-col {
        text-align: center;
      }
      .mc-form2-tab-container .tab {
        padding: 10px 10px;
      }
      .mc-form2-tab-container .tab.active {
        color: gray;
        font-weight: 700;
      }
      .mc-form2-tab-container .tab.inactive {
        color: #FFFFFF;
      }

      .mc-form2-list .field-heading {
        text-align: center;
        font-weight: bold;
      }

      .mc-form2-list .field-separator {
        height: 1px;
        width: 100%;
        background-color: #000000;
      }

      .mc-form2-list .picklist-item {
        padding-right: 8px;
      }

      /* Left align the checkbox (the label is stacked above it) */
      .mc-form2-list .checkbox-item div[item-content] {
        align-self: start;
      }

      /* Remove the line under input fields */
      .mc-form2-list .item-inner,
      .mc-form2-list ion-item {
        border-bottom-color: transparent !important;
        box-shadow: none !important;
      }

      /* Used to disable labels when form is read only */
      .mc-form2-list .disabled {
        opacity: .4;
        pointer-events: none;
      }
    `
  ]
})
export class McForm2Component implements OnInit, OnDestroy {

  // private readonly logTag: string = 'mc-form2.ts';

  @Input('formVersion') formVersion;
  @Input('generateForm') generateForm: Subject<any>;
  @Input('saveInProgress') saveInProgress: Subject<any>;
  @Input('submit') submit: Subject<any>;
  @Input('populateForm') populateForm: Subject<any>;
  @Input('populateFields') populateFields: Subject<any>;
  @Input('tabContainerClass') tabContainerClass: string;
  @Input('listClass') listClass: string;
  @Input('dateDisplayFormat') dateDisplayFormat: string = 'DD/MM/YYYY';
  @Input('datePickerFormat') datePickerFormat: string = 'DD/MM/YYYY';
  @Input('dateMax') dateMax: string = '2020';
  @Input('dateMin') dateMin: string = '2000';
  // Call the 'tabSelected' function from parent
  @Input('selectTab') selectTab: Subject<any>;
  // Is the form to be displayed as 'read only'?
  @Input('readOnly') readOnly: boolean = false;
  // Is the placeholder shown?
  @Input('noPlaceholder') noPlaceholder: boolean = true;
  // Picklist options of AlertController
  @Input('picklistOptions') picklistOptions: any = { enableBackdropDismiss: false };
  // Type of picklist interface
  @Input('picklistInterface') picklistInterface: string = 'alert';
  // Input autocomplete property
  @Input('autocomplete') autocomplete: string = 'on';
  // Input autocorrect property
  @Input('autocorrect') autocorrect: string = 'on';
  // Indicates whether any fields have been edited (so buttons on parent can be shown/hidden)
  @Output() editingBegan = new EventEmitter<boolean>();
  // The result of a 'save in progress'
  @Output() saveInProgressResult = new EventEmitter<Object>();
  // The result of a 'submit'
  @Output() submitResult = new EventEmitter<Object>();
  // When the tab is tapped
  @Output() tabTapped = new EventEmitter<Object>();
  // The tabs
  @Output() tabsBuilt = new EventEmitter<Object>();

  activeTab: number = 1;
  fields: any = [];
  tabs: any = [];
  fieldsModel: any = {};
  picklistModel: any = {};

  TAB_STATUS_INACTIVE = 'inactive';
  TAB_STATUS_ACTIVE = 'active';

  // So we can unsubscribe subscriptions on destroy
  private generateFormSubscription: Subscription;
  private saveInProgressSubscription: Subscription;
  private submitSubscription: Subscription;
  private populateFormSubscription: Subscription;
  private populateFieldsSubscription: Subscription;
  private selectTabSubscription: Subscription;

  constructor(private mcFormProvider: McFormProvider) { }

  ngOnInit() {
    this.showForm();
    // Create subscription to allow form to be generated from parent component
    if (this.generateForm) {
      this.generateFormSubscription = this.generateForm.subscribe(formVersion => {
        if (formVersion) {
          this.formVersion = formVersion;
        }
        this.showForm();
      });
    }
    // Create subscription to allow 'save in progress' to be actioned from parent component
    if (this.saveInProgress) {
      this.saveInProgressSubscription = this.saveInProgress.subscribe(() => {
        this.doSaveInProgress();
      });
    }
    // Create subscription to allow 'submit' to be actioned from parent component
    if (this.submit) {
      this.submitSubscription = this.submit.subscribe(() => {
        this.doSubmit();
      });
    }
    // Create subscription to allow 'populate form' to be actioned from parent component
    if (this.populateForm) {
      this.populateFormSubscription = this.populateForm.subscribe(responses => {
        this.doPopulateForm(responses);
      });
    }
    // Create subscription to allow 'populate fields' to be actioned from parent component
    if (this.populateFields) {
      this.populateFieldsSubscription = this.populateFields.subscribe(fieldsModel => {
        this.doPopulateFields(fieldsModel);
      });
    }
    // Create subscription to allow tab to be selected from parent component
    if (this.selectTab) {
      this.selectTabSubscription = this.selectTab.subscribe(tabId => {
        this.tabSelected(tabId);
      });
    }
  }

  ngOnDestroy() {
    if (this.generateFormSubscription) {
      this.generateFormSubscription.unsubscribe();
    }
    if (this.saveInProgressSubscription) {
      this.saveInProgressSubscription.unsubscribe();
    }
    if (this.submitSubscription) {
      this.submitSubscription.unsubscribe();
    }
    if (this.populateFormSubscription) {
      this.populateFormSubscription.unsubscribe();
    }
    if (this.populateFieldsSubscription) {
      this.populateFieldsSubscription.unsubscribe();
    }
    if (this.selectTabSubscription) {
      this.selectTabSubscription.unsubscribe();
    }
  }

  showForm() {
    // console.log('this.formVersion', this.formVersion);
    if (this.formVersion && this.formVersion.mobilecaddy1__Fields_JSON__c) {
      let extractResult = this.mcFormProvider.extractAndProcessFields(this.formVersion.mobilecaddy1__Fields_JSON__c);
      // console.log('extractResult', extractResult);
      this.fields = extractResult.fields;
      this.tabs = extractResult.tabs;
      this.fieldsModel = extractResult.fieldsModel;
      this.picklistModel = extractResult.picklistModel;

      this.mcFormProvider.checkAndUpdateChildQuestions(this.fields, this.fieldsModel, this.picklistModel);

      this.tabsBuilt.emit(this.tabs);
    }
  }

  tabSelected(tabId) {
    this.activeTab = tabId;
    this.setTabBarSelectedTab(tabId);
    this.tabTapped.emit(tabId);
  }

  setTabBarSelectedTab(tabId) {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].id === tabId) {
        this.tabs[i].active = this.TAB_STATUS_ACTIVE;
      } else {
        this.tabs[i].active = this.TAB_STATUS_INACTIVE;
      }
    }
  }

  valueEdited() {
    if (!this.readOnly) {
      this.mcFormProvider.checkAndUpdateChildQuestions(this.fields, this.fieldsModel, this.picklistModel);
      this.editingBegan.emit(true);
    }
  }

  addClearDateButton(fieldId) {
    // Returns a ion-datetime pickerOptions to create a Clear date button on the picker
    return {
      buttons: [{
        text: 'Clear',
        handler: () => {
          this.fieldsModel[fieldId] = '';
        }
      }]
    };
  }

  doSaveInProgress() {
    let result: any = this.mcFormProvider.validateForm(
      this.formVersion,
      this.fields,
      this.fieldsModel,
      this.picklistModel,
      true);
    // Add additinal info
    result.fields = this.fields;
    result.fieldsModel = this.fieldsModel;
    result.picklistModel = this.picklistModel;
    // Return the result to the parent component
    this.saveInProgressResult.emit(result);
  }

  doSubmit() {
    let result: any = this.mcFormProvider.validateForm(
      this.formVersion,
      this.fields,
      this.fieldsModel,
      this.picklistModel,
      false);
    // Add additinal info
    result.fields = this.fields;
    result.fieldsModel = this.fieldsModel;
    result.picklistModel = this.picklistModel;
    // Return the result to the parent component
    this.submitResult.emit(result);
  }

  doPopulateForm(responses) {
    let result = this.mcFormProvider.populateForm(
      responses,
      this.fields,
      this.fieldsModel,
      this.picklistModel);
    if (result) {
      this.fieldsModel = result;
    }
  }

  compareFn(e1: any, e2: any): boolean {
    return e1 && e2 ? e1.label === e2.label : e1 === e2;
  }

  doPopulateFields(fieldsModel) {
    this.fieldsModel = fieldsModel;
    this.mcFormProvider.checkAndUpdateChildQuestions(this.fields, this.fieldsModel, this.picklistModel);
  }

}
