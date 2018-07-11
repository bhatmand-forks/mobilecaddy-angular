import { Injectable } from '@angular/core';
import * as smartStoreUtils from 'mobilecaddy-utils/smartStoreUtils';
import * as logger from 'mobilecaddy-utils/logger';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';

@Injectable()
export class McRecoveryProvider {
  constructor(private device: Device, private file: File) {}

  getAllTableData() {
    return new Promise((resolve, reject) => {
      let sequence = Promise.resolve();
      let tablesData = {};
      let tableCount = 0;
      let totalTables = 0;
      smartStoreUtils
        .listSoups()
        .then(tables => {
          console.log('tables', tables);
          totalTables = tables.length;

          tables.forEach(tableName => {
            // console.log('tableName',tableName);
            sequence = sequence.then(() => {
              tableCount++;
              return smartStoreUtils
                .querySoupRecsPromise(tableName)
                .then(data => {
                  tablesData[tableName] = data;
                  if (tableCount == totalTables) {
                    resolve(tablesData);
                  }
                })
                .catch(error => {
                  reject(error);
                });
            });
          });
        })
        .catch(error => {
          logger.error('Unable to get tables from smartstore', error);
          reject(error);
        });
    });
  }

  getAllLocalStorageData() {
    return new Promise((resolve, reject) => {
      let dumpedLocalStorageData = [];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          // console.log('localStorage key',key);
          // console.log('localStorage',localStorage[key]);
          dumpedLocalStorageData.push({
            key: key,
            data: JSON.stringify(localStorage[key])
          });
        }
      }
      resolve(dumpedLocalStorageData);
    });
  }

  recoverAllData() {
    return new Promise((resolve, reject) => {
      this.dumpLocalStorage()
        .then(res => {
          return this.dumpTables();
        })
        .then(res => {
          logger.log('Completed Recovery: ', res);
          resolve(res);
        })
        .catch(err => {
          logger.error('Error in recovery: ', err);
          reject(err);
        });
    });
  }

  private dumpTables() {
    return new Promise((resolve, reject) => {
      let sequence = Promise.resolve();
      let tableCount = 0;
      let totalTables = 0;
      smartStoreUtils
        .listSoups()
        .then(tables => {
          totalTables = tables.length;

          tables.forEach(tableName => {
            sequence = sequence.then(() => {
              tableCount++;
              return smartStoreUtils
                .querySoupRecsPromise(tableName)
                .then(data => {
                  return this.storeDumpedDataToRecoveryFolder(
                    'MobileTable_' + tableName,
                    data
                  );
                })
                .then(resObject => {
                  logger.log(
                    '(' +
                      tableCount +
                      ' of ' +
                      totalTables +
                      ') Dump Result for ' +
                      tableName +
                      ': ',
                    resObject
                  );

                  if (tableCount == totalTables) {
                    resolve('Dump Completed for all tables.');
                  }
                })
                .catch(error => {
                  reject(error);
                });
            });
          });
        })
        .catch(error => {
          logger.error('Unable to get tables from smartstore', error);
          reject(error);
        });
    });
  }

  private dumpLocalStorage() {
    return new Promise((resolve, reject) => {
      let dumpedLocalStorageData = [];
      for (let i in localStorage) {
        dumpedLocalStorageData.push(localStorage[i]);
      }

      this.storeDumpedDataToRecoveryFolder(
        'LocalStorage',
        dumpedLocalStorageData
      )
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private storeDumpedDataToExternalAndroidRecoveryFolder(fileName, data) {
    // Stores dumped data to recovery folder
    // Params: fileName - name of the file. data - data to dump as JSON string

    return new Promise((resolve, reject) => {
      let externalRootDirectory = this.file.externalRootDirectory;

      logger.log('Beginning Android dump for: ' + fileName);
      (<any>window).requestFileSystem(
        window['LocalFileSystem'].PERSISTENT,
        0,
        function(fs) {
          let date = new Date();
          let dateString = date.toISOString();
          dateString = dateString.replace(/:/g, '');
          let fileNameWithDate =
            'Recovered_' + fileName + '_' + dateString + '.txt';

          (<any>window).resolveLocalFileSystemURL(
            externalRootDirectory,
            function(dir) {
              logger.log('File system open: ' + fs.name);
              dir.getDirectory(
                'RecoveredData',
                {
                  create: true
                },
                function(recoveryFolder) {
                  recoveryFolder.getFile(
                    fileNameWithDate,
                    {
                      create: true,
                      exclusive: false
                    },
                    function(fileEntry) {
                      logger.log(
                        'fileEntry is file? ' + fileEntry.isFile.toString()
                      );

                      fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onerror = function(e) {
                          logger.log('Failed file read: ' + e.toString());
                          reject(e.toString());
                        };

                        let dataObj = new Blob([JSON.stringify(data)], {
                          type: 'text/plain'
                        });
                        logger.log('Completed write for: ' + fileName);

                        fileWriter.write(dataObj);
                        resolve('Completed dump of ' + fileName);
                      });
                    },
                    function(e) {
                      reject('Error for getFile: ' + JSON.stringify(e));
                    }
                  );
                }
              );
            },
            function(e) {
              reject(
                'Error for resolveLocalFileSystemURL: ' + JSON.stringify(e)
              );
            }
          );
        },
        function(e) {
          reject('Error for requestFileSystem: ' + JSON.stringify(e));
        }
      );
    });
  }

  private storeDumpedDataToRecoveryFolder(fileName, data) {
    logger.log('Attempting to dump: ' + fileName);

    if (this.device.platform === 'Android') {
      return this.storeDumpedDataToExternalAndroidRecoveryFolder(
        fileName,
        data
      );
    } else {
      return new Promise((resolve, reject) => {
        logger.log('Beginning iOS dump for: ' + fileName);
        // Stores dumped data to recovery folder
        (<any>window).requestFileSystem(
          window['LocalFileSystem'].PERSISTENT,
          0,
          function(fs) {
            let date = new Date();
            let dateString = date.toISOString();
            dateString = dateString.replace(/:/g, '');
            let fileNameWithDate =
              'Recovered_' + fileName + '_' + dateString + '.txt';

            logger.log('File system open: ' + fs.name);
            fs.root.getDirectory(
              'RecoveredData',
              {
                create: true
              },
              function(recoveryFolder) {
                recoveryFolder.getFile(
                  fileNameWithDate,
                  {
                    create: true,
                    exclusive: false
                  },
                  function(fileEntry) {
                    logger.log(
                      'fileEntry is file? ' + fileEntry.isFile.toString()
                    );

                    fileEntry.createWriter(function(fileWriter) {
                      fileWriter.onerror = function(e) {
                        logger.error('Failed file read: ' + e.toString());
                        reject('Failed file read: ' + e.toString());
                      };

                      let dataObj = new Blob([JSON.stringify(data)], {
                        type: 'text/plain'
                      });

                      fileWriter.write(dataObj);
                      logger.log('Write completed: ' + fileName);
                      resolve('Recovery Completed: ' + fileName);
                    });
                  },
                  function(e) {
                    reject('Error for getFile: ' + JSON.stringify(e));
                  }
                );
              },
              function(e) {
                reject('Error for getDirectory: ' + JSON.stringify(e));
              }
            );
          },
          function(e) {
            reject('Error for requestFileSystem: ' + JSON.stringify(e));
          }
        );
      });
    }
  }
}
