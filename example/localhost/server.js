const { app, API_CONFIG } = require("universal-mean-api");

app.listen(API_CONFIG.PORT, () => {
    console.log(`API is running on port ${API_CONFIG.PORT}.`);
});
