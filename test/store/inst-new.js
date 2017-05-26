var app = require("../../server");
var chai = require("chai");
var expect = require("chai").expect;
chai.use(require("chai-as-promised"));
var be = require("../../lib/db");
var instBe = require("../../lib/instDb.js");

var webdriver = require("../../node_modules/selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until,
  test = require("../../node_modules/selenium-webdriver/testing");
var fs = require('fs');
var path = require('path');
const props = JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));
const testInstData = JSON.parse(fs.readFileSync('./test/misc/testInstData.json', 'utf8'));



test.describe("Installations add screen tests", function() {
  var chromeDriver = new webdriver.Builder()
    .forBrowser("chrome")
    .build();
  chromeDriver.manage().window().setPosition(200,0);

  test.before(function(done) {
    this.timeout(5000);
    // clear the test collection
    console.log("Starting inst-new...");
    //chromeDriver.manage().window().setPosition(200,0);
    console.log("Dropping installation collections...");
    console.log("Inserting test data...");
    instBe.instDoc.db.collections.instCollection.drop(function(err){
      console.log("inserting testInstData in installations collection:"+JSON.stringify(testInstData,null,2));
      instBe.instDoc.db.collections.instCollection.insert(testInstData,
        function(err, records){
          done();
        });
    });
  });
  test.after(function(done) {
    // clear the test collection
    console.log("Cleaning up (inst-new)...");
    console.log("Dropping installation collections...");
    chromeDriver.quit();
    instBe.instDoc.db.collections.instCollection.drop(function(err){
      done();
    });
  });

  var allCookies = null;

  test.it("should show search page with login button", function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl+"#/inst/list");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      "(click to login)"),5000);
  });

  test.it("should login", function() {
    // get test authentication
    chromeDriver.get(props.webUrl+"testlogin?username=testuser&password=testuserpasswd");
    chromeDriver.wait(until.elementLocated(By.id("Test auth success")),3000);
  });

  test.it("should show search page with username on logout button", function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl+"#/inst/new");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      "testuser (click to logout)"),5000);
  });


  test.it("should show the requested installation record title", function() {
    chromeDriver.wait(until.titleIs("SWDB - New Installation"), 5000);
  });

  test.it("Add new record", function() {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
    var input = chromeDriver.findElement(By.id("host"));
    input.sendKeys("testHost1");

    chromeDriver.wait(until.elementLocated(By.id("add.area")), 3000);
    input = chromeDriver.findElement(By.id("add.area"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("area.0")), 3000);
    input = chromeDriver.findElement(By.id("area.0"));
    input.sendKeys("testArea1");

    chromeDriver.wait(until.elementLocated(By.id("add.slots")), 3000);
    input = chromeDriver.findElement(By.id("add.slots"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("slots.0")), 3000);
    input = chromeDriver.findElement(By.id("slots.0"));
    input.sendKeys("testSlot1");

    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    input = chromeDriver.findElement(By.id("status"));
    input.click();
    input.sendKeys("RDY_BEAM");

    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
  });

  //test.it("Host required", function() {
  //this.timeout(8000);
  //chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
  //var input = chromeDriver.findElement(By.id("host"));
  //input.sendKeys("1");
  //input.clear();
  //var inputSts = chromeDriver.findElement(By.id("hostInputSts"));
  //chromeDriver.wait(until.elementTextIs(inputSts, "Host is required"),5000);
  //input.clear();
  //});
  //test.it("Host min for field ", function() {
  //this.timeout(8000);
  //chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
  //var input = chromeDriver.findElement(By.id("host"));
  //input.sendKeys("1");
  //var inputSts = chromeDriver.findElement(By.id("hostInputSts"));
  //chromeDriver.wait(until.elementTextIs(inputSts, "Host must exceed 2 characters"),5000);
  //input.clear();
  //input.sendKeys("11");
  //chromeDriver.wait(until.elementTextIs(inputSts, ""),5000);
  //input.clear();
  //});
  //test.it("Host max for field ", function() {
  //this.timeout(8000);
  //chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
  //var input = chromeDriver.findElement(By.id("host"));
  //input.sendKeys("0123456789012345678901234567891");
  //var inputSts = chromeDriver.findElement(By.id("hostInputSts"));
  //chromeDriver.wait(until.elementTextIs(inputSts, "Host must not exceed 30 characters"),5000);
  //input.clear();
  //input.sendKeys("012345678901234567890123456789");
  //chromeDriver.wait(until.elementTextIs(inputSts, ""),5000);
  //input.clear();
  //});
});