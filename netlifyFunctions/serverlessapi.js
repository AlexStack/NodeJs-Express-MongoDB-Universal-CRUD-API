const { app } = require("../app/services/universal.app");

module.exports.handler = serverless(app);