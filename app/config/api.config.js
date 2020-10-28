module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8083';

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
    }
]