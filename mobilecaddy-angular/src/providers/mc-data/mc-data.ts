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
    pageSize?: number
  ): any {
    return new Promise((resolve, reject) => {
      let whereClause;

      if (filters) {
        _.each(filters, (value, key) => {
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
            whereClause += ' AND {' + tableName + ':' + key + '} IN ( ' + valStr + ' )';
          } else {
            whereClause = '{' + tableName + ':' + key + '} IN ( ' + valStr + ' )';
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
      // smartSql queries don't work on browser but run on devices.
      // To overcome this limitation, sort & limit records by custom logic for browser (codeflow)
      if (!window['LOCAL_DEV']) {
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

      if (!pageSize) {
        pageSize = 100;
      }

      // console.log('::smartSql::', smartSql);

      devUtils.smartSql(smartSql, pageSize).then(resObject => {
        if (window['LOCAL_DEV']) {
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