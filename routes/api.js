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
            console.log("required field(s) missing");
            console.log(`issue_title = ${issue_title}`);
            console.log(`issue_text = ${issue_text}`);
            console.log(`created_by = ${created_by}`);
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
            console.log(`checking if project ${projectname} exist...`);
            if (!projectData) {
                const newProject = new Project({ project_title: projectname });
                newProject.issues.push(newIssue);
                newProject.save((err, data) => {
                    if (err || !data) {
                        console.log(err);
                        res.send("There was an error saving in post");
                    } else {
                        console.log("Created new project, pushingnew issue");
                        res.json(newIssue);
                    }
                });
            } else {
                projectData.issues.push(newIssue);
                projectData.save((err, data) => {
                    if (err || !data) {
                        console.log(err);
                        res.send("There was an error saving in post");
                    } else {
                        console.log("Found old project, pushing new issue");
                        res.json(newIssue);
                    }
                });
            }
        });
    })

    .put(function(req, res) {
        let projectname = req.params.projectname;
        const {
            _id,
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            open,
        } = req.body;
        console.log(
            `Updating the issue from project ${projectname} with id ${_id}`
        );

        if (!_id) {
            console.log("required field(s) missing");
            console.log(`_id = ${_id}`);
            res.json({ error: "missing _id" });
            return;
        }

        if (!issue_title && !issue_text && !created_by && !status_text && !open) {
            res.json({ error: "no update field(s) sent", _id: _id });
            return;
        }

        Project.findOne({ project_title: projectname }, (err, projectData) => {
            if (err || !projectData) {
                res.json({ error: "could not update", _id: _id });
            } else {
                const issueData = projectData.issues.id(_id);
                if (!issueData) {
                    res.json({ error: "could not update", _id: _id });
                    return;
                }
                issueData.issue_title = issue_title || issueData.issue_title;
                issueData.issue_text = issue_text || issueData.issue_text;
                issueData.created_by = created_by || issueData.created_by;
                issueData.assigned_to = assigned_to || issueData.assigned_to;
                issueData.status_text = status_text || issueData.status_text;
                issueData.updated_on = new Date();
                issueData.open = open || issueData.open;
                projectData.save((err, data) => {
                    if (err || !data) {
                        console.log(`update failure: ${err}`);
                        res.json({ error: "could not update", _id: _id });
                    } else {
                        console.log(data);
                        res.json({ result: "successfully updated", _id: _id });
                    }
                });
            }
        });
    })

    .delete(function(req, res) {
        let projectname = req.params.projectname;
        const { _id } = req.body;

        if (!_id) {
            res.json({ error: "missing _id" });
            return;
        }

        Project.findOne({ project_title: projectname }, (err, projectData) => {
            if (!projectData || err) {
                res.send({ error: "could not delete", id: _id });
            } else {
                const issueData = projectData.issues.id(_id);
                if (!issueData) {
                    res.send({ error: "_id not exist", _id: _id });
                    return;
                }
                issueData.remove();

                projectData.save((err, data) => {
                    if (err || !data) {
                        res.json({ error: "could not delete", _id: issueData._id });
                    } else {
                        res.json({ result: "successfully deleted", _id: issueData._id });
                    }
                });
            }
        });
    });
};