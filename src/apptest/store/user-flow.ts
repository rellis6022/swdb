import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import dbg = require('debug');
import webdriver = require('selenium-webdriver');
import test = require('selenium-webdriver/testing');
import Supertest = require('supertest');
import CommonTools = require('../../app/lib/CommonTools');
import server = require('../../app/server');
import TestTools = require('./TestTools');

const debug = dbg('swdb:user-flow-tests');
const ctools = new CommonTools.CommonTools();
let props: CommonTools.IProps;
const expect = chai.expect;
chai.use(chaiAsPromised);
props = ctools.getConfiguration();
let app;
let supertest: Supertest.SuperTest<Supertest.Test>;
const testTools = new TestTools.TestTools();
const By = webdriver.By;
const until = webdriver.until;


test.describe('User flow tests', () => {
  let chromeDriver: webdriver.WebDriver;
  let tmpStatusDate: Date;
  let tmpInstStatusDate: Date;
  before('Prep DB', async () => {
    app = await server.start();
    supertest = Supertest(app);
    debug('Prep DB');
    await testTools.clearTestCollections(debug);
    await testTools.loadTestCollectionsStandard(debug, props.test.swTestDataFile, props.test.instTestDataFile);
  });

  after('clear db', async () => {
    debug('Clear DB');
    // clear the test collection.
    chromeDriver.quit();
    await testTools.clearTestCollections(debug);
    await server.stop();
  });

  test.it('should show search page with login button', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);

    chromeDriver = new webdriver.Builder()
      .forBrowser('chrome')
      .build();
    chromeDriver.manage().window().setPosition(200, 0);

    chromeDriver.get(props.webUrl + '#/list');
    chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
      'Log in'), 5000);
  });

  test.it('login as test user', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
    this.timeout(8000);
    supertest
    .get('/login')
    .auth(props.test.username, props.test.password)
    .timeout(8000)
    .expect(302)
    .end((err, res) => {
      if (err) {
        done(err);
      } else {
        const Cookies = res.header['set-cookie'].pop().split(';')[0];
        debug('test login cookies: ' + Cookies);
        const parts = Cookies.split('=');
        debug('setting driver cookie ' + parts[0] + ' ' + parts[1]);
        chromeDriver.manage().addCookie({name: parts[0], value: parts[1]});
        done();
      }
    });
  });

  test.it('should show search page with username on logout button', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.get(props.webUrl + '#/list');
    chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
      props.test.username.toUpperCase()), 5000);
  });

  test.it('should show new page with username on logout button', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.get(props.webUrl + '#/new');
    chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
      props.test.username.toUpperCase()), 5000);
  });


  test.it('should show the requested sw record title', () => {
    chromeDriver.wait(until.titleIs('SWDB - New'), 5000);
  });

  test.it('Add new sw record - set name', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    chromeDriver.wait(until.elementLocated(By.id('swName')), 3000);
    chromeDriver.findElement(By.id('swName')).sendKeys('Test UserRecord');
  });

  test.it('Add new sw record - set version', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set version
    chromeDriver.wait(until.elementLocated(By.id('version')), 3000);
    const input = chromeDriver.findElement(By.id('version'));
    input.click();
    input.sendKeys('Test Version');
  });

  test.it('Add new sw record - set branch', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set branch
    chromeDriver.wait(until.elementLocated(By.id('branch')), 3000);
    const input = chromeDriver.findElement(By.id('branch'));
    input.click();
    input.sendKeys('Test branch');
  });

  test.it('Add new sw record - set description', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set description
    chromeDriver.wait(until.elementLocated(By.id('desc')), 3000);
    const input = chromeDriver.findElement(By.id('desc'));
    input.click();
    input.sendKeys('Test description');
  });

  test.it('Add new sw record - set desc doc', () => {
    // set description document
    chromeDriver.wait(until.elementLocated(By.id('descDocLoc')), 3000);
    const input = chromeDriver.findElement(By.id('descDocLoc'));
    input.click();
    input.sendKeys('http://www.google.com');
  });

  test.it('Add new sw record - set design desc doc', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set design description document
    chromeDriver.wait(until.elementLocated(By.id('designDescDocLoc')), 3000);
    const input = chromeDriver.findElement(By.id('designDescDocLoc'));
    input.click();
    input.sendKeys('http://www.google.com');
  });

  test.it('Add new sw record - set owner', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set owner
    chromeDriver.wait(until.elementLocated(By.id('owner')), 3000);
    let input = chromeDriver.findElement(By.id('owner'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="owner"]/input[1]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="owner"]/input[1]'));
    input.sendKeys('controls');
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-0-2"]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-0-2"]'));
    input.click();
  });

  test.it('Add new sw record - set level of care', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set level of care
    chromeDriver.wait(until.elementLocated(By.id('levelOfCare')), 3000);
    const input = chromeDriver.findElement(By.id('levelOfCare'));
    input.click();
    input.sendKeys('LOW');
  });

  test.it('Add new sw record - set status', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set status
    chromeDriver.wait(until.elementLocated(By.id('status')), 3000);
    const input = chromeDriver.findElement(By.id('status'));
    input.click();
    input.sendKeys('Development');
  });

  test.it('Add new sw record - set status date', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set status date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i')), 3000);
    let input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(
      By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
    tmpStatusDate = new Date();
  });

  test.it('Add new sw record - set platforms', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set platforms
    chromeDriver.wait(until.elementLocated(By.id('platforms')), 3000);
    const input = chromeDriver.findElement(By.id('platforms'));
    input.click();
    input.sendKeys('Test platform');
  });

  test.it('Add new sw record - set vvProcLoc', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set vvProcLoc
    chromeDriver.wait(until.elementLocated(By.id('add.vvProcLoc')), 3000);
    let input = chromeDriver.findElement(By.id('add.vvProcLoc'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvProcLoc.0')), 3000);
    const input0 = chromeDriver.findElement(By.id('vvProcLoc.0'));
    input0.sendKeys('http://procservtest.com/procdoc0');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvProcLoc.1')), 3000);
    const input1 = chromeDriver.findElement(By.id('vvProcLoc.1'));
    input1.sendKeys('http://procservtest.com/procdoc1');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvProcLoc.2')), 3000);
    const input2 = chromeDriver.findElement(By.id('vvProcLoc.2'));
    input2.sendKeys('http://procservtest.com/procdoc2');
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id('rm.vvProcLoc.0')), 3000);
    input = chromeDriver.findElement(By.id('rm.vvProcLoc.0'));
    input.click();
  });


  test.it('Add new sw record - set vvResultsLoc', function(this: Mocha.ITestCallbackContext) {
    this.timeout(7000);
    // set vvResultsLoc
    chromeDriver.wait(until.elementLocated(By.id('add.vvResultsLoc')), 3000);
    let input = chromeDriver.findElement(By.id('add.vvResultsLoc'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.0')), 3000);
    const input0 = chromeDriver.findElement(By.id('vvResultsLoc.0'));
    input0.sendKeys('http://resultservtest.com/resultsdoc0');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.1')), 3000);
    const input1 = chromeDriver.findElement(By.id('vvResultsLoc.1'));
    input1.sendKeys('http://resultservtest.com/resultsdoc1');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.2')), 3000);
    const input2 = chromeDriver.findElement(By.id('vvResultsLoc.2'));
    input2.sendKeys('http://resultservtest.com/resultdoc2');
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id('rm.vvResultsLoc.0')), 3000);
    input = chromeDriver.findElement(By.id('rm.vvResultsLoc.0'));
    input.click();
  });

  test.it('Add new sw record - set version control', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set version control
    chromeDriver.wait(until.elementLocated(By.id('versionControl')), 3000);
    const input = chromeDriver.findElement(By.id('versionControl'));
    input.click();
    input.sendKeys('Git');
  });

  test.it('Add new sw record - set version control loc', () => {
    // set version control location
    chromeDriver.wait(until.elementLocated(By.id('versionControlLoc')), 3000);
    const input = chromeDriver.findElement(By.id('versionControlLoc'));
    input.click();
    input.sendKeys('http://www.google.com');
  });

  test.it('Add new sw record - set engineer', function(this: Mocha.ITestCallbackContext) {
    this.timeout(10000);
    // set engineer
    chromeDriver.wait(until.elementLocated(By.id('engineer')), 3000);
    let input = chromeDriver.findElement(By.id('engineer'));
    chromeDriver.executeScript('scroll(0, -250);');
    input.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="engineer"]/input[1]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="engineer"]/input[1]'));
    input.sendKeys('ellisr');
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-1-0"]')));
    input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-1-0"]'));
    input.click();
  });

  test.it('should show the sw details record', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // submit and check result
    chromeDriver.findElement(By.id('submitBtn')).click();
    chromeDriver.wait(until.titleIs('SWDB - Details'), 5000);
  });

  // perform this test and record the record id for checking in a later test
  let id: string | undefined;
  test.it('should show the correct software name in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('swName')), 3000);
    chromeDriver.findElement(By.id('swName')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test UserRecord');
      });
    chromeDriver.getCurrentUrl().then((currUrl) => {
      id = currUrl.split('/').pop();
    });
  });

  // find the created record
  test.it('should find a sw record', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.get(props.webUrl + '#/list');
    chromeDriver.wait(until.elementLocated(By.id('swNameSrch')), 8000)
      .sendKeys('UserRecord');
    chromeDriver.wait(until.elementLocated(By.id('versionSrch')), 8000)
      .sendKeys('Test version');
    chromeDriver.wait(until.elementLocated(By.linkText('Test UserRecord')),
      8000);
  });

  // find the created record and click update
  test.it('should show sw record details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.linkText('Test UserRecord')),
      8000).click();
    chromeDriver.wait(until.titleIs('SWDB - Details'), 5000);
    chromeDriver.wait(until.elementLocated(By.id('updateBtn')),
      8000).click();
  });

  test.it('should show the sw update title', () => {
    chromeDriver.wait(until.titleIs('SWDB - Update'), 5000);
  });

  test.it('should update a sw record', function(this: Mocha.ITestCallbackContext) {
    this.timeout(20000);
    chromeDriver.wait(until.elementLocated(By.id('desc')), 8000)
      .clear();
    chromeDriver.wait(until.elementLocated(By.id('desc')), 8000)
      .sendKeys('New Test Description');
    chromeDriver.wait(until.elementLocated(By.id('submitBtn')), 8000)
      .click();
  });

  test.it('should show the sw details record', function(this: Mocha.ITestCallbackContext) {
    this.timeout(20000);
    chromeDriver.wait(until.titleIs('SWDB - Details'), 20000);
  });

  test.it('should show the correct sw description in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('desc')), 3000);
    chromeDriver.findElement(By.id('desc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('New Test Description');
      });
  });

  test.it('should show the correct software name in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('swName')), 3000);
    chromeDriver.findElement(By.id('swName')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test UserRecord');
      });
  });

  test.it('should show the correct software branch in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('branch')), 3000);
    chromeDriver.findElement(By.id('branch')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test branch');
      });
  });

  test.it('should show the correct software version in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('version')), 3000);
    chromeDriver.findElement(By.id('version')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test Version');
      });
  });

  test.it('should show the correct sw description doc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('descDocLoc')), 3000);
    chromeDriver.findElement(By.id('descDocLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://www.google.com');
      });
  });

  test.it('should show the correct sw design description doc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('designDescDocLoc')), 3000);
    chromeDriver.findElement(By.id('designDescDocLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://www.google.com');
      });
  });

  test.it('should show the correct sw owner in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('owner')), 3000);
    chromeDriver.findElement(By.id('owner')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('IFS:LAB.FRIB.ASD.CONTROLS.EBC');
      });
  });

  test.it('should show the correct sw engineer in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('engineer')), 3000);
    chromeDriver.findElement(By.id('engineer')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('ELLISR');
      });
  });

  test.it('should show the correct sw levelOfCare in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('levelOfCare')), 3000);
    chromeDriver.findElement(By.id('levelOfCare')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Low');
      });
  });

  test.it('should show the correct sw status in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('status')), 3000);
    chromeDriver.findElement(By.id('status')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Development');
      });
  });

  test.it('should show the status date in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('statusDate')), 3000);
    chromeDriver.findElement(By.id('statusDate')).getAttribute('value').then(
      (text: string) => {
        expect(text).to.equal(
          (tmpStatusDate.getMonth() + 1) + '/' +
          tmpStatusDate.getDate() + '/' +
          tmpStatusDate.getFullYear());
      });
  });

  test.it('should show the correct sw platforms in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('platforms')), 3000);
    chromeDriver.findElement(By.id('platforms')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test platform');
      });
  });

  test.it('should show the correct sw vvProcLoc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('vvProcLoc')), 3000);
    chromeDriver.findElement(By.id('vvProcLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://procservtest.com/procdoc1,http://procservtest.com/procdoc2');
      });
  });

  test.it('should show the correct sw vvResultsLoc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc')), 3000);
    chromeDriver.findElement(By.id('vvResultsLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://resultservtest.com/resultsdoc1,http://resultservtest.com/resultdoc2');
      });
  });

  test.it('should show the correct sw versionControl in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('versionControl')), 3000);
    chromeDriver.findElement(By.id('versionControl')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Git');
      });
  });

  test.it('should show the correct sw versionControlLoc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('versionControlLoc')), 3000);
    chromeDriver.findElement(By.id('versionControlLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://www.google.com');
      });
  });

  // Begin making a new installation and link to the previous sw record we made
  test.it('should show search page with username on logout button', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.get(props.webUrl + '#/inst/new');
    chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
      props.test.username.toUpperCase()), 5000);
  });

  test.it('should show the new installation page title', () => {
    chromeDriver.wait(until.titleIs('SWDB - New Installation'), 5000);
  });
  test.it('Add new inst record - set host', function(this: Mocha.ITestCallbackContext) {
    this.timeout(15000);
    chromeDriver.wait(until.elementLocated(By.id('host')), 3000);
    const input = chromeDriver.findElement(By.id('host'));
    input.sendKeys('testHost1');
  });

  test.it('Add new inst record - set software', function(this: Mocha.ITestCallbackContext) {
    this.timeout(15000);
    // set software
    chromeDriver.wait(until.elementLocated(By.id('software')), 3000);
    let searchInput = chromeDriver.findElement(By.id('software'));
    searchInput.click();
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="software"]/input[1]')));
    searchInput = chromeDriver.findElement(By.xpath('//*[@id="software"]/input[1]'));
    searchInput.sendKeys('BEAST');
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="ui-select-choices-row-4-0"]/span')), 5000);
  });
  test.it('Add new inst record - click row', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    const input = chromeDriver.findElement(By.xpath('//*[@id="ui-select-choices-row-4-0"]/span'));
    input.click();
  });

  test.it('Add new inst record - check input', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(
      By.id('software')),
       'BEAST/b12/0.2'), 3000);
    chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(
      By.id('software')),
       'BEAST/b12/0.2'), 3000);
  });

  test.it('Add new inst record - set name', () => {
    // set name
    chromeDriver.wait(until.elementLocated(By.id('name')), 3000);
    const input = chromeDriver.findElement(By.id('name'));
    input.click();
    input.sendKeys('Test name');
  });

  test.it('Add new inst record - set area 0', function(this: Mocha.ITestCallbackContext) {
    this.timeout(6000);
    // set area
    // add controls room, operator area, nscl control room
    // then delete the controls room
    chromeDriver.wait(until.elementLocated(By.id('add.area')), 3000);
    const input = chromeDriver.findElement(By.id('add.area'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('area.0')), 3000);
    const input0 = chromeDriver.findElement(By.id('area.0'));
    input0.click();

    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="area.0"]/input[1]')), 3000);
    const input0b = chromeDriver.findElement(By.xpath('//*[@id="area.0"]/input[1]'));
    input0b.sendKeys('controls\n');

    chromeDriver.wait(until.elementTextContains(input0,
      'IFS:LAB.FRIB.ASD.CONTROLS.HLCO'), 5000);
    });

  test.it('Add new inst record - set area 1', function(this: Mocha.ITestCallbackContext) {
    this.timeout(6000);
    chromeDriver.wait(until.elementLocated(By.id('add.area')), 3000);
    const input = chromeDriver.findElement(By.id('add.area'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('area.1')), 3000);
    const input1 = chromeDriver.findElement(By.id('area.1'));
    input1.click();

    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="area.1"]/input[1]')), 3000);
    const input1b = chromeDriver.findElement(By.xpath('//*[@id="area.1"]/input[1]'));
    input1b.sendKeys('operator\n');

    chromeDriver.wait(until.elementTextContains(input1,
      'IFS:LAB.FRIB.ASD.ACCELERATOROPS.MACHINEOPERATORS'), 5000);
    });

  test.it('Add new inst record - set area 2', function(this: Mocha.ITestCallbackContext) {
    this.timeout(6000);
    chromeDriver.wait(until.elementLocated(By.id('add.area')), 3000);
    const input = chromeDriver.findElement(By.id('add.area'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('area.2')), 3000);
    const input2 = chromeDriver.findElement(By.id('area.2'));
    input2.click();

    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="area.2"]/input[1]')), 3000);
    const input2b = chromeDriver.findElement(By.xpath('//*[@id="area.2"]/input[1]'));
    input2b.sendKeys('control room\n');

    chromeDriver.wait(until.elementTextContains(input2,
      'ADB:AREA.NSCL.CONTROLRM'), 5000);
    });

  test.it('Add new inst record - remove area 0', () => {
    chromeDriver.wait(until.elementLocated(By.id('rm.area.0')), 3000);
    const input = chromeDriver.findElement(By.id('rm.area.0'));
    input.click();
  });

  test.it('Add new inst installation - set drr', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set drrs
    chromeDriver.wait(until.elementLocated(By.id('drrs')), 3000);
    const input = chromeDriver.findElement(By.id('drrs'));
    input.click();
    input.sendKeys('TestDRR');
  });

  test.it('Add new inst installation - set status', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set the status
    chromeDriver.wait(until.elementLocated(By.id('status')), 3000);
    const input = chromeDriver.findElement(By.id('status'));
    input.click();
    input.sendKeys('Ready for beam');

    chromeDriver.wait(until.elementLocated(By.id('status')), 3000);
  });

  test.it('Add new inst installation - set status date', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set status date
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i')), 3000);
    let input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(
      By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="statusDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
    tmpInstStatusDate = new Date();

  });

  test.it('Add new inst installation - set V&V approval date', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    chromeDriver.wait(until.elementLocated(By.xpath('//*[@id="vvApprovalDate-group"]/div/p/span/button/i')), 3000);
    let input = chromeDriver.findElement(By.xpath('//*[@id="vvApprovalDate-group"]/div/p/span/button/i'));
    input.click();
    chromeDriver.wait(until.elementLocated(
      By.xpath('//*[@id="vvApprovalDate-group"]/div/p/div/ul/li[2]/span/button[1]')), 3000);
    input = chromeDriver.findElement(By.xpath('//*[@id="vvApprovalDate-group"]/div/p/div/ul/li[2]/span/button[1]'));
    input.click();
  });

  test.it('Add new inst installation - set vvResultsLoc', function(this: Mocha.ITestCallbackContext) {
    this.timeout(5000);
    // set vvResultsLoc
    chromeDriver.wait(until.elementLocated(By.id('add.vvResultsLoc')), 3000);
    let input = chromeDriver.findElement(By.id('add.vvResultsLoc'));
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.0')), 3000);
    const input0 = chromeDriver.findElement(By.id('vvResultsLoc.0'));
    input0.sendKeys('http://resultservtest.com/resultsdoc0');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.1')), 3000);
    const input1 = chromeDriver.findElement(By.id('vvResultsLoc.1'));
    input1.sendKeys('http://resultservtest.com/resultsdoc1');
    input.click();
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc.2')), 3000);
    const input2 = chromeDriver.findElement(By.id('vvResultsLoc.2'));
    input2.sendKeys('http://resultservtest.com/resultdoc2');
    // remove the first entry
    chromeDriver.wait(until.elementLocated(By.id('rm.vvResultsLoc.0')), 3000);
    input = chromeDriver.findElement(By.id('rm.vvResultsLoc.0'));
    input.click();
  });

  test.it('should show the inst details record', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.findElement(By.id('submitBtn')).click();
    chromeDriver.wait(until.titleIs('SWDB - Installation Details'), 5000);
  });

  test.it('should show the correct installation host in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('host')), 3000);
    chromeDriver.findElement(By.id('host')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('testHost1');
      });
  });

  test.it('should show the correct installtion name in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('name')), 3000);
    chromeDriver.findElement(By.id('name')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Test name');
      });
  });

  test.it('should show the correct installation software in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('software')), 3000);
    chromeDriver.findElement(By.id('software')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('BEAST / b12 / 0.2');
      });
  });

  test.it('should show the correct installtion area in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('area')), 3000);
    chromeDriver.findElement(By.id('area')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('IFS:LAB.FRIB.ASD.ACCELERATOROPS.MACHINEOPERATORS,ADB:AREA.NSCL.CONTROLRM');
      });
  });

  test.it('should show the correct installtion DRR in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('drrs')), 3000);
    chromeDriver.findElement(By.id('drrs')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('TestDRR');
      });
  });

  test.it('should show the correct installtion status in details', function(this: Mocha.ITestCallbackContext) {
    this.timeout(8000);
    chromeDriver.wait(until.elementLocated(By.id('status')), 3000);
    chromeDriver.findElement(By.id('status')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('Ready for beam');
      });
  });

  test.it('should show the installation status date in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('statusDate')), 3000);
    chromeDriver.findElement(By.id('statusDate')).getAttribute('value').then(
      (text: string) => {
        expect(text).to.equal(
          (tmpInstStatusDate.getMonth() + 1) + '/' +
          tmpInstStatusDate.getDate() + '/' +
          tmpInstStatusDate.getFullYear());
      });
  });

  test.it('should show the correct inst vvResultsLoc in details', () => {
    chromeDriver.wait(until.elementLocated(By.id('vvResultsLoc')), 3000);
    chromeDriver.findElement(By.id('vvResultsLoc')).getAttribute('value').then(
      (text) => {
        expect(text).to.equal('http://resultservtest.com/resultsdoc1,http://resultservtest.com/resultdoc2');
      });
  });

  test.describe('Cancel from new sw goes back to list', () => {
    // test cancel from new sw record foes back to the mail search screen
    test.it('should show new page with username on logout button', function(this: Mocha.ITestCallbackContext) {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + '#/new');
      chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
      chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
        props.test.username.toUpperCase()), 5000);
    });

    test.it('should show the new sw record title and click cancel', () => {
      chromeDriver.wait(until.titleIs('SWDB - New'), 5000);
      chromeDriver.wait(until.elementLocated(By.id('cancelBtn')), 5000);
      chromeDriver.findElement(By.id('cancelBtn')).click();
    });

    test.it('should show list page', () => {
      chromeDriver.wait(until.titleIs('SWDB - List'), 5000);
    });
  });

  test.describe('Cancel from sw update goes back to details', () => {
    // Test cancel from sw update goes back to the appropriate detauils screen
    // find the created record
    test.it('should find a record', function(this: Mocha.ITestCallbackContext) {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + '#/list');
      chromeDriver.wait(until.elementLocated(By.id('swNameSrch')), 8000)
        .sendKeys('UserRecord');
      chromeDriver.wait(until.elementLocated(By.id('versionSrch')), 8000)
        .sendKeys('Test version');
      chromeDriver.wait(until.elementLocated(By.linkText('Test UserRecord')),
        8000);
    });

    // find the created record and click update-cancel and back to details
    test.it('should show record details after cancel update', function(this: Mocha.ITestCallbackContext) {
      this.timeout(10000);
      chromeDriver.wait(until.elementLocated(By.linkText('Test UserRecord')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Details'), 5000);
      chromeDriver.wait(until.elementLocated(By.id('updateBtn')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Update'), 5000);
      chromeDriver.wait(until.elementLocated(By.id('cancelBtn')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Details'), 5000);
      chromeDriver.getCurrentUrl().then((currUrl) => {
        const newid = currUrl.split('/').pop();
        expect(newid).to.equal(id);
      });
    });
  });



  test.describe('Cancel from new installation goes back to list', () => {
    // test cancel from new sw record foes back to the mail search screen
    test.it('should show new installation page with username on logout button',
      function(this: Mocha.ITestCallbackContext) {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + '#/inst/new');
      chromeDriver.wait(until.elementLocated(By.id('usrBtn')), 5000);
      chromeDriver.wait(until.elementTextContains(chromeDriver.findElement(By.id('usrBtn')),
        props.test.username.toUpperCase()), 5000);
    });

    test.it('should show the new sw record title and click cancel', () => {
      chromeDriver.wait(until.titleIs('SWDB - New Installation'), 5000);
      chromeDriver.wait(until.elementLocated(By.id('cancelBtn')), 5000);
      chromeDriver.findElement(By.id('cancelBtn')).click();
    });

    test.it('should show list page', () => {
      chromeDriver.wait(until.titleIs('SWDB - Installations List'), 5000);
    });
  });

  test.describe('Cancel from installation update goes back to details', () => {
    // Test cancel from sw update goes back to the appropriate detauils screen
    // find the created record
    test.it('should find installation record', function(this: Mocha.ITestCallbackContext) {
      this.timeout(8000);
      chromeDriver.get(props.webUrl + '#/inst/list');
      chromeDriver.wait(until.elementLocated(By.id('hostSrch')), 8000)
        .sendKeys('testHost1');
    });

    // find the created record and click update-cancel and back to details
    test.it('should show record details after cancel update', function(this: Mocha.ITestCallbackContext) {
      this.timeout(10000);
      chromeDriver.wait(until.elementLocated(By.linkText('testHost1')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Installation Details'), 5000);
      chromeDriver.getCurrentUrl().then((currUrl) => {
        id = currUrl.split('/').pop();
      });
      chromeDriver.wait(until.elementLocated(By.id('updateBtn')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Update Installation'), 5000);
      chromeDriver.wait(until.elementLocated(By.id('cancelBtn')),
        8000).click();
      chromeDriver.wait(until.titleIs('SWDB - Installation Details'), 5000);
      chromeDriver.getCurrentUrl().then((currUrl) => {
        const newid = currUrl.split('/').pop();
        expect(newid).to.equal(id);
      });
    });
  });
});
