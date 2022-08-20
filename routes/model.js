const mongoose = require("mongoose");

// define schema
/*
  "_id": "5871dda29faedc3491ff93bb",
  "issue_title": "Fix error in posting data",
  "issue_text": "When we post data it has an error.",
  "created_on": "2017-01-08T06:35:14.240Z",
  "updated_on": "2017-01-08T06:35:14.240Z",
  "created_by": "Joe",
  "assigned_to": "Joe",
  "open": true,
  "status_text": "In QA"
*/
const issueSchema = new mongoose.Schema({
    issue_title: { type: String, require: true },
    issue_text: { type: String, require: true },
    created_on: { type: Date, require: true },
    update_on: { type: Date, require: true },
    created_by: { type: String, require: true },
    assigned_to: String,
    open: { type: Boolean, require: true },
    status_text: String,
});

const projectSchema = new mongoose.Schema({
    project_title: { type: String, require: true },
    issues: [issueSchema],
});

// create model
const Issue = mongoose.model("Issue", issueSchema);
const Project = mongoose.model("Project", projectSchema);

exports.Issue = Issue;
exports.Project = Project;