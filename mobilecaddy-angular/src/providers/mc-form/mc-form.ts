import { Injectable } from '@angular/core';
import * as logger from 'mobilecaddy-utils/logger';
import * as _ from 'underscore';

@Injectable()
export class McFormProvider {

  constructor() { }

  checkAndUpdateChildQuestions(fieldsToValidate, fieldsModel, picklistModel) {
    // First parse and alter the fieldsToValidate to check for parent
    // questions that have made child questions mandatory.

    for (let a = 0; a < fieldsToValidate.length; a++) {
      // Initially set isChildQuestion to false, we might change this later.
      fieldsToValidate[a].isChildQuestion = false;

      // Initially set isActiveChildQuestion to false, we might change this later.
      fieldsToValidate[a].isActiveQuestion = false;

      // If this question has a mandatory question (therefore child question), check if that
      // has been answered with a mandatory question. If it has, set to mandatory.
      let mandatoryQuestionId = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Question__c;
      if (mandatoryQuestionId) {
        // This is a child question.
        fieldsToValidate[a].isChildQuestion = true;
        let parentQuestion = _.findWhere(fieldsToValidate, { 'Id': mandatoryQuestionId });
        // Only a picklist or a checkbox can be a parentQuestion
        switch (parentQuestion.mobilecaddy1__Type__c) {
          case 'Picklist':
            // Pre check on the parent having being answers and get
            // the answer. Don't store message if not answered,
            // this will be handled later.
            let mandatoryAnswerArray = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Answer_Values__c.split(',');
            let parentPicklistEntries = picklistModel[parentQuestion.Id];
            for (let m = 0; m < parentPicklistEntries.length; m++) {
              if (fieldsModel[parentQuestion.Id].label == parentPicklistEntries[m].label) {
                // 'm === 0' - we're expecting 'Please select' as first picklist entry
                if (m === 0 && parentQuestion.mobilecaddy1__Mandatory__c) {
                  // Mandatory case handled by standard processing.
                } else {
                  // m is the ID of the answer chosen by the user.
                  // Check if m is one of the mandatory answers
                  // Note, m is a number, answers array will be strings.
                  if (_.contains(mandatoryAnswerArray, m.toString())) {
                    // User has selected an answer from the parent which makes the current
                    // fieldToValidate mandatory, therefore set the mandatory flag.
                    // Note new field mandatoryByParent due to object referencing, can't
                    // just edit mobilecaddy1__Mandatory__c or we lose data.
                    fieldsToValidate[a].mandatoryByParent = true;
                    fieldsToValidate[a].isActiveQuestion = true;
                  } else {
                    fieldsToValidate[a].mandatoryByParent = false;
                    fieldsToValidate[a].isActiveQuestion = false;
                  }
                }
                break;
              }
            }
            break;
          case 'Checkbox':
            // If the value of the checkbox matches the value of the parent question's answer
            let mandatoryAnswer = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Answer_Values__c;
            let userAnswerOnParent = fieldsModel[parentQuestion.Id];

            if (mandatoryAnswer === '1') {
              mandatoryAnswer = true;
            } else if (mandatoryAnswer === '0') {
              mandatoryAnswer = false;
            }

            if (userAnswerOnParent === mandatoryAnswer) {
              // User answer has triggered the mandatory flag for this child.
              fieldsToValidate[a].mandatoryByParent = true;
              fieldsToValidate[a].isActiveQuestion = true;
            } else {
              fieldsToValidate[a].mandatoryByParent = false;
              fieldsToValidate[a].isActiveQuestion = false;
            }
            break;
        }
      }
    }
  }

  validateForm(formVersionData, fieldsToValidate, fieldsModel, picklistModel, saveAsDraft) {
    let invalidMsg: string = '',
      fields: any = [],
      score: number = 0,
      maxScore: number = 0;

    // First parse and alter the fieldsToValidate to check for parent
    // questions that have made child questions mandatory.
    for (let a = 0; a < fieldsToValidate.length; a++) {
      // If this question has a mandatory question (therefore is a child), check if that
      // has been answered with a mandatory question. If it has, set to mandatory.
      let mandatoryQuestionId = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Question__c;
      if (mandatoryQuestionId) {
        let parentQuestion = _.findWhere(fieldsToValidate, { 'Id': mandatoryQuestionId });
        // Only a picklist or a checkbox can be a parentQuestion
        switch (parentQuestion.mobilecaddy1__Type__c) {
          case 'Picklist':
            // Pre check on the parent having being answers and get
            // the answer. Don't store message if not answered,
            // this will be handled later.
            let mandatoryAnswerArray = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Answer_Values__c.split(',');
            let parentPicklistEntries = picklistModel[parentQuestion.Id];
            for (let m = 0; m < parentPicklistEntries.length; m++) {
              if (fieldsModel[parentQuestion.Id].label == parentPicklistEntries[m].label) {
                // 'm === 0' - we're expecting 'Please select' as first picklist entry
                if (m === 0 && parentQuestion.mobilecaddy1__Mandatory__c) {
                  // Mandatory case handled by standard processing.
                } else {
                  // m is the ID of the answer chosen by the user.
                  // Check if m is one of the mandatory answers
                  // Note, m is a number, answers array will be strings.
                  if (_.contains(mandatoryAnswerArray, m.toString())) {
                    // User has selected an answer from the parent which makes the current
                    // fieldToValidate mandatory, therefore set the mandatory flag.
                    // Note new field mandatoryByParent due to object referencing, can't
                    // just edit mobilecaddy1__Mandatory__c or we lose data.
                    fieldsToValidate[a].mandatoryByParent = true;
                  } else {
                    fieldsToValidate[a].mandatoryByParent = false;
                  }
                }
                break;
              }
            }
            break;
          case 'Checkbox':
            // If the value of the checkbox matches the value of the parent question's answer
            let mandatoryAnswer = fieldsToValidate[a].mobilecaddy1__Mandatory_via_Answer_Values__c;
            let userAnswerOnParent = fieldsModel[parentQuestion.Id];

            if (mandatoryAnswer === '1') {
              mandatoryAnswer = true;
            } else if (mandatoryAnswer === '0') {
              mandatoryAnswer = false;
            }

            if (userAnswerOnParent === mandatoryAnswer) {
              // User answer has triggered the mandatory flag for this child.
              fieldsToValidate[a].mandatoryByParent = true;
            } else {
              fieldsToValidate[a].mandatoryByParent = false;
            }
            break;
        }
      }
    }


    // Standard processing
    for (let i = 0; i < fieldsToValidate.length; i++) {

      let fieldObj = {
        "id": fieldsToValidate[i].Id,
        "type": fieldsToValidate[i].mobilecaddy1__Type__c,
        "userScore": 0,
        "score": fieldsToValidate[i].mobilecaddy1__Score__c,
        "question": fieldsToValidate[i].mobilecaddy1__Label__c,
        "mandatoryByParent": fieldsToValidate[i].mandatoryByParent,
        "scored": null,
        "value": "null"
      };

      // Work out if field is scored based on global form score or field level score
      if (formVersionData.mobilecaddy1__Scored__c === "No") {
        fieldObj.scored = false;
      } else {
        if (_.has(fieldsToValidate[i], 'mobilecaddy1__Scored_Question__c') === false ||
          fieldsToValidate[i].mobilecaddy1__Scored_Question__c === false) {
          fieldObj.scored = false;
        } else {
          fieldObj.scored = true;
        }
      }

      switch (fieldsToValidate[i].mobilecaddy1__Type__c) {
        case 'Checkbox':
          fieldObj.value = fieldsModel[fieldsToValidate[i].Id].toString();

          if (fieldsModel[fieldsToValidate[i].Id] && fieldObj.scored) {
            fieldObj.userScore = Number(fieldsToValidate[i].mobilecaddy1__Score__c);
          }

          if (fieldObj.scored) {
            maxScore += fieldObj.score;
          }

          fields.push(fieldObj);
          break;
        case 'Picklist':
          // For Picklists, the fieldsModel is an object e.g. {"label":"xxxx", "score":"5"}
          let picklistEntries = picklistModel[fieldsToValidate[i].Id];

          let highestScore = 0;
          for (let k = 0; k < picklistEntries.length; k++) {
            if (Number(picklistEntries[k].score > highestScore)) {
              highestScore = Number(picklistEntries[k].score);
            }
          }

          for (let j = 0; j < picklistEntries.length; j++) {
            if (fieldsModel[fieldsToValidate[i].Id].label == picklistEntries[j].label) {
              // Why 'j === 0' check below?
              // Answer: we're expecting the first picklist entry to be something like 'Please select'.
              //         checking for 'j === 0' indicates that the user hasn't selected a value
              if (j === 0 && fieldsToValidate[i].mobilecaddy1__Mandatory__c ||
                j === 0 && fieldsToValidate[i].mandatoryByParent) {
                invalidMsg += "<strong>Mandatory question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
              } else {
                fieldObj.value = this.escapeSpecialCharacters(fieldsModel[fieldsToValidate[i].Id].label);

                if (fieldObj.scored) {
                  maxScore += highestScore;
                  fieldObj.userScore = Number(picklistEntries[j].score);
                }

                fields.push(fieldObj);
              }
              break;
            }
          }
          break;
        case 'Date':
          if (!fieldsModel[fieldsToValidate[i].Id] && fieldsToValidate[i].mobilecaddy1__Mandatory__c ||
            !fieldsModel[fieldsToValidate[i].Id] && fieldsToValidate[i].mandatoryByParent) {
            invalidMsg += "<strong>Mandatory question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
          } else {
            if (fieldsModel[fieldsToValidate[i].Id] === undefined) {
              invalidMsg += "Invalid date: " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
            } else {
              if (fieldsModel[fieldsToValidate[i].Id]) {
                fieldObj.value = fieldsModel[fieldsToValidate[i].Id];
                if (fieldObj.scored) {
                  fieldObj.userScore = Number(fieldsToValidate[i].mobilecaddy1__Score__c);
                }
              } else {
                fieldObj.value = "null";
              }

              if (fieldObj.scored) {
                maxScore += fieldObj.score;
              }

              fields.push(fieldObj);
            }
          }
          break;
        case 'Number':
          if (!fieldsModel[fieldsToValidate[i].Id] && fieldsToValidate[i].mobilecaddy1__Mandatory__c ||
            !fieldsModel[fieldsToValidate[i].Id] && fieldsToValidate[i].mandatoryByParent) {
            invalidMsg += "<strong>Mandatory question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
          } else {
            let userNumberAnswer = fieldsModel[fieldsToValidate[i].Id];
            let decimalPlacesInAnswer = String(userNumberAnswer).split('.')[1];
            if (decimalPlacesInAnswer &&
              fieldsModel[fieldsToValidate[i].Id] && // Non mandatory, but data entered
              fieldsToValidate[i].mobilecaddy1__Decimal_Places__c && // Form has requested decimal place validation
              (decimalPlacesInAnswer.length > fieldsToValidate[i].mobilecaddy1__Decimal_Places__c)) {
              invalidMsg += "<strong>Too many decimal places for question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
            } else {
              if (fieldsModel[fieldsToValidate[i].Id]) {
                fieldObj.value = fieldsModel[fieldsToValidate[i].Id].toString();
                if (fieldObj.scored) {
                  fieldObj.userScore = Number(fieldsToValidate[i].mobilecaddy1__Score__c);
                }
              } else {
                fieldObj.value = "null";
              }
              if (fieldObj.scored) {
                maxScore += fieldObj.score;
              }

              fields.push(fieldObj);
            }
          }
          break;
        case 'Text':
          if (fieldsModel[fieldsToValidate[i].Id].trim() === '' && fieldsToValidate[i].mobilecaddy1__Mandatory__c ||
            fieldsModel[fieldsToValidate[i].Id].trim() === '' && fieldsToValidate[i].mandatoryByParent) {
            invalidMsg += "<strong>Mandatory question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
          } else {
            fieldObj.value = this.escapeSpecialCharacters(fieldsModel[fieldsToValidate[i].Id]);
            if (fieldsModel[fieldsToValidate[i].Id].trim() !== '') {
              if (fieldObj.scored) {
                fieldObj.userScore = Number(fieldsToValidate[i].mobilecaddy1__Score__c);
              }
            }
            if (fieldObj.scored) {
              maxScore += fieldObj.score;
            }

            fields.push(fieldObj);
          }
          break;
        case 'Textarea':
          if (fieldsModel[fieldsToValidate[i].Id].trim() === '' && fieldsToValidate[i].mobilecaddy1__Mandatory__c ||
            fieldsModel[fieldsToValidate[i].Id].trim() === '' && fieldsToValidate[i].mandatoryByParent) {
            invalidMsg += "<strong>Mandatory question:</strong> " + fieldsToValidate[i].mobilecaddy1__Label__c + "<br />";
          } else {
            fieldObj.value = this.escapeSpecialCharacters(fieldsModel[fieldsToValidate[i].Id]);
            if (fieldsModel[fieldsToValidate[i].Id].trim() !== '') {
              if (fieldObj.scored) {
                fieldObj.userScore = Number(fieldsToValidate[i].mobilecaddy1__Score__c);
              }
            }
            if (fieldObj.scored) {
              maxScore += fieldObj.score;
            }

            fields.push(fieldObj);
          }
          break;
      }
    }

    // Build the 'responses' json
    let responsesJson: any = {};
    responsesJson.fields = fields;

    if (!saveAsDraft) {
      // Check for validation errors
      if (invalidMsg === '') {
        // Sum the score for the fields
        score = 0;
        // Find all incorrect questions
        let incorrectQuestions = [];
        for (let s = 0; s < fields.length; s++) {
          score += Number(fields[s].userScore);
          // If is an incorrect answer, add it to incorrect answers
          if (fields[s].scored && (Number(fields[s].userScore) < Number(fields[s].score))) {
            // If child question AND active, or normal non-child question otherwise we
            // dont need to know if the question was wrong.
            if ((fields[s].isChildQuestion && fields[s].isActiveQuestion) || !fields[s].isChildQuestion) {
              incorrectQuestions.push(fields[s]);
            }
          }
        }
        // Return details
        return {
          formResponse: JSON.stringify([responsesJson]),
          score: score,
          maxScore: maxScore,
          incorrectQuestions: incorrectQuestions,
          error: null
        };
      } else {
        return {
          error: invalidMsg
        };
      }
    } else {
      return {
        formResponse: JSON.stringify([responsesJson]),
        fieldsModel: fieldsModel,
        picklistModel: picklistModel
      }
    }
  }

  escapeSpecialCharacters(s) {
    return s.replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/\"/g, "'");
  }

  processFieldsForDisplay(fields) {
    // Process fields and build models
    let fieldsModel = {};
    let picklistModel = {};
    let tabs = [];

    for (let i = 0; i < fields.length; i++) {

      // Validation
      if (!fields[i].mobilecaddy1_TabName_Order__c) {
        throw 'Form Error: No Tab Name or Tab Order for field ' + fields[i].Id;
      }

      if (fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Order__c == null
        || fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Order__c == undefined
      ) {
        throw 'Form Error: No Tab Order for field ' + fields[i].Id;
      }

      if (fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Name__c == null
        || fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Name__c == undefined
      ) {
        throw 'Form Error: No Tab Name for field ' + fields[i].Id;
      }

      if (fields[i].mobilecaddy1__Scored_Question__c && (fields[i].mobilecaddy1__Score__c == 'undefined' || fields[i].mobilecaddy1__Score__c == null)) {
        throw 'Form Error: No score for scored question ' + fields[i].Id;
      }

      // Process Tabs
      let tabId = fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Order__c;
      let tabName = fields[i].mobilecaddy1_TabName_Order__c.mobilecaddy1__Tab_Name__c;
      if (tabName !== '') {
        if (!_.findWhere(tabs, { 'id': tabId })) {
          let isActive = tabs.length === 0 ? 'active' : 'inactive';
          tabs.push({
            id: tabId,
            name: tabName,
            active: isActive
          });
        }
      }

      // Process fields
      switch (fields[i].mobilecaddy1__Type__c) {
        case 'Checkbox':
          fieldsModel[fields[i].Id] = false;
          break;
        case 'Picklist':
          let picklistEntries = fields[i].mobilecaddy1__Picklist_Entries__c;

          if (!picklistEntries || picklistEntries.length === 0) {
            throw 'Form Error: No entries for picklist: ' + fields[i].Id;
          }

          picklistModel[fields[i].Id] = [];
          for (let j = 0; j < picklistEntries.length; j++) {
            let entry = picklistEntries[j];
            picklistModel[fields[i].Id].push({
              'label': entry.Value,
              'score': entry.Score
            });
          }
          // Set the default to be the first picklist entry, which we're expecting to be something like 'Please select'.
          fieldsModel[fields[i].Id] = picklistModel[fields[i].Id][0];
          break;
        case 'Date':
          fieldsModel[fields[i].Id] = null;
          break;
        case 'Number':
          fieldsModel[fields[i].Id] = null;
          break;
        case 'Text':
          fieldsModel[fields[i].Id] = '';
          break;
        case 'Textarea':
          fields[i].rows = 3; // Default rows

          if (fields[i].mobilecaddy1__Length__c && fields[i].mobilecaddy1__Length__c <= 200) {
            fields[i].rows = 1;
          } else if (fields[i].mobilecaddy1__Length__c && fields[i].mobilecaddy1__Length__c <= 400) {
            fields[i].rows = 2;
          } else if (fields[i].mobilecaddy1__Length__c && fields[i].mobilecaddy1__Length__c <= 600) {
            fields[i].rows = 3;
          } else if (fields[i].mobilecaddy1__Length__c && fields[i].mobilecaddy1__Length__c >= 800) {
            fields[i].rows = 4;
          }

          fieldsModel[fields[i].Id] = '';
          break;
      }
    }

    return {
      fields: fields,
      fieldsModel: fieldsModel,
      picklistModel: picklistModel,
      tabs: tabs
    };
  }

  extractAndProcessFields(fieldsJSON) {
    if (fieldsJSON) {
      let fields = null;
      try {
        fields = JSON.parse(fieldsJSON);
      } catch (e) {
        logger.error("Unable to parse Form Version JSON", JSON.stringify(e));
        throw 'Form Error: Unable to parse Form Version.';
      }

      if (fields) {
        return this.processFieldsForDisplay(fields);
      } else {
        return null;
      }
    } else {
      logger.error("No fields to extract.");
      throw 'Form Error: No fields to extract.';
    }
  }

  populateForm(responses, fields, fieldsModel, picklistModel) {
    if (responses) {
      // Convert the string into an object
      let formResponses = null;
      try {
        formResponses = JSON.parse(responses);
      } catch (e) {
        logger.error("Unable to parse formResponses JSON", JSON.stringify(e));
        throw 'Form Error: Unable to parse formResponses.';
      }

      // Process the field responses
      if (formResponses && formResponses[0].fields) {
        // Generate an array of field responses by field Id
        let fieldResponses: Object = {};
        _.each(formResponses[0].fields, function (field) {
          fieldResponses[field.id] = field;
        });

        // Update the fields model with response
        for (let i = 0; i < fields.length; i++) {
          // Get the value saved in the response
          let value = fieldResponses[fields[i].Id].value;
          // Value might have been saved as string 'null' in json
          if (value === 'null') {
            value = null;
          }

          // For Picklists, the value is an object with label & score
          if (fieldResponses[fields[i].Id].type === 'Picklist') {
            // Iterate over all the possible picklist entries (for this field),
            // and attempt to match against the field value (which would have been the picklist label)
            let picklistEntries = picklistModel[fields[i].Id];
            for (let j = 0; j < picklistEntries.length; j++) {
              if (value == picklistEntries[j].label) {
                value = picklistEntries[j];
                break;
              }
            }
          }

          // Override the default field value with the response
          fieldsModel[fields[i].Id] = value;
        }
        return fieldsModel;
      } else {
        return null;
      }
    }
  }

}