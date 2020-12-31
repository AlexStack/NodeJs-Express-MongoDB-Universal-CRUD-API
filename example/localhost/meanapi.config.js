const fs = require("fs");
const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

const envFile = process.cwd() + '/.env';
if (!isServerless && fs.existsSync(envFile)) {
    const envResult = require('dotenv').config({ path: envFile });
    if (envResult.error) {
        throw envResult.error;
    } else if (process.env.DEBUG == 'yes') {
        console.log('envResult:', envResult.parsed);
    }
}

module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || [/localhost/, /\.test$/];
module.exports.IS_SERVERLESS = isServerless;

module.exports.API_SCHEMAS = [
    {
        "apiRoute": "test1",
        "collectionName": "test1",
        "schema": {
            name: String,
            description: String,
            type: String,
            gender: String,
            dob: Date,
            userId: { type: Number, required: [true, 'userId is required.'] }
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "description", "type"],
    },
    {
        "apiRoute": "test2",
        "collectionName": "test2",
        "schema": {
            title: {
                type: String,
                required: [true, 'Title is required.']
            },
            description: String,
            age: {
                type: Number,
                min: [18, 'Too young'],
                max: 80
            }
        },
        "mongooseOption": { timestamps: true, strict: true },
        "searchFields": ["description", "title"],
    },
    {
        "apiRoute": "test3",
        "collectionName": "test3",
        "schema": {
            address: String,
            description: String
        },
        "mongooseOption": { timestamps: false, strict: false },
        "searchFields": ["address"],
    }
];