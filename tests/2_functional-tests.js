const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Routing Tests', function() {
    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
      chai.request(server)
        .post('/api/issues/fcc-project')
        .type('form')
        .set("content-type", "application/json")
        .send({
          issue_title: "Title 1",
          issue_text: "Text 1",
          created_by: "User 1",
          status_text: "Status Text 1",
          assigned_to: "User 2",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          deleteID = res.body._id;
          assert.equal(res.body.issue_title, "Title 1");
          assert.equal(res.body.assigned_to, "User 2");
          assert.equal(res.body.issue_text, "Text 1");
          assert.equal(res.body.status_text, "Status Text 1");
          assert.equal(res.body.created_by, "User 1");
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
      chai.request(server)
        .post('/api/issues/fcc-project')
        .type('form')
        .set("content-type", "application/json")
        .send({
          issue_title: "Title 2",
          issue_text: "Text 2",
          created_by: "User 3"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title 2");
          assert.equal(res.body.issue_text, "Text 2");
          assert.equal(res.body.created_by, "User 3");
          done();
        })
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
      chai.request(server)
        .post('/api/issues/fcc-project')
        .type('form')
        .set("content_type", "application/json")
        .send({
          status_text: "status_text"
        })
        .end((err, res) => {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        })
    })

    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
      chai.request(server)
        .get('/api/issues/fcc-project')
        .end((err, res) => {
          assert.equal(res.status, 200);
          console.log(res.body)
          assert.equal(res.body.length, 4);
          done();
        })
    })
    
  });
  
});
