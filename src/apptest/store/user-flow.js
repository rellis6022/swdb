var app = require("../../app/server");
var chai = require("chai");
var expect = require("chai").expect;
var supertest = require("supertest")(app);
chai.use(require("chai-as-promised"));
var Be = require('../../app/lib/Db');
let be = new Be.Db();
var instBe = require("../../app/lib/instDb.js");
var ObjectId = require('mongodb').ObjectID;

let TestTools = require('./TestTools');
let testTools = new TestTools.TestTools();

var webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until,
  test = require("selenium-webdriver/testing");
var fs = require('fs');
var path = require('path');
let dbg = require('debug');
const debug = dbg('swdb:user-flow-tests');

let CommonTools = require('../../app/lib/CommonTools');
let ctools = new CommonTools.CommonTools();
let props = {};
props = ctools.getConfiguration();


test.describe("User flow tests", function() {
  var chromeDriver;
  before("Prep DB", async function () {
    debug("Prep DB");
    await testTools.clearTestCollections(debug);
    // testTools.testCollectionsStatus(debug);
    await testTools.loadTestCollectionsStandard(debug, props.test.swTestDataFile, props.test.instTestDataFile);
  });

  after("clear db", async function () {
    debug("Clear DB");
    // clear the test collection.
    chromeDriver.quit();
    await testTools.clearTestCollections(debug);
  });

  var allCookies = null;

  test.it("should show search page with login button", function() {
    this.timeout(8000);

    chromeDriver = new webdriver.Builder()
      .forBrowser("chrome")
      .build();
    chromeDriver.manage().window().setPosition(200,0);

    chromeDriver.get(props.webUrl+"#/list");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      "Log in"),5000);
  });

  test.it("login as test user", function(done){
    this.timeout(8000);
    supertest
    .get("/login")
    .auth(props.test.username, props.test.password)
    .expect(302)
    .end(function(err,res){
      if (err) done(err);
      else {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        debug('test login cookies: ' + Cookies);
        let parts = Cookies.split('=');
        debug('setting driver cookie ' + parts[0] + ' ' + parts[1]);
        chromeDriver.manage().addCookie({name:parts[0], value:parts[1]});
        done();
      }
    });
  });

  test.it('should show search page with username on logout button', function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl + '#/list');
    chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
      props.test.username.toUpperCase()), 5000);
  });

  test.it("should show new page with username on logout button", function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl+"#/new");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      props.test.username.toUpperCase()),5000);
  });


  test.it("should show the requested sw record title", function() {
    chromeDriver.wait(until.titleIs("SWDB - New"), 5000);
  });

  test.it("Add new record - set name", function() {
    this.timeout(5000);
    chromeDriver.wait(until.elementLocated(By.id('swName')), 3000);
    var input = chromeDriver.findElement(By.id('swName')).sendKeys("Test UserRecord");
  });

  test.it("Add new record - set version", function() {
    this.timeout(5000);
    // set version
    chromeDriver.wait(until.elementLocated(By.id("version")), 3000);
    input = chromeDriver.findElement(By.id("version"));
    input.click();
    input.sendKeys("Test Version");
  });

  test.it("Add new record - set branch", function() {
    this.timeout(5000);
    // set branch
    chromeDriver.wait(until.elementLocated(By.id("branch")), 3000);
    input = chromeDriver.findElement(By.id("branch"));
    input.click();
    input.sendKeys("Test branch");
  });

  test.it("Add new record - set description", function() {
    this.timeout(5000);
    // set description
    chromeDriver.wait(until.elementLocated(By.id("desc")), 3000);
    input = chromeDriver.findElement(By.id("desc"));
    input.click();
    input.sendKeys("Test description");
  });

  test.it("Add new record - set desc doc", function() {
    // set description document
    chromeDriver.wait(until.elementLocated(By.id("descDocLoc")), 3000);
    input = chromeDriver.findElement(By.id("descDocLoc"));
    input.click();
    input.sendKeys("http://www.google.com");
  });

  test.it("Add new record - set design desc doc", function() {
    this.timeout(5000);
    // set design description document
    chromeDriver.wait(until.elementLocated(By.id("designDescDocLoc")), 3000);
    input = chromeDriver.findElement(By.id("designDescDocLoc"));
    input.click();
    input.sendKeys("http://www.google.com");
  });

  test.it("Add new record - set owner", function() {
    this.timeout(5000);
    // set owner 
    chromeDriver.wait(until.elementLocated(By.id("owner")), 3000);
    input = chromeDriver.findElement(By.id("owner"));
    input.click();
    //*[@id="owner"]/input[1]
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="owner"]/input[1]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="owner"]/input[1]'));
    input.sendKeys("controls");
    //*[@id="ui-select-choices-row-0-2"]/span
    // "IFS:LAB.NSCL.OPS.CONTROLS"
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-0-2"]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-0-2"]'));
    input.click();
  });

  test.it("Add new record - set level of care", function() {
    this.timeout(5000);
    // set level of care
    chromeDriver.wait(until.elementLocated(By.id("levelOfCare")), 3000);
    input = chromeDriver.findElement(By.id("levelOfCare"));
    input.click();
    input.sendKeys("LOW");
  });

  test.it("Add new record - set status", function() {
    this.timeout(5000);
    // set status
    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    input = chromeDriver.findElement(By.id("status"));
    input.click();
    input.sendKeys("DEVEL");
  });

  test.it("Add new record - set ststus date", function() {
    this.timeout(5000);
    // set status date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
  });

  test.it("Add new record - set platforms", function() {
    this.timeout(5000);
    // set platforms
    chromeDriver.wait(until.elementLocated(By.id("platforms")), 3000);
    input = chromeDriver.findElement(By.id("platforms"));
    input.click();
    input.sendKeys("Test platform");
  });

  test.it("Add new record - set vvProcLoc", function() {
    this.timeout(5000);
    // set vvProcLoc
    chromeDriver.wait(until.elementLocated(By.id("add.vvProcLoc")), 3000);
    input = chromeDriver.findElement(By.id("add.vvProcLoc"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvProcLoc.0")), 3000);
    input0 = chromeDriver.findElement(By.id("vvProcLoc.0"));
    input0.sendKeys("http://procservtest.com/procdoc0");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvProcLoc.1")), 3000);
    input1 = chromeDriver.findElement(By.id("vvProcLoc.1"));
    input1.sendKeys("http://procservtest.com/procdoc1");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvProcLoc.2")), 3000);
    input2 = chromeDriver.findElement(By.id("vvProcLoc.2"));
    input2.sendKeys("http://procservtest.com/procdoc2");
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id("rm.vvProcLoc.0")), 3000);
    input = chromeDriver.findElement(By.id("rm.vvProcLoc.0"));
    input.click();
  });


  test.it("Add new record - set vvResultsLoc", function() {
    this.timeout(5000);
    // set vvResultsLoc
    chromeDriver.wait(until.elementLocated(By.id("add.vvResultsLoc")), 3000);
    input = chromeDriver.findElement(By.id("add.vvResultsLoc"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.0")), 3000);
    input0 = chromeDriver.findElement(By.id("vvResultsLoc.0"));
    input0.sendKeys("http://resultservtest.com/resultsdoc0");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.1")), 3000);
    input1 = chromeDriver.findElement(By.id("vvResultsLoc.1"));
    input1.sendKeys("http://resultservtest.com/resultsdoc1");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.2")), 3000);
    input2 = chromeDriver.findElement(By.id("vvResultsLoc.2"));
    input2.sendKeys("http://resultservtest.com/resultdoc2");
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id("rm.vvResultsLoc.0")), 3000);
    input = chromeDriver.findElement(By.id("rm.vvResultsLoc.0"));
    input.click();
  });

  test.it("Add new record - set version control", function() {
    this.timeout(5000);
    // set version control
    chromeDriver.wait(until.elementLocated(By.id("versionControl")), 3000);
    input = chromeDriver.findElement(By.id("versionControl"));
    input.click();
    input.sendKeys("Git");
  });

  test.it("Add new record - set version control loc", function() {
    // set version control location
    chromeDriver.wait(until.elementLocated(By.id("versionControlLoc")), 3000);
    input = chromeDriver.findElement(By.id("versionControlLoc"));
    input.click();
    input.sendKeys("http://www.google.com");
  });

  test.it("Add new record - set recert frequency", function() {
    this.timeout(5000);
    // set recert freq
    chromeDriver.wait(until.elementLocated(By.id("recertFreq")), 3000);
    input = chromeDriver.findElement(By.id("recertFreq"));
    input.click();
    input.sendKeys("Test recertification frequency");
  });

  test.it("Add new record - set recert date", function() {
    this.timeout(5000);
    // set recert date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="recertDate-group"]/div/p/span/button/i')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="recertDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="recertDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="recertDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
  });

  test.it("Add new record - set engineer", function() {
    this.timeout(8000);
    // set engineer
    chromeDriver.wait(until.elementLocated(By.id("engineer")), 3000);
    input = chromeDriver.findElement(By.id("engineer"));
    input.click();
    //*[@id="engineer"]/input[1]
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="engineer"]/input[1]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="engineer"]/input[1]'));
    input.sendKeys("ellisr");
    //*[@id="ui-select-choices-row-1-0"]/span/div
    //*[@id="ui-select-choices-row-1-0"]/span
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-1-0"]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-1-0"]'));
    input.click();
  });

  test.it("should show the details record", function () {
    this.timeout(5000);
    // submit and check result
    chromeDriver.findElement(By.id("submitBtn")).click();
    chromeDriver.wait(until.titleIs("SWDB - Details"), 5000);
  });

  // perform this test and record the record id for checking in a later test
  let id = null;
  test.it("should show the correct software name in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("swName")), 3000);
    chromeDriver.findElement(By.id("swName")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test UserRecord");
      });
    let url = chromeDriver.getCurrentUrl().then((currUrl) => {
      id = currUrl.split('/').pop();
    });
  });

  // find the created record
  test.it("should find a record", function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl+"#/list");
    chromeDriver.wait(until.elementLocated(By.id("swNameSrch")), 8000)
      .sendKeys("UserRecord");
    chromeDriver.wait(until.elementLocated(By.id("versionSrch")), 8000)
      .sendKeys("Test version");
    chromeDriver.wait(until.elementLocated(By.linkText("Test UserRecord")),
      8000);
  });

  // find the created record and click update
  test.it("should show record details", function() {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.linkText("Test UserRecord")),
      8000).click();
    chromeDriver.wait(until.titleIs("SWDB - Details"), 5000);
    chromeDriver.wait(until.elementLocated(By.id("updateBtn")),
      8000).click();
  });

  test.it("should show the update title", function() {
    chromeDriver.wait(until.titleIs("SWDB - Update"), 5000);
  });

  test.it("should update a record", function() {
    this.timeout(20000);
    chromeDriver.wait(until.elementLocated(By.id("desc")), 8000)
      .clear();
    chromeDriver.wait(until.elementLocated(By.id("desc")), 8000)
      .sendKeys("New Test Description");
    chromeDriver.wait(until.elementLocated(By.id("submitBtn")), 8000)
      .click();
  });

  test.it("should show the details record", function () {
    this.timeout(20000);
    chromeDriver.wait(until.titleIs("SWDB - Details"), 20000);
  });

  test.it("should show the correct description in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("desc")), 3000);
    chromeDriver.findElement(By.id("desc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("New Test Description");
      });
  });

  test.it("should show the correct software name in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("swName")), 3000);
    chromeDriver.findElement(By.id("swName")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test UserRecord");
      });
  });

  test.it("should show the correct software branch in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("branch")), 3000);
    chromeDriver.findElement(By.id("branch")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test branch");
      });
  });

  test.it("should show the correct software version in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("version")), 3000);
    chromeDriver.findElement(By.id("version")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test Version");
      });
  });

  test.it("should show the correct description doc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("descDocLoc")), 3000);
    chromeDriver.findElement(By.id("descDocLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://www.google.com");
      });
  });

  test.it("should show the correct design description doc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("designDescDocLoc")), 3000);
    chromeDriver.findElement(By.id("designDescDocLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://www.google.com");
      });
  });

  test.it("should show the correct owner in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("owner")), 3000);
    chromeDriver.findElement(By.id("owner")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("IFS:LAB.FRIB.ASD.CONTROLS.EBC");
      });
  });

  test.it("should show the correct engineer in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("engineer")), 3000);
    chromeDriver.findElement(By.id("engineer")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("ELLISR");
      });
  });

  test.it("should show the correct levelOfCare in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("levelOfCare")), 3000);
    chromeDriver.findElement(By.id("levelOfCare")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("LOW");
      });
  });

  test.it("should show the correct status in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    chromeDriver.findElement(By.id("status")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("DEVEL");
      });
  });

  // test.it("should show the correct statusDate in details", function () {
  //   chromeDriver.wait(until.elementLocated(By.id("statusDate")), 3000);
  //   chromeDriver.findElement(By.id("statusDate")).getAttribute("value").then(
  //     function (text) {
  //       expect(text).to.equal("2017-09-30T07:00:00.000Z");
  //     });
  // });

  test.it("should show the correct platforms in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("platforms")), 3000);
    chromeDriver.findElement(By.id("platforms")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test platform");
      });
  });

  test.it("should show the correct vvProcLoc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("vvProcLoc")), 3000);
    chromeDriver.findElement(By.id("vvProcLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://procservtest.com/procdoc1,http://procservtest.com/procdoc2");
      });
  });

  test.it("should show the correct vvResultsLoc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc")), 3000);
    chromeDriver.findElement(By.id("vvResultsLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://resultservtest.com/resultsdoc1,http://resultservtest.com/resultdoc2");
      });
  });

  test.it("should show the correct versionControl in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("versionControl")), 3000);
    chromeDriver.findElement(By.id("versionControl")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Git");
      });
  });

  test.it("should show the correct versionControlLoc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("versionControlLoc")), 3000);
    chromeDriver.findElement(By.id("versionControlLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://www.google.com");
      });
  });

  test.it("should show the correct recertFreq in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("recertFreq")), 3000);
    chromeDriver.findElement(By.id("recertFreq")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test recertification frequency");
      });
  });

  // test.it("should show the correct recertDate in details", function () {
  //   chromeDriver.wait(until.elementLocated(By.id("recertDate")), 3000);
  //   chromeDriver.findElement(By.id("recertDate")).getAttribute("value").then(
  //     function (text) {
  //       expect(text).to.equal("2017-09-30T07:00:00.000Z");
  //     });
  // });




// Begin making a new installation and link to the previous sw record we made
test.it("should show search page with username on logout button", function() {
    this.timeout(8000);
    chromeDriver.get(props.webUrl+"#/inst/new");
    chromeDriver.wait(until.elementLocated(By.id("usrBtn")),5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
      props.test.username.toUpperCase()),5000);
  });

  test.it("should show the requested installation record title", function() {
    chromeDriver.wait(until.titleIs("SWDB - New Installation"), 5000);
  });
  test.it("Add new record - set host", function() {
    this.timeout(15000);
    chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
    var input = chromeDriver.findElement(By.id("host"));
    input.sendKeys("testHost1");
  });

  test.it("Add new record - set software", function() {
    this.timeout(15000);
    // set software
    chromeDriver.wait(until.elementLocated(By.id("software")), 3000);
    searchInput = chromeDriver.findElement(By.id("software"));
    searchInput.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="software"]/input[1]')));
    searchInput = chromeDriver.findElement(By.xpath('//*[@id="software"]/input[1]'));
    searchInput.sendKeys("BEAST");
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-4-3"]/span')), 5000);
    // chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="software"]')), 5000);
    // input = chromeDriver.findElement(By.xpath('//*[@id="software"]'));
    // input.getAttribute("innerHTML").then(function(result) {
    //   console.log("inner html: " + result);
    // });
  });
  test.it("Add new record - click row", function() {
    this.timeout(5000);
    input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-4-3"]/span'));
    input.click();
  });
  test.it("Add new record - check input", function() {
    this.timeout(5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(
      By.id('software')),
       "BEAST/b5/0.2"),3000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(
      By.id('software')),
       "BEAST/b5/0.2"),3000);
    // chromeDriver.pause(2000);
  });

  test.it("Add new record - set name", function() {
    // set name
    chromeDriver.wait(until.elementLocated(By.id("name")), 3000);
    input = chromeDriver.findElement(By.id("name"));
    input.click();
    input.sendKeys("Test name");
  });


  test.it("Add new installation - set area", function() {
    this.timeout(5000);
    // set area
    chromeDriver.wait(until.elementLocated(By.id("add.area")), 3000);
    input = chromeDriver.findElement(By.id("add.area"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("area.0")), 3000);
    input0 = chromeDriver.findElement(By.id("area.0"));
    input0.click();

    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="area.0"]/input[1]')), 3000);
    input0b = chromeDriver.findElement(By.xpath('//*[@id="area.0"]/input[1]'));
    input0b.sendKeys("controls\n");

    chromeDriver.wait(until.elementTextContains(input0,
      "ADB:AREA.FRIB.CTRLITIDF"), 5000);
  });

  test.it("Add new installation - set drr", function() {
    this.timeout(5000);
    // set drrs
    chromeDriver.wait(until.elementLocated(By.id("drrs")), 3000);
    input = chromeDriver.findElement(By.id("drrs"));
    input.click();
    input.sendKeys("TestDRR");
  });

  test.it("Add new installation - set status", function() {
    this.timeout(5000);
    // set the status
    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    input = chromeDriver.findElement(By.id("status"));
    input.click();
    input.sendKeys("RDY_BEAM");

    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
  });

  test.it("Add new installation - set status date", function() {
    this.timeout(5000);
    // set status date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
  });

  test.it("Add new installation - set vvResultsLoc", function() {
    this.timeout(5000);
    // set vvResultsLoc
    chromeDriver.wait(until.elementLocated(By.id("add.vvResultsLoc")), 3000);
    input = chromeDriver.findElement(By.id("add.vvResultsLoc"));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.0")), 3000);
    input0 = chromeDriver.findElement(By.id("vvResultsLoc.0"));
    input0.sendKeys("http://resultservtest.com/resultsdoc0");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.1")), 3000);
    input1 = chromeDriver.findElement(By.id("vvResultsLoc.1"));
    input1.sendKeys("http://resultservtest.com/resultsdoc1");
    input.click();
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc.2")), 3000);
    input2 = chromeDriver.findElement(By.id("vvResultsLoc.2"));
    input2.sendKeys("http://resultservtest.com/resultdoc2");
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id("rm.vvResultsLoc.0")), 3000);
    input = chromeDriver.findElement(By.id("rm.vvResultsLoc.0"));
    input.click();
  });

  test.it("should show the details record", function () {
    this.timeout(8000);
    chromeDriver.findElement(By.id("submitBtn")).click();
    chromeDriver.wait(until.titleIs("SWDB - Installation Details"), 5000);
  });

  test.it("should show the correct installtion host in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("host")), 3000);
    chromeDriver.findElement(By.id("host")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("testHost1");
      });
  });

  test.it("should show the correct installtion name in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("name")), 3000);
    chromeDriver.findElement(By.id("name")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("Test name");
      });
  });

  test.it("should show the correct installtion software in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("software")), 3000);
    chromeDriver.findElement(By.id("software")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("5947589458a6aa0face9a555");
      });
  });

  test.it("should show the correct installtion area in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("area")), 3000);
    chromeDriver.findElement(By.id("area")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("ADB:AREA.FRIB.CTRLITIDF");
      });
  });

  test.it("should show the correct installtion DRR in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("drrs")), 3000);
    chromeDriver.findElement(By.id("drrs")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("TestDRR");
      });
  });

  test.it("should show the correct installtion status in details", function () {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id("status")), 3000);
    chromeDriver.findElement(By.id("status")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("RDY_BEAM");
      });
  });
  // need date test
  // test.it("should show the correct installtion status date in details", function () {
  //   this.timeout(8000);
  //   chromeDriver.wait(until.elementLocated(By.id("statusDate")), 3000);
  //   chromeDriver.findElement(By.id("statusDate")).getAttribute("value").then(
  //     function (text) {
  //       expect(text).to.equal("2017-09-30T07:00:00.000Z");
  //     });
  // });

  test.it("should show the correct vvResultsLoc in details", function () {
    chromeDriver.wait(until.elementLocated(By.id("vvResultsLoc")), 3000);
    chromeDriver.findElement(By.id("vvResultsLoc")).getAttribute("value").then(
      function (text) {
        expect(text).to.equal("http://resultservtest.com/resultsdoc1,http://resultservtest.com/resultdoc2");
      });
  });

  test.describe("Cancel from new sw goes back to list", function () {
    // test cancel from new sw record foes back to the mail search screen
    test.it("should show new page with username on logout button", function () {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + "#/new");
      chromeDriver.wait(until.elementLocated(By.id("usrBtn")), 5000);
      chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
        props.test.username.toUpperCase()), 5000);
    });

    test.it("should show the new sw record title and click cancel", function () {
      chromeDriver.wait(until.titleIs("SWDB - New"), 5000);
      chromeDriver.wait(until.elementLocated(By.id("cancelBtn")), 5000);
      chromeDriver.findElement(By.id("cancelBtn")).click();
    });

    test.it("should show list page", function () {
      chromeDriver.wait(until.titleIs("SWDB - List"), 5000);
    });
  });

  test.describe("Cancel from sw update goes back to details", function () {
    // Test cancel from sw update goes back to the appropriate detauils screen
    // find the created record
    test.it("should find a record", function () {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + "#/list");
      chromeDriver.wait(until.elementLocated(By.id("swNameSrch")), 8000)
        .sendKeys("UserRecord");
      chromeDriver.wait(until.elementLocated(By.id("versionSrch")), 8000)
        .sendKeys("Test version");
      chromeDriver.wait(until.elementLocated(By.linkText("Test UserRecord")),
        8000);
    });

    // find the created record and click update-cancel and back to details
    test.it("should show record details after cancel update", function () {
      this.timeout(10000);
      chromeDriver.wait(until.elementLocated(By.linkText("Test UserRecord")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Details"), 5000);
      chromeDriver.wait(until.elementLocated(By.id("updateBtn")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Update"), 5000);
      chromeDriver.wait(until.elementLocated(By.id("cancelBtn")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Details"), 5000);
      let newurl = chromeDriver.getCurrentUrl().then((currUrl) => {
        let newid = currUrl.split('/').pop();
        expect(newid).to.equal(id);
      });
    });
  });



  test.describe("Cancel from new installation goes back to list", function () {
    // test cancel from new sw record foes back to the mail search screen
    test.it("should show new installation page with username on logout button", function () {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + "#/inst/new");
      chromeDriver.wait(until.elementLocated(By.id("usrBtn")), 5000);
      chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id("usrBtn")),
        props.test.username.toUpperCase()), 5000);
    });

    test.it("should show the new sw record title and click cancel", function () {
      chromeDriver.wait(until.titleIs("SWDB - New Installation"), 5000);
      chromeDriver.wait(until.elementLocated(By.id("cancelBtn")), 5000);
      chromeDriver.findElement(By.id("cancelBtn")).click();
    });

    test.it("should show list page", function () {
      chromeDriver.wait(until.titleIs("SWDB - Installations List"), 5000);
    });
  });

  test.describe("Cancel from installation update goes back to details", function () {
    // Test cancel from sw update goes back to the appropriate detauils screen
    // find the created record
    test.it("should find installation record", function () {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + "#/inst/list");
      chromeDriver.wait(until.elementLocated(By.id("hostSrch")), 8000)
        .sendKeys("testHost1");
    });

    // find the created record and click update-cancel and back to details
    test.it("should show record details after cancel update", function () {
      this.timeout(10000);
      chromeDriver.wait(until.elementLocated(By.linkText("testHost1")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Installation Details"), 5000);
      let url = chromeDriver.getCurrentUrl().then((currUrl) => {
        id = currUrl.split('/').pop();
      });
      chromeDriver.wait(until.elementLocated(By.id("updateBtn")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Update Installation"), 5000);
      chromeDriver.wait(until.elementLocated(By.id("cancelBtn")),
        8000).click();
      chromeDriver.wait(until.titleIs("SWDB - Installation Details"), 5000);
      let newurl = chromeDriver.getCurrentUrl().then((currUrl) => {
        let newid = currUrl.split('/').pop();
        expect(newid).to.equal(id);
      });
    });
  });
});
