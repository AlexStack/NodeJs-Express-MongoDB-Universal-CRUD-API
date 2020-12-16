const API_CONFIG = require("../config/api.config");
const db = require("../models");
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    const apiRoute = req._parsedUrl.pathname.replace('/' + API_CONFIG.API_BASE, '');
    const apiSchema = API_CONFIG.API_SCHEMAS.find(item => item.apiRoute == apiRoute);

    let shouldPassAuth = false;
    if (apiRoute.indexOf('/getUserToken') != -1) {
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

    console.log('checkAuth apiRoute', apiRoute, req.method);

    if (!API_CONFIG.ENABLE_AUTH || shouldPassAuth) {
        next();
    } else {


        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).send({
                error: "Please login first!"
            })
        }

        const accessToken = authorization.replace('Bearer ', '');
        jwt.verify(accessToken, API_CONFIG.JWT_SECRET, async (err, currentUser) => {
            if (err) {
                return res.status(401).send({
                    error: "Please login first! Wrong token: " + accessToken
                })
            } else {
                console.log('checkAuth currentUser', currentUser.id, currentUser.firstName, currentUser.role);
            }
            req.currentUser = currentUser;
            next();
        })
    }

}