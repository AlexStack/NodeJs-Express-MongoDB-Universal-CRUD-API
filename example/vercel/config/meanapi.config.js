module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || [/localhost/, /\.test$/];
module.exports.IS_SERVERLESS = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

module.exports.API_SCHEMAS = [
    {
        "apiRoute": "posts",
        "collectionName": "posts",
        "schema": {
            title: String,
            content: String,
            category: String,
            parentId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content", "category"],
    },
    {
        "apiRoute": "comments",
        "collectionName": "comments",
        "schema": {
            title: {
                type: String,
                required: [true, 'Title is required.']
            },
            description: String,
            userId: { type: Number, required: [true, 'userId is required.'] }
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["description", "title"],
    },
    {
        "apiRoute": "users",
        "collectionName": "users",
        "schema": {
            name: String,
            dob: Date,
            age: {
                type: Number,
                min: [18, 'Too young'],
                max: 80
            }
        },
        "mongooseOption": { timestamps: false, strict: false },
        "searchFields": ["name"],
    }
];