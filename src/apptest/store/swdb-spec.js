var app = require("../../app/server");
var expect = require("chai").expect;
var supertest = require("../../../node_modules/supertest")(app);
var tools = require("../../app/lib/swdblib");
var Be = require('../../app/lib/Db');
let be = new Be.Db();

let TestTools = require('./TestTools');
let testTools = new TestTools.TestTools();

var expect2 = require("../../../node_modules/expect");
var XMLHttpRequest = require("../../../node_modules/xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
var path = require('path');
const exec = require('child_process').exec;
const circJSON = require('../../../node_modules/circular-json');

let CommonTools = require('../../app/lib/CommonTools');
let ctools = new CommonTools.CommonTools();
let props = {};
props = ctools.getConfiguration();

var testLogin = function(request, done) {
  //console.log('Login start');
  supertest
  .get("/login?username=testuser&password=testuserpasswd")
  .send(testAcct)
  .expect(200)
  .end(function(err,res){
    //console.log('Login complete');
    agent.saveCookies(res);
    done();
  });
};

// clear the test collection before and after tests suite
before(function(done) {
    console.log("Starting swdb-spec");
    this.timeout(5000);
    testTools.loadTestCollectionsStandard(done);
});

after(function(done) {
    // clear the test collection
    testTools.clearTestCollections(done);
});

var Cookies;
//
describe("app", function() {
  before("login as test user", function(done){
    supertest
    .get("/testlogin?username=testuser&password=testuserpasswd")
    .expect(200)
    .end(function(err,res){
      Cookies = res.headers['set-cookie'].pop().split(';')[0];
      //console.log('Login complete. Cookie: '+Cookies);
      done();
    });
  });

  // web facing tests
  //
  it("Respond with welcome", function(done) {
    supertest
    .get("/")
    .expect(200)
    .end(function(err, res){
      expect(res.res.text).to.match(/SWDB \(Prototype Interface\)/);
      done(err);
    });
  });
  it("Returns all sw records", function(done) {
    supertest
    .get("/api/v1/swdb/")
    .expect(200)
    .end(function(err, res){
      expect(res.text).to.match(/\[*\]/);
      done();
    });
  });
  it("Post a new record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
      .send({swName: "Test Record", owner: "Owner 1000", engineer: "Engineer 1000", levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1000"})
    .expect(201)
    .end(done);
  });

  it("Errors posting a bad swName", function(done) {
    supertest
      .post("/api/v1/swdb/")
      .send({swName: "Bogus Test Record", owner: "Owner 1000", engineer: "Engineer 1000", levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1000"})
      .set("Accept", "application/json")
      .set('Cookie', [Cookies])
      .expect(400)
      .end(function(err, res){
        expect(res.text).to.match(/Software name must be in the software name list/);
        done();
      });
  });

  it("Errors posting a duplicate new record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "Test Record", owner: "Owner 1000", engineer: "Engineer 1000",levelOfCare: "LOW", status: "DEVEL", statusDate: "1/1/1970"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(500)
    .expect('There was a duplicate key error')
    .end(function(err,res) {
      done();
    });
  });

  it("Post a new record Test Record2", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "Test Record2", owner: "Owner 1002", engineer: "Engineer 1002",levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id:Test Record", function(done) {
      //var origId = tools.getIdFromSwName("test1000");
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id:Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("Test Record");
        expect(res.body._id).to.match(/.{24}/);
        expect(res.body.__v).to.match(/\d+/);
        done();
      });
    });
  });

  it("Post a new record Desc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "Desc Test Record", owner: "Owner 1002", engineer: "Engineer 1002",levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for Desc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: Desc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="Desc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: Desc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("Desc Test Record");
        expect(res.body._id).to.match(/.{24}/);
        expect(res.body.__v).to.match(/\d+/);
        done();
      });
    });
  });

  it("Post a new record Engineer Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "Engineer Test Record", owner: "Owner 1002", engineer: "Any Engineer",  levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for Engineer Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: Engineer Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="Engineer Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: Engineer Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("Engineer Test Record");
        expect(res.body.engineer).to.equal("Any Engineer");
        expect(res.body._id).to.match(/.{24}/);
        expect(res.body.__v).to.match(/\d+/);
        done();
      });
    });
  });

  it("Post a new record versionControlLoc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "versionControlLoc Test Record", owner: "versioControlLoc Test Owner", engineer: "Test Engineer", versionControlLoc: "http://www.somehost/some-path/some-file", levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for versionControlLoc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: versionControlLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="versionControlLoc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: versionControlLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("versionControlLoc Test Record");
        expect(res.body.versionControlLoc).to.equal("http://www.somehost/some-path/some-file");
        done();
      });
    });
  });

  it("Post a new record designDescDocLoc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "designDescDocLoc Test Record", owner: "designDescDocLoc Test Owner", engineer: "Test Engineer", designDescDocLoc: "http://www.somehost/some-path/some-file", levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for designDescDocLoc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: designDescDocLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="designDescDocLoc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: designDescDocLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("designDescDocLoc Test Record");
        expect(res.body.designDescDocLoc).to.equal("http://www.somehost/some-path/some-file");
        done();
      });
    });
  });

  it("Post a new record descDocLoc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "descDocLoc Test Record", owner: "descDocLoc Test Owner", engineer: "Test Engineer", descDocLoc: "http://www.somehost/some-path/some-file", levelOfCare: "LOW", status: "DEVEL", statusDate: "date 1002"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for descDocLoc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: descDocLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="descDocLoc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: descDocLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("descDocLoc Test Record");
        expect(res.body.descDocLoc).to.equal("http://www.somehost/some-path/some-file");
        done();
      });
    });
  });

  it("Post a new record recertDate Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "recertDate Test Record", owner: "recertDate Test Owner", engineer: "Test Engineer", recertDate: "April 20, 2016", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for recertDate Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: recertDate Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="recertDate Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: recertDate Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("recertDate Test Record");
        expect(res.body.recertDate).to.equal("2016-04-20T07:00:00.000Z");
        done();
      });
    });
  });

  it("Post a new record vvProcLoc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "vvProcLoc Test Record", owner: "vvProcLoc Test Owner", engineer: "Test Engineer", vvProcLoc: "http://www.somehost/some-path/some-file", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for vvProcLoc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: vvProcLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="vvProcLoc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: vvProcLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("vvProcLoc Test Record");
        expect(res.body.vvProcLoc).to.equal("http://www.somehost/some-path/some-file");
        done();
      });
    });
  });

  it("Post a new record vvResultsLoc Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "vvResultsLoc Test Record", owner: "vvResultsLoc Test Owner", engineer: "Test Engineer", vvResultsLoc: "http://www.somehost/some-path/some-file2", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for vvResultsLoc Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: vvResultsLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="vvResultsLoc Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: vvResultsLoc Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("vvResultsLoc Test Record");
        expect(res.body.vvResultsLoc).to.equal("http://www.somehost/some-path/some-file2");
        done();
      });
    });
  });

  it("Post a new record branch Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "branch Test Record", owner: "branch Test Owner", engineer: "Test Engineer", branch: "New branch", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for branch Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID record id: branch Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="branch Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: branch Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("branch Test Record");
        expect(res.body.branch).to.equal("New branch");
        done();
      });
    });
  });

  it("Post a new record versionControl Test Record", function(done) {
    supertest
      .post("/api/v1/swdb/")
    .send({swName: "versionControl Test Record", owner: "versionControl Test Owner", engineer: "Test Engineer", versionControl: "Git", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for versionControl Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID versionControl id: branch Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="versionControl Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: versionControl Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("versionControl Test Record");
        expect(res.body.versionControl).to.equal("Git");
        done();
      });
    });
  });

  it("Post a new record previous Test Record", function(done) {
    supertest
    .post("/api/v1/swdb/")
    .send({swName: "previous Test Record", owner: "previous Test Owner", engineer: "Test Engineer", previous: "test-reference", levelOfCare: "LOW", status: "DEVEL", statusDate: "0"})
    .set("Accept", "application/json")
    .set('Cookie', [Cookies])
    .expect(201)
    .end(done);
  });

  describe('get id for previous Test Record', function() {
    var wrapper = {origId:null};
    before("Get ID previous id: branch Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="previous Test Record") wrapper.origId=res[i]._id;
        }
        done();
      });
    });

    it("Returns test record id: previous Test Record", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        expect(res.body.swName).to.equal("previous Test Record");
        expect(res.body.previous).to.equal("test-reference");
        done();
      });
    });
  });


  describe('get id for Test Record2', function() {
    var wrapper = {origId:null};
    before("Get ID record id:Test Record2", function(done) {
      supertest
      .get("/api/v1/swdb/")
      .expect(200)
      //var origId = tools.getIdFromSwName("test1000");
      .end(function(err,res){
        res=JSON.parse(res.text);
        for (var i=0, iLen=res.length; i<iLen; i++){
          if (res[i].swName=="Test Record2"){
            wrapper.origId=res[i]._id;
          }
        }
        done();
      });
    });

    it("Can update a record via PUT swName id:Test Record3", function(done) {
      supertest
      .put("/api/v1/swdb/"+wrapper.origId)
      .send({swName: "Test Record3"})
    .set('Cookie', [Cookies])
      .expect(200)
      .end(done);
    });
    it("Returns test record 1d:Test Record3", function(done) {
      supertest
      .get("/api/v1/swdb/"+wrapper.origId)
      .expect(200)
      .end(function(err, res){
        expect(res.body).to.have.property("_id");
        //expect(res.body._id).to.equal(wrapper.origId);
        expect(res.body.swName).to.equal("Test Record3");
        done();
      });
    });

    // This table lists test requests to make and the expected
    // responses.
    // {req:{msg:,url:,type:,err{status:}}
    //  res:{msg:,url:,type:,err{status:}}
    //  }
    var testUpdateParams = [
      {"type": "PUT", "req": {"msg": {"swName": "Test Record4"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET", "res": {"msg": {"swName": "Test Record4"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"owner": "New test owner 1002"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"owner": "New test owner 1002"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"engineer": "New Engineer"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"engineer": "New Engineer"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"levelOfCare": "MEDIUM"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"levelOfCare": "MEDIUM"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"levelOfCare": "ERRONEOUS_VALUE"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "GET","res": {"msg": {"levelOfCare": "MEDIUM"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"levelOfCare": "SAFETY"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"levelOfCare": "SAFETY"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"status": "RDY_INSTALL"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"status": "RDY_INSTALL"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"status": "ERRONEOUS_VALUE"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "GET","res": {"msg": {"status": "RDY_INSTALL"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"statusDate": "7/7/1977"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"statusDate": "1977-07-07"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"version": "NEW test version"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"version": "NEW test version"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"branch": "NEW Branch"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"branch": "NEW Branch"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"branch": "NEW Branch name that is much too long"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"platforms": "NEW test platform"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"platforms": "NEW test platform"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"designDescDocLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"designDescDocLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"designDescDocLoc": "badhostname/some_path/some-file"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"descDocLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"descDocLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"descDocLoc": "badurl"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"vvProcLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"vvProcLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"vvProcLoc": "http:some-malformed-url"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"vvResultsLoc": "http://www.somehost/some-path/some-file3"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"vvResultsLoc": "http://www.somehost/some-path/some-file3"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"vvResultsLoc": "http:some-malformed-url"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"versionControl": "Git"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"versionControl": "Git"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"versionControl": "Erroneous RCS"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"versionControlLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"versionControlLoc": "http://www.somehost/some-path/some-file"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"recertFreq": "NEW test recert frequency"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"recertFreq": "NEW test recert frequency"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"recertStatus": "NEW test recert status"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"recertStatus": "NEW test recert status"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"recertDate": "April 21, 2017"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"recertDate": "2017-04-21T07:00:00.000Z"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"recertDate": "Not a date"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"previous": "test-reference"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"previous": "test-reference"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      {"type": "PUT","req": {"msg": {"previous": "bad reference is way to long for this"},"url": "/api/v1/swdb/", "err": {"status": 400}}},
      {"type": "PUT","req": {"msg": {"comment": "NEW test comment"},"url": "/api/v1/swdb/", "err": {"status": 200}}},
      {"type": "GET","res": {"msg": {"comment": "NEW test comment"},"url": "/api/v1/swdb/",  "err": {"status": 200}}},
      // test new swName is required, min, max
      {"type":"POST", "req": {"msg": {"owner": "test owner"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"swName","msg":"Software name is required."}'}}},
      // test nwe owner required, min, max
      {"type":"POST", "req": {"msg": {"swName": "NEW Test name"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"owner","msg":"Owner is required."}'}}},
      // test levelOfCare required, enumerated
      {"type":"POST", "req": {"msg": {"swName": "NEW Test name", "owner":"NEW OWNER"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"levelOfCare","msg":"Level of care is required."}'}}},
      {"type":"POST", "req": {"msg": {"swName": "NEW Test name", "owner":"NEW OWNER", "levelOfCare": "LOW"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"status","msg":"Status is required."}'}}},
      {"type":"POST", "req": {"msg": {"swName": "NEW Test name", "owner":"NEW OWNER", "levelOfCare": "LOW","status":"DEVEL"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"statusDate","msg":"Status date is required."}'}}},
      // test new status enumerated
      {"type":"POST", "req": {"msg": {"status": "not-enumerated"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"status","msg":"Status must be one of DEVEL,RDY_INSTALL,RDY_INT_TEST,RDY_BEAM,RETIRED","value":"not-enumerated"}'}}},
      // test new statusDate with non-date
      {"type":"POST", "req": {"msg": {"swName":"testing","owner":"test owner","levelOfCare":"LOW","status":"DEVEL","statusDate": "non-date"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"statusDate","msg":"Status date must be a date.","value":"non-date"}'}}},
      // test new version min, max
      {"type":"POST", "req": {"msg": {"version": ""}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"version","msg":"Version must be 1-30 characters."'}}},
      {"type":"POST", "req": {"msg": {"version": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"version","msg":"Version must be 1-30 characters."'}}},
      // test new platforms min, max
      {"type":"POST", "req": {"msg": {"platforms": "NEW"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"platforms","msg":"Platforms must be 4-30 characters."'}}},
      {"type":"POST", "req": {"msg": {"platforms": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"platforms","msg":"Platforms must be 4-30 characters."'}}},
      // test new versionControl min, max
      {"type":"POST", "req": {"msg": {"versionControl": "Erroneous RCS"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"versionControl","msg":"Revision control must be one of Git,AssetCentre,Filesystem,Other"'}}},
      // test new recertFreq min, max
      {"type":"POST", "req": {"msg": {"recertFreq": "N"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertFreq","msg":"Recertification frequency must be 4-30 characters."'}}},
      {"type":"POST", "req": {"msg": {"recertFreq": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertFreq","msg":"Recertification frequency must be 4-30 characters."'}}},
      // test new recertStatus min, max
      {"type":"POST", "req": {"msg": {"recertStatus": "N"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertStatus","msg":"Recertification status must be 4-30 characters."'}}},
      {"type":"POST", "req": {"msg": {"recertStatus": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertStatus","msg":"Recertification status must be 4-30 characters."'}}},

      // test update owner min, max
      {"type":"PUT", "req": {"msg": {"swName": "NEW Test name", "owner": "N"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"owner","msg":"Owner must be 2-30 characters."'}}},
      {"type":"PUT", "req": {"msg": {"swName": "NEW Test name","owner": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"owner","msg":"Owner must be 2-30 characters."'}}},
      // test update levelOfCare enumerated
      {"type":"PUT", "req": {"msg": {"levelOfCare": "not-enumerated"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"levelOfCare","msg":"Level of care must be one of NONE,LOW,MEDIUM,HIGH,SAFETY","value":"not-enumerated"}'}}},
      // test update status enumerated
      {"type":"PUT", "req": {"msg": {"status": "not-enumerated"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"status","msg":"Status must be one of DEVEL,RDY_INSTALL,RDY_INT_TEST,RDY_BEAM,RETIRED","value":"not-enumerated"}'}}},
      // test update statusDate with non-date
      {"type":"PUT", "req": {"msg": {"statusDate": "non-date"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '{"param":"statusDate","msg":"Status date must be a date.","value":"non-date"}'}}},
      // test update version min, max
      {"type":"PUT", "req": {"msg": {"version": ""}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"version","msg":"Version must be 1-30 characters."'}}},
      {"type":"PUT", "req": {"msg": {"version": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"version","msg":"Version must be 1-30 characters."'}}},
      // test update platforms min, max
      {"type":"PUT", "req": {"msg": {"platforms": "NEW"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"platforms","msg":"Platforms must be 4-30 characters."'}}},
      {"type":"PUT", "req": {"msg": {"platforms": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"platforms","msg":"Platforms must be 4-30 characters."'}}},
      // test update versionControl min, max
      {"type":"PUT", "req": {"msg": {"versionControl": "Erroneous RCS"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"versionControl","msg":"Revision control must be one of Git,AssetCentre,Filesystem,Other"'}}},
      // test update recertFreq min, max
      {"type":"PUT", "req": {"msg": {"recertFreq": "N"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertFreq","msg":"Recertification frequency must be 4-30 characters."'}}},
      {"type":"PUT", "req": {"msg": {"recertFreq": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertFreq","msg":"Recertification frequency must be 4-30 characters."'}}},
      // test update recertStatus min, max
      {"type":"PUT", "req": {"msg": {"recertStatus": "N"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertStatus","msg":"Recertification status must be 4-30 characters."'}}},
      {"type":"PUT", "req": {"msg": {"recertStatus": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"recertStatus","msg":"Recertification status must be 4-30 characters."'}}},
      // test update comment
      {"type":"PUT", "req": {"msg": {"comment": ["NE"]}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"comment","msg":"Comment must be a string"'}}},
      {"type":"PUT", "req": {"msg": {"comment": "NE"}, "url": "/api/v1/swdb/",
      "err": {"status": 200}}},
      {"type":"PUT", "req": {"msg": {"comment": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 200}}},

      // test update desc
      {"type":"PUT", "req": {"msg": {"desc": ["NE"]}, "url": "/api/v1/swdb/",
      "err": {"status": 400, "msgHas": '"param":"desc","msg":"Description must be a string"'}}},
      {"type":"PUT", "req": {"msg": {"desc": "NE"}, "url": "/api/v1/swdb/",
      "err": {"status": 200}}},
      {"type":"PUT", "req": {"msg": {"desc": "0123456789012345678901234567890"}, "url": "/api/v1/swdb/",
      "err": {"status": 200}}},
    ];

    // go through the table and check the given parameters
    testUpdateParams.forEach(function(value,i) {
      //handle PUT
      if (value.type === "PUT") {
        it(value.req.err.status+" "+value.type+" msg: "+
        JSON.stringify(JSON.stringify(value.req.msg)), function(done) {
          supertest
          .put(value.req.url+wrapper.origId)
          .send(value.req.msg)
          .set('Cookie', [Cookies])
          .end(function(err,res){
            if (value.req.err.status){
              expect(res.status).to.equal(value.req.err.status);
            }
            if (value.req.err.msgHas) {
              expect2(res.text).toMatch(value.req.err.msgHas);
            }

            done();
          });
        });
      }
      if (value.type === "POST") {
        it(value.req.err.status+" "+value.type+" "+JSON.stringify(JSON.stringify(value.req.msg)), function(done) {
          supertest
          .post(value.req.url)
          .send(value.req.msg)
          .set('Cookie', [Cookies])
          .end(function(err,res){
            if (value.req.err.status){
              expect(res.status).to.equal(value.req.err.status);
            }
            if (value.req.err.msgHas) {
              expect2(res.text).toMatch(value.req.err.msgHas);
            }
            done();
          });
        });
      }

      // handle GET
      if (value.type === "GET") {
        it(value.res.err.status+" "+JSON.stringify(value.res.msg), function(done) {
          supertest
          .get(value.res.url+wrapper.origId)
          .end(function(err, res) {
            if (value.res.err.status){
              expect(res.status).to.equal(value.res.err.status);
            }
            for (var prop in value.res.msg) {
              expect(res.body).to.have.property(prop);
              // This is to allow sloppy matching on whole objects.
              // See the npm "expect" module for more
              expect2(res.body[prop]).toMatch(value.res.msg[prop]);
            }
            done();
          });
        });
      }
    });
    it("Errors on update a nonexistent record via POST swName id:badbeef", function(done) {
      supertest
      .post("/api/v1/swdb/badbeef")
      .set('Cookie', [Cookies])
      .send({swName: "Test Record4"})
      .expect(404)
      .expect('Cannot POST /api/v1/swdb/badbeef\n')
      .end(done);
    });
    it("Errors on update a nonexistent record via PUT swName id:badbeef", function(done) {
      supertest
      .put("/api/v1/swdb/badbeef")
      .set('Cookie', [Cookies])
      .send({swName: "Test Record4"})
      .expect(500)
      .expect('Record not found')
      .end(done);
    });
    it("Errors on update a nonexistent record via PATCH swName id:badbeef", function(done) {
      supertest
      .patch("/api/v1/swdb/badbeef")
      .set('Cookie', [Cookies])
      .send({swName: "Test Record4"})
      .expect(500)
      .expect('Record not found')
      .end(done);
    });
  });
});