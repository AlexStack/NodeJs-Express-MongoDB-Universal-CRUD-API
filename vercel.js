const { app, API_CONFIG } = require("./app/express/universal.app");

// module.exports = serverless(app);
app.listen(API_CONFIG.PORT, () => {
    console.log(`Server is running on port ${API_CONFIG.PORT}.`);
});
