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

  // console.log('query', req.query)
  const apiSchema = getApiSchema(req, res);
  // console.log('apiSchema=', apiSchema);

  let condition = {};
  let tempVar;
  for (paramName in req.query) {
    if (paramName in apiSchema.schema) {
      if (apiSchema.schema[paramName] == String || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == String)) {
        if (req.query[paramName].indexOf('==') === 0) {
          // e.g. title===Cat 
          // case sensitive equal match, better to set up index
          condition[paramName] = req.query[paramName].replace('==', '');
        } else if (req.query[paramName].substr(0, 1) == '%' && req.query[paramName].substr(-1) == '%') {
          // e.g. title=%ca%
          // case insensitive full text match, will not use index, slow
          condition[paramName] = { $regex: new RegExp(req.query[paramName].replace(/%/g, '')), $options: "i" };
        } else {
          // e.g. title=cat
          // case insensitive equal match, may not use the index
          // https://docs.mongodb.com/manual/reference/operator/query/regex/
          condition[paramName] = { $regex: new RegExp("^" + req.query[paramName].toLowerCase() + "$", "i") };
        }

      } else if (apiSchema.schema[paramName] == Number || ("type" in apiSchema.schema[paramName] && apiSchema.schema[paramName].type == Number)) {
        if (req.query[paramName].indexOf('>') === 0) {
          // e.g. age=>18
          tempVar = Number(req.query[paramName].replace('>', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $gte: tempVar };
          }
        } else if (req.query[paramName].indexOf('<') === 0) {
          // e.g. age=<18
          tempVar = Number(req.query[paramName].replace('<', ''));
          if (!isNaN(tempVar)) {
            condition[paramName] = { $lte: tempVar };
          }
        } else if (!isNaN(req.query[paramName])) {
          // e.g. age=18
          condition[paramName] = { $eq: req.query[paramName] };
        }
      }
    }
    // console.log(paramName, req.query[paramName])
  }
  console.log('find query condition:', condition)

  Universal.find(condition)
    .then((data) => {
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
  const id = req.params[API_CONFIG.API_ROUTE];
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


// search
exports.search = (req, res) => {
  const keyword = req.params.keyword;
  const Universal = getUniversalDb(req, res);
  //   Universal.find({ $text: { $search: keyword } })
  const apiSchema = getApiSchema(req, res);
  // console.log('apiSchema=', apiSchema);
  Universal.aggregate([
    {
      $search: {
        text: {
          query: keyword,
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