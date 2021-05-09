const fs = require("fs");
const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

// try to load .env if not serverless
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
module.exports.JWT_SECRET = process.env.JWT_SECRET || 'Ki8H1-JWT-U&HJs92dj2.d32slU&dk2+petStory' + this.DB;

/**
 * 
 * MongoDB collection name: plural camelCase, e.g. pets, stories, users, user_story, pet_story
 * MongoDB field/column name: singular camelCase (keep same as javascript variable convention)
 * 
 * API Route: plural camelCase
 * Use plural route name convention instead of singular
 * Note: controller file name still use singular
 * Ref: https://github.com/alexeymezenin/laravel-best-practices#follow-laravel-naming-conventions
 * Ref: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-1-basic-coding-standard.md
 * Ref: https://www.php-fig.org/psr/psr-2/
 * Ref: https://www.restapitutorial.com/lessons/restfulresourcenaming.html
 * 
 */


module.exports.API_SCHEMAS = [
    {
        "apiRoute": "server4",
        "collectionName": "table4",
        "schema": {
            name: String,
            description: String,
            type: String,
            gender: String,
            dob: Date,
            userId: { type: Number, required: [true, 'userId is required.'] }
        },
        "mongooseOption": { timestamps: true },
        "searchFields": ["name", "description", "type"],
    },
    {
        "apiRoute": "test4",
        "collectionName": "test4",
        "schema": {
            title: {
                type: String,
                required: [true, 'Title is required.'],
                unique: true,
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
        "apiRoute": "test5",
        "collectionName": "test5",
        "schema": {
            address: String,
            description: String
        },
        "mongooseOption": { timestamps: false, strict: true },
        "searchFields": ["address"],
    },
    /**
    * "collectionName": "users"
    */
    {
        "apiRoute": "users",
        "collectionName": "users",
        "schema": {

            email: {
                type: String,
                required: true,
                select: true,
            },
            password: {
                type: String,
                required: true,
                select: true,
            },
            confirmPassword: {
                type: String,
                select: false,
            },
            role: String,
            firstName: String,
            lastName: String,
            username: String,
            viewNum: Number,
            likeNum: Number,
            commentNum: Number,
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name"],
        // "selectFields": "-email -firebaseUid",
        "writeRules": { "ignoreCreateAuth": true, "selfUpdateFields": ["viewNum", "likeNum", "commentNum"] }, // allow register without check auth
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { password: 0, confirmPassword: 0, email2: 0, "pets2.createdAt": 0, __v: 0, _id: 0, firebaseUid: 0, accessToken: 0 }
            }
        ]
    },
    /**
     * "collectionName": "pets"
     */
    {
        "apiRoute": "pets",
        "collectionName": "pets",
        "schema": {
            name: String,
            species: String,
            gender: String,
            type: String,
            content: String,
            priority: Number,
            editorChoice: Number,
            viewNum: Number,
            likeNum: Number,
            commentNum: Number,
            storyNum: Number,
            dob: Date,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "content"],
        "writeRules": { "selfUpdateFields": ["viewNum", "likeNum", "commentNum", "storyNum"] },
        // "readRules": { "checkAuth": true, "checkOwner": false },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
    * "collectionName": "stories"
    */
    {
        "apiRoute": "stories",
        "collectionName": "stories",
        "schema": {
            title: String,
            content: String,
            species: String,
            tags: String,
            // isPublic: Boolean,
            priority: Number,
            editorChoice: Number,
            viewNum: Number,
            likeNum: Number,
            commentNum: Number,
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content", "tags"],
        // "readRules": { "checkAuth": true, "checkOwner": false },
        "writeRules": { "selfUpdateFields": ["viewNum", "likeNum", "commentNum"] },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
    * "collectionName": "files"
    */
    {
        "apiRoute": "files",
        "collectionName": "files",
        "schema": {
            title: String,
            content: String,
            type: String, // image, video, other file type
            url: String,
            priority: Number,
            editorChoice: Number,
            storyId: String,
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content"],
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
    * "collectionName": "species"
    */
    {
        "apiRoute": "species",
        "collectionName": "species",
        "schema": {
            name: String,
            content: String,
            mainImageUrl: String,
            editorChoice: Number,
            priority: Number
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content"],
        "writeRules": { "checkAdmin": true },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
    * "collectionName": "comments"
    */
    {
        "apiRoute": "comments",
        "collectionName": "comments",
        "schema": {
            title: String,
            content: String,
            category: String, // petProfile, petStory, petOwner
            parentId: String,
            priority: Number,
            editorChoice: Number,
            isPublic: Boolean,
            storyId: String,
            petId: String,
            ownerId: String,
            userId: String,
            nickname: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content"],
        "writeRules": { "ignoreCreateAuth": true },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
    * "collectionName": "likes"
    */
    {
        "apiRoute": "likes",
        "collectionName": "likes",
        "schema": {
            type: String, // thumb up, heart, sad, cry, lol, surprise
            targetId: String, // target item id 
            category: String, // petProfile, petStory, petOwner, comment
            userId: String,
            appId: String // app unique id
        },
        "mongooseOption": { timestamps: true, strict: true },
        "searchFields": ["type", "category"],
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
     * "collectionName": "orders"
     * Test readRules, only owner itself can view/edit
     */
    {
        "apiRoute": "orders",
        "collectionName": "orders",
        "schema": {
            userId: String,
            productName: String,
            productId: String,
            productPrice: Number,
            orderAmount: Number,
            orderStatus: String,
            paymentStatus: String,
            name: String,
            contact: String,
            note: String,
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "note", "contact", "productTitle"],
        "writeRules": { "checkOwner": true },
        "readRules": { "checkAuth": true, "checkOwner": true },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
    /**
     * "collectionName": "favorites"
     * Test readRules, only owner itself can view/edit
     */
    {
        "apiRoute": "favorites",
        "collectionName": "favorites",
        "schema": {
            userId: String,
            productId: String,
            rate: Number,
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["userId", "productId"],
        "writeRules": { "checkOwner": false },
        "readRules": { "checkAuth": false, "checkOwner": true },
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { __v: 0, _id: 0 }
            }
        ]
    },
];
// ENABLE_AUTH=true, all edit/delete/add has to be the owner or admin
// ENABLE_AUTH=false, test & debug mode, everyone can edit/delete
module.exports.ENABLE_AUTH = true;

// user table api endpoint route
module.exports.USER_ROUTE = 'users';

// the foreign key id field in other tables refers to user id
module.exports.FIELD_USER_ID = 'userId';
module.exports.FIELD_PUBLIC = 'isPublic';
module.exports.FIELD_TARGET_USER_ID = 'ownerId';
module.exports.FIELD_PASSWORD = 'password';

module.exports.FIREBASE_DB_URL = 'https://pet-story-react.firebaseio.com';

module.exports.FIREBASE_SDK_KEY = process.env.FIREBASE_SDK_KEY && JSON.parse(process.env.FIREBASE_SDK_KEY) || 'please-set-FIREBASE_SDK_KEY-first';