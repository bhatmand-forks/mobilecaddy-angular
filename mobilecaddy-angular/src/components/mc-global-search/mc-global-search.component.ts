import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular'; // ? Need this to allow us to focus on input?
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators/debounceTime';

import { McConfigService } from '../../providers/mc-config/mc-config.service';

import { McGlobalSearchProvider } from '../../providers/mc-global-search/mc-global-search.service';

@Component({
  selector: 'mc-global-search',
  templateUrl: './mc-global-search.component.html'
})
export class GlobalSearch implements OnInit {
  private logTag: string = 'mc-global-search.component.ts';
  private config;
  private displayFields;
  recentSearches: Array<any> = [];
  searchDone: boolean = false;
  results: Array<any>;
  @Input() query: string;
  searchControl: FormControl;
  @ViewChild('searchBox') searchBox;

  constructor(
    private searchPvdr: McGlobalSearchProvider,
    private mcConfig: McConfigService,
    private navCtrl: NavController
  ) {
    this.searchControl = new FormControl();
  }

  ngOnInit() {
    this.config = this.mcConfig.getConfig('globalSearch');
    this.displayFields = this.getDisplayFields();
    console.log('displayFields', this.displayFields);
    setTimeout(() => {
      this.searchBox.setFocus();
    }, 150);
    this.showRecentSearches();
    this.searchControl.valueChanges
      .pipe(debounceTime(800))
      .subscribe(search => {
        console.log(this.logTag, 'Maybe do a search', search);
        if (search === '') {
          this.searchDone = false;
        } else if (search && search.length > 2) {
          this.doSearch();
        }
      });
  }

  /**
   * @description gets recent search results from the GlobalSearchService
   **/
  showRecentSearches(): void {
    this.recentSearches = this.searchPvdr.getRecentSearches();
  }

  clearSearch() {
    console.log(this.logTag, 'clearSearch', this.query);
    this.query = '';
    setTimeout(() => {
      this.searchBox.setFocus();
    }, 150);
    this.searchDone = false;
  }

  doSearch() {
    console.log(this.logTag, 'doSearch', this.query);
    this.results = undefined;
    this.searchDone = true;
    this.searchPvdr.search(this.query).subscribe(res => {
      console.log(this.logTag, res);
      if (res instanceof Array) {
        // This is our config, specifying tables etc
        this.results = res;
      } else {
        // This is our results
        this.results.find((item, index) => {
          if (item.table === res.table) {
            item.results = this.enrichResult(res);
            //Stop searching after finding the element that meets the condition
            return true;
          }
        });
        console.log(this.results);
      }
    });
  }

  /**
   * @description calls the addRecentSearch function from the
   * GlobalSearchService to add the result to the recent searches list. Then
   * calls the function showRecentSearches to update the results in the UI.
   * If the result has an href, it changes the current location of the app
   * to that path.
   *
   * @param item contains the config information of the result
   * @param result the result object that will be added
   **/
  resultClicked(item, result) {
    console.log(this.logTag, 'resultClicked', item, result);
    if (!result) result = item.result;
    this.searchPvdr.addRecentSearch(item, result);
    this.showRecentSearches();

    let myNavParams: any = { id: result.Id };
    myNavParams[result.navParamName] = result.result;
    this.navCtrl.push(result.pageName, myNavParams);
  }

  private getDisplayFields(): any {
    let tmp = {};
    this.config.tables.forEach(element => {
      tmp[element.name] = {
        fields: element.displayFields
      };
    });
    return tmp;
  }

  /**
   * @description Add a markup string for each result, based upon the config.
   * @param result Object from DB
   */
  private enrichResult(result: any): any {
    console.log('enrichResult', result);
    let resultArr = result.results.map(r => {
      let tmpStr = '';
      this.displayFields[r.name].fields.forEach((fieldDiv, divIdx) => {
        tmpStr += '<div>';
        fieldDiv.fields.forEach((field, fieldIdx) => {
          tmpStr += this.wrapField(r.name, divIdx, fieldIdx, r.result[field]);
        });
        tmpStr += '</div>';
      });
      r.string = tmpStr;
      return r;
    });
    return resultArr;
  }

  private wrapField(name, divIdx, fieldIdx, field) {
    console.log('wrapField', name, divIdx, fieldIdx, field);
    console.log('this.displayFields', this.displayFields);
    let fieldConfig = this.displayFields[name].fields;
    // First, check if the field should be wrapped in a tag
    if (
      fieldConfig[divIdx].tags &&
      fieldConfig[divIdx].tags[fieldIdx] &&
      fieldConfig[divIdx].tags[fieldIdx].trim() !== ''
    ) {
      // Now check if field should have a class applied to the tag
      if (
        fieldConfig[divIdx].classes &&
        fieldConfig[divIdx].classes[fieldIdx] &&
        fieldConfig[divIdx].classes[fieldIdx].trim() !== ''
      ) {
        // Tag and class
        return (
          '<' +
          fieldConfig[divIdx].tags[fieldIdx] +
          ' class="' +
          fieldConfig[divIdx].classes[fieldIdx] +
          '">' +
          field +
          '<' +
          fieldConfig[divIdx].tags[fieldIdx] +
          '/>'
        );
      } else {
        // Tag but no class
        return (
          '<' +
          fieldConfig[divIdx].tags[fieldIdx] +
          '>' +
          field +
          '<' +
          fieldConfig[divIdx].tags[fieldIdx] +
          '/>'
        );
      }
    } else {
      // No tag wrapping field...
      // Now check if field should have a class applied to the field
      if (
        fieldConfig[divIdx].classes &&
        fieldConfig[divIdx].classes[fieldIdx] &&
        fieldConfig[divIdx].classes[fieldIdx].trim() !== ''
      ) {
        // No tag but we have a class - add a 'span' tag so we can add the class to it
        return (
          '<span class="' +
          fieldConfig[divIdx].classes[fieldIdx] +
          '">' +
          field +
          '<span/>'
        );
      } else {
        // No tag and no class
        return field;
      }
    }
  }
}
