import { Component, ViewChild } from '@angular/core';
import {
  NavParams,
  Loading,
  AlertController,
  ModalController,
  Modal,
  Content
} from 'ionic-angular';
import { McLoadingProvider } from '../../providers/mc-loading/mc-loading';
import { McSettingsProvider } from '../../providers/mc-settings/mc-settings';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import { SettingsMtiTableRecordPage } from '../../pages/settings-mti-table-record/settings-mti-table-record';

@Component({
  selector: 'page-settings-mti-detail',
  templateUrl: 'settings-mti-detail.html'
})
export class SettingsMtiDetailPage {
  allRecords: any = [];
  filteredRecords: any = [];
  tableName: string;
  searchString: string;
  hasTableReadFinished: boolean = false;
  @ViewChild(Content) content: Content;

  constructor(
    private navParams: NavParams,
    private mcSettingsProvider: McSettingsProvider,
    private loadingProvider: McLoadingProvider,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    this.tableName = this.navParams.get('tableName');
  }

  ngOnInit() {
    this.showRecords();
  }

  showRecords(): void {
    // Create message to display during load
    let loader: Loading = this.loadingProvider.createLoading(
      'Loading ' + this.tableName + ' ...'
    );

    loader.present().then(() => {
      devUtils
        .readRecords(this.tableName)
        .then(res => {
          let remappedRecords = this.mcSettingsProvider.remapToNameValue(res['records']);
          // We're trying to keep the html as clean and simple as possible.
          // Build and add a 'displayFields' onto each record.
          // This is so we have a small display field built in js rather than angular using ngFor in html.
          // Also note how the ion-card (and elements within) are restricted on height (as per Ionic recommendations)
          remappedRecords.map(rec => {
            // console.log('rec',rec);
            let displayFields = '';
            let fieldCount = 0;
            // Iterate over the fields on the record, selecting a choice few for our limited card
            for (let i = 0; i < rec.length; i++) {
              // console.log('rec',rec);
              if (this.tableName.indexOf('__ap') > -1) {
                if (rec[i].Name == 'Name' || rec[i].Name == 'Id' || rec[i].Name == 'CreatedDate' || rec[i].Name == 'CaseNumber') {
                  displayFields += '<strong>' + rec[i].Name + '</strong>: ' + rec[i].Value + '<br/>';
                }
              } else {
                // If not a user '...__ap' table then limit the number of fields displayed
                if (fieldCount < 4) {
                  displayFields += '<strong>' + rec[i].Name + '</strong>: ' + rec[i].Value + '<br/>';
                  fieldCount += 1;
                }
              }
            }
            rec.displayFields = displayFields;
          });

          this.allRecords = remappedRecords;
          this.filteredRecords = remappedRecords;
          loader.dismiss();
          this.hasTableReadFinished = true;
        })
        .catch(e => {
          logger.error('showRecords', this.tableName, e);
          loader.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Load table failed',
            message: 'Error: ' + JSON.stringify(e),
            buttons: ['OK']
          });
          alert.present();
        });
    });
  }

  getSearchRecords(ev: any) {
    this.scrollToTop();
    this.searchString = ev.target.value;
    this.filterRecords();
  }

  filterRecords() {
    // Reset items back to all of the items
    this.filteredRecords = this.allRecords;

    // Get any search bar string
    let searchString: string = this.searchString;

    // Filter all records by any search criteria.
    // If the search value is an empty string don't filter the items
    if (searchString && searchString.trim() != '') {
      this.filteredRecords = this.filteredRecords.filter(rec => {
        let result = false;
        // Check the Value for each field on the record
        for (let i = 0; i < rec.length; i++) {
          if (
            String(rec[i].Value)
              .toLowerCase()
              .indexOf(searchString.toLowerCase()) > -1
          ) {
            result = true;
            break;
          }
        }
        return result;
      });
    }
  }

  showFieldValue(value) {
    let alert = this.alertCtrl.create({
      title: 'Field Value',
      inputs: [
        {
          name: 'value',
          value: value,
          type: 'text'
        }
      ],
      buttons: ['OK']
    });
    alert.present();
  }

  showTableRecord(tableName, record, soupRecordId) {
    // console.log(record);
    let data = {
      tableName: tableName,
      record: record,
      soupRecordId: soupRecordId
    };
    // Display modal
    const myModal: Modal = this.modalCtrl.create(SettingsMtiTableRecordPage, {
      data: data
    });
    myModal.present();
  }

  scrollToTop() {
    // Scrolls to the top of content
    this.content.scrollToTop();
  }

  showRecord(event, i) {
    event.preventDefault();
    event.stopPropagation();
    // console.log(this.filteredRecords[i]);
    this.showTableRecord(this.tableName, this.filteredRecords[i], null);
  }

}
