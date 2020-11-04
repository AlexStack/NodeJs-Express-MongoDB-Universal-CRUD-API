const fs = require("fs")
const isRunningOnLambda = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);
const envFile = __dirname + '/../../.env';

if (!isRunningOnLambda && fs.existsSync(envFile)) {
    const envResult = require('dotenv').config({ path: envFile });
    if (envResult.error) {
        throw envResult.error
    } else if (process.env.DEBUG == 'yes') {
        console.log('envResult:', envResult.parsed);
    }
}

module.exports.isRunningOnLambda;