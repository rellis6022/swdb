"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectId = require('../../../node_modules/mongodb').ObjectID;
var CommonTools = require("../../app/lib/CommonTools");
var Be = require("../../app/lib/Db");
var be = new Be.Db();
var instBe = require("../../app/lib/instDb.js");
var tools = new CommonTools.CommonTools();
var props = tools.getConfiguration();
var fs = require("fs");
var testInstData = JSON.parse(fs.readFileSync('../apptest/misc/datafiles/instTestDataCombined.json', 'utf8'));
var testSwData = JSON.parse(fs.readFileSync('../apptest/misc/datafiles/swTestDataCombined.json', 'utf8'));
var testSwNames = JSON.parse(fs.readFileSync('../apptest/misc/datafiles/swTestNames.json', 'utf8'));
var TestTools = (function () {
    function TestTools() {
    }
    TestTools.prototype.loadTestCollectionsStandard = function (done) {
        // console.log("Starting standard test db clear and reload...");
        // before we start loading data, convert _ids to ObjectIDs
        // console.log("Converting ObjectIds...");
        for (var i in testSwNames) {
            if ('_id' in testSwNames[i]) {
                testSwNames[i]._id = ObjectId(testSwNames[i]._id);
            }
        }
        for (var i in testSwData) {
            if ('_id' in testSwData[i]) {
                testSwData[i]._id = ObjectId(testSwData[i]._id);
            }
        }
        for (var i in testInstData) {
            if ('_id' in testInstData[i]) {
                testInstData[i]._id = ObjectId(testInstData[i]._id);
            }
        }
        // console.log("Dropping installation collections...");
        instBe.instDoc.db.collections.instCollection.drop(function (err) {
            // console.log("Dropping sw collections...");
            Be.Db.swDoc.db.collections.swdbCollection.drop(function (swDocDropErr) {
                // console.log("Dropping swNames collections...");
                Be.Db.swDoc.db.collections.swNamesProp.drop(function (swNamesDropErr) {
                    // console.log("inserting testSwNames in sw collection");
                    Be.Db.swNamesDoc.db.collections.swNamesProp.insert(testSwNames, function (swNameInsertErr, records) {
                        // console.log("inserting testSwData in installations collection");
                        Be.Db.swDoc.db.collections.swdbCollection.insert(testSwData, function (swDocInsertErr, swDocRecords) {
                            // console.log("inserting testInstData in installations collection");
                            instBe.instDoc.db.collections.instCollection.insert(testInstData, function (instInsertErr, instRecords) {
                                done();
                            });
                        });
                    });
                });
            });
        });
    };
    TestTools.prototype.clearTestCollections = function (done) {
        // console.log("Cleaning up...");
        // console.log("Dropping installation collections...");
        instBe.instDoc.db.collections.instCollection.drop(function (err) {
            // chromeDriver.quit();
            // console.log("Dropping swdb collections...");
            Be.Db.swDoc.db.collections.swdbCollection.drop(function (swDocDropErr) {
                // console.log("Dropping swdbNames collections...");
                Be.Db.swDoc.db.collections.swNamesProp.drop(function (swNamesDropErr) {
                    done();
                });
            });
        });
    };
    return TestTools;
}());
exports.TestTools = TestTools;
