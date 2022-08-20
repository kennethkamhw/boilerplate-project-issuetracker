"use strict";
const { Issue, Project } = require("./model.js");

module.exports = function(app) {
    app
        .route("/api/issues/:project")

    .get(function(req, res) {
        let project = req.params.project;
    })

    .post(function(req, res) {
        let project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
        if (!issue_title || !issue_text || !created_by) {
            res.json({ error: "required field(s) missing" });
            return;
        }
        const newIssue = new Issue({
            issue_title: issue_title || "",
            issue_text: issue_text || "",
            created_on: new Date(),
            updated_on: new Date(),
            created_by: created_by || "",
            open: true,
            status_text: status_text || "",
        });
        Project.findOne({ name: project }, (err, projectData) => {
            if (!projectData) {
                const newProject = new Project({ name: project });
                newProject.issues.push(newIssue);
                newProject.save().then((err, data) => {
                    if (err || !data) {
                        console.error(err);
                        res.send("There was an error saving in post");
                    } else {
                        res.json(newIssue);
                    }
                });
            }
        });
    })

    .put(function(req, res) {
        let project = req.params.project;
    })

    .delete(function(req, res) {
        let project = req.params.project;
    });
};