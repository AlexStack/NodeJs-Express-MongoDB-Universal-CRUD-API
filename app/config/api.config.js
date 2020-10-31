module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

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
    {
        "apiRoute": "user",
        "collectionName": "users",
        "schema": {
            name: String,
            email: String,
            password: String,
            role: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name"],
    },
    {
        "apiRoute": "pet",
        "collectionName": "pets",
        "schema": {
            name: String,
            species: String,
            gender: String,
            type: String,
            detail: String,
            priority: Number,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["name", "description"],
    },
    {
        "apiRoute": "story",
        "collectionName": "stories",
        "schema": {
            title: String,
            content: String,
            tags: String,
            public: Boolean,
            priority: Number,
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "content", "tags"],
    },
    {
        "apiRoute": "file",
        "collectionName": "files",
        "schema": {
            title: String,
            description: String,
            type: String, // image, video, other file type
            url: String,
            priority: Number,
            storyId: String,
            petId: String,
            userId: String
        },
        "mongooseOption": { timestamps: true, strict: false },
        "searchFields": ["title", "description"],
    }
]