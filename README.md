# Serverless MEAN API

- An Universal RESTful CRUD API for dynamic multiple collections of mongodb (database tables) with Node.js and Express.js, we DO NOT need to code the CRUD route/controller for each collection/table anymore.
- Designed to run on Serverless environment, such as AWS Lambda, Azure, Google, NetLify, Vercel
- MEAN API stands for MongoDB(M) + Express.js(E) + Universal CRUD API(A) + Node.js(N)
- All schemas and api routes can define in ONE file: api.config.js (No need to create mongodb collection beforehand)
- Come with a react-admin demo
- Support field search(=, %like%, full-text) and some json-sever standard parameters: \_sort, \_order, \_start, \_end, \_limit, \_like, \_gte, \_lte, id=1,2,3,4,5

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
  MEAN_API: https://meanapi.netlify.app/.netlify/functions/serverlessapi

## Config react-admin for API demo or admin dashboard

- Setup env available: MEAN_API to https://meanapi.netlify.app/.netlify/functions/serverlessapi
- Change document root directory to reactAdmin/build
