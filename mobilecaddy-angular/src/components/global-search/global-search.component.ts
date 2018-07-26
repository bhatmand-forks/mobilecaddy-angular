import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular'; // ? Need this to allow us to focus on input?
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators/debounceTime';

// import { MobileCaddyConfigService } from '../config-service/config.service';

import { GlobalSearchProvider } from '../../providers/global-search-service/global-search.service';

@Component({
  selector: 'mobilecaddy-global-search',
  templateUrl: './global-search.component.html'
})
export class GlobalSearch implements OnInit {
  private logTag: string = 'global-search.component.ts';
  recentSearches: Array<any> = [];
  searchDone: boolean = false;
  results: Array<any>;
  @Input() query: string;
  searchControl: FormControl;
  @ViewChild('searchBox') searchBox;

  constructor(
    private searchPvdr: GlobalSearchProvider,
    private navCtrl: NavController
  ) {
    this.searchControl = new FormControl();
  }

  ngOnInit() {
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
            item.results = res.results;
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
    myNavParams[result.navParamName] = result;
    this.navCtrl.push(result.pageName, myNavParams);
  }

  wrapField(i,j,field) {
    // First, check if the field should be wrapped in a tag
    if (this.displayFields[i].tags && this.displayFields[i].tags[j] && this.displayFields[i].tags[j].trim() !== '') {
      // Now check if field should have a class applied to the tag
      if (this.displayFields[i].classes && this.displayFields[i].classes[j] && this.displayFields[i].classes[j].trim() !== '') {
        // Tag and class
        return '<' + this.displayFields[i].tags[j] + ' class="' + this.displayFields[i].classes[j]+ '">' + field + '<' + this.displayFields[i].tags[j] + '/>';
      } else {
        // Tag but no class
        return '<' + this.displayFields[i].tags[j] + '>' + field + '<' + this.displayFields[i].tags[j] + '/>';
      }
    } else {
      // No tag wrapping field...
      // Now check if field should have a class applied to the field
      if (this.displayFields[i].classes && this.displayFields[i].classes[j] && this.displayFields[i].classes[j].trim() !== '') {
        // No tag but we have a class - add a 'span' tag so we can add the class to it
        return '<span class="' + this.displayFields[i].classes[j]+ '">' + field + '<span/>';
      } else {
        // No tag and no class
        return field;
      }
    }
  }
}
