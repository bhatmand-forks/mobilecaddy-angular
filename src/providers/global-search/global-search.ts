import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

import { MobileCaddyConfigService } from '../../../mobilecaddy-angular/src/config-service/config.service';

// TODO Use config service and export an interface for this
interface tableConfig {
  table: string;
  name: string;
  fieldsToQuery: Array<string>;
  fieldsToShow: Array<string>;
  icon: string;
  href: string;
}

interface config {
  maxItems?: number;
  encrypted?: boolean;
  tables: tableConfig[];
}

@Injectable()
export class GlobalSearchProvider {
  private logTag: string = 'globalSearch.service.ts';
  searchRes: BehaviorSubject<
    any[] | { table: string; results: Array<string> }
  > = new BehaviorSubject([]);
  private config: config;

  constructor(public mcConfig: MobileCaddyConfigService) {}

  // * P U B L I C    M E T H O D S

  /**
   * @description Adds an item to the recent searches list. It can be added to
   * the localStorage, if encryptedStore is false, or to the database otherwise.
   * Any repeated item will be deleted before adding the same one. Also if the
   * max number is reached the oldest item will be deleted.
   *
   * @param item contains the config information of the result
   *                      {icon, href}
   * @param {Object} result the Salesforce object that will be added
   **/
  addRecentSearch(item: { icon: string; href: string }, result) {
    let maxRecentSearches;
    if (this.config.maxItems === null) {
      maxRecentSearches = 10;
      this.config.maxItems = 10;
    } else {
      maxRecentSearches = this.config.maxItems;
    }
    const search = {
      icon: item.icon,
      href: item.href,
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
   * @return {[Object]} represents the most recent results clicked
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
      // TODO These are not being used for the moment because the query only works when doing a SELECT * for now.
      const fieldsToShow = element.fieldsToShow.join(', ');
      let selectCondition = '';
      element.fieldsToShow.forEach((field, index) => {
        selectCondition += '{' + element.table + ':' + field + '}';
        if (index < element.fieldsToShow.length - 1) {
          selectCondition += ',';
        }
      });

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
        'SELECT ' +
        selectCondition +
        ' from {' +
        element.table +
        '} WHERE ' +
        whereCondition;

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
    results: Array<{ Id: string }>,
    configElement: tableConfig
  ): Array<{ Id: string; string: string; href?: string; status?: string }> {
    let resultsArray: Array<{
      Id: string;
      string: string;
      href?: string;
      status?: string;
    }> = [];
    results.forEach(result => {
      const obtainedHref = this.setHref(result, configElement.href);
      const resultString = this.setString(result, configElement.fieldsToShow);
      if (obtainedHref.status === undefined) {
        resultsArray.push({
          Id: result.Id,
          string: resultString,
          href: obtainedHref
        });
      } else {
        resultsArray.push({
          Id: result.Id,
          string: resultString,
          status: obtainedHref.status
        });
      }
    });
    return resultsArray;
  }

  /**
   * @description It adds an href element to the result object or a status
   * element if an error occurred
   *
   * @param result represents the result object
   * @param href the href String with placeholders, that should be
   * used when the result is clicked
   * @return if the Id values are found on the object, then
   * it returns the String with the href, if they weren't, then an object with
   * the status is returned
   **/
  private setHref(result: object, href: string): any {
    //Splitting the href String so I can have each part in a separate
    //position of an array.
    let splitHref = href.split('/');

    //Removes the empty String generated in the first position
    splitHref.splice(0, 1);

    //idNames will have the names of the Strings that represent Ids
    //in the href String, such as AccountId, or Id
    let idNames = [];

    //indexOfIds will have the indexes of the idNames that are in
    //splitHref
    let indexOfIds = [];

    // Run through splitHref to save in idNames only the Strings that
    // have a ':' at the beginning, which are the ones that should
    // contain a placeholer
    splitHref.forEach((hrefItem, index) => {
      if (hrefItem.substring(0, 1) === ':') {
        indexOfIds.push(index);
        idNames.push(hrefItem.substring(1, hrefItem.length));
      }
    });

    //idValues are the actual Ids of the result Object
    //It might be only one
    let idValues = [];
    let statusObj;
    for (let i = 0; i < idNames.length; i++) {
      let id = this.findId(result, idNames[i]);
      if (id != '') {
        idValues.push(id);
      } else {
        //If at least one idName wasn't found, set the status message
        //so that the developer knows what happened
        statusObj = { status: 'At least one id of the href was not found' };
        break;
      }
    }

    //If the status wasn't set, it means the Id values were found,
    //so we form the href String using the indexOfIds and the values
    //in idValues
    if (!statusObj) {
      for (let i = 0; i < indexOfIds.length; i++) {
        splitHref[indexOfIds[i]] = idValues[i];
      }
      //An '/' is added to the first String of the href String
      splitHref[0] = '/' + splitHref[0];
      //The splitHref is joined to form the complete href String
      return splitHref.join('/');
    } else {
      return statusObj;
    }
  }

  /**
   * @description Auxiliar function that searches through the object,
   * to try to find the value of the corresponding idName
   *
   * @param object represents a result object of the globlal search
   * @param idName name of the placeholder containing an Id,
   * e.g.: AccountId
   * @return value of the Id placeholder in the object
   **/
  private findId(object: object, idName: string): string {
    let idValue = '';
    //Searching for the idName in the keys of the Object
    Object.keys(object).find(objKey => {
      if (objKey === idName) {
        //If the idName was found in the Object, then save its value
        idValue = object[objKey];
        //Stop searching after finding the element that meets the condition
        return true;
      }
    });
    return idValue;
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
  private setString(result: object, fields: string[]): string {
    let resultString = '';
    fields.forEach((field, index) => {
      if (index < fields.length - 1) {
        if (result[fields[index + 1]] != '') {
          resultString += result[field] + ', ';
        } else {
          resultString += result[field];
        }
      } else {
        resultString += result[field];
      }
    });
    return resultString;
  }
}
