module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || [/localhost/, /\.test$/];

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
    {
        "apiRoute": "users",
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
        "apiRoute": "pets",
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
        "apiRoute": "stories",
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
        "apiRoute": "files",
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