const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const resource = require("./app/routes/express-resource-alex");
const app = express();

console.log(process.env);

const API_CONFIG = require("./app/config/api.config");

var corsOptions = {
    origin: API_CONFIG.CORS_ORIGIN,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route for api index page
app.get("/" + API_CONFIG.API_BASE, (req, res) => {
    res.json({ message: "Welcome to Alex' Universal API(Node Express Mongodb) application" });
});

const db = require("./app/models");
db.mongoose
    .connect(API_CONFIG.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch((err) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

let universal = null;
API_CONFIG.API_SCHEMAS.forEach(apiSchema => {
    universal = require("./app/controllers/universal.controller");
    app.resource(API_CONFIG.API_BASE + apiSchema.apiRoute, universal);
    app.get("/" + API_CONFIG.API_BASE + apiSchema.apiRoute + "/search/:keyword", (req, res, next) => {
        universal.search(req, res);
    });
});



module.exports.lambdaHandler = serverless(app);