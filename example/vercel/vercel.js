const { app, serverless, API_CONFIG } = require("universal-mean-api");

// module.exports = serverless(app);
app.listen(API_CONFIG.PORT, () => {
    console.log(`Server is running on port ${API_CONFIG.PORT}. process.cwd()=` + process.cwd());
});
