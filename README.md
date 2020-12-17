# Serverless Universal MEAN API

- An Universal RESTful CRUD API for dynamic multiple collections of mongodb (database tables) with Node.js and Express.js, we DO NOT need to code the CRUD route/controller for each collection/table anymore.
- Designed to run on Serverless environment, such as AWS Lambda, Azure, Google, NetLify, Vercel
- Universal MEAN API stands for MongoDB(M) + Express.js(E) + Universal CRUD API(A) + Node.js(N)
- All schemas and api routes can define in ONE file: api.config.js (No need to create mongodb collection beforehand)
- Come with a react-admin demo
- Support field search(=, %like%, full-text) and some json-sever standard parameters: \_sort, \_order, \_start, \_end, \_limit, \_like, \_gte, \_lte, id=1,2,3,4,5

## How to install

- npm install universal-mean-api

## How to use

- You need create 2 js files after install: server.js & meanapi.config.js
- Then run command: node server.js to see the result
- Your app file structure example:

```JavaScript
  /node_modules
  /package-lock.json
  /server.js
  /meanapi.config.js or /config/meanapi.config.js or /config/api.config.js
```

- Basic example code for server.js:

```JavaScript
const { app, serverless, API_CONFIG } = require("universal-mean-api");
if (API_CONFIG.IS_SERVERLESS) {
    module.exports.lambdaHandler = serverless(app); // handler for serverless function
} else {
    app.listen(app.get('config').PORT, () => {
        console.log(`API is running on port ${API_CONFIG.PORT}.`);
    });
}
```

- Basic example of meanapi.config.js (API variables & MongoDB schemas & routes)

```JavaScript
module.exports.DB = process.env.DB || 'please-set-database-connect-uri-first';
module.exports.API_BASE = process.env.API_BASE || 'api/';
module.exports.PORT = process.env.PORT || '8080';
module.exports.CORS_ORIGIN = process.env.CORS_ORIGIN || [/localhost/, /\.test$/];
module.exports.IS_SERVERLESS = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

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


```

## How to access the RESTful API

- Based on above example server.js & meanapi.config.js files, we can access the localhost:8080 by run command node server.js or nodemon server.js
- RESTful API endpoint for collection < tablename >: http://localhost:8080/api/< tablename >
- RESTful API endpoint for collection test1: http://localhost:8080/api/test1
- RESTful API endpoint for collection test2: http://localhost:8080/api/test2
- RESTful API endpoint for collection test3: http://localhost:8080/api/test3
- RESTful API endpoint support GET/POST/PUT/DELETE and fields search

## RESTful API CRUD routes example

```JavaScript
GET http://localhost:8080/api/test1
GET http://localhost:8080/api/test1/<id>
POST http://localhost:8080/api/test1
PUT http://localhost:8080/api/test1/<id>
PATCH http://localhost:8080/api/test1/<id>
DELETE http://localhost:8080/api/test1/<id>
```

## Field search route examples

- GET /api/test1?name_like=mean&description_like=api
- GET /api/test1?age_lgt=18&\_limit=20
- GET /api/test1?id=1&id=2&id=3
- GET /api/test1?id=1,2,3,4 or ?\_id=1,2,3,4

## Sort & order by examples

- GET /api/test1?\_sort=age&\_order=dasc&\_start=10&\_end=20&name_like=api

## Get data from relationship collections or tables

- To include children resources, add \_embed
- To include parent resource, add \_expand
- e.g. /pets/5fcd8f4a3b755f0008556057?\_expand=user,file|mainImageId&\_embed=pets,stories
- \_expand=user,file|mainImageId means get parent data from parent table users and files. it will use userId and fileId as the foreign key by default unless you set it by table|foreignKey. e.g. file|mainImageId, file is the singular table name and mainImageId is the foreignKey
- Only support the detail route at this moment, will add to the list route

## User auth check system (check if the user is the owner or admin via JWT access token)

- ENABLE_AUTH: enable user auth check system or not
- ENABLE_AUTH=true, all edit/delete/add(update/destroy/create) requests has to be the owner or admin
- ENABLE_AUTH=false, test & debug mode, everyone can view/edit/delete
- e.g. module.exports.ENABLE_AUTH = true;

- USER_ROUTE: user table api endpoint route
- e.g. module.exports.USER_ROUTE = 'users';

- FIELD_USER_ID: the foreign key id in other tables to user id
- e.g. module.exports.FIELD_USER_ID = 'userId';

- by default all GET request no need check user auth
- if we want enable auth check for a table/collection list/show GET request
- set readRules for each table/collection like below
- "readRules": { "checkAuth": true, "checkOwner": true }
- e.g. CRUD for orders table/collection, need to login first to do anything, only the owner itself can view/add/edit/delete his/her orders

- Who is admin? Set role field in users table to admin or xxxAdmin (any role value contains string "admin" will consider is an admin role)
- e.g. role=webAdmin, role=admin, role=SuperAdmin, role=Dashboard Admin
- admin has all permissions for now

## How to set admin only add/edit/delete permission

- add/edit/delete request allow owner itself by default
- if you want set admin only for some system tables, e.g. settings, categories
- Add "writeRules": { "checkAdmin": true } to the schema settings in api.config.js

## How to allow create item anonymous

- Sometimes we want allow create item anonymous. e.g. a contact us form
- Add "writeRules": { "ignoreCreateAuth": true } to the schema settings in api.config.js
- NOTE: It still requires login if there is a \_POST[userId] parameter for security reason
- edit/delete still requires owner or admin


## How to set up a private item

- Sometimes we want create item privately. e.g. something is public while others is private, or private message & public comment
- Add "isPublic: Boolean" to the schema settings in api.config.js
- Set FIELD_PUBLIC = 'isPublic' and FIELD_TARGET_USER_ID = 'ownerId' to fit your needs
- The API will check if there is a isPublic field in the schema first, then check the current user or target user is match or not
- Example 1: a story set isPublic=false, means it is private. only the owner itself can view/edit it. Other users can not event list or view it.
- Example 2: a private message sent to userA from userB, only those two users both can view the message, however, only userB can edit/delete the message.


## return data - all JSON format

- add or update request, returns the NEW item object if success
- list request, returns an array contains all item objects
- show/detail request, returns the item object if success
- delete request, the http status returns 200 if success

## Debug locally

- npm install universal-mean-api
- npx nodemon server.js (or nodemon server.js)
- cd reactAdmin
- npm start

## AWS Lambda settings

- Function js file: awsLambda.js

## Serverless function settings for NetLify

- Base directory: Empty(Not set)
- Build command: npm install && cd reactAdmin && npm install && npm run build && rm -rf node_modules
- Publish directory: reactAdmin/build
- Functions directory: netlifyFunctions
- Function js file: netlifyFunctions/serverlessapi.js
- Environment variables
  API_BASE: .netlify/functions/serverlessapi/
  DB: mongodb+srv://db-user:db-pass@cluster0.tblrm.mongodb.net/db-name?retryWrites=true&w=majority
  DEBUG: yes
  REACT_APP_MEAN_API: https://meanapi.netlify.app/.netlify/functions/serverlessapi
- Config react-admin for API demo or admin dashboard
  - Setup env available: MEAN_API to https://meanapi.netlify.app/.netlify/functions/serverlessapi
  - Change document root directory to reactAdmin/build

## Vercel

- Test many times for serverless function and failed
- Use vercel.json install of serverless function
- Demo: https://meanapi.now.sh/serverlessApi/pet
- Environment variables
  - API_BASE: serverlessApi/
  - DB: mongodb+srv://db-user:db-pass@cluster0.tblrm.mongodb.net/db-name?retryWrites=true&w=majority
  - DEBUG: yes
  - CORS_ORIGIN: https://reactadmindemo.now.sh
- Set up react-admin with another app use different domain name
  - REACT_APP_MEAN_API: https://meanapi.now.sh/serverlessApi
  - Demo: https://reactadmindemo.now.sh/
