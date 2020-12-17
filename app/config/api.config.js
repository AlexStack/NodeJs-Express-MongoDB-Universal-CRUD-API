const fs = require("fs");
const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

// try to load .env if not serverless
const envFile = __dirname + '/../../.env';
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
            name: String,
            email: {
                type: String,
                required: true,
                select: true,
            },
            password: {
                type: String,
                required: true,
                select: false,
            },
            confirmPassword: {
                type: String,
                select: false,
            },
            role: String,
            firstName: String,
            lastName: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name"],
        "selectFields": "-email -firebaseUid",
        "aggregatePipeline": [
            {
                "$addFields":
                    { id: "$_id" }
            },
            {
                "$project":
                    { password: 0, confirmPassword: 0, email2: 0, "pets2.createdAt": 0, __v: 0, _id: 0 }
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
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "content"],
        // "writeRules": { "checkOwner": true },
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
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content", "tags"],
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
        "mongooseOption": { timestamps: true, strict: false },
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
            name: String,
            content: String,
            productId: String,
            status: String,
            category: String,
            storyId: String,
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "content"],
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

module.exports.FIREBASE_DB_URL = 'https://pet-story-react.firebaseio.com';
module.exports.FIREBASE_SDK_KEY = {
    "type": "service_account",
    "project_id": "pet-story-react",
    "private_key_id": "ed900053feddcb6e4542ed44e1807dfb5c328156",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYTQsgkkAeoCP3\najRrE5hIvTGFQMSzRbUAIUTUD6ZCaqv/oaeivshf9Qple5I86vqMes/k/VMz3Hcp\nvJE6tP+O8d+MVSAIevm0eKzK0p5me8AZbnEpRpWB3JDAbk97SboHwWDdZxSJ3g0L\nuLRx09/MmOaeyG2BwQWD4c77mpTBWTfQd4d5S52ExP2teDrUe2FNPcoYBzqmuhER\nTJx25VxsQMyciCodO4CMYuUG96sbBEtazREOuPiAmFbkMW7voMZI41w0QrFnVUKN\nIphzF57ZhtIe1PmX0pPpmNJhrtJ9fzyuAECy84G4HOx5vJyJEu7YT/SWh4aw3rIv\nLjCUC32zAgMBAAECggEABafUF56MC6xuCXxZJqIbT+rZUZXJItBzheYLtJrsKp/k\nHoxgjuuUwfN13Qo3W6nCKhX5bbXL3Ct+BVUU84rQc/zJYgsF3dVrO7zAyztXryiT\nRp5890fBZN7Nmp0TYy78CIOxgXyYHP0w8NQoEeizRoQQXv8ZtJgis0tfBfrZ4UrM\ngtf9QFAPK9bDxglSoV25TZF/y6QSWc2CHbc0+ojoE6Fv+UD686/efX3XShyY7bBo\nbyLt8l3GRhsCM7M0vkWntEBKS9th+K8Dz7y4bPZ/Ty3l2aGDOIeJHkX4rHWatYA5\nO4Wv/pIXh5TA0PQbzeWWsSzLSWO9c5KWvpkMviDZUQKBgQDPOlvAzfyuIPNMeDtt\n4LDGPaC4vMmxa0mngnQaZ1H7x4bZVvfiyvDM0elWldmjQIPu5iY+tWFJS1RnL4X8\nSpeDo8i2yXOc2pEQFWqz6QNGrVlzRlFTVzFfZj5KolM3WNobpkP07+bVqpEH/jIE\nNpZezw+4/nhS2YzvoJBcdUoGywKBgQC8JUqBhuErf/JpjwaFoWO6hHdw9dmj9sOg\ng6lYL9irTsQpDo2ygta6UUizXnC05dOf3GbkTji52FEffj42fsZcfypv9vUJiGuB\nCVEjlQcG0uIe53LDqp4oFekR2mXTsJdghbFWOANMrdPxEPSnMEsPlm+yDgu/d4Vp\nFwkxXu4fuQKBgDAmo0M9mcTsKxxNo6F4YBrwHvROCZ+MCmU9zrSD5WzXg+Hkb1zn\nQuSUsd9ImnVwfDd6itBvXNenBUmkpUFmI6aW3AB89rwvnR1bnJuJPRWjGfHLGQKA\ndBxyqW62IRfvMV7TV18Gj2B+bYyp5/1Koc4N1t1pY5P8sN7NND4HktfZAoGBAJiq\nQaycf3VGmrLgpVAlRsD/39M/ClyrTM2gR/cQy+UlQrJ15rBkzkvczPsOtLF0k6Vx\nt+OlPQ4/4oOFcoHRmK9RWGQFpYsYsPLBVp9iu5Lj5ytgbpUqiq7IKJid+GYvMoXV\ntbHaPYMowYMoWPyYiS+ayANYtlukZhKB6Kmw99OxAoGADEAEQTkY/zNB6DmSkIfX\noNj9Aj8j3LLpzGuQBA90dpJvOhscABKsq+PxNCuRFdFSIkXfZ7AwNGm4WyoZF5a5\nzyjfiW2qL+SdFIOJRhZW28RR+VLGyp/ckHpvdK5s74yvVPBw8dn+SMJZhmAv0+CE\nORaXx8imeL1Xxaop6VEPxJo=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-19l33@pet-story-react.iam.gserviceaccount.com",
    "client_id": "101941843025319779446",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-19l33%40pet-story-react.iam.gserviceaccount.com"
}
