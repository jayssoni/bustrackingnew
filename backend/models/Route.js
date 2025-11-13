const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  distance: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);
