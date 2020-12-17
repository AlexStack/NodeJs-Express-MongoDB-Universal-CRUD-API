const API_CONFIG = require("../config/api.config");
const db = require("../models");
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    const apiRoute = req._parsedUrl.pathname.replace('/' + API_CONFIG.API_BASE, '');
    const apiSchema = API_CONFIG.API_SCHEMAS.find(item => item.apiRoute == apiRoute.split('/')[0]);

    let shouldPassAuth = false;
    if ( API_CONFIG.ENABLE_AUTH ) {
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
        // pass auth if writeRules.ignoreCreateAuth & no req.body.userId
        // allow anonymous create/add item
        // require login if there is a req.body.userId for security reason
        if (req.method == 'POST' && apiSchema && apiSchema.writeRules && apiSchema.writeRules.ignoreCreateAuth && !req.body[API_CONFIG.FIELD_USER_ID]) {
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

    if ( authorization ){
        // set req.currentUser even shouldPassAuth = true 
        jwt.verify(
            authorization.replace('Bearer ', ''), 
            API_CONFIG.JWT_SECRET, 
            async (err, currentUser) => {
            if ( err) {
                if (shouldPassAuth){
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

    
    

    // if (!API_CONFIG.ENABLE_AUTH || shouldPassAuth) {
    //     next();
    // } else {

    //     const { authorization } = req.headers;
    //     if (!authorization) {
    //         return res.status(401).send({
    //             error: "Please login first!"
    //         })
    //     }

    //     const accessToken = authorization.replace('Bearer ', '');
    //     jwt.verify(accessToken, API_CONFIG.JWT_SECRET, async (err, currentUser) => {
    //         if (err) {
    //             return res.status(401).send({
    //                 error: "Please login first! Wrong token: " + accessToken
    //             })
    //         } else {
    //             console.log('checkAuth currentUser', currentUser.id, currentUser.firstName, currentUser.role);
    //         }
    //         req.currentUser = currentUser;
    //         next();
    //     })
    // }

}