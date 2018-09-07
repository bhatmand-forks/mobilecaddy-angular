import { Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import * as _ from 'underscore';

@Injectable()
export class McDataProvider {

  constructor() { }

  getByFilters(
    tableName: string,
    filters?: any,
    limit?: any,
    orderBy?: any,
    fields?: any,
    pageSize?: number,
    operator?: string
  ): any {
    return new Promise((resolve, reject) => {
      let whereClause;
      let sqlOperator = 'AND';

      // Check if we have an operator parameter (should be either AND or OR)
      if (operator) {
        sqlOperator = operator.toUpperCase().trim();
        if (sqlOperator !== 'AND' && sqlOperator !== 'OR') {
          sqlOperator = 'AND';
        }
      }

      // If we have an OR operator, then change query to be 'fieldName = value1 OR fieldName = value2' 
      if (filters && sqlOperator === 'OR') {
        console.log('filters', filters);
        let newFiltersArray = [];
        // Rebuild the 'filters' to aid with the '=' and 'OR' query
        _.each(filters, (value, fieldName) => {
          if (!Array.isArray(value)) {
            let filter = {};
            filter[fieldName] = value;
            newFiltersArray.push(filter);
          } else {
            _.each(value, (val) => {
              let filter = {};
              filter[fieldName] = val;
              newFiltersArray.push(filter);
            });
          }
        });
        console.log('newFiltersArray', newFiltersArray);
        if (newFiltersArray.length > 0) {
          for (let i in newFiltersArray) {
            let filter = newFiltersArray[i]
            for (let fieldName in filter) {
              let value = filter[fieldName];
              if (whereClause) {
                whereClause += 'OR {' + tableName + ':' + fieldName + '} = \'' + value + '\' ';
              } else {
                whereClause = '{' + tableName + ':' + fieldName + '} = \'' + value + '\' ';
              }
            }
          }
        }
        console.log('whereClause', whereClause);
      }

      if (filters && sqlOperator === 'AND') {
        _.each(filters, (value, fieldName) => {
          let values = [];
          if (!Array.isArray(value)) {
            values.push(value);
          } else {
            values = value;
          }

          let valStr = '';
          _.each(values, (val) => {
            valStr += (valStr === '') ? '\'' + val + '\'' : ',\'' + val + '\'';
          });

          if (whereClause) {
            whereClause += ' AND {' + tableName + ':' + fieldName + '} IN ( ' + valStr + ' )';
          } else {
            whereClause = '{' + tableName + ':' + fieldName + '} IN ( ' + valStr + ' )';
          }
        });
      }

      // Have we got any specific fields to select?
      let columns = '*';
      if (fields) {
        columns = '';
        _.each(fields, (field) => {
          columns += '{' + tableName + ':' + field + '},';
        });
        // Remove last comma
        columns = columns.substring(0, columns.length - 1);
      }

      let smartSql;

      if (whereClause) {
        smartSql = 'SELECT ' + columns + ' FROM {' + tableName + '} WHERE ' + whereClause;
      } else {
        smartSql = 'SELECT ' + columns + ' FROM {' + tableName + '} ';
      }

      // Run different logic to get records for actual device or browser
      // smartSql queries don't work on browser but will run on devices.
      // To overcome this limitation, sort & limit records by custom logic for browser (codeflow)
      if (!window['LOCAL_DEV']) {
        // On a device, we can add 'order by' and 'limit'
        if (orderBy) {
          let orderBys = [];
          _.each(orderBy, (value, key) => {
            orderBys.push('{' + tableName + ':' + key + '} ' + value);
          });
          smartSql += ' order by ' + orderBys.join();
        }

        if (limit) {
          smartSql += ' limit ' + limit;
        }
      }

      console.log('::smartSql::', smartSql);

      if (!pageSize) {
        pageSize = 100;
      }

      devUtils.smartSql(smartSql, pageSize).then(resObject => {
        if (window['LOCAL_DEV']) {
          // If running locally in codeflow, order and limit using our own code
          resObject.records = this.arrangeRecords(resObject.records, orderBy, limit, fields);
        }
        resolve(resObject.records);
      }).catch(e => {
        reject(e);
      });
    });
  }

  readRecords(tableName: string) {
    return new Promise((resolve, reject) => {
      devUtils.readRecords(tableName).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  smartSql(smartSql: string, pageSize?: number) {
    return new Promise((resolve, reject) => {
      if (!pageSize) {
        pageSize = 100;
      }
      devUtils.smartSql(smartSql, pageSize).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  insert(tableName: string, records: any) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(records)) {
        records = [records];
      }
      devUtils.insertRecords(tableName, records).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  update(tableName: string, records: any) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(records)) {
        records = [records];
      }
      devUtils.updateRecords(tableName, records, 'Id').then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  remove(tableName: string, records: any) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(records)) {
        records = [records];
      }
      devUtils.deleteRecord(tableName, records, 'Id').then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  getRecordTypes(tableName: string) {
    return new Promise((resolve, reject) => {
      devUtils.getRecordTypes(tableName).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  private arrangeRecords(records: any, orderBy?: any, limit?: any, fields?: any): any {
    // Note. This is a VERY simple implementation of 'order by' for local dev only.
    // Only sorts by 1st field in 'orderBy' object, and only applies that fields ASC/DESC
    if (orderBy) {
      let orderBys = [];
      let reverse = null;
      _.each(orderBy, (val, key) => {
        orderBys.push(key);
        if (reverse == null) {
          reverse = val === 'ASC' ? false : true;
        }
      });
      if (fields) {
        // Find the index position of the 'order by' field name
        let fieldIndex = -1;
        for (let i = 0; i < fields.length; i++) {
          fieldIndex++;
          if (fields[i] == orderBys[0]) {
            break;
          }
        }
        records = _.sortBy(records, fieldIndex);
      } else {
        records = _.sortBy(records, orderBys[0]);
      }
      if (reverse) {
        records.reverse();
      }
    }

    if (limit) {
      records = records.slice(0, limit)
    }

    return records;
  }

}