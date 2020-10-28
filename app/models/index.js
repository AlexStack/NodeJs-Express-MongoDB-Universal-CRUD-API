const API_CONFIG = require("../config/api.config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise; 

const db = {};
db.mongoose = mongoose;

API_CONFIG.API_SCHEMAS.forEach(apiSchema => {
    db[apiSchema.apiRoute] = require("./universal.model.js")(mongoose, apiSchema.schema, apiSchema.mongooseOption, apiSchema.collectionName);

    // console.log(apiSchema);
});
// console.log(apiSchemas.SimpleMessage);

module.exports = db;
