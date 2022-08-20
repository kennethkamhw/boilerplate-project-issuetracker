"use strict";
const { Issue, Project } = require("./model.js");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = function(app) {
    app
        .route("/api/issues/:projectname")

    .get(function(req, res) {
        let projectname = req.params.projectname;
        const {
            _id,
            open,
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
        } = req.query;

        console.log(
            `starting to aggregate the data, req.query = ${JSON.stringify(
          req.query
        )}`
        );

        Project.aggregate([
            { $match: { project_title: projectname } },
            { $unwind: "$issues" },
            _id != undefined ?
            { $match: { "issues._id": ObjectId(_id) } } :
            { $match: {} },
            open != undefined ?
            { $match: { "issues.open": open === "true" } } :
            { $match: {} },
            issue_title != undefined ?
            { $match: { "issues.issue_title": issue_title } } :
            { $match: {} },
            issue_text != undefined ?
            { $match: { "issues.issue_text": issue_text } } :
            { $match: {} },
            created_by != undefined ?
            { $match: { "issues.created_by": created_by } } :
            { $match: {} },
            assigned_to != undefined ?
            { $match: { "issues.assigned_to": assigned_to } } :
            { $match: {} },
            status_text != undefined ?
            { $match: { "issues.status_text": status_text } } :
            { $match: {} },
        ]).exec((err, data) => {
            if (!data) {
                console.log("no data found in database...");
                res.json([]);
            } else {
                res.json(data.map((e) => e.issues));
            }
        });
    })

    .post(function(req, res) {
        let projectname = req.params.projectname;
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
            assigned_to: assigned_to || "",
        });

        Project.findOne({ project_title: projectname }, (err, projectData) => {
            console.log(`finding one project: ${projectname}`);
            if (!projectData) {
                const newProject = new Project({ project_title: projectname });
                newProject.issues.push(newIssue);
                newProject.save().then((err, data) => {
                    if (err || !data) {
                        console.error(err);
                        res.send("There was an error saving in post");
                    } else {
                        res.json(newIssue);
                    }
                });
            } else {
                projectData.issues.push(newIssue);
                projectData.save((err, data) => {
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