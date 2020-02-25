import { Injectable } from '@angular/core';

// interface SyncTableConfig {
//   Name: string;
//   syncWithoutLocalUpdates?: boolean;
//   maxTableAge?: number;
// }

export interface Header1Resp {
  title: string
}

export interface List1Resp {
  isCardList: string,
  isImageCard: string,
  cardClass: string,
  itemClass: string,
  displayFields: Array<any>,
  showSearch: boolean,
  searchPlaceholder: string,
  noDataMsg: string,
  noDataMsgClass: string
}

@Injectable()
export class McConfigService {
  private logTag: string = 'mc-config.service.ts';
  private config;
  private configKey: string = 'mc-config';
  test: string;

  constructor() {}

  setConfig(config: any): void {
    console.log(this.logTag, 'setConfig', config);
    this.config = config;
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  getConfig(key?: string): any {
    if (this.config) {
      console.log(this.logTag, 'getConfig from "this"');
      const res = key ? this.config[key] : this.config;
      return typeof res == 'object' ? JSON.parse(JSON.stringify(res)) : res;
    } else {
      console.log(this.logTag, 'getConfig from "localStorage"');
      this.config = JSON.parse(localStorage.getItem(this.configKey));
      const res = key ? this.config[key] : this.config;
      return typeof res == 'object' ? JSON.parse(JSON.stringify(res)) : res;
    }
  }

  getConfigById(theObjects, id:string, parentType?: string) {
    var result = null;
    if(theObjects instanceof Array) {
        for(var i = 0; i < theObjects.length; i++) {
            result = this.getConfigById(theObjects[i], id, parentType);
            if (result) {
                break;
            }
        }
    }
    else
    {
        for(var prop in theObjects) {
            if(prop == 'id') {
                if(theObjects[prop] == id) {
                    theObjects.parentType = parentType;
                    return theObjects;
                }
            }
            if(theObjects[prop] instanceof Object || theObjects[prop] instanceof Array) {
                result = this.getConfigById(theObjects[prop], id, prop);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
  }

  inflateComponent(name :string, conf: any, recs: Array<any> = undefined) :any {
    switch (name) {
      case "Header1" : {
        return this.inflateHeader1(conf, recs);
      }
      case "Item_List1" :
        return this.inflateList1(conf);
      case "dataServiceInterface" :
        // TODO
        return {};
      default :
        console.warn(this.logTag, "Unknown component", name);
        throw ("Unknown component " + name);
    }
  }

  private inflateHeader1(conf:any, recs: Array<any>): Header1Resp {
    let resp: Header1Resp = {
      title: ""
    }
    if (conf.config.type == "static" ) {
      // TODO would be nice to use opional chaining
      // e.g. (conf.config?.transParams?.Title)
      if ((((conf || {}).config || {}).transParams || {}).Title) {
        resp.title = conf.config.transParams.Title;
      }
    } else {
      // Get title from a field
      resp.title = recs[0][conf.fields[0].config.apiFieldName];
    }
    return resp;
  }

  private inflateList1(conf: any): List1Resp {
    let resp: List1Resp = {
      isCardList: "",
      isImageCard: "",
      cardClass: "",
      itemClass: "",
      displayFields: [],
      showSearch: false,
      searchPlaceholder: "",
      noDataMsg: "",
      noDataMsgClass: ""
    }

    resp.isCardList = conf.componentInterface.params.isCardList;
    resp.isImageCard = conf.componentInterface.params.isImageCard;
    resp.cardClass = conf.componentInterface.params.cardClass;
    resp.itemClass = conf.componentInterface.params.itemClass;

    // Go through componentInterface children.
    conf.componentInterface.children.forEach(child => {

      // TODO Set list header
      // this.listHeaderTitle =

      // TODO List Order.

      // TODO Filter.

      // TODO Icons.

      switch (child.name) {
        case "search":
          resp.showSearch = true;
          resp.searchPlaceholder = child.transParams.searchPlaceholder;
          break;
        case "row":
          let row = {
            classes: [],
            fields : [],
            tags : [],
            pipes: [],
          };
          child.children.forEach(subChild => {
            switch ( subChild.name ) {
              // TODO "tag", "suffix", etc
              case "field" :
                row.fields.push(subChild.params.apiFieldName);
                row.classes.push(subChild.params.class);
                row.pipes.push({suffix:subChild.params.suffix});
                break;
              default:
                break;
            }
          });
          resp.displayFields.push(row);
          break;
      }
    });

    return resp;
  }
}
