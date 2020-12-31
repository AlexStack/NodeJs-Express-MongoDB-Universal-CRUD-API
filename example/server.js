const { app, serverless, API_CONFIG } = require("universal-mean-api");
if (API_CONFIG.IS_SERVERLESS) {
    module.exports.lambdaHandler = serverless(app); // handler for serverless function
} else {
    app.listen(app.get('config').PORT, () => {
        console.log(`API is running on port ${API_CONFIG.PORT}.`);
    });
}