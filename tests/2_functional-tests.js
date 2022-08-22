const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const ObjectId = require("mongoose").Types.ObjectId;

chai.use(chaiHttp);

let deleteID;

suite("Functional Tests", function() {
    suite("Routing Tests", function() {
        test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .post("/api/issues/fcc-project")
                .type("form")
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

        test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .post("/api/issues/fcc-project")
                .type("form")
                .set("content-type", "application/json")
                .send({
                    issue_title: "Title 2",
                    issue_text: "Text 2",
                    created_by: "User 3",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, "Title 2");
                    assert.equal(res.body.issue_text, "Text 2");
                    assert.equal(res.body.created_by, "User 3");
                    done();
                });
        });

        test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .post("/api/issues/fcc-project")
                .type("form")
                .set("content_type", "application/json")
                .send({
                    status_text: "status_text",
                })
                .end((err, res) => {
                    assert.equal(res.body.error, "required field(s) missing");
                    done();
                });
        });

        test("View issues on a project: GET request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .get("/api/issues/get_issues_test_705733")
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    console.log(res.body);
                    assert.equal(res.body.length, 4);
                    done();
                });
        });

        test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .get("/api/issues/get_issues_test_705733?created_by=Alice")
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    console.log(res.body);
                    assert.equal(res.body.length, 3);
                    assert.deepEqual(
                        res.body.map((e) => e.created_by),
                        Array(3).fill("Alice")
                    );
                    done();
                });
        });

        test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .get(
                    "/api/issues/get_issues_test_705733?created_by=Alice&assigned_to=Eric"
                )
                .end((err, res) => {
                    let expectedResult = {
                        assigned_to: "Eric",
                        status_text: "",
                        open: true,
                        issue_title: "To be Filtered",
                        issue_text: "Filter Issues Test",
                        created_by: "Alice",
                        created_on: "2022-08-22T04:48:32.158Z",
                        updated_on: "2022-08-22T04:48:32.158Z",
                        _id: "63030aa0dcdc97977de1dc65",
                    };
                    assert.equal(res.status, 200);
                    console.log(res.body);
                    assert.equal(res.body.length, 1);
                    assert.deepEqual(res.body, [expectedResult]);
                    done();
                });
        });

        test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .put("/api/issues/fcc-project")
                .set("content_type", "applicaiton/json")
                .send({
                    _id: "63030a93dcdc97977de1dc4a",
                    created_by: "Kenneth",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    console.log(res.body);
                    assert.equal(res.body.result, "successfully updated");
                    done();
                });
        });

        test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .put("/api/issues/fcc-project")
                .set("content_type", "application/json")
                .send({
                    _id: "63033010e8bb87cbbdd66159",
                    created_by: "Kenneth",
                    status_text: "fxxk you axxhole",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, "successfully updated");
                    done();
                });
        });

        test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .put("/api/issues/fcc-project")
                .set("content_type", "application/json")
                .send({
                    created_by: "Kenneth",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, "missing _id");
                    done();
                });
        });

        test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .put("/api/issues/fcc-project")
                .set("content_type", "applicaiton/json")
                .send({
                    _id: "63032fcc63d0a139dca253b8",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, "no update field(s) sent");
                    done();
                });
        });

        test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .put("/api/issues/fcc-project")
                .set("content_Type", "application/json")
                .send({
                    _id: "banana",
                    created_by: "banana",
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, "could not update");
                    done();
                });
        });

        test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .delete("/api/issues/fcc-project")
                .send({ _id: deleteID })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, "successfully deleted");
                    done();
                });
        });

        test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .delete("/api/issues/fcc-project")
                .send({ _id: "banana" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, "could not delete");
                    done();
                });
        });

        test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
            chai
                .request(server)
                .delete("/api/issues/fcc-project")
                .send({})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, "missing _id");
                    done();
                });
        });
    });
});