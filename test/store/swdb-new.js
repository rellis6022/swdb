var app = require("../../server");
var chai = require("chai");
var expect = require("chai").expect;
chai.use(require("chai-as-promised"));
var Be = require('../../lib/Db');
let be = new Be.Db();
var instBe = require("../../lib/instDb.js");
var ObjectId = require('mongodb').ObjectID;

let TestTools = require('./TestTools');
let testTools = new TestTools.TestTools();

var webdriver = require("../../node_modules/selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until,
  test = require("../../node_modules/selenium-webdriver/testing");
var fs = require('fs');
var path = require('path');
const props = JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));

test.describe("Software update screen tests", function() {
  var chromeDriver;

  test.before(function(done) {
    console.log("Starting swdb-new");
    this.timeout(5000);
    testTools.loadTestCollectionsStandard(done);
  });

  test.after(function(done) {
    // clear the test collection
    chromeDriver.quit();
    testTools.clearTestCollections(done);
  });


  var allCookies = null;

  test.it("should show search page with login button", function() {
    this.timeout(15000);

    chromeDriver = new webdriver.Builder()
      .forBrowser("chrome")
      .build();
    chromeDriver.manage().window().setPosition(200,0);
  //var window = chromeDriver.getWindowHandle();
    //chromeDriver.switchTo().window(window);

    chromeDriver.get(props.webUrl+"#/list");
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
    chromeDriver.get(props.webUrl+"#/new");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      "testuser (click to logout)"),5000);
  });


  test.it("should show the requested record title", function() {
    chromeDriver.wait(until.titleIs("SWDB - New"), 5000);
  });

  test.it("Add new record", function() {
    this.timeout(16000);
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="swName"]/span')), 3000);
    var input = chromeDriver.findElement(By.xpath('//*[@id="swName"]/span'));
    input.click();//*[@id="swName-group"]/div/div/input[1]
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="swName-group"]/div/div/input[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="swName-group"]/div/div/input[1]'));
    input.sendKeys("Test Record3");
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-0-0"]/span/span')));
    chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-0-0"]/span/span')).click();

    // set version
    chromeDriver.wait(until.elementLocated(By.id("version")), 3000);
    input = chromeDriver.findElement(By.id("version"));
    input.click();
    input.sendKeys("Test Version");

    // set branch
    chromeDriver.wait(until.elementLocated(By.id("branch")), 3000);
    input = chromeDriver.findElement(By.id("branch"));
    input.click();
    input.sendKeys("Test branch");

    // set description
    chromeDriver.wait(until.elementLocated(By.id("desc")), 3000);
    input = chromeDriver.findElement(By.id("desc"));
    input.click();
    input.sendKeys("Test description");

    // set description document
    chromeDriver.wait(until.elementLocated(By.id("descDocLoc")), 3000);
    input = chromeDriver.findElement(By.id("descDocLoc"));
    input.click();
    input.sendKeys("http://www.google.com");

    // set design description document
    chromeDriver.wait(until.elementLocated(By.id("designDescDocLoc")), 3000);
    input = chromeDriver.findElement(By.id("designDescDocLoc"));
    input.click();
    input.sendKeys("http://www.google.com");

    // set owner
    chromeDriver.wait(until.elementLocated(By.id("owner")), 3000);
    input = chromeDriver.findElement(By.id("owner"));
    input.click();
    input.sendKeys("Test owner");

    // set engineer
    chromeDriver.wait(until.elementLocated(By.id("engineer")), 3000);
    input = chromeDriver.findElement(By.id("engineer"));
    input.click();
    input.sendKeys("Test engineer");

    // set level of care
    chromeDriver.wait(until.elementLocated(By.id("levelOfCare")), 3000);
    input = chromeDriver.findElement(By.id("levelOfCare"));
    input.click();
    input.sendKeys("LOW");

    // set status
    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    input = chromeDriver.findElement(By.id("status"));
    input.click();
    input.sendKeys("DEVEL");

    // set status data
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();

    // set platforms
    chromeDriver.wait(until.elementLocated(By.id("platforms")), 3000);
    input = chromeDriver.findElement(By.id("platforms"));
    input.click();
    input.sendKeys("Test platform");

    // set vvProcLoc
    chromeDriver.wait(until.elementLocated(By.id("vvProcLoc")), 3000);
    input = chromeDriver.findElement(By.id("vvProcLoc"));
    input.click();
    input.sendKeys("http://www.google.com");

    // set vvResultsLoc
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc")), 3000);
    input = chromeDriver.findElement(By.id("vvResultsLoc"));
    input.click();
    input.sendKeys("http://www.google.com");

    // set version control
    chromeDriver.wait(until.elementLocated(By.id("versionControl")), 3000);
    input = chromeDriver.findElement(By.id("versionControl"));
    input.click();
    input.sendKeys("Git");

    // set version control location
    chromeDriver.wait(until.elementLocated(By.id("versionControlLoc")), 3000);
    input = chromeDriver.findElement(By.id("versionControlLoc"));
    input.click();
    input.sendKeys("http://www.google.com");

    // set recert freq
    chromeDriver.wait(until.elementLocated(By.id("recertFreq")), 3000);
    input = chromeDriver.findElement(By.id("recertFreq"));
    input.click();
    input.sendKeys("Test recertification frequency");

    // set recert date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="recertDate-group"]/div/p/span/button/i')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="recertDate-group"]/div/p/span/button/i'));
   input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="recertDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="recertDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
    chromeDriver.findElement(By.id("submitBtn")).click();
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("formStatus")),
      "Document posted"),5000);
  });

});
