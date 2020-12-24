const API_CONFIG = require("../config/api.config");

let helper = {};

helper.getApiRoute = (req, res) => {
    // console.log('req.route.path',req.route.path);
    // console.log(req._parsedUrl);  
    const apiRoute = req._parsedUrl.pathname.replace('/' + API_CONFIG.API_BASE, '');
    if (apiRoute.indexOf('/search') != -1) {
        return apiRoute.split('/search')[0];
    } else if (apiRoute.indexOf('/') != -1) {
        return apiRoute.split('/')[0];
    }
    return apiRoute;
}
helper.getUniversalDb = (db, req, res) => {
    // get dynamic dbModel via api router
    return db[helper.getApiRoute(req, res)];
}

helper.getApiSchema = (req, res) => {
    const apiRoute = helper.getApiRoute(req, res);
    return API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.apiRoute == apiRoute);
}



helper.hasAllSelfUpdateFields = (apiSchema, existItem, req, res) => {

    // check if all req.body fields are selfUpdateFields
    if (apiSchema.writeRules && apiSchema.writeRules.selfUpdateFields && apiSchema.writeRules.selfUpdateFields.length > 0) {
        let checkPoint = null; // not selfUpdateFields
        let noOtherFields = true;
        const fields = apiSchema.writeRules.selfUpdateFields;

        for (let [pName, pValue] of Object.entries(req.body)) {
            if (fields.includes(pName)) {
                if (existItem == 'allSelfUpdateFieldsOnly') {
                    checkPoint = true;
                    continue;
                }
                if (!existItem[pName]) {
                    if (pValue == 'increment') { pValue = 1; req.body[pName] = pValue; }
                    if (parseInt(pValue) != 1 && parseInt(pValue) != 0) {
                        checkPoint = false;
                        console.log('------selfUpdateFields checkPoint1', checkPoint)
                        return false;
                    } else {
                        checkPoint = true;
                    }
                } else if (pValue == 'increment') {
                    checkPoint = true;
                    pValue = parseInt(existItem[pName]) + 1;
                    req.body[pName] = pValue;
                    console.log('------selfUpdateFields checkPoint2 pValue=', pValue)
                } else if (pValue == 'decrement') {
                    checkPoint = true;
                    pValue = parseInt(existItem[pName]) - 1;
                    if (pValue < 0) { pValue = 0; }
                    req.body[pName] = pValue;
                    console.log('------selfUpdateFields checkPoint3', pValue)
                } else if (Math.abs(parseInt(existItem[pName]) - parseInt(pValue)) > 1) {
                    checkPoint = false;
                    console.log('------selfUpdateFields checkPoint4', checkPoint)
                    return false;
                } else {
                    checkPoint = true;
                }
            } else {
                noOtherFields = false;
            }
        }
        console.log('------selfUpdateFields checkPoint5', checkPoint)
        if (noOtherFields && checkPoint) {
            return true; // pass all check points and noOtherFields
        } else if (checkPoint === false) {
            // only === false means has invalid selfUpdateFields, NOT ===null
            // even owner itself can not change selfUpdateFields with step>1
            return false;
        }
    }
    return false;
}



helper.hasWritePermission = async (apiSchema, Universal, id, req, res) => {
    if (!API_CONFIG.ENABLE_AUTH) {
        return true;
    }
    if (!req.currentUser) {
        if (req.method == 'PUT' && helper.hasAllSelfUpdateFields(apiSchema, 'allSelfUpdateFieldsOnly', req, res)) {
            //shouldPassAuth  but no req.currentUser
        } else {
            console.log('-----currentUser no req.currentUser');
            return false;
        }
    }
    if (req.currentUser && req.currentUser.role && req.currentUser.role.toLowerCase().indexOf('admin') != -1) {
        // currentUser is admin
        console.log('=====currentUser is admin', req.currentUser.firstName);
        return true;
    } else {
        // check if must be admin
        if (apiSchema.writeRules && apiSchema.writeRules.checkAdmin) {
            return false;
        }
        // normal user, must be owner itself
        const existItem = id ? await Universal.findById(id) : req.body;
        if (!id) {
            console.log('======no id, add new item, check auth:', req.currentUser.id, existItem[API_CONFIG.FIELD_USER_ID]);
            // if no id, refactor the formData(req.body) with req.currentUser.id
            existItem[API_CONFIG.FIELD_USER_ID] = req.currentUser.id;
        }
        if (!existItem) {
            console.log(`Item not exists`);
            return false;
        }

        if (id && helper.hasAllSelfUpdateFields(apiSchema, existItem, req, res)) {
            return true;
        }
        // // if is update, check if all req.body fields are selfUpdateFields
        // if (id && apiSchema.writeRules && apiSchema.writeRules.selfUpdateFields && apiSchema.writeRules.selfUpdateFields.length > 0) {
        //   let checkPoint = null; // not selfUpdateFields
        //   let noOtherFields = true;
        //   const fields = apiSchema.writeRules.selfUpdateFields;

        //   for (let [pName, pValue] of Object.entries(req.body)) {
        //     if (fields.includes(pName)) {
        //       if (!existItem[pName]) {
        //         if (pValue == 'increment') { pValue = 1; req.body[pName] = pValue; }
        //         if (parseInt(pValue) != 1 && parseInt(pValue) != 0) {
        //           checkPoint = false;
        //           console.log('------selfUpdateFields checkPoint1', checkPoint)
        //           return false;
        //         } else {
        //           checkPoint = true;
        //         }
        //       } else if (pValue == 'increment') {
        //         checkPoint = true;
        //         pValue = parseInt(existItem[pName]) + 1;
        //         req.body[pName] = pValue;
        //         console.log('------selfUpdateFields checkPoint4', pValue)
        //       } else if (pValue == 'decrement') {
        //         checkPoint = true;
        //         pValue = parseInt(existItem[pName]) - 1;
        //         req.body[pName] = pValue;
        //         console.log('------selfUpdateFields checkPoint5', pValue)
        //       } else if (Math.abs(parseInt(existItem[pName]) - parseInt(pValue)) > 1) {
        //         checkPoint = false;
        //         console.log('------selfUpdateFields checkPoint2', checkPoint)
        //         return false;
        //       } else {
        //         checkPoint = true;
        //       }
        //     } else {
        //       noOtherFields = false;
        //     }
        //   }
        //   console.log('------selfUpdateFields checkPoint3', checkPoint)
        //   if (noOtherFields && checkPoint) {
        //     return true; // pass all check points and noOtherFields
        //   } else if (checkPoint === false) {
        //     // only === false means has invalid selfUpdateFields, NOT ===null
        //     // even owner itself can not change selfUpdateFields with step>1
        //     return false;
        //   }
        // }

        // hasOwnProperty return false if userId not defined in api.config.js
        if ((apiSchema.schema.hasOwnProperty(API_CONFIG.FIELD_USER_ID) || existItem[API_CONFIG.FIELD_USER_ID]) && req.currentUser.id != existItem[API_CONFIG.FIELD_USER_ID]) {
            console.log("It not your item, CAN NOT UPDATE ITEM WITH ID " + (id || existItem[API_CONFIG.FIELD_USER_ID]));
            return false;
        }
        // if it's user table
        if (apiSchema.apiRoute == API_CONFIG.USER_ROUTE && id && req.currentUser.id != existItem.id) {
            console.log("Sorry, You are not allowed to update item " + (id || existItem.id));
            return false;
        }
        console.log('=====currentUser id', req.currentUser.id, existItem[API_CONFIG.FIELD_USER_ID], apiSchema.schema.hasOwnProperty(API_CONFIG.FIELD_USER_ID), existItem);

        return true;
    }

}



helper.hasReadPermission = (apiSchema, Universal, existItem, req, res) => {
    let hasPermission = false;
    if (apiSchema.readRules && apiSchema.readRules.checkAuth && apiSchema.readRules.checkOwner) {
        if (!req.currentUser) {
            console.log('=====hasReadPermission, NO req.currentUser for', apiSchema.apiRoute);
            return false;
        }
        if (req.currentUser.role && req.currentUser.role.toLowerCase().indexOf('admin') != -1) {
            // currentUser is admin
            console.log('=====hasReadPermission, currentUser is admin', req.currentUser.firstName);
            hasPermission = true;
        } else {
            // normal user, must be owner itself
            if (apiSchema.schema.hasOwnProperty(API_CONFIG.FIELD_USER_ID)) {
                // const existItem = itemData === null ? req.body : itemData;
                if (existItem && existItem[API_CONFIG.FIELD_USER_ID] && req.currentUser.id == existItem[API_CONFIG.FIELD_USER_ID]) {
                    console.log('=====hasReadPermission, passed, currentUser is the owner');
                    hasPermission = true;
                }
                if (!existItem) {
                    console.log('=====hasReadPermission, item not find ');
                }
            } else {
                // property not defined in schema(api.config.js)
                hasPermission = false;
            }

        }
    } else {
        console.log('=====hasReadPermission,passed, no need to check owner for ', apiSchema.apiRoute);
        hasPermission = true;
    }
    return hasPermission;
}

helper.hasPrivateConstraint = (apiSchema, existItem, req, res) => {
    // check if the schema has isPublic field
    let hasPrivateConstraint = false;
    if (apiSchema.schema.hasOwnProperty(API_CONFIG.FIELD_PUBLIC)) {
        if (!req.currentUser) {
            console.log('hasPrivateConstraint: no req.currentUser');
            hasPrivateConstraint = true;
        } else {
            if (req.currentUser.role && req.currentUser.role.toLowerCase().indexOf('admin') != -1) {
                // is admin
            } else if (existItem[API_CONFIG.FIELD_USER_ID] && existItem[API_CONFIG.FIELD_USER_ID] == req.currentUser.id) {
                // is owner
            } else if (existItem[API_CONFIG.FIELD_TARGET_USER_ID] && existItem[API_CONFIG.FIELD_TARGET_USER_ID] == req.currentUser.id) {
                // is target user, e.g. the user who receive a comment/message/reply
            } else {
                hasPrivateConstraint = true;
            }
        }
    }
    return hasPrivateConstraint;
};



helper.decodeFirebaseIdToken = async (firebaseIdToken) => {
    const firebaseAdmin = require("firebase-admin");
    if (!firebaseIdToken || firebaseIdToken.length < 250 || !API_CONFIG.FIREBASE_DB_URL || !API_CONFIG.FIREBASE_SDK_KEY || !API_CONFIG.FIREBASE_SDK_KEY.hasOwnProperty('private_key')) {
        return false;
    }
    // !admin.apps.length ? admin.initializeApp() : admin.app();
    if (firebaseAdmin.apps.length == 0) {
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(API_CONFIG.FIREBASE_SDK_KEY),
            databaseURL: API_CONFIG.FIREBASE_DB_URL
        });
    } else {
        firebaseAdmin.app();
    }

    try {
        const decodedToken = await firebaseAdmin
            .auth()
            .verifyIdToken(firebaseIdToken);
        // .then((decodedToken) => {
        //   const uid = decodedToken.uid;
        //   console.log('firebaseIdToken decodedToken1 = ', decodedToken);
        //   return false;
        // })
        // .catch((error) => {
        //   // Handle error
        //   console.log('firebaseIdToken decodedToken error = ', error);
        // });

        // console.log('firebaseIdToken decodedToken2 = ', decodedToken);
        return decodedToken;
    } catch (err) {
        console.log('decodedToken error = ', err.message);
        return false;
    }

}



helper.getTableId = (tableName) => {
    let tableId = tableName + 'Id';
    if (tableName.slice(-3) == 'ies') {
        tableId = tableName.slice(0, -3) + 'yId';
    } else if (tableName.slice(-2) == 'es') {
        tableId = tableName.slice(0, -2) + 'Id';
    } else if (tableName.slice(-1) == 's') {
        tableId = tableName.slice(0, -1) + 'Id';
    }
    return tableId;
}

helper.getPluralName = (tableName) => {
    let pluralName = tableName + 's';
    const lastLetter = tableName.slice(-1);
    const last2Letter = tableName.slice(-2);
    if (lastLetter == 's' || lastLetter == 'x' || lastLetter == 'z' || last2Letter == 'ch' || last2Letter == 'sh') {
        pluralName = tableName + 'es';
    } else if (lastLetter == 'y' && last2Letter != 'oy' && last2Letter != 'ey') {
        pluralName = tableName.slice(0, -1) + 'ies';
    } else if (lastLetter == 'f' && last2Letter != 'of' && last2Letter != 'ef') {
        pluralName = tableName.slice(0, -1) + 'ves';
    } else if (last2Letter == 'fe') {
        pluralName = tableName.slice(0, -2) + 'ves';
    }
    return pluralName;
}

helper.getChildrenLookupOperator = (id, tableName, apiSchema, embedSchema, foreignId, hasPrivate) => {
    const foreignField = foreignId ? foreignId : helper.getTableId(apiSchema.collectionName);
    let pipeline = embedSchema.aggregatePipeline ? embedSchema.aggregatePipeline : [];
    let match = {};
    if (id) {
        // for show()
        match[foreignField] = id;
    } else {
        match['$expr'] = { "$eq": ["$" + foreignField, "$$strId"] };
    }

    if (hasPrivate) {
        match[API_CONFIG.FIELD_PUBLIC] = true;
    }

    pipeline = [{ '$match': match }, ...pipeline];
    const lookupOperator = {
        '$lookup': {
            'from': tableName,
            "let": { "strId": { $ifNull: ["$id", "id-is-null"] } }, // maybe $_id in some case
            // "let": { "strId": { $ifNull: ["$id", "$_id"] } },
            'as': tableName,
            'pipeline': pipeline
        }
    }
    //BUG: users table(users?id=5fdbf8dc098f0a77130d4123&_embed=pets,stories,comments|ownerId)  not working, but other tables works
    console.log('lookupOperator pipeline.match', match);
    return lookupOperator;
}

helper.getParentLookupOperator = (foreignField, singularTableName, pluralTableName, expandSchema) => {
    let pipeline = expandSchema.aggregatePipeline ? expandSchema.aggregatePipeline : [];
    let match = {};
    // match['_id'] = db.mongoose.Types.ObjectId(id);
    // match['$expr'] = { "$eq": ["$_id", "$$userId"] };
    // match['$expr'] = { "$eq": ["$email", "Aaron@test.com"] };
    // match['$expr'] = { "$eq": ["$_id", "5f9e18f0d9886400089675eb"] };
    // match['$expr'] = { "$eq": ["$_id", db.mongoose.Types.ObjectId("5f9e18f0d9886400089675eb")] };
    match['$expr'] = { "$eq": ["$_id", "$objId"] };

    pipeline = [
        ...[
            {
                $addFields: {
                    objId: {
                        $convert: {
                            input: "$$strId",
                            to: "objectId",
                            onError: 0
                        }
                        // "$toObjectId": "$$strId"
                    }
                }
            },
            { '$match': match }
        ],
        ...pipeline
    ];
    const lookupOperator = {
        '$lookup': {
            'from': pluralTableName,
            "let": { "strId": "$" + foreignField },
            'as': singularTableName,
            'pipeline': pipeline
        }
    }
    // console.log('getParentLookupOperator pipeline', pipeline);
    return lookupOperator;
}

module.exports = helper;