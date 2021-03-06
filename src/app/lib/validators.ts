/**
 * Custom validators
 */
import * as Debug from 'debug';
import * as express from 'express';
import * as lodash from 'lodash';
import * as mongoose from 'mongoose';


import {
  Software,
} from '../models/software';

import {
  SWInstall,
} from '../models/swinstall';

const debug = Debug('swdb:validators');


/**
 * Custom sanitizer similar to the provided 'toDate', however,
 * this sanitizer ensures the value in an ISO date-only string.
 * Use null to indicate error like the provided 'toDate' function.
 *
 * For comparison see the validator library source code:
 *   https://github.com/chriso/validator.js/blob/master/src/lib/toDate.js
 */
export function isoDateStringToUTCDate(allowEmpty: true): (value: {}) => (Date | string | null);
export function isoDateStringToUTCDate(allowEmpty?: false): (value: {}) => (Date | null);
export function isoDateStringToUTCDate(allowEmpty?: boolean): (value: {}) => (Date | string | null) {
  return (value: {}) => {
    // Empty string used as flag to clear vvApprovalDate!
    if (allowEmpty && value === '') {
      return '';
    }

    if (!value) {
      return null;
    }

    const isoDateString = String(value);
    if (!isoDateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return null;
    }

    const timestamp = Date.parse(isoDateString);
    if (Number.isNaN(timestamp)) {
      return null;
    }

    return new Date(timestamp);
  };
}

export function isArea(val: string, opts: { req: express.Request }) {
  // Must be an array of strings
  const result: string[] = [];
  if (Array.isArray(val)) {
    // debug('body is ' + cJSON.stringify(opts.req.body, null, 2));
    // debug('val is ' + cJSON.stringify(val, null, 2));
    val.forEach((element, idx, arr) => {
      const thisResult = lodash.isString(element);
      // debug('validation for element: ' + thisResult);
      if (!thisResult) {
        // record all failed fields
        result.push(String(element) + ' must be a string');
      }
    });
    return true;
  } else {
    return false;
  }
}

export function isVvProcLoc(val: {}) {
  /* Case 1: The value is not an array
   * Case 2: The String is an array, but the listed items are not valid strings.
   * Case 3: The string is an array and all listed items are valid strings
   */
  const result: string[] = [];
  if (Array.isArray(val)) {
    // debug('body is ' + cJSON.stringify(opts.req.body, null, 2));
    val.forEach((element: string, idx: number, arr: any[]) => {
      // debug('checking element ' + element);
      // debug('checking element(by index) ' + opts.req.body.vvProcLoc[idx]);
      const thisResult = lodash.isString(element);
      if (!thisResult) {
        // record all failed fields
        result.push(String(element) + ' must be a string');
      }
    });
    // debug('vals: ' + JSON.stringify(result, null, 2));
    // debug('#vals: ' + result.length);
    if (result.length !== 0) {
      return false; // Case 2
    } else {
      return true; // Case 3
    }
  } else {
    return false; // Case 1
  }
}

export function isVvResultsLoc(val: string, opts: { req: express.Request }) {
  /* Case 1: The string is not a json array
    * Case 2: The String is an array, but the listed items are not valid urls.
    * Case 3: The string is an array and all listed items are valif urls
    */
  const result: string[] = [];
  if (Array.isArray(val)) {
    // debug('body is ' + cJSON.stringify(opts.req.body, null, 2));
    val.forEach((element: string, idx: number, arr: any[]) => {
      // debug('checking element ' + element);
      // debug('checking element(by index) ' + opts.req.body.vvResultsLoc[idx]);
      const thisResult = lodash.isString(element);
      if (!thisResult) {
        // record all failed fields
        result.push(String(element) + ' must be a string');
      }
    });
    // debug('vals: ' + JSON.stringify(result, null, 2));
    // debug('#vals: ' + result.length);
    if (result.length !== 0) {
      return false; // Case 2
    } else {
      return true; // Case 3
    }
  } else {
    return false; // Case 1
  }
}

export function isSlots(slots: any, opts: { req: express.Request }) {
  // Must be an array of strings
  if (Array.isArray(slots)) {
    for (const slot of slots) {
      if (typeof slot !== 'string') {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

// export function isDRRs(val: any[], opts: { req: express.Request }) {
//   // Must be a string
//   if (Array.isArray(val)) {
//     val.forEach((element: any, idx: number, arr: any[]) => {
//       opts.req.checkBody('slots[' + idx + ']',
//         'DRR ' + idx + ' must be a string')
//         .optional().isAscii();
//     });
//     return true;
//   } else {
//     return false;
//   }
// }


export class CustomValidators {
  /**
   * swNoVerBranchChgIfStatusRdyInstall - method to detect version/branch change when sw status
   *  is Ready for install
   * @param req - express request
   * @param instBe - db object for installation db access
   *
   * @returns Promise<IValResult>
   */
  public static swNoVerBranchChgIfStatusRdyInstall =
    async (v2: boolean, req: express.Request): Promise<IValResult> => {
    // get the id of the record which is wanting update
    // go get the existing record
    debug('Checking wfRuler1');
    const id = req.params.id;
    try {
      const idObj = new mongoose.mongo.ObjectId(req.params.id);
      debug('id:' + idObj);
    } catch (err) {
      return {
        error: true,
        data: 'Record id parse err: ' + id + ': ' + JSON.stringify(err),
      };
    }
    try {
      const queryPromise = await Software.findOne({ _id: id }).exec();
      // if old status was Ready for install
      // first, see if there was eve a  record to update
      if (!queryPromise) {
        return {
          error: true,
          data: 'Record id not found' + id,
        };
      }
      if (queryPromise.status === 'RDY_INST') {
        // if the version or branch have changed
        // debug('swUpdateWorkflowValidation req: ' + JSON.stringify(req.body));
        const data = v2 ? req.body.data : req.body;
        if ((('version' in data) || ('branch' in data)) &&
          ((data.version !== queryPromise.version) || (data.branch !== queryPromise.branch))) {
          // debug('swUpdateWorkflowValidation version and/or branch changed');
          const status = 'RDY_INST';
          return {
            error: true,
            data: 'Version and branch cannot change in state ' + status,
          };
        }
        return {
          error: false,
          data: 'queryPromise',
        };
      } else {
        // this record update is okay for workflow
        return {
          error: false,
          data: 'queryPromise',
        };
      }
    } catch (err) {
      debug('swUpdateWorkflowValidation err: ' + JSON.stringify(err));
      return {
        error: true,
        data: err,
      };
    }
  }

  /**
   * instUpdateWorflowValidation - method to detect workflow issues with installation updates
   * @param req - express request
   * @param instBe - db object for installation db access
   *
   * @returns Promise<IValResult>
   */
  public static noInstSwChangeUnlessReadyForInstall =
    async (v2: boolean, req: express.Request): Promise<IValResult> => {
    // The installation sw field cxan only change in the Ready for install state
    // get the id of the record which is wanting update
    // go get the existing record
    debug('Checking wfRuler2');
    const id = req.params.id;
    try {
      debug('Rule 2 id: ' + id);
      const idObj = new mongoose.mongo.ObjectId(req.params.id);
      debug('id:' + idObj);
    } catch (err) {
      return {
        error: true,
        data: 'Record id parse err: ' + id + ': ' + JSON.stringify(err),
      };
    }
    try {
      const queryPromise = await SWInstall.findOne({ _id: id }).exec();
      // if old status was Ready for install
      // first, see if there was eve a  record to update
      if (!queryPromise) {
        return {
          error: true,
          data: 'Rule2 record id not found ' + id,
        };
      }
      const data = v2 ? req.body.data : req.body;
      if ((data.software) &&
        (JSON.stringify(data.software) !== JSON.stringify(queryPromise.software))) {
        debug('software from ' + JSON.stringify(queryPromise.software) + ' to ' + JSON.stringify(data.software));
        if (queryPromise.status === 'RDY_INST') {
          // req is changing software, and in in Ready for installation
          return {
            error: false,
            data: 'queryPromise',
          };
        } else {
          // req is changing sw, and not in Ready for installation
          return {
            error: true,
            data: 'Installation software field can only be changed in state ' + 'RDY_INST',
          };
        }
      } else {
        return {
          error: false,
          data: 'queryPromise',
        };
      }
    } catch (err) {
      debug('instUpdateWorkflowValidation db err: ' + JSON.stringify(err));
      return {
        error: true,
        data: err,
      };
    }
  }

  /**
   * noInstSwUnlessSwIsReadyForInstall  - method to detect installations attempting to point to software that is not
   * in state Ready for install
   * @param req - express request
   *
   * @returns Promise<IValResult>
   */
  public static noInstSwUnlessSwIsReadyForInstall =
    async (v2: boolean, req: express.Request): Promise<IValResult> => {
    // here the req passed is either a new installation or an update.
    // the software listed in the request must have state Ready for install.

    // check that the id is parsable
    debug('Checking wfRule3');
    const data = v2 ? req.body.data : req.body;
    if (data.software) {
      const id = data.software;
      try {
        const idObj = new mongoose.mongo.ObjectId(id);
        debug('id:' + idObj);
      } catch (err) {
        return {
          error: true,
          data: 'Record id parse err: ' + id + ': ' + JSON.stringify(err),
        };
      }
      try {
        await Software.find().exec();
        // debug('Rule3 sees swDocs: ' + JSON.stringify(queryPromise1));
        const queryPromise  = await Software.findOne({ _id: id }).exec();
        // if old status was Ready for install
        // first, see if there was eve a  record to update
        if (!queryPromise) {
          debug('Rule3 No queryPromise, returning err');
          return {
            error: true,
            data: 'Rule3 record id not found ' + id,
          };
        } else {
          if (queryPromise.status !== 'RDY_INST') {
            debug('Rule3 Sw field status is incorrect, returning err');
            return {
              error: true,
              data: 'Software field must point to software with status ' + 'RDY_INST' + '.' +
              'The given software, ' + id + ', has status ' + queryPromise.status,
            };
          } else {
            debug('Rule 3: Sw field status is okay, returning okay');
            return {
              error: false,
              data: 'No errors',
            };
          }
        }
      } catch (err) {
        debug('Rule3 db err: ' + JSON.stringify(err));
        return {
          error: true,
          data: err,
        };
      }
    } else {
      debug('Rule3 Sw field status is blank, returning okay');
      return {
        error: false,
        data: 'No software listed',
      };
    }
  }

  /**
   * noSwStateChgIfReferringInst  - method to detect software attempting to change state
   * when there are installations referring to it.
   * @param req - express request
   *
   * @returns Promise<IValResult>
   */
  public static noSwStateChgIfReferringInst = async (v2: boolean, req: express.Request): Promise<IValResult> => {
    // check that the id is parsable
    debug('Checking wfRule4');
    // go get the existing record
    const id = req.params.id;
    try {
      const idObj = new mongoose.mongo.ObjectId(req.params.id);
      debug('id:' + idObj);
    } catch (err) {
      return {
        error: true,
        data: 'Record id parse err: ' + id + ': ' + JSON.stringify(err),
      };
    }
    try {
      const queryPromise = await Software.findOne({ _id: id }).exec();
      // if old status was Ready for install
      // first, see if there was eve a  record to update
      if (!queryPromise) {
        return {
          error: true,
          data: 'Record id not found' + id,
        };
      }
      const data = v2 ? req.body.data : req.body;
      if (queryPromise.status === data.status) {
        return {
          error: false,
          data: 'No status changed.',
        };
      } else {
        // go find installations that refer to this sw
        const queryPromise2 = await SWInstall.find({ software: id }).exec();
        if (queryPromise2.length > 0) {
          // there are referring installations
          return {
            error: true,
            data: 'Software state cannot change while there are active installations: ' +
              queryPromise2.map((item: any) => {
                return item._id;
              }),
          };
        } else {
          return {
            error: false,
            data: 'No referring acive installations.',
          };
        }
      }
    } catch (err) {
      debug(err);
      return {
        error: true,
        data: JSON.stringify(err),
      };
    }
  }
}

export interface IValResult {
    error: boolean;
    data: string;
}
