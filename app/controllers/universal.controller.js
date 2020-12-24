const API_CONFIG = require("../config/api.config");
const db = require("../models");
const jwt = require('jsonwebtoken');
const helper = require("../helper/commonHelper")

// Create and Save a new Universal
exports.store = async (req, res) => {
  const apiSchema = helper.getApiSchema(req, res);
  const Universal = helper.getUniversalDb(db, req, res);
  if (apiSchema.writeRules && apiSchema.writeRules.ignoreCreateAuth && !req.body[API_CONFIG.FIELD_USER_ID]) {
    // ignore auth check, allow create item anonymous. e.g. contact us form
  } else {
    const hasPermission = await helper.hasWritePermission(apiSchema, Universal, null, req, res);
    if (!hasPermission) {
      res.status(401).send({
        message: "User do not has the permission to create new item",
      });
      return false;
    }
  }

  const universal = new Universal(req.body);
  // Save Universal in the database
  universal
    .save(universal)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the item.",
      });
    });
};

// Retrieve all universals from the database by find()
exports.indexByFind = (req, res) => {

  // Universal = db[req.url.replace('/' + API_CONFIG.API_BASE, '')];
  const Universal = helper.getUniversalDb(db, req, res);

  // console.log('===== query', req.query)
  const apiSchema = helper.getApiSchema(req, res);
  // console.log('apiSchema=', apiSchema);

  let condition = {};
  let tempVar;
  for (paramName in req.query) {
    let paramValue = req.query[paramName];

    // Add _like to filter %keyword%, e.g. name_like=ca
    // support simple regex syntax
    // e.g.name_like=^v  name_like=n$ name_like=jack|alex  name_like=or?n
    if (paramName.indexOf('_like') != -1) {
      paramName = paramName.replace('_like', '');
      paramValue = '%' + paramValue + '%';
    }

    // Add _gte or _lte for getting a range(cannot use together yet)
    // , e.g. age_lte=60  age_gte=18
    if (paramName.indexOf('_gte') != -1) {
      paramName = paramName.replace('_gte', '');
      paramValue = '>' + paramValue;
    }
    if (paramName.indexOf('_lte') != -1) {
      paramName = paramName.replace('_lte', '');
      paramValue = '<' + paramValue;
    }

    if (paramName in apiSchema.schema) {
      if (apiSchema.schema[paramName] == String || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == String)) {
        if (paramValue.indexOf('==') === 0) {
          // e.g. title===Cat 
          // case sensitive equal match, better to set up index
          condition[paramName] = paramValue.replace('==', '');
        } else if (paramValue.substr(0, 1) == '%' && paramValue.substr(-1) == '%') {
          // e.g. title=%ca%
          // case insensitive full text match, will not use index, slow
          condition[paramName] = { $regex: new RegExp(paramValue.replace(/%/g, '')), $options: "i" };
        } else {
          // e.g. title=cat
          // case insensitive equal match, may not use the index
          // https://docs.mongodb.com/manual/reference/operator/query/regex/
          condition[paramName] = { $regex: new RegExp("^" + paramValue.toLowerCase() + "$", "i") };
        }

      } else if (apiSchema.schema[paramName] == Number || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == Number)) {
        if (paramValue.indexOf('>') === 0) {
          // e.g. age=>18
          tempVar = Number(paramValue.replace('>', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $gte: tempVar };
          }
        } else if (paramValue.indexOf('<') === 0) {
          // e.g. age=<18
          tempVar = Number(paramValue.replace('<', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $lte: tempVar };
          }
        } else if (!isNaN(paramValue)) {
          // e.g. age=18
          condition[paramName] = { $eq: paramValue };
        }
      }
    }
    // console.log(paramName, paramValue)
  }

  // find multiple ids, e.g.  ?id=1&id=2&id=3 or ?id=1,2,3,4,5
  if (req.query.id || req.query._id) {
    const originId = req.query.id ? req.query.id : req.query._id;
    const idAry = (typeof originId == 'string') ? originId.split(',') : originId;
    condition["_id"] = { "$in": idAry };
  }

  // full text search
  if (req.query.q && req.query.q.trim() != '') {
    return this.search(req, res);
  }

  console.log('find query condition:', condition);

  // Add _sort and _order (ascending order by default)
  let defaultSort = {};
  if (req.query._sort && req.query._order) {
    if (req.query._sort in apiSchema.schema) {
      defaultSort[req.query._sort] = (req.query._order == 'DESC') ? -1 : 1;
    }
  }
  if (Object.keys(defaultSort).length === 0) {
    defaultSort = { _id: -1 };
  }

  // Add _start and _end or _limit 
  let defaultSkip = 0;
  let defaultLimit = 0;
  if (req.query._start && req.query._end) {
    defaultSkip = parseInt(req.query._start);
    defaultLimit = req.query._limit ? parseInt(req.query._limit) : (parseInt(req.query._end) - parseInt(req.query._start));
  }


  let query = Universal.find(condition).sort(defaultSort);

  // only display specific fields or exclude some fields
  if (apiSchema.selectFields && apiSchema.selectFields.length > 0) {
    query.select(apiSchema.selectFields);
  }

  if (defaultSkip > 0) {
    query.skip(defaultSkip);
  }
  if (defaultLimit > 0) {
    query.limit(defaultLimit);
  }
  query.then(async (data) => {
    const totalNumber = await Universal.countDocuments(condition);
    console.log('defaultSort', defaultSort, totalNumber);
    // const totalNumber = data.length;
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("x-total-count", totalNumber);
    res.send(data);
  }).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving items.",
    });
  });
};


// Retrieve all universals from the database by aggregate()
exports.index = async (req, res) => {

  // Universal = db[req.url.replace('/' + API_CONFIG.API_BASE, '')];
  const Universal = helper.getUniversalDb(db, req, res);

  // console.log('===== query', req.query)
  const apiSchema = helper.getApiSchema(req, res);
  // console.log('apiSchema=', apiSchema);

  let condition = {};
  let tempVar;
  for (paramName in req.query) {
    let paramValue = req.query[paramName];

    // Add _like to filter %keyword%, e.g. name_like=ca
    // support simple regex syntax
    // e.g.name_like=^v  name_like=n$ name_like=jack|alex  name_like=or?n
    if (paramName.indexOf('_like') != -1) {
      paramName = paramName.replace('_like', '');
      paramValue = '%' + paramValue + '%';
    }

    // Add _gte or _lte for getting a range(cannot use together yet)
    // , e.g. age_lte=60  age_gte=18
    if (paramName.indexOf('_gte') != -1) {
      paramName = paramName.replace('_gte', '');
      paramValue = '>' + paramValue;
    }
    if (paramName.indexOf('_lte') != -1) {
      paramName = paramName.replace('_lte', '');
      paramValue = '<' + paramValue;
    }

    if (paramName in apiSchema.schema) {
      if (apiSchema.schema[paramName] == String || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == String)) {
        if (paramValue.indexOf('==') === 0) {
          // e.g. title===Cat 
          // case sensitive equal match, better to set up index
          condition[paramName] = paramValue.replace('==', '');
        } else if (paramValue.substr(0, 1) == '%' && paramValue.substr(-1) == '%') {
          // e.g. title=%ca%
          // case insensitive full text match, will not use index, slow
          condition[paramName] = { $regex: new RegExp(paramValue.replace(/%/g, '')), $options: "i" };
        } else if (paramValue.indexOf('i=') === 0) {
          // e.g. title=i=cat
          // case insensitive equal match, may not use the index
          // https://docs.mongodb.com/manual/reference/operator/query/regex/
          condition[paramName] = { $regex: new RegExp("^" + paramValue.replace('i=', '').toLowerCase() + "$", "i") };
        } else {
          // e.g. title=cat, same as title===cat
          // case sensitive equal match, better to set up index
          condition[paramName] = paramValue.replace('==', '');
        }

      } else if (apiSchema.schema[paramName] == Number || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == Number)) {
        if (paramValue.indexOf('>') === 0) {
          // e.g. age=>18
          tempVar = Number(paramValue.replace('>', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $gte: tempVar };
          }
        } else if (paramValue.indexOf('<') === 0) {
          // e.g. age=<18
          tempVar = Number(paramValue.replace('<', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $lte: tempVar };
          }
        } else if (!isNaN(paramValue)) {
          // e.g. age=18
          condition[paramName] = { $eq: Number(paramValue) };
        }
      }
    }
    // console.log(paramName, paramValue)
  }

  // find multiple ids, e.g.  ?id=1&id=2&id=3 or ?id=1,2,3,4,5
  if (req.query.id || req.query._id) {
    const originId = req.query.id ? req.query.id : req.query._id;
    const idAry = (typeof originId == 'string') ? originId.split(',') : originId;
    let objIdAry = [];
    idAry.map(idStr => {
      if (db.mongoose.isValidObjectId(idStr)) {
        objIdAry.push(db.mongoose.Types.ObjectId(idStr));
      }
    })
    condition["_id"] = { "$in": objIdAry };
  }

  // full text search
  if (req.query.q && req.query.q.trim() != '') {
    return this.search(req, res);
  }

  // check if it's set only the owner can view the list
  const hasPermission = helper.hasReadPermission(apiSchema, Universal, req.body, req, res);
  if (!hasPermission) {
    condition[API_CONFIG.FIELD_USER_ID] = req.currentUser.id;
  }

  // check if the schema hasPrivateConstraint
  if (helper.hasPrivateConstraint(apiSchema, condition, req, res)) {
    condition[API_CONFIG.FIELD_PUBLIC] = true;
  }

  console.log('find query condition:', condition);

  // Add _sort and _order (ascending order by default)
  let defaultSort = {};
  if (req.query._sort && req.query._order) {
    if (req.query._sort in apiSchema.schema) {
      defaultSort[req.query._sort] = (req.query._order.toUpperCase() == 'DESC') ? -1 : 1;
    }
  }
  if (Object.keys(defaultSort).length === 0) {
    defaultSort = { _id: -1 };
  }

  // Add _start and _end or _limit 
  let defaultSkip = 0;
  let defaultLimit = 2000;
  if (req.query._start && req.query._end) {
    defaultSkip = parseInt(req.query._start);
    defaultLimit = req.query._limit ? parseInt(req.query._limit) : (parseInt(req.query._end) - parseInt(req.query._start));
  }


  let pipelineOperators = [
    {
      // '$match': { _id: db.mongoose.Types.ObjectId(id) }
      '$match': condition,
    },
    {
      '$sort': defaultSort,
    },
    {
      '$skip': defaultSkip,
    },
    {
      '$limit': defaultLimit,
    },
    // {
    //   "$addFields":
    //     { id: "$_id" }
    // }
  ];

  // To include children resources, add _embed
  if (req.query._embed) {
    await req.query._embed.split(',').map(async (tableName) => {
      const embedTable = tableName.split('|');
      const pluralTableName = embedTable[0];
      const foreignField = embedTable[1] ? embedTable[1] : null;

      const embedSchema = API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.collectionName == pluralTableName);
      if (embedSchema) {
        const hasPermission = helper.hasReadPermission(embedSchema, Universal, req.body, req, res);
        if (hasPermission) {
          const hasPrivate = helper.hasPrivateConstraint(embedSchema, condition, req, res);

          console.log('tableName embedSchema hasPrivate', hasPrivate)
          pipelineOperators.push(helper.getChildrenLookupOperator(null, pluralTableName, apiSchema, embedSchema, foreignField, hasPrivate));
        } else {
          console.log('No read permission for embedSchema ', embedSchema.apiRoute);
        }

      } else {
        console.log('tableName schema not defined', tableName)
      }
    })
    // console.log('pipelineOperators after req.query._embed', pipelineOperators);

  }

  // To include parent resource, add _expand
  if (req.query._expand) {
    await req.query._expand.split(',').map(async (tableName) => {
      const expandTable = tableName.split('|');
      const singularTableName = expandTable[0];
      const foreignField = expandTable[1] ? expandTable[1] : singularTableName + 'Id';
      const pluralTableName = helper.getPluralName(singularTableName);
      const expandSchema = API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.collectionName == pluralTableName);
      if (expandSchema) {
        const hasPermission = helper.hasReadPermission(expandSchema, Universal, req.body, req, res);
        if (hasPermission) {
          console.log('tableName expandSchema', expandSchema.apiRoute)
          pipelineOperators.push(helper.getParentLookupOperator(foreignField, singularTableName, pluralTableName, expandSchema));

          pipelineOperators.push({ $unwind: { path: "$" + singularTableName, "preserveNullAndEmptyArrays": true } });
        } else {
          console.log('No read permission for expandSchema ', expandSchema.apiRoute)
        }

      } else {
        console.log('tableName schema not defined', singularTableName, pluralTableName)
      }
    })
    // console.log('pipelineOperators after req.query._expand', pipelineOperators);
  }

  // test nested query, not working
  // pipelineOperators.push(
  //   { '$match': { "$pet.species": "Cat" } }
  // )

  // combine pre-defined pipeline from api.config.js
  if (apiSchema.aggregatePipeline) {
    pipelineOperators = [...pipelineOperators, ...apiSchema.aggregatePipeline]
  }

  // console.log('===exports.show pipelineOperators', pipelineOperators);

  const aggregateData = Universal.aggregate(pipelineOperators).exec((err, data) => {
    if (err) {
      return console.log('aggregate error', err)
    }
    // if (req.query?._responseType == 'returnData') {
    //   console.log('aggregate data', data)
    //   return data;
    // } else {
    // console.log('aggregate data.length', data.length)

    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("x-total-count", data.length);
    res.send(data);
    // }

  });

  // console.log('aggregate aggregateQuery', aggregateData)
  return aggregateData;
};



// Find a single Universal with an id via findById
exports.showByFind = async (req, res) => {
  const apiSchema = helper.getApiSchema(req, res);

  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];

  const Universal = helper.getUniversalDb(db, req, res);
  let query = Universal.findById(id);

  // only display specific fields or exclude some schema fields
  if (apiSchema.selectFields && apiSchema.selectFields.length > 0) {
    // query.select(apiSchema.selectFields);
  }

  query.then((data) => {
    if (!data)
      res.status(404).send({ message: "Not found the item with id " + id });
    else {
      res.send(data);
    };
  }).catch((err) => {
    res.status(500).send({ message: "Error retrieving the item with id=" + id });
  });
};


// Find a single Universal with an id via aggregate
// To include children resources, add _embed
// To include parent resource, add _expand
// e.g. /pets/5fcd8f4a3b755f0008556057?_expand=user,file|mainImageId&_embed=pets,stories
exports.show = async (req, res) => {
  const apiSchema = helper.getApiSchema(req, res);

  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];
  if (!db.mongoose.isValidObjectId(id)) {
    res.status(500).send({ message: id + " is not a ValidObjectId " });
    return false;
  }

  const Universal = helper.getUniversalDb(db, req, res);

  // check if it's set only the owner can view the list
  const existItem = await Universal.findById(id);
  const hasPermission = helper.hasReadPermission(apiSchema, Universal, existItem, req, res);
  if (!hasPermission) {
    res.status(401).send({ message: " No read permission for " + req.currentUser.id });
    return false;
  }

  // check if the schema hasPrivateConstraint
  if (helper.hasPrivateConstraint(apiSchema, existItem, req, res)) {
    res.status(401).send({ message: " This item is private" });
    return false;
  }

  let pipelineOperators = [
    {
      '$match': { _id: db.mongoose.Types.ObjectId(id) }
    }
  ];

  // To include children resources, add _embed
  if (req.query._embed) {
    await req.query._embed.split(',').map(async (tableName) => {
      const embedTable = tableName.split('|');
      const pluralTableName = embedTable[0];
      const foreignField = embedTable[1] ? embedTable[1] : null;

      const embedSchema = API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.collectionName == pluralTableName);;
      if (embedSchema) {
        // check embedSchema permission as well
        const hasPermission = helper.hasReadPermission(embedSchema, Universal, existItem, req, res);
        if (hasPermission) {
          let hasPrivate = helper.hasPrivateConstraint(embedSchema, existItem, req, res);

          if (hasPrivate && apiSchema.apiRoute == API_CONFIG.USER_ROUTE && req.currentUser && existItem.id == req.currentUser.id) {
            // if is user table
            hasPrivate = false;
          }
          console.log('tableName embedSchema hasPrivate', hasPrivate); pipelineOperators.push(helper.getChildrenLookupOperator(id, pluralTableName, apiSchema, embedSchema, foreignField, hasPrivate));
        } else {
          // ignore the embed schema
          console.log('No read permission for embed schema ' + embedSchema.apiRoute + '');
        }
      } else {
        console.log('tableName schema not defined', tableName)
      }

    })
  }

  // To include parent resource, add _expand
  if (req.query._expand) {
    await req.query._expand.split(',').map(async tableName => {
      const expandTable = tableName.split('|');
      const singularTableName = expandTable[0];
      const foreignField = expandTable[1] ? expandTable[1] : singularTableName + 'Id';
      const pluralTableName = helper.getPluralName(singularTableName);
      const expandSchema = API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.collectionName == pluralTableName);
      if (expandSchema) {
        // check embedSchema permission as well
        const hasPermission = helper.hasReadPermission(expandSchema, Universal, existItem, req, res);
        if (hasPermission) {
          // console.log('tableName expandSchema', expandSchema)
          pipelineOperators.push(helper.getParentLookupOperator(foreignField, singularTableName, pluralTableName, expandSchema));

          pipelineOperators.push({ $unwind: { path: "$" + singularTableName, "preserveNullAndEmptyArrays": true } });
        } else {
          // ignore the expand schema
          console.log('No read permission for expand schema ' + expandSchema.apiRoute + '');
        }

      } else {
        console.log('tableName schema not defined', singularTableName, pluralTableName)
      }

    })
  }
  if (apiSchema.aggregatePipeline) {
    pipelineOperators = [...pipelineOperators, ...apiSchema.aggregatePipeline]
  }


  // console.log('===exports.show pipelineOperators', pipelineOperators, apiSchema);

  let query = await Universal.aggregate(pipelineOperators).exec((err, data) => {
    if (err) {
      return console.log('aggregate error', err)
    }
    // console.log('aggregate data', data)
    if (!data || data.length == 0)
      res.status(404).send({ message: "Not found the item with id " + id });
    else {
      res.send(data[0]);
    };
  });

  // console.log(query)
  return query;
};

// Update a Universal by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }
  const apiSchema = helper.getApiSchema(req, res);
  console.log('====update req', req.currentUser, req.body);
  const id = req.params[apiSchema.apiRoute];
  const Universal = helper.getUniversalDb(db, req, res);

  const hasPermission = await helper.hasWritePermission(apiSchema, Universal, id, req, res);
  if (!hasPermission) {
    res.status(401).send({
      message: `No permission to update item with id=${id}. currentUser: ${req.currentUser?.id}`,
    });
    return false;
  }
  // console.log('update req.body', req.body)

  // TODO: if id not exist, create a new item -- for PUT method
  Universal.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
    upsert: true,
    new: true, // return new data instead old data
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot find the item with id=${id}. Try to Create a new one!!`,
        });
        // console.log("the item was not found! Create a new one!");
        // create(req, res);
      } else {
        // res.send({
        //   message: "Item was updated successfully.",
        //   data: data,
        //   total: 1
        // });
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating the item with id=" + id,
      });
    });
};




// Delete a Universal with the specified id in the request
exports.destroy = async (req, res) => {
  const apiSchema = helper.getApiSchema(req, res);
  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];
  const Universal = helper.getUniversalDb(db, req, res);

  const hasPermission = await helper.hasWritePermission(apiSchema, Universal, id, req, res);
  if (!hasPermission) {
    res.status(404).send({
      message: `No permission to DELETE item with id=${id}. currentUser: ${req.currentUser.id}`,
    });
    return false;
  }

  Universal.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete the item with id=${id}. Maybe the item was not found!`,
        });
      } else {
        res.send({
          message: "The item was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete the item with id=" + id,
      });
    });
};


// full text search
exports.search = (req, res) => {
  const keyword = req.params.keyword ? req.params.keyword : req.query.q;
  const Universal = helper.getUniversalDb(db, req, res);
  //   Universal.find({ $text: { $search: keyword } })
  const apiSchema = helper.getApiSchema(req, res);
  // console.log('apiSchema=', apiSchema);
  Universal.aggregate([
    {
      $search: {
        text: {
          query: keyword.trim(),
          path: apiSchema.searchFields,
        },
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while searching. ",
      });
    });
};

// user token, todo: security
exports.getUserToken = async (req, res) => {

  if (!req.body.firebaseIdToken && !req.body.awsIdToken) {
    console.log('getUserToken req.body', req.body, req.body)
    return res.status(400).json({ error: "Missing params for getUserToken" });
  }

  let findCondition = {};

  if (req.body.firebaseIdToken) {

    const decodedToken = await helper.decodeFirebaseIdToken(req.body.firebaseIdToken);
    console.log('decodedToken decodedToken ', decodedToken);
    if (!decodedToken) {
      return res.status(401).json({ error: "Wrong firebaseIdToken" });
    }
    if (!decodedToken.uid || decodedToken.uid != req.body.firebaseUid) {
      return res.status(401).json({ error: "firebaseUid not match firebaseIdToken" });
    }
    findCondition.firebaseUid = decodedToken.uid;
  }

  const Universal = helper.getUniversalDb(db, req, res);

  // if (!req.body.email) {
  //   return res.status(400).json({ error: "no email" });
  // }
  req.body._responseType = 'returnData';
  // return this.index(req, res);
  // const returnData = this.index(req, res);



  const userData = await Universal.findOne(findCondition).exec();
  console.log('_responseType userData', userData);
  if (!userData) {
    console.log('No such user findCondition', findCondition);
    return res.status(401).json({ error: "No such user" });
  }

  let userProfile = {
    id: userData._id ? userData._id : userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
  };
  console.log('_responseType userProfile', userData['firstName']);
  // create token
  userProfile.accessToken = jwt.sign(
    userProfile,// payload data
    API_CONFIG.JWT_SECRET
  );


  res.send(userProfile);
  // res.set("x-total-count", data.length);
  // res.send(data);
}