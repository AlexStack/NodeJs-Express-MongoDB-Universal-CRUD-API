const { app, serverless } = require("./app/services/universal.app");

module.exports.handler = serverless(app);