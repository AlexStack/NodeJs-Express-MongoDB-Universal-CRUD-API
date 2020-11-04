const { app, serverless } = require("./app/express/universal.app");

module.exports.handler = serverless(app);