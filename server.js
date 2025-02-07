"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai").expect;
const cors = require("cors");
require("dotenv").config();
const { db } = require("./connect.js");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

let app = express();

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("");
  console.log(`Recieved Request: METHOD = ${req.method}, URL = ${req.originalUrl}`);
  next();
});

//Index page (static HTML)
app.route("/").get(function(req, res) {
    console.log("sending static HTML homepage...");
    res.sendFile(process.cwd() + "/views/index.html");
});

//Routing for API
apiRoutes(app);

//Sample front-end
app.route("/:projectname/").get(function(req, res) {
    console.log(`sending project pages for ${req.parms.projectname}...`);
    res.sendFile(process.cwd() + "/views/issue.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
    res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function() {
    console.log("Your app is listening on port " + listener.address().port);
    if (process.env.NODE_ENV === "test") {
        console.log("Running Tests...");
        setTimeout(function() {
            try {
                runner.run();
            } catch (e) {
                console.log("Tests are not valid:");
                console.error(e);
            }
        }, 3500);
    }
});

module.exports = app; //for testing