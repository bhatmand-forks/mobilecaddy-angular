import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { McFormDetailPage } from '../../pages/mc-form-detail/mc-form-detail'
import { McCompletedFormsPage } from '../../pages/mc-completed-forms/mc-completed-forms'
import { McConfigService } from '../../providers/mc-config/mc-config.service';

@Component({
  selector: 'page-mc-menu-forms',
  templateUrl: 'mc-menu-forms.html',
})
export class McMenuFormsPage implements OnInit {

  // mc-list parameters
  formVersions: any = [];
  config = {
    formVersionFields: [],
    iconsStart: [],
    buttonsEnd: [],
    showSearch: true,
    searchPlaceholder: 'Search...',
    noDataMsg: 'No records',
    loaderMsg: 'Loading...'
  }

  // mcMenuFormsPage config read from app.config (if there is any)
  pageConfig: any;

  newResponseTitlePrefix: string = 'New ';
  completedFormsTitle: string = 'Completed Forms';

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public mcDataProvider: McDataProvider,
    public mcConfigService: McConfigService
  ) { }

  ngOnInit() {
    // Get config for page
    this.pageConfig = this.mcConfigService.getConfig('mcMenuFormsPage');

    // Set loading message - either from app.config or local variable
    let loaderMsg = (this.pageConfig && this.pageConfig.loaderMsg) ? this.pageConfig.loaderMsg : this.config.loaderMsg;

    // Create a message to display
    let loader = this.loadingCtrl.create({
      content: loaderMsg,
      duration: 10000
    });
    loader.present();

    // Get data for the list
    this.mcDataProvider.getByFilters('Form_Version__ap', { mobilecaddy1__Form_Placement__c: 'Menu' }, null, { mobilecaddy1__Order__c: 'ASC' }).then(res => {
      // console.log('res', res);
      // Sets the '[recs]' mc-list component parameter which causes it to populate list
      this.setUpList(res);
      // Dismiss loader message
      loader.dismiss();
    });
  }

  setUpList(res) {
    // As we're using the '[recs]' parameter to mc-list, specify the actual field names
    this.config.formVersionFields = [
      {
        fields: ['mobilecaddy1__Label__c']
      }
    ];
    this.config.iconsStart = [
      {
        name: 'add',
        class: 'menu-form-list-icon-start',
        // Set condition so it is always true and icon is always shown
        conditions: [
          {
            field: 'mobilecaddy1__Form_Placement__c',
            value: 'Menu'
          }
        ]
      }
    ];
    this.config.buttonsEnd = [
      {
        name: 'Completed',
        class: 'menu-form-list-button-end',
        // Set condition so it is always true and button is always shown
        conditions: [
          {
            field: 'mobilecaddy1__Form_Placement__c',
            value: 'Menu'
          }
        ]
      }
    ];
    this.formVersions = res;
    // Get any page config
    this.mergeConfig();
  }

  mergeConfig() {
    // Get any page config and merge/override local config
    if (this.pageConfig) {
      Object.assign(this.config, this.pageConfig);
    }
  }

  buttonEndClicked(rec) {
    // 'Completed' button tapped
    // console.log('buttonEndClicked rec', rec);
    this.navCtrl.push(McCompletedFormsPage,
      {
        formVersion: rec,
        title: this.completedFormsTitle
      }
    );
  }

  iconStartClicked(rec) {
    // Add form icon tapped
    // console.log('iconStartClicked rec', rec);
    this.navCtrl.push(McFormDetailPage,
      {
        formVersion: rec,
        title: this.newResponseTitlePrefix + rec.mobilecaddy1__Label__c,
        readOnly: false
      }
    );
  }

}
