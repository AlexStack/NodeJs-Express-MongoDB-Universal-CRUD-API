# Serverless Universal MEAN API

- An Universal RESTful CRUD API for dynamic multiple collections of mongodb (database tables) with Node.js and Express.js, we DO NOT need to code the CRUD route/controller for each collection/table anymore.
- Designed to run on Serverless environment, such as AWS Lambda, Azure, Google, NetLify, Vercel
- Universal MEAN API stands for MongoDB(M) + Express.js(E) + Universal CRUD API(A) + Node.js(N)
- All schemas and api routes can define in ONE file: api.config.js (No need to create mongodb collection beforehand)
- Come with a react-admin demo
- Support field search(=, %like%, full-text) and some json-sever standard parameters: \_sort, \_order, \_start, \_end, \_limit, \_like, \_gte, \_lte, id=1,2,3,4,5

## How to install

- npm i universal-mean-api

## How to use

- Basic example of server.js or awsLambda.js:

```JavaScript
const { app, serverless, API_CONFIG } = require("universal-mean-api");
if (API_CONFIG.IS_SERVERLESS) {
    module.exports.lambdaHandler = serverless(app);
} else {
    app.listen(app.get('config').PORT, () => {
        console.log(`API is running on port ${API_CONFIG.PORT}.`);
    });
}
```

- Basic example of api.config.js

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

## Debug locally

- cd universalApi
- nodemon awsLambda.js
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
