const API_CONFIG = require("../config/api.config");
const db = require("../models");

const getApiRoute = (req, res) => {
  console.log(req.route.path);
  // console.log(req._parsedUrl);  
  const apiRoute = req._parsedUrl.pathname.replace('/' + API_CONFIG.API_BASE, '');
  if (apiRoute.indexOf('/search') != -1) {
    return apiRoute.split('/search')[0];
  } else if (apiRoute.indexOf('/') != -1) {
    return apiRoute.split('/')[0];
  }
  return apiRoute;
}
const getUniversalDb = (req, res) => {
  // get dynamic dbModel via api router
  return db[getApiRoute(req, res)];
}

const getApiSchema = (req, res) => {
  const apiRoute = getApiRoute(req, res);
  return API_CONFIG.API_SCHEMAS.find(apiSchema => apiSchema.apiRoute == apiRoute);
}

// Create and Save a new Universal
exports.store = (req, res) => {

  const Universal = getUniversalDb(req, res);

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

// Retrieve all universals from the database.
exports.index = (req, res) => {

  // Universal = db[req.url.replace('/' + API_CONFIG.API_BASE, '')];
  const Universal = getUniversalDb(req, res);

  console.log('query', req.query)
  const apiSchema = getApiSchema(req, res);
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
  if (req.query.id) {
    const idAry = (typeof req.query.id == 'string') ? req.query.id.split(',') : req.query.id;
    condition["id"] = { "$in": idAry };
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
    defaultSort = { id: -1 };
  }

  // Add _start and _end or _limit 
  let defaultSkip = 0;
  let defaultLimit = 0;
  if (req.query._start && req.query._end) {
    defaultSkip = parseInt(req.query._start);
    defaultLimit = req.query._limit ? parseInt(req.query._limit) : (parseInt(req.query._end) - parseInt(req.query._start));
  }


  let query = Universal.find(condition).sort(defaultSort);

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
  })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving items.",
      });
    });
};

// Find a single Universal with an id
exports.show = (req, res) => {
  const apiSchema = getApiSchema(req, res);

  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];

  const Universal = getUniversalDb(req, res);
  Universal.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found the item with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving the item with id=" + id });
    });
};

// Update a Universal by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }
  const apiSchema = getApiSchema(req, res);
  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];

  const Universal = getUniversalDb(req, res);
  Universal.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false,
    upsert: true,
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot find the item with id=${id}. Try to Create a new one!!`,
        });
        // console.log("the item was not found! Create a new one!");
        // create(req, res);
      } else {
        res.send({ message: "Item was updated successfully." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating the item with id=" + id,
      });
    });
};

// Delete a Universal with the specified id in the request
exports.destroy = (req, res) => {
  const apiSchema = getApiSchema(req, res);
  // console.log(apiSchema, req.params);
  const id = req.params[apiSchema.apiRoute];
  const Universal = getUniversalDb(req, res);
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
  const Universal = getUniversalDb(req, res);
  //   Universal.find({ $text: { $search: keyword } })
  const apiSchema = getApiSchema(req, res);
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