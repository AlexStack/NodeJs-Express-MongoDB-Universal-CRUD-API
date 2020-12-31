const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const resource = require("../routes/express-resource-alex");
const app = express();
const db = require("../models");
const helper = require("../helper/commonHelper")
const checkAuth = require("../middlewares/checkAuth");

// // read config file from the app
// const configFilePaths = ['/config/meanapi.config.js', '/config/api.config.js', '/meanapi.config.js', '/api.config.js'];
// let apiConfigFile = '../config/api.config.js';
// const appRootDir = process.cwd();
// for (i = 0; i < configFilePaths.length; i++) {
//     if (fs.existsSync(appRootDir + configFilePaths[i])) {
//         apiConfigFile = appRootDir + configFilePaths[i];
//         break;
//     }
// }
// console.log('apiConfigFile=' + apiConfigFile);
// const API_CONFIG = require(apiConfigFile);

const API_CONFIG = helper.getApiConfig();

if (process.env.DEBUG == 'yes') {
    console.log('API_CONFIG:', API_CONFIG);
}

let corsOptions = {
    origin: API_CONFIG.CORS_ORIGIN,
};

if (typeof API_CONFIG.CORS_ORIGIN == 'string' && API_CONFIG.CORS_ORIGIN.startsWith('[')) {
    const corsStr = API_CONFIG.CORS_ORIGIN.replace('[', '').replace(']', '').replace(/ /g, '');
    const corsAry = corsStr.split(',');
    corsOptions.origin = corsAry;
}

console.log(corsOptions);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// auto middleware
app.use(checkAuth);

// simple route for api index page
app.get("/" + API_CONFIG.API_BASE, (req, res) => {
    res.json({ message: "Welcome to Alex' Universal API(Node Express Mongodb) application" });
});


db.mongoose
    .connect(API_CONFIG.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to the database! API is ready!");
    })
    .catch((err) => {
        console.log("Cannot connect to the database with DB URI: " + API_CONFIG.DB, err);
        process.exit();
    });


/**
 * Generate RESTful API routes for each schema
 * Controller methods and routes examples:
 * index() =>   GET   /
 * create() =>   GET   /create
 * store() =>   POST  /
 * show() =>   GET   /:id
 * edit() =>   GET   /edit/:id
 * update() =>   PUT   /:id
 * patch() =>   PATCH /:id
 * destroy() =>   DEL   /:id
 */
let universal = null;
universal = require("../controllers/universal.controller");

// user auth routes
if (API_CONFIG.ENABLE_AUTH && API_CONFIG.USER_ROUTE) {
    app.post("/" + API_CONFIG.API_BASE + API_CONFIG.USER_ROUTE + "/getUserToken", (req, res, next) => {
        universal.getUserToken(req, res, next);
    });

}



// other universal routes
API_CONFIG.API_SCHEMAS.forEach(apiSchema => {
    // universal = require("../controllers/universal.controller");
    app.resource(API_CONFIG.API_BASE + apiSchema.apiRoute, universal);
    app.get("/" + API_CONFIG.API_BASE + apiSchema.apiRoute + "/search/:keyword", (req, res, next) => {
        universal.search(req, res);
    });
});



app.set('config', API_CONFIG);

module.exports.db = db;
module.exports.app = app;
module.exports.serverless = serverless;
module.exports.API_CONFIG = API_CONFIG;

