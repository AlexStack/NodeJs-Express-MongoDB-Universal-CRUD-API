const { app, serverless, API_CONFIG } = require("./app/services/universal.app");

if (API_CONFIG.IS_SERVERLESS) {
    module.exports.lambdaHandler = serverless(app);
} else {
    app.listen(app.get('config').PORT, () => {
        console.log(`API is running on port ${API_CONFIG.PORT}.`);
    });
}
