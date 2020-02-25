import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { LoadingController, Loading } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import * as fileUtils from 'mobilecaddy-utils/fileUtils';

@Component({
  selector: 'mc-list',
  templateUrl: 'mc-list.html',
  styles: [
    `
      .mc-list-search-container {
        width: 100%;
        background-color: #ffffff;
      }
    `
  ]
})
export class McListComponent implements OnInit, OnDestroy, OnChanges {
  logTag: string = 'mc-list.ts';
  @Input('headerTitle') headerTitle: string;
  // Either 'recs' or 'sqlParms' must be specified for this component.
  // 'recs' = data read by parent component and passed to this component.
  // 'sqlParms' = the smart sql used by this component to read the data.
  @Input('recs') recs: any;
  @Input('sqlParms') sqlParms: any;
  @Input('displayFields') displayFields: any;
  @Input('iconsStart') iconsStart: any;
  @Input('imagesStart') imagesStart: any;
  @Input('iconsEnd') iconsEnd: any;
  @Input('buttonsEnd') buttonsEnd: any;
  @Input('itemClass') itemClass: string;
  @Input('cardClass') cardClass: string;
  @Input('loaderMsg') loaderMsg: string;
  @Input('noDataMsg') noDataMsg: string;
  @Input('noDataMsgClass') noDataMsgClass: string;
  @Input('isCardList') isCardList: boolean;
  @Input('isImageCard') isImageCard: boolean = false;
  @Input('showAddButton') showAddButton: boolean;
  @Input('showSearch') showSearch: boolean;
  @Input('searchPlaceholder') searchPlaceholder: string = 'Search';
  @Input('refreshList') refreshList: Subject<any>;
  @Input('filterList') filterList: Subject<any>;
  @Input('height') height: string;
  @Input('listScrollHeight') listScrollHeight: string;
  @Input('addCardStart') addCardStart: any;
  @Input('addCardEnd') addCardEnd: any;
  @Output() recordClicked: EventEmitter<any> = new EventEmitter();
  @Output() iconEndClicked: EventEmitter<any> = new EventEmitter();
  @Output() iconStartClicked: EventEmitter<any> = new EventEmitter();
  @Output() buttonEndClicked: EventEmitter<any> = new EventEmitter();
  @Output() addClicked: EventEmitter<any> = new EventEmitter();
  @Output() addCardStartClicked: EventEmitter<any> = new EventEmitter();
  @Output() addCardEndClicked: EventEmitter<any> = new EventEmitter();

  // So we can unsubscribe subscriptions on destroy
  private refreshListSubscription: Subscription;
  private filterListSubscription: Subscription;

  // We save all the original records so we can restore after a search (if config has been set for one)
  private allRecs: any = [];

  constructor(
    private mcDataProvider: McDataProvider,
    private loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getData();
    // Create subscription to allow list data to be refreshed from parent component
    if (this.refreshList) {
      this.refreshListSubscription = this.refreshList.subscribe(sqlParms => {
        // We might want to change the sql criteria for a list refresh
        if (sqlParms) {
          this.sqlParms = sqlParms;
        }
        this.getData();
      });
    }
    // Create subscription to allow list data to be filtered from parent component
    if (this.filterList) {
      this.filterListSubscription = this.filterList.subscribe(ev => {
        this.filterRecs(ev);
      });
    }
  }

  ngOnDestroy() {
    if (this.refreshListSubscription) {
      this.refreshListSubscription.unsubscribe();
    }
    if (this.filterListSubscription) {
      this.filterListSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if the 'recs' has been changed by the parent component (e.g. after reading data)
    if (changes.recs) {
      this.recs = changes.recs.currentValue;
      this.maybeEnrichRecsWithImages().then(r => {
        // Update 'allRecs' to reflect the records - 'allRecs' is used in search functionality
        this.allRecs = this.recs;
      });
    }
  }

  getData() {
    // We should have @Input of either 'recs' or 'sqlParms', not both
    if (this.sqlParms) {
      let loader: Loading;
      if (this.loaderMsg && this.loaderMsg !== '') {
        loader = this.loadingCtrl.create({
          content: this.loaderMsg,
          duration: 10000
        });
        loader.present();
      }
      this.mcDataProvider
        .getByFilters(
          this.sqlParms.tableName,
          this.sqlParms.filters,
          this.sqlParms.limit,
          this.sqlParms.orderBy,
          this.sqlParms.fields,
          this.sqlParms.pageSize
        )
        .then(res => {
          // console.log(this.logTag, 'res', res);
          if (res.length > 0) {
            this.recs = res;
            this.maybeEnrichRecsWithImages();
            this.allRecs = res;
          }
          if (loader) {
            loader.dismiss();
          }
        })
        .catch(e => {
          console.error(e);
        });
    } else {
      this.maybeEnrichRecsWithImages();
      this.allRecs = this.recs;
    }
  }

  clickRecord(event, rec) {
    event.stopPropagation();
    if (this.recordClicked) {
      this.recordClicked.emit(rec);
    }
  }

  clickIconStart(event, rec) {
    event.stopPropagation();
    if (this.iconStartClicked) {
      this.iconStartClicked.emit(rec);
    }
  }

  clickIconEnd(event, rec) {
    event.stopPropagation();
    if (this.iconEndClicked) {
      this.iconEndClicked.emit(rec);
    }
  }

  clickButtonEnd(event, rec) {
    event.stopPropagation();
    if (this.buttonEndClicked) {
      this.buttonEndClicked.emit(rec);
    }
  }

  clickAdd() {
    if (this.addClicked) {
      this.addClicked.emit();
    }
  }

  clickAddCardStart(event) {
    event.stopPropagation();
    if (this.addCardStartClicked) {
      this.addCardStartClicked.emit();
    }
  }

  clickAddCardEnd(event) {
    event.stopPropagation();
    if (this.addCardEndClicked) {
      this.addCardEndClicked.emit();
    }
  }

  wrapField(i, j, field) {
    // i = index of displayFields (which represents a row of fields)
    // j = index of fields (which represents a field position within each row)
    // First, check if the field should be wrapped in a tag
    if (
      this.displayFields[i].tags &&
      this.displayFields[i].tags[j] &&
      this.displayFields[i].tags[j].trim() !== ''
    ) {
      // Now check if field should have a class applied to the tag
      if (
        this.displayFields[i].classes &&
        this.displayFields[i].classes[j] &&
        this.displayFields[i].classes[j].trim() !== ''
      ) {
        // Tag and class
        let cssClass = this.displayFields[i].classes[j];
        // Check if field has a conditional class (based on value of field)
        cssClass = this.checkForConditionalClass(i, j, field, cssClass);
        return (
          '<' +
          this.displayFields[i].tags[j] +
          ' class="' +
          cssClass +
          '">' +
          this.formatField(i, j, field) +
          '<' +
          this.displayFields[i].tags[j] +
          '/>'
        );
      } else {
        // Tag but no class.
        // Check if field has a conditional class (based on value of field)
        let cssClass = this.checkForConditionalClass(i, j, field, '');
        if (cssClass !== '') {
          return (
            '<' +
            this.displayFields[i].tags[j] +
            ' class="' +
            cssClass +
            '">' +
            this.formatField(i, j, field) +
            '<' +
            this.displayFields[i].tags[j] +
            '/>'
          );
        } else {
          return (
            '<' +
            this.displayFields[i].tags[j] +
            '>' +
            this.formatField(i, j, field) +
            '<' +
            this.displayFields[i].tags[j] +
            '/>'
          );
        }
      }
    } else {
      // No tag wrapping field...
      // Now check if field should have a class applied to the field
      if (
        this.displayFields[i].classes &&
        this.displayFields[i].classes[j] &&
        this.displayFields[i].classes[j].trim() !== ''
      ) {
        // No tag but we have a class - add a 'span' tag so we can add the class to it
        let cssClass = this.displayFields[i].classes[j];
        // Check if field has a conditional class (based on value of field)
        cssClass = this.checkForConditionalClass(i, j, field, cssClass);
        return (
          '<span class="' +
          cssClass +
          '">' +
          this.formatField(i, j, field) +
          '<span/>'
        );
      } else {
        // No tag and no class.
        // Check if field has a conditional class (based on value of field)
        let cssClass = this.checkForConditionalClass(i, j, field, '');
        return cssClass !== ''
          ? '<span class="' +
              cssClass +
              '">' +
              this.formatField(i, j, field) +
              '<span/>'
          : this.formatField(i, j, field);
      }
    }
  }

  checkForConditionalClass(i, j, field, cssClass): string {
    // Default result to class already determined from 'classes' node (in case we don't find a conditional one)
    let result = cssClass;
    // Look for a conditional class for this field value
    if (
      this.displayFields[i].conditions &&
      this.displayFields[i].conditions[j]
    ) {
      for (let c = 0; c < this.displayFields[i].conditions[j].length; c++) {
        if (this.displayFields[i].conditions[j][c].value == field) {
          result = this.displayFields[i].conditions[j][c].class;
          break;
        }
      }
    }
    return result;
  }

  formatField(i, j, field) {
    if (field == null || field == undefined || field === '') {
      return '';
    }
    let result = field;
    // Check to see if field needs to be formatted using a pipe.
    // N.B. we currently only cater for a DatePipe
    if (this.displayFields[i].pipes && this.displayFields[i].pipes[j]) {
      // Check if we need to format field as date
      if (
        this.displayFields[i].pipes[j].name &&
        this.displayFields[i].pipes[j].name == 'date'
      ) {
        if (
          this.displayFields[i].pipes[j].format &&
          this.displayFields[i].pipes[j].format.trim() !== ''
        ) {
          let pipe = new DatePipe(
            this.displayFields[i].pipes[j].locale
              ? this.displayFields[i].pipes[j].locale
              : 'en-US'
          );
          result = pipe.transform(field, this.displayFields[i].pipes[j].format);
        }
      }
      // Note. 'suffix' and 'prefix' aren't really angular pipes, they're used for formatting the field value.
      // Check to see if there's a suffix to add to the field
      if (
        this.displayFields[i].pipes[j].suffix &&
        this.displayFields[i].pipes[j].suffix.trim() !== ''
      ) {
        result = result + this.displayFields[i].pipes[j].suffix;
      }
      // Check to see if there's a prefix to add to the field
      if (
        this.displayFields[i].pipes[j].prefix &&
        this.displayFields[i].pipes[j].prefix.trim() !== ''
      ) {
        result = this.displayFields[i].pipes[j].prefix + result;
      }
    }
    return result;
  }

  getIconStartName(rec: any): string {
    let i = this.getIconStartIndex(rec);
    return i !== null
      ? this.iconsStart[i].name
        ? this.iconsStart[i].name
        : ''
      : '';
  }

  getIconStartColor(rec: any): string {
    let i = this.getIconStartIndex(rec);
    return i !== null
      ? this.iconsStart[i].color
        ? this.iconsStart[i].color
        : ''
      : '';
  }

  getIconStartClass(rec: any): string {
    let i = this.getIconStartIndex(rec);
    return i !== null
      ? this.iconsStart[i].class
        ? this.iconsStart[i].class
        : ''
      : '';
  }

  getImageStartClass(): string {
    return this.imagesStart.class ? this.imagesStart.class : '';
  }

  getIconEndName(rec: any): string {
    let i = this.getIconEndIndex(rec);
    return i !== null
      ? this.iconsEnd[i].name
        ? this.iconsEnd[i].name
        : ''
      : '';
  }

  getIconEndColor(rec: any): string {
    let i = this.getIconEndIndex(rec);
    return i !== null
      ? this.iconsEnd[i].color
        ? this.iconsEnd[i].color
        : ''
      : '';
  }

  getIconEndClass(rec: any): string {
    let i = this.getIconEndIndex(rec);
    return i !== null
      ? this.iconsEnd[i].class
        ? this.iconsEnd[i].class
        : ''
      : '';
  }

  getButtonEndName(rec: any): string {
    let i = this.getButtonEndIndex(rec);
    return i !== null
      ? this.buttonsEnd[i].name
        ? this.buttonsEnd[i].name
        : ''
      : '';
  }

  getButtonEndClass(rec: any): string {
    let i = this.getButtonEndIndex(rec);
    return i !== null
      ? this.buttonsEnd[i].class
        ? this.buttonsEnd[i].class
        : ''
      : '';
  }

  filterRecs(ev: any) {
    // Reset recs back to all of the recs
    this.recs = this.allRecs;

    // Get the value of the searchbar
    const searchString = ev.target.value;

    // If the value is an empty string don't filter the recs
    if (searchString && searchString.trim() !== '') {
      this.recs = this.recs.filter(rec => {
        let res: boolean = false;
        for (let i = 0; i < this.displayFields.length; i++) {
          for (let j = 0; j < this.displayFields[i].fields.length; j++) {
            if (
              rec[this.displayFields[i].fields[j]] &&
              rec[this.displayFields[i].fields[j]]
                .toString()
                .toLowerCase()
                .indexOf(searchString.toLowerCase()) > -1
            ) {
              res = true;
              break;
            }
          }
        }
        return res;
      });
    }
  }

  private getIconStartIndex(rec: any): number {
    let index: number = null;
    for (let i = 0; i < this.iconsStart.length; i++) {
      for (let j = 0; j < this.iconsStart[i].conditions.length; j++) {
        if (
          this.iconsStart[i].conditions[j].showOnAll ||
          rec[this.iconsStart[i].conditions[j].field] ==
            this.iconsStart[i].conditions[j].value
        ) {
          index = i;
          break;
        }
      }
    }
    return index;
  }

  private getIconEndIndex(rec: any): number {
    let index: number = null;
    for (let i = 0; i < this.iconsEnd.length; i++) {
      for (let j = 0; j < this.iconsEnd[i].conditions.length; j++) {
        if (
          this.iconsEnd[i].conditions[j].showOnAll ||
          rec[this.iconsEnd[i].conditions[j].field] ==
            this.iconsEnd[i].conditions[j].value
        ) {
          index = i;
          break;
        }
      }
    }
    return index;
  }

  private getButtonEndIndex(rec: any): number {
    let index: number = null;
    for (let i = 0; i < this.buttonsEnd.length; i++) {
      for (let j = 0; j < this.buttonsEnd[i].conditions.length; j++) {
        if (
          this.buttonsEnd[i].conditions[j].showOnAll ||
          rec[this.buttonsEnd[i].conditions[j].field] ==
            this.buttonsEnd[i].conditions[j].value
        ) {
          index = i;
          break;
        }
      }
    }
    return index;
  }

  private maybeEnrichRecsWithImages() {
    return new Promise((resolve, reject) => {
      console.log(this.logTag, 'maybeEnrichRecsWithImages');
      if (this.imagesStart) {
        console.log(this.logTag, 'We have imagesStart');

        var promises = [];

        // Go through recs and add the image attribute
        this.recs.forEach(rec => {
          try {
            promises.push(
              fileUtils
                .readAsDataURL(rec[this.imagesStart.field])
                .then(res => {
                  console.log('readAsDataURL res: ' + res);
                  rec.image = this.sanitizer.bypassSecurityTrustUrl(res);
                })
                .catch(err => {
                  console.error('readAsDataURL err', err);
                  // logger.error('Error', err);
                })
            );
          } catch (e) {
            console.error('Error - try catch: ', e);
            // logger.error('Error - try catch', e);
            reject();
          }
        });

        Promise.all(promises).then(() => {
          resolve();
        }).catch(e => {
          console.error("promise.all catch", e);
        });
      }
    });
  }
}
