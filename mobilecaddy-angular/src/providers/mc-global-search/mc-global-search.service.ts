import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';

import { McConfigService } from '../mc-config/mc-config.service';

// TODO Use config service and export an interface for this
interface tableConfig {
  table: string;
  name: string;
  fieldsToQuery: Array<string>;
  // fieldsToShow: Array<string>;
  icon: string;
  // href: string;
  pageName: string;
  navParamName: string;
}

interface config {
  maxItems?: number;
  encrypted?: boolean;
  tables: tableConfig[];
}

@Injectable()
export class McGlobalSearchProvider {
  private logTag: string = 'mc-global-search.service.ts';
  searchRes: BehaviorSubject<
    any[] | { table: string; results: Array<string> }
  > = new BehaviorSubject([]);
  private config: config;

  constructor(public mcConfig: McConfigService) {}

  // * P U B L I C    M E T H O D S

  /**
   * @description Adds an item to the recent searches list. It can be added to
   * the localStorage, if encryptedStore is false, or to the database otherwise.
   * Any repeated item will be deleted before adding the same one. Also if the
   * max number is reached the oldest item will be deleted.
   *
   * @param contains the config information of the result
   *                      {icon}
   * @param result the Salesforce object that will be added
   **/
  addRecentSearch(item: { icon: string }, result) {
    let maxRecentSearches;
    if (!this.config) this.config = this.mcConfig.getConfig('globalSearch');
    if (this.config.maxItems === null) {
      maxRecentSearches = 10;
      this.config.maxItems = 10;
    } else {
      maxRecentSearches = this.config.maxItems;
    }
    const search = {
      icon: item.icon,
      result: result
    };

    // if (encryptedStore === false){
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches'));
    if (recentSearches === null) {
      recentSearches = [];
    }

    //Checking if the new search already exists in the list, in that case,
    //it's deleted
    recentSearches.find((recentSearch, index) => {
      if (recentSearch.result.Id === result.Id) {
        recentSearches.splice(index, 1);
        //Stop searching after finding the element that meets the condition
        return true;
      }
    });

    //Add the new result to the list
    recentSearches.push(search);

    //Checking the size of the list, because if it already has the
    //maximum amount of items then we need to remove one, before pushing
    //the new one
    if (recentSearches.length > maxRecentSearches) {
      recentSearches.shift();
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    // }
  }

  /**
   * @description returns an Array with Objects representing the the most
   * recent results clicked. If encryptedStore is false then it will be
   * obtained from localStorage
   *
   * @return represents the most recent results clicked
   **/
  getRecentSearches(): Array<any> {
    // if (encryptedStore === false){
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches'));
    if (recentSearches !== null) {
      return recentSearches.reverse();
    } else {
      return [];
    }
    // }
  }

  /**
   * @param query
   */
  search(
    query: string
  ): BehaviorSubject<any[] | { table: string; results: Array<string> }> {
    if (!this.config) this.config = this.mcConfig.getConfig('globalSearch');
    console.log(this.logTag, 'search', query);
    let tableConf = this.config.tables;
    // Initially reply with config, so component can render tables being searched
    let confForController: Array<any> = [];
    tableConf.forEach(configElement => {
      confForController.push(this.setConfigForController(configElement));
      this.searchTable(configElement, query).then(
        resultsArray => {
          this.searchRes.next({
            table: configElement.table,
            results: resultsArray
          });
        },
        function(e) {
          logger.error(this.logTag, e);
        }
      );
    });
    this.searchRes.next(confForController);
    return this.searchRes;
  }

  // * P R I V A T E    M E T H O D S

  /**
   * @description generates an Object that has some elements of the config
   * parameter of a specific table, to be used by the controller
   *
   * @param element has the configuration information of a database table
   * @return Object that has some of the elements of the config Object of a specific table
   */
  private setConfigForController(
    element: any
  ): { table: string; name: string; icon: string } {
    return {
      table: element.table,
      name: element.name,
      icon: element.icon
    };
  }

  /**
   * @description Uses a smartSQL query from the devUtils API to find the
   * String parameter in any of the fields specified in the config information.
   * When it finishes the search it returns a promise that can have the
   * the records or a status if something unexpected happened.
   *
   * @param  element has the config information of the table on which
   * the SOQL query will be performed
   * @param str it's the String that the user wants to search for in
   * the database tables
   * @return resolves to a success with the Array of results, or
   * rejects an error object
   */
  private searchTable(element: tableConfig, str: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let whereCondition = '';
      element.fieldsToQuery.forEach((field, index) => {
        whereCondition +=
          '{' +
          element.table +
          ':' +
          field +
          "} LIKE '%" +
          str.toLocaleLowerCase() +
          "%'";
        if (index < element.fieldsToQuery.length - 1) {
          whereCondition += ' OR ';
        }
      });

      var smartSql =
        'SELECT * from {' + element.table + '} WHERE ' + whereCondition;

      console.log('smartSql', smartSql);

      devUtils
        .smartSql(smartSql)
        .then(resObject => {
          if (resObject != undefined) {
            const resultsArray = this.createResultsArray(
              resObject.records,
              element
            );
            resolve(resultsArray);
          } else {
            resolve([]);
          }
        })
        .catch(resObject => {
          console.error(this.logTag, resObject);
          if (resObject == undefined) {
            reject([]);
          } else {
            logger.error(this.logTag, resObject);
            reject(resObject);
          }
        });
    });
  }

  /**
   * @description creates an array of three objects for each result, one is the
   * Id of the result, the second is a String that contains the concatenated
   * fields to show from the result and the third is either the href that will
   * be used when the item is clicked in the view or a status explaining why
   * the href couldn't be created
   *
   * @param results it's the array that has the result object(s) from
   * the SOQL query
   * @param configElement has the configuration information for the
   * corresponding table of the result(s)
   * @return array that contains data of the result object(s)
   **/
  private createResultsArray(
    results: any[],
    configElement: tableConfig
  ): Array<{
    Id: string;
    result: any[];
    name: string;
    pageName: string;
    navParamName: string;
  }> {
    let resultsArray: Array<{
      Id: string;
      result: any[];
      name: string;
      pageName: string;
      navParamName: string;
    }> = [];
    // TODO Need to update as soql replies with items in an array, not as probs of objects
    // * somehow this currently works in CodeFlow
    results.forEach(result => {
      resultsArray.push({
        Id: result.Id,
        // result: this.filterProps(result, configElement.fieldsToShow),
        result: result,
        name: configElement.name,
        pageName: configElement.pageName,
        navParamName: configElement.navParamName
      });
    });
    return resultsArray;
  }

  /**
   * @description For each of the fields to show, it checks if the result
   * has it and if it does, the value is concatenated with the previous values
   * with a comma
   *
   * @param result represents the result object
   * @param fields each String is one field that should appear in
   * the result String
   * @return the String that contains the result information,
   * e.g. "Judy Smith, CEO"
   **/
  // private setString(result: object, fields: string[]): string {
  //   let resultString = '';
  //   fields.forEach((field, index) => {
  //     if (index < fields.length - 1) {
  //       if (result[fields[index + 1]] != '') {
  //         resultString += result[field] + ', ';
  //       } else {
  //         resultString += result[field];
  //       }
  //     } else {
  //       resultString += result[field];
  //     }
  //   });
  //   return resultString;
  // }

  private filterProps(result: object, fields: string[]): any[] {
    let resultArr = fields.map(field => {
      return result[field];
    });
    return resultArr;
  }
}
