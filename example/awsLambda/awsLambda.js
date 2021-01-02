const { app, serverless, API_CONFIG } = require("universal-mean-api");

module.exports.lambdaHandler = serverless(app);
