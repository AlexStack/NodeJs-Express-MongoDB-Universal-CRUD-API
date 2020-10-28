module.exports = (mongoose, mongooseSchema, mongooseOption, collectionName) => {
  var schema = mongoose.Schema(
    mongooseSchema, mongooseOption
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Universal = mongoose.model(collectionName,  schema);
  return Universal;
};
