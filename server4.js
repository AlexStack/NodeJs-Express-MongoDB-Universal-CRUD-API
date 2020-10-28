const envResult = require('dotenv').config({ path: '.env' });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const resource = require("./app/routes/express-resource-alex");
const API_CONFIG = require("./app/config/api.config");
const app = express();

const isRunningOnLambda = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);
console.log(isRunningOnLambda,isRunningOnLambda);

if (envResult.error) {
    throw envResult.error
} else {
    // console.log(envResult.parsed);
}

var corsOptions = {
  origin: API_CONFIG.CORS_ORIGIN,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route for api index page
app.get("/"+API_CONFIG.API_BASE, (req, res) => {
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
  app.get("/"+API_CONFIG.API_BASE + apiSchema.apiRoute + "/search/:keyword", (req, res, next) => {
    universal.search(req, res);
  });  
});


app.listen(API_CONFIG.PORT, () => {
  console.log(`Server4 is running on port ${API_CONFIG.PORT}.`);
});
