const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  capacity: {
    type: Number,
    required: true,
    default: 40
  },
  currentPassengers: {
    type: Number,
    default: 0
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  eta: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bus', busSchema);
