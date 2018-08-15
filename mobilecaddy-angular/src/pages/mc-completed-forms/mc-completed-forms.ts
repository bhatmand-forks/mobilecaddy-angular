import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { McFormDetailPage } from '../../pages/mc-form-detail/mc-form-detail'
import { McConfigService } from '../../providers/mc-config/mc-config.service';

@Component({
  selector: 'page-mc-completed-forms',
  templateUrl: 'mc-completed-forms.html',
})
export class McCompletedFormsPage implements OnInit {

  // mc-list parameters
  formResponses: any = [];
  config = {
    formResponseFields: [],
    showSearch: true,
    searchPlaceholder: 'Search...',
    noDataMsg: 'No records',
    loaderMsg: 'Loading...',
    subTitleField: 'mobilecaddy1__Label__c'
  }

  // mcCompletedFormsPage config read from app.config (if there is any)
  pageConfig: any;

  formVersion: any;
  title: string;
  subTitle: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public mcDataProvider: McDataProvider,
    public mcConfigService: McConfigService
  ) { }

  ngOnInit() {
    // Get config for page
    this.pageConfig = this.mcConfigService.getConfig('mcCompletedFormsPage');

    // Get parameters
    this.title = this.navParams.get('title') ? this.navParams.get('title') : 'Completed Forms';
    this.formVersion = this.navParams.get('formVersion');
    if (!this.formVersion) {
      return;
    }

    // Set subtitle - page config might override.
    // Note. We can suppress the sub title by setting the page config to: subTitleField: ''
    if (this.pageConfig) {
      if (this.pageConfig.subTitleField === null || this.pageConfig.subTitleField === undefined) {
        // Use the local value
        this.subTitle = this.formVersion[this.config.subTitleField];
      } else {
        if (this.pageConfig.subTitleField !== '') {
          // Use app.config value
          this.subTitle = this.formVersion[this.pageConfig.subTitleField];
        }
      }
    } else {
      // Use the local value
      this.subTitle = this.formVersion[this.config.subTitleField];
    }

    // Set loading message - either from app.config or local variable
    let loaderMsg = (this.pageConfig && this.pageConfig.loaderMsg) ? this.pageConfig.loaderMsg : this.config.loaderMsg;

    // Create a message to display
    let loader = this.loadingCtrl.create({
      content: loaderMsg,
      duration: 10000
    });
    loader.present();

    // Get data for the list
    this.mcDataProvider.getByFilters('Form_Response__ap', { mobilecaddy1__Form_Version__c: this.formVersion.Id }, null, { CreatedDate: 'DESC' }).then(res => {
      // console.log('res', res);
      // Sets the '[recs]' mc-list component parameter which causes it to populate list
      this.setUpList(res);
      // Dismiss loader message
      loader.dismiss();
    });
  }

  setUpList(res) {
    // As we're using the '[recs]' parameter to mc-list, specify the actual field names
    this.config.formResponseFields = [
      {
        fields: ['Name', 'CreatedDate'],
        pipes: [null, { name: 'date', format: 'dd/MM/yyyy hh:mm', prefix: '&nbsp;-&nbsp;' }],
      }
    ];
    this.formResponses = res;
    // Get any page config
    this.mergeConfig();
  }

  mergeConfig() {
    // Get any page config and merge/override local config
    if (this.pageConfig) {
      Object.assign(this.config, this.pageConfig);
    }
  }

  showDetail(rec): void {
    // console.log('showDetail rec', rec);
    this.navCtrl.push(McFormDetailPage,
      {
        formResponse: rec,
        formVersion: this.formVersion,
        title: rec.Name,
        readOnly: true
      }
    );
  }

}