// apiCallCountSchema.js

const mongoose = require('mongoose');

const apiCallCountSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const ApiCallCount = mongoose.model('ApiCallCount', apiCallCountSchema);

module.exports = ApiCallCount;
