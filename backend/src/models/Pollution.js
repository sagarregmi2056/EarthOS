const mongoose = require('mongoose');

const PollutionSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  pm25: {
    type: Number,
    required: true,
    min: 0,
    max: 999
  },
  source: {
    type: String,
    enum: ['sensor', 'satellite', 'user', 'model'],
    default: 'user'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  deviceInfo: {
    type: String,
    default: 'unknown'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

// Create indexes for efficient querying
PollutionSchema.index({ timestamp: -1 });
PollutionSchema.index({ pm25: 1 });
PollutionSchema.index({ source: 1 });

// Method to convert to GeoJSON feature
PollutionSchema.methods.toFeature = function() {
  return {
    type: 'Feature',
    geometry: this.location,
    properties: {
      pm25: this.pm25,
      source: this.source,
      timestamp: this.timestamp,
      id: this._id
    }
  };
};

// Static method to convert multiple documents to GeoJSON FeatureCollection
PollutionSchema.statics.toFeatureCollection = function(docs) {
  return {
    type: 'FeatureCollection',
    features: docs.map(doc => doc.toFeature())
  };
};

module.exports = mongoose.model('Pollution', PollutionSchema); 