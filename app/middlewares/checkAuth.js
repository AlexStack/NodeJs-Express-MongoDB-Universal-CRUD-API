// const API_CONFIG = require("../config/api.config");
const jwt = require('jsonwebtoken');
const helper = require("../helper/commonHelper");

const API_CONFIG = helper.getApiConfig();

module.exports = async (req, res, next) => {
    const apiRoute = req._parsedUrl.pathname.replace('/' + API_CONFIG.API_BASE, '');
    const apiSchema = API_CONFIG.API_SCHEMAS.find(item => item.apiRoute == apiRoute.split('/')[0]);

    let shouldPassAuth = false;
    if (API_CONFIG.ENABLE_AUTH) {
        if (apiRoute.indexOf('/getUserToken') != -1 || apiRoute.indexOf('/userLogin') != -1 || apiRoute.indexOf('/userRegister') != -1) {
            shouldPassAuth = true;
        }
        // by default all GET request no need check auth
        if (req.method == 'GET') {
            shouldPassAuth = true;
            if (apiSchema && apiSchema.readRules && apiSchema.readRules.checkAuth) {
                // if checkAuth = true in api schema
                shouldPassAuth = false;
            }
        }
        // pass auth if writeRules.ignoreCreateAuth & no req.body.userId
        // allow anonymous create/add item
        // require login if there is a req.body.userId for security reason
        if (req.method == 'POST' && apiSchema && apiSchema.writeRules && apiSchema.writeRules.ignoreCreateAuth && !req.body[API_CONFIG.FIELD_USER_ID]) {
            shouldPassAuth = true;
        }

        // pass auth if all req.body are SelfUpdateFields
        if (req.method == 'PUT' && helper.hasAllSelfUpdateFields(apiSchema, 'allSelfUpdateFieldsOnly', req, res)) {
            shouldPassAuth = true;
        }

        console.log('checkAuth apiRoute', apiRoute, req.method);

    } else {
        shouldPassAuth = true;
    }


    const { authorization } = req.headers;
    if (!shouldPassAuth && !authorization) {
        return res.status(401).send({
            error: "Please login first!"
        })
    }

    if (authorization && authorization.indexOf('Bearer ') != -1 && authorization.length > 100) {
        // set req.currentUser even shouldPassAuth = true 
        jwt.verify(
            authorization.replace('Bearer ', ''),
            API_CONFIG.JWT_SECRET,
            async (err, currentUser) => {
                if (err) {
                    if (shouldPassAuth) {
                        console.log('=====checkAuth err', err);
                    } else {
                        return res.status(401).send({
                            error: "Please login first! Wrong token"
                        })
                    }
                } else {
                    console.log('=====checkAuth currentUser', currentUser.id, currentUser.firstName, currentUser.role);
                }
                req.currentUser = currentUser;
                next();
            })
    } else {
        next();
    }

}