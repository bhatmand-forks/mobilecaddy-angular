import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular'; // ? Need this to allow us to focus on input?

// import { MobileCaddyConfigService } from '../../../mobilecaddy-angular/src/config-service/config.service';

import { GlobalSearchProvider } from '../../providers/global-search/global-search';

@Component({
  selector: 'global-search',
  templateUrl: './global-search.component.html'
})
export class GlobalSearch implements OnInit {
  private logTag: string = 'global-search.component.ts';
  recentSearches: Array<any> = [];
  searchDone: boolean = false;
  results: Array<any>;
  @Input() query: string;
  @ViewChild('searchBox') searchBox;

  constructor(
    private searchPvdr: GlobalSearchProvider,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // TODO Show recent searches
    setTimeout(() => {
      this.searchBox.setFocus();
    }, 150);
    this.showRecentSearches();
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
    this.searchPvdr.addRecentSearch(item, result);
    this.showRecentSearches();
    this.navCtrl.push('OutboxPage');
    // TODO How to link to pages without having to import them first?
    // if (result.href != undefined){
    //   $location.path("/app" + result.href);
    // } else {
    //   console.log(logTag, "No href: ", result.status);
    // }
  }
}
