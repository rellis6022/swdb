var app = require("../../server");
var chai = require("chai");
var expect = require("chai").expect;
chai.use(require("chai-as-promised"));
var be = require("../../lib/db");

var webdriver = require("../../node_modules/selenium-webdriver"),
By = webdriver.By,
until = webdriver.until,
test = require("../../node_modules/selenium-webdriver/testing");
var fs = require('fs');
var path = require('path');
const props = JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));
//const swTable = JSON.parse(fs.readFileSync('./test/misc/datafiles/swData.json', 'utf8'));
const swTable = JSON.parse(fs.readFileSync('./test/misc/datafiles/swTestDataCombined.json', 'utf8'));
const testSwNames = JSON.parse(fs.readFileSync('./test/misc/datafiles/swTestNames.json', 'utf8'));

// make table of sw names
var swNames = [];
for (var i in swTable)
{
  swNames.push({id: i, "name": swTable[i].Name});
}
props.swNames = swNames;

// clear the test collection before and after tests suite
before(function(done) {

  // clear the test collection
  this.timeout(5000);
  console.log("Dropping collections...");
  be.swDoc.db.collections.swdbCollection.drop(function(err){
    be.swDoc.db.collections.swNamesProp.drop(function(err){
      console.log("inserting testSwNames in swNamesProp collection");
      be.swNamesDoc.db.collections.swNamesProp.insert(testSwNames,
          function(err, records){
        done();
      });
    });
  });
});

after(function(done) {
  // clear the test collection
  be.swDoc.db.collections.swdbCollection.drop(function(err){
    be.swDoc.db.collections.swNamesProp.drop(function(err){
    done();
    });
  });
});

test.describe("SWDB record tests", function() {
  var driver;

  test.before(function() {
    this.timeout(5000);
    driver = new webdriver.Builder()
    .forBrowser("chrome")
    .build();
    driver.manage().window().setPosition(200,0);
  });
  test.after(function() {
    driver.quit();
  });

    var allCookies = null;

  test.it("should show search page with login button", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/list");
    driver.wait(until.elementLocated(By.id("usrBtn")),5000);
    driver.wait(until.elementTextContains(driver.findElement(By.id("usrBtn")),
    "(click to login)"),5000);
  });

  test.it("should login", function() {
    // get test authentication
    driver.get(props.webUrl+"testlogin?username=testuser&password=testuserpasswd");
    driver.wait(until.elementLocated(By.id("Test auth success")),3000);
  });

  test.it("should show search page with username on logout button", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/list");
    driver.wait(until.elementLocated(By.id("usrBtn")),5000);
    driver.wait(until.elementTextContains(driver.findElement(By.id("usrBtn")),
    "testuser (click to logout)"),5000);
  });

  // test required fields
  test.it("fail to add a new record if missing valid swName", function() {
    this.timeout(10000);
    driver.get(props.webUrl+"#/new");
    //driver.wait(until.elementIsVisible(driver.findElement(By.id("swName")),5000)).click();
    //driver.wait(until.elementLocated(By.xpath('//*[@id="swName-group"]/div/div/input[1]')),5000).sendKeys("Beast"+webdriver.Key.RETURN+webdriver.Key.ESCAPE);
    //driver.sleep(1000);
    driver.findElement(By.id("owner")).click();
    driver.sleep(1000);
    driver.findElement(By.id("owner")).sendKeys("Software owner - 3001");
    driver.findElement(By.id("levelOfCare")).sendKeys("LOW");
    driver.findElement(By.id("status")).sendKeys("DEVEL");
    driver.findElement(By.id("statusDate")).sendKeys("1978/07/07");
    driver.findElement(By.id("version")).sendKeys("v0.3001");
    driver.findElement(By.id("submitBtn")).click();

    driver.wait(until.elementTextContains(driver.findElement(By.id("formError")),
    "Error: clear errors before submission"),5000);
  });

  // Open the new page and insert test data
  test.it("should add a new record", function() {
    this.timeout(10000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementIsVisible(driver.findElement(By.id("swName")),5000)).click();
    driver.wait(until.elementLocated(By.xpath('//*[@id="swName-group"]/div/div/input[1]')),5000).sendKeys("Beast"+webdriver.Key.RETURN+webdriver.Key.ESCAPE);
    driver.sleep(1000);
    driver.findElement(By.id("owner")).click();
    driver.sleep(1000);
    driver.findElement(By.id("owner")).sendKeys("Software owner - 3001");
    driver.findElement(By.id("levelOfCare")).sendKeys("LOW");
    driver.findElement(By.id("status")).sendKeys("DEVEL");
    driver.findElement(By.id("statusDate")).sendKeys("1978/07/07");
    driver.findElement(By.id("version")).sendKeys("v0.3001");
    driver.findElement(By.id("submitBtn")).click();

    driver.wait(until.elementTextContains(driver.findElement(By.id("formStatus")),
    "Document posted"),5000);
  });
});
