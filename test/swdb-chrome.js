var app = require("../server");
var chai = require("chai");
var expect = require("chai").expect;
chai.use(require("chai-as-promised"));
var be = require("../lib/db");

var webdriver = require("../node_modules/selenium-webdriver"),
By = webdriver.By,
until = webdriver.until,
test = require("../node_modules/selenium-webdriver/testing");
var fs = require('fs');
var path = require('path');
const props = JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));

// clear the test collection before and after tests suite
before(function(done) {
  // clear the test collection
  be.swDoc.db.collections.swdbs.drop();
  this.timeout(5000);
  done();
});
after(function(done) {
  // clear the test collection
  be.swDoc.db.collections.swdbs.drop();
  done();
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

  test.it("should login", function() {
    // get test authentication
    driver.get(props.webUrl+"login?username=testuser&password=testuserpasswd");
    driver.wait(until.elementLocated(By.id("Test auth success")),3000);
  });

  // Open the new page and insert test data
  test.it("should add a new record", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("swName")),3000).sendKeys("Software Name - 3001");
    driver.findElement(By.id("owner")).sendKeys("Software owner - 3001");
    driver.findElement(By.id("levelOfCare")).sendKeys("LOW");
    driver.findElement(By.id("status")).sendKeys("DEVEL");
    driver.findElement(By.id("statusDate")).sendKeys("1978/07/07");
    driver.findElement(By.id("releasedVersion")).sendKeys("v0.3001");
    driver.findElement(By.id("submitBtn")).click();

    driver.wait(until.elementTextContains(driver.findElement(By.id("formStatus")),
    "Document posted"),5000);
  });

  // find a record
  test.it("should find and update a record", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/list");
    driver.wait(until.elementLocated(By.id("swdbList_filter")), 8000)
    .findElement(By.tagName("Input"))
    .sendKeys("3001");
    driver.wait(until.elementLocated(By.linkText("Software Name - 3001")),
    8000);

    driver.findElement(By.linkText("Software Name - 3001")).click();
    driver.wait(until.titleIs("SWDB - Details"), 5000);

    driver.findElement(By.linkText("Update this document")).click();
    driver.wait(until.titleIs("SWDB - Update"), 5000);
    driver.findElement(By.id("owner")).clear();
    driver.findElement(By.id("owner")).sendKeys("NEW Owner 3001");
    driver.findElement(By.id("submitBtn")).click();
    driver.wait(until.elementTextContains(driver.findElement(By.id("formStatus")),
    "Document updates successfully posted"),5000);
  });

  // // delete a record
  // test.it("should delete a record", function() {
  //   this.timeout(5000);
  //   driver.get("http://localhost:"+props.webPort+"/#/del/3001");
  //   driver.wait(until.titleIs("SWDB - Delete"), 5000);
  //   driver.findElement(By.id("submitBtn")).click();

  //   // wait for success message
  //   driver.wait(until.elementTextContains(
  //     driver.findElement(By.id("formStatus")),
  //      "Document successfully deleted"),5000);
  // });

  // test field limits
  test.it("SW Name required", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("swName")), 3000);
    var input = driver.findElement(By.id("swName"));
    input.sendKeys("0123456789012345678901234567891");
    input.clear();
    var inputSts = driver.findElement(By.id("swNameInputSts"));
    text = inputSts.getText();
    driver.wait(until.elementTextIs(inputSts, "Name is required"),5000);
    input.clear();
  });
  test.it("SW Name min for field ", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("swName")), 3000);
    var input = driver.findElement(By.id("swName"));
    input.sendKeys("1");
    var inputSts = driver.findElement(By.id("swNameInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Name must exceed 2 characters"),5000);
    input.clear();
    input.sendKeys("11");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  test.it("SW Name max for field ", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("swName")), 3000);
    var input = driver.findElement(By.id("swName"));
    input.sendKeys("0123456789012345678901234567891");
    var inputSts = driver.findElement(By.id("swNameInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Name must not exceed 30 characters"),5000);
    input.clear();
    input.sendKeys("012345678901234567890123456789");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  test.it("SW owner required", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("owner")), 3000);
    var input = driver.findElement(By.id("owner"));
    input.sendKeys("1");
    input.clear();
    var inputSts = driver.findElement(By.id("ownerInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Owner is required"),5000);
    input.clear();
  });
  test.it("SW owner min for field ", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("owner")), 3000);
    var input = driver.findElement(By.id("owner"));
    input.sendKeys("1");
    var inputSts = driver.findElement(By.id("ownerInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Owner must exceed 2 characters"),5000);
    input.clear();
    input.sendKeys("11");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  test.it("SW owner max for field ", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("owner")), 3000);
    var input = driver.findElement(By.id("owner"));
    input.sendKeys("0123456789012345678901234567891");
    var inputSts = driver.findElement(By.id("ownerInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Owner must not exceed 30 characters"),5000);
    input.clear();
    input.sendKeys("012345678901234567890123456789");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });

  test.it("statusDate date format", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("statusDate")), 3000);
    var input = driver.findElement(By.id("statusDate"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("statusDateInputSts"));
    input.clear();
    input.sendKeys("1911/11/11");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  test.it("releasedVersion format", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("releasedVersion")), 3000);
    var input = driver.findElement(By.id("releasedVersion"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("releasedVersionInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 2 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  test.it("platforms format min", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("platforms")), 3000);
    var input = driver.findElement(By.id("platforms"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("platformsInputSts"));
    //var text = inputSts.getText();
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
  });
  test.it("platforms format max", function() {
    driver.wait(until.elementLocated(By.id("platforms")), 3000);
    var input = driver.findElement(By.id("platforms"));
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    var inputSts = driver.findElement(By.id("platformsInputSts"));
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });

  // auxSw
  test.it("Add auxSw min", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("add.auxSw")), 3000);
    var addButton = driver.findElement(By.id("add.auxSw"));
    addButton.click();
    var input = driver.findElement(By.id("auxSw.0"));
    var rmButton = driver.findElement(By.id("rm.auxSw.0"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("auxSwInputSts.0"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    inputSts = driver.findElement(By.id("auxSwInputSts.0"));
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
    rmButton.click();
  });
  // swDescDoc add
  test.it("Add swDescDoc min", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("add.swDescDoc")), 3000);
    var addButton = driver.findElement(By.id("add.swDescDoc"));
    addButton.click();
    var input = driver.findElement(By.id("swDescDoc.0"));
    var rmButton = driver.findElement(By.id("rm.swDescDoc.0"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("swDescDocInputSts.0"));
    var text = inputSts.getText();
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
    rmButton.click();
  });
  // validationDoc add
  test.it("Add validationDoc doc min", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("add.validationDoc")), 3000);
    var addButton = driver.findElement(By.id("add.validationDoc"));
    addButton.click();
    var input = driver.findElement(By.id("validationDocInput.0.doc"));
    var rmButton = driver.findElement(By.id("rm.validationDoc.0"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("validationDocInputSts.0.doc"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    //text = inputSts.getText();
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();

    rmButton.click();
  });
  // verificationDoc add
  test.it("Add verificationDoc doc min", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("add.verificationDoc")), 3000);
    var addButton = driver.findElement(By.id("add.verificationDoc"));
    addButton.click();
    input = driver.findElement(By.id("verificationDocInput.0.doc"));
    var rmButton = driver.findElement(By.id("rm.verificationDoc.0"));
    input.sendKeys("7");
    driver.wait(until.elementLocated(By.id("verificationDocInputSts.0.doc")), 3000);
    var inputSts = driver.findElement(By.id("verificationDocInputSts.0.doc"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();

    rmButton.click();
  });

  // versionControl
  test.it("revisionControl", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("revisionControl")), 3000);
    input = driver.findElement(By.id("revisionControl"));
    input.sendKeys("7");
    driver.wait(until.elementLocated(By.id("revisionControlInputSts")), 3000);
    var inputSts = driver.findElement(By.id("revisionControlInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  // recertFreq
  test.it("recertFreq", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("recertFreq")), 3000);
    input = driver.findElement(By.id("recertFreq"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("recertFreqInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });
  // recertStatus
  test.it("recertStatus", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("recertStatus")), 3000);
    input = driver.findElement(By.id("recertStatus"));
    input.sendKeys("7");
    var inputSts = driver.findElement(By.id("recertStatusInputSts"));
    driver.wait(until.elementTextIs(inputSts, "Minimum 4 characters"),5000);
    var text = inputSts.getText();
    expect(text).to.eventually.equal("Minimum 4 characters");
    input.clear();
    input.sendKeys("0123456789012345678901234567890");
    driver.wait(until.elementTextIs(inputSts, ""),5000);
    input.clear();
  });

  test.it("should logout", function() {
    // get test authentication
    driver.get(props.webUrl+"logout");
    driver.wait(until.elementLocated(By.id("Logout complete")),3000);
  });

  // test unauthorized record adds
  test.it("should fail add a new record", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/new");
    driver.wait(until.elementLocated(By.id("swName")), 3000);
    driver.findElement(By.id("swName")).sendKeys("Software Name - 4001");
    driver.findElement(By.id("owner")).sendKeys("Software owner - 4001");
    driver.findElement(By.id("levelOfCare")).sendKeys("LOW");
    driver.findElement(By.id("status")).sendKeys("DEVEL");
    driver.findElement(By.id("statusDate")).sendKeys("1978/07/07");
    driver.findElement(By.id("releasedVersion")).sendKeys("v0.3001");
    driver.findElement(By.id("submitBtn")).click();

    driver.wait(until.elementTextContains(driver.findElement(By.id("formError")),
    "Not authorized"),5000);
  });
  // find a record and fail to update it
  test.it("should find and fail to update a record", function() {
    this.timeout(8000);
    driver.get(props.webUrl+"#/list");
    driver.wait(until.elementLocated(By.id("swdbList_filter")), 8000)
    .findElement(By.tagName("Input"))
    .sendKeys("3001");
    driver.wait(until.elementLocated(By.linkText("Software Name - 3001")),
    8000);

    driver.findElement(By.linkText("Software Name - 3001")).click();
    driver.wait(until.titleIs("SWDB - Details"), 5000);

    driver.findElement(By.linkText("Update this document")).click();
    driver.wait(until.titleIs("SWDB - Update"), 5000);
    driver.findElement(By.id("owner")).clear();
    driver.findElement(By.id("owner")).sendKeys("NEW Owner 3001");
    driver.findElement(By.id("submitBtn")).click();
    driver.wait(until.elementTextContains(driver.findElement(By.id("formError")),
    "Not authorized"),5000);
  });

  test.after(function() {
    driver.manage().timeouts().implicitlyWait(2000);
    driver.quit();
  });
});
