import { Component, Input, Output, ViewChild, ElementRef, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { McFormProvider } from '../../providers/mc-form/mc-form';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'mc-form',
  templateUrl: 'mc-form.html',
  styles: [
    `
      .mc-form-tab-container {
        width: 100%;
      }
      .mc-form-tab-container ion-grid {
        background-color: lightgray;
      }
      .mc-form-tab-container ion-grid,
      .mc-form-tab-container ion-col {
        padding: 0;
      }
      .mc-form-tab-container ion-col {
        text-align: center;
      }
      .mc-form-tab-container .tab {
        padding: 10px 10px;
      }
      .mc-form-tab-container .tab.active {
        color: gray;
        font-weight: 700;
      }
      .mc-form-tab-container .tab.inactive {
        color: #FFFFFF;
      }

      .mc-form-list .field-heading {
        text-align: center;
        font-weight: bold;
      }

      .mc-form-list .field-separator {
        height: 1px;
        width: 100%;
        background-color: #000000;
      }

      .mc-form-list .picklist-item {
        padding-right: 8px;
      }

      /* Left align the checkbox (the label is stacked above it) */
      .mc-form-list .checkbox-item div[item-content] {
        align-self: start;
      }

      /* Remove the line under input fields */
      .mc-form-list .item-inner,
      .mc-form-list ion-item {
        border-bottom-color: transparent !important;
        box-shadow: none !important;
      }

      /* Used to disable labels when form is read only */
      .mc-form-list .disabled {
        opacity: .4;
        pointer-events: none;
      }
    `
  ]
})
export class McFormComponent implements OnInit, OnDestroy {

  // private readonly logTag: string = 'mc-form.ts';

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
  // Is the form to be displayed as 'read only'?
  @Input('readOnly') readOnly: boolean = false;
  // Is the placeholder shown?
  @Input('noPlaceholder') noPlaceholder: boolean = true;
  // Picklist options of AlertController
  @Input('picklistOptions') picklistOptions: any = { enableBackdropDismiss: false };
  // Type of picklist interface
  @Input('picklistInterface') picklistInterface: string = 'alert';
  // Input autocomplete property
  @Input('autocomplete') autocomplete: string = 'off';
  // Input autocorrect property
  @Input('autocorrect') autocorrect: string = 'off';
  // Indicates whether any fields have been edited (so buttons on parent can be shown/hidden)
  @Output() editingBegan = new EventEmitter<boolean>();
  // The result of a 'save in progress'
  @Output() saveInProgressResult = new EventEmitter<Object>();
  // The result of a 'submit'
  @Output() submitResult = new EventEmitter<Object>();

  // Elements used to fix tab(s) at top of content, stopping them scrolling with the form list
  @ViewChild('fixedTabsContainer') fixedTabsContainer: ElementRef;
  @ViewChild('list') list: ElementRef;

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

  // We only want to adjust form list top margin when tabs container height changes
  private prevTabsHeight: number = 0;

  constructor(private mcFormProvider: McFormProvider) {
  }

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
  }

  ngAfterViewChecked() {
    // The 'tabs' are dynamically created when the form is populated.
    // Change the form list top margin after 'tabs' html has been created
    this.repositionFormList();
  }

  repositionFormList() {
    // Set the top margin of the form list, to take into account the tabs container.

    // Get reference to tabs container
    let fixedTabsContainerEl = this.fixedTabsContainer.nativeElement;

    // Get the height of the tabs fixed container
    let tabsHeight = fixedTabsContainerEl.offsetHeight;

    // Check for change of the tabs container height (it's dynamic html)
    if (tabsHeight != this.prevTabsHeight) {
      // Get reference to form list element
      let listEl = this.list.nativeElement;
      // Set the margin top to the height of the tabs fixed container
      listEl.style.marginTop = tabsHeight + 'px';
      // Save height
      this.prevTabsHeight = tabsHeight;
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
    }
  }

  tabSelected(tabId) {
    this.activeTab = tabId;
    this.setTabBarSelectedTab(tabId);
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
    let result:any = this.mcFormProvider.validateForm(
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
