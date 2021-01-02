const { app, serverless } = require("universal-mean-api");

// console.log(process.env);

module.exports.handler = serverless(app);