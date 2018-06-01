import { Injectable } from '@angular/core';
import { MobileCaddyConfigService } from '../config-service/config.service';
import * as _ from 'underscore';

export interface recentItemsTypeConfig {
  name: string;
  icon: string;
  href: string;
}

@Injectable()
export class RecentItemsService {
  // private logTag: string = 'recent-items.service.ts';
  private recentItemsKey: string = 'recentItems';
  private config;

  constructor(private MobileCaddyConfigService: MobileCaddyConfigService) {}

  /**
   * @description Adds an item to the recent items list. It can be added to the
   * localStorage or to the database. Any repeated item will be deleted before
   * adding the same one. Also if the max number is reached the oldest item wil
   * be deleted.
   *
   * @param type the type of the new item, e.g. "Account"
   * @param object the object that will be added
   */
  addRecentItem(type: string, object): void {
    let maxRecentItems = this.getMaxItems();

    // if (encryptedStore === false){
    let recentItems = JSON.parse(localStorage.getItem('recentItems'));
    if (recentItems === null) {
      recentItems = [];
    }
    let newItem = {
      type: type,
      object: object
    };

    //Checking if the new item already exists in the list, in that case,
    //it's deleted
    recentItems.find((recentItem, index) => {
      if (recentItem.object.Id === newItem.object.Id) {
        recentItems.splice(index, 1);
        //Stop searching after finding the element that meets the condition
        return true;
      }
    });

    //Add the new item to the list
    recentItems.push(newItem);

    //Checking the size of the list, because if it already has the
    //maximum amount of items then we need to remove one, before pushing
    //the new one
    if (recentItems.length > maxRecentItems) {
      recentItems.shift();
    }
    localStorage.setItem('recentItems', JSON.stringify(recentItems));
    // }
  }

  /**
   * @description It removes the recentItems from localStorage
   *
   * @param type the type of the items to delete, e.g. "Account".
   * It's optional
   */
  clearRecentItems(type) {
    if (!type) {
      localStorage.removeItem(this.recentItemsKey);
    } else {
      let filteredRecentItems = JSON.parse(
        localStorage.getItem(this.recentItemsKey)
      ).filter(item => {
        return item.type != type;
      });
      localStorage.setItem(
        this.recentItemsKey,
        JSON.stringify(filteredRecentItems)
      );
    }
  }

  /**
   * @description Checks to see if an item with id exists, if so return it, if not return false
   *
   * @param id Id of the object to look for.
   * @return  Matching recentItem object | false.
   */
  contains(id) {
    let recentItems = JSON.parse(localStorage.getItem(this.recentItemsKey));
    let match = recentItems.find(el => {
      return el.object.Id == id;
    });
    return match ? match : false;
  }

  /**
   * @param  item represents the recent item
   * @return represents the recent item that has been enriched
   * @description It adds config information to the item
   */
  private enrichItem(item) {
    //Conf has the object that includes the type of item, icon and href
    let conf = this.getConfigForType(item.type);

    //Splitting the href String so I can have each part in a separate
    //position of an array.
    let splitHref = conf.href.split('/');

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
    splitHref.forEach(function(hrefItem, index) {
      if (hrefItem.substring(0, 1) === ':') {
        indexOfIds.push(index);
        idNames.push(hrefItem.substring(1, hrefItem.length));
      }
    });

    //idValues are the actual Ids of the recent item
    //It might be only one
    let idValues = [];
    for (let i = 0; i < idNames.length; i++) {
      let id = this.findId(item.object, idNames[i]);
      if (id != undefined) {
        idValues.push(id);
      } else {
        //If at least one idName wasn't found, set the status message
        //so that the developer knows what happened
        item.status = 'At least one id of the href was not found';
        break;
      }
    }
    //If the status wasn't set, it means the Id values were found,
    //so we form the href String using the indexOfIds and the values
    //in idValues
    if (!item.status) {
      for (let i = 0; i < indexOfIds.length; i++) {
        splitHref[indexOfIds[i]] = idValues[i];
      }
      //An '/' is added to the first String of the href String
      splitHref[0] = '/' + splitHref[0];
      //The splitHref is joined to form the complete href String
      item.href = splitHref.join('/');
    }

    // Add icon info
    if (conf.icon) item.icon = conf.icon;
    return item;
  }

  /**
   * @description Auxiliar function that searches through the item object,
   * to try to find the value of the corresponding idName
   *
   * @param  object item object from the database or localStorage
   * @param  idName name of the placeholder containing an Id,
   * e.g.: AccountId
   * @return value of the Id placeholder in the item object
   */
  private findId(object: object, idName: string): string {
    var idValue;
    //Searching for the idName in the keys of the item object
    Object.keys(object).find(objKey => {
      if (objKey === idName) {
        //If the idName was found in the object, then save its value
        idValue = object[objKey];
        //Stop searching after finding the element that meets the condition
        return true;
      }
    });
    return idValue;
  }

  /**
   * @description Returns the config information for a recent item type
   *
   * @param type type of recent item, e.g.:'Account'
   * @return object that contains the configuration information about
   * the item of the specified type
   */
  getConfigForType(type: string): recentItemsTypeConfig {
    if (!this.config)
      this.config = this.MobileCaddyConfigService.getConfig('recentItems');
    let configInfo = _.filter(this.config.tables, eachConfig => {
      return eachConfig.name == type;
    });
    return configInfo[0];
  }

  /**
   * @description It returns an array of recent items
   *
   * @param type the type of the items, e.g. "Account". It's optional
   * @param amount the number of recent items that the controller
   * wants to receive. It's optional
   * @paramconfig defines if the user wants to get config
   * information about the recent items. It's optional
   * @return represents the array of recent item objects
   */
  getRecentItems(type: string, amount?: number, config?: boolean) {
    var recentItems = JSON.parse(localStorage.getItem(this.recentItemsKey));

    if (!recentItems) return [];

    var items;
    if (!type) {
      items = recentItems;
    } else {
      //Filter through the list of recentItems to find the ones that have
      //the needed type
      items = _.filter(recentItems, recentItem => {
        return recentItem.type == type;
      });
    }

    if (!amount) amount = items.length;
    //If the number of needed items is less than the total found,
    //just remove the ones not needed from the array, starting
    //from the oldest one, in position zero
    if (amount < items.length) {
      items.splice(0, items.length - amount);
    }

    //The controller wants to get the configuration information for each item
    if (config) {
      items.map(item => {
        return this.enrichItem(item);
      });
    } else config = false;

    //Since the oldest item is in the first position, to be able to show
    //the correct order when the array is looped, it needs to be reversed
    return items.reverse();
  }

  /**
   * @description Gets the maximum number of items that can be in the recent
   * items list
   *
   * @return maximum number of items
   */
  getMaxItems(): number {
    if (!this.config)
      this.config = this.MobileCaddyConfigService.getConfig('recentItems');
    if (this.config.maxItems === null) {
      return 10;
    } else {
      return this.config.maxItems;
    }
  }

  /**
   * @description Removes an item.
   *
   * @param id If od the object.
   * @return    true if item found, false if not.
   */
  removeItem(id: string): boolean {
    let recentItems = JSON.parse(localStorage.getItem(this.recentItemsKey));
    let matchFound = false;
    let recentItems2 = recentItems.filter(el => {
      if (el.object.Id == id) {
        matchFound = true;
        return false;
      } else {
        return true;
      }
    });
    localStorage.setItem(this.recentItemsKey, JSON.stringify(recentItems2));
    return matchFound;
  }
}
