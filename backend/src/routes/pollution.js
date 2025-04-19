const express = require('express');
const router = express.Router();
const Pollution = require('../models/Pollution');
const Joi = require('joi');

// Validation schema for pollution data
const pollutionSchema = Joi.object({
  longitude: Joi.number().required().min(-180).max(180),
  latitude: Joi.number().required().min(-90).max(90),
  pm25: Joi.number().required().min(0).max(999),
  source: Joi.string().valid('sensor', 'satellite', 'user', 'model').default('user'),
  notes: Joi.string().max(500),
  deviceInfo: Joi.string()
});

// GET all pollution data as GeoJSON
router.get('/', async (req, res) => {
  try {
    const { timeRange, minPm25, maxPm25, source } = req.query;
    
    const query = {};
    
    // Apply time filter if provided
    if (timeRange) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(timeRange));
      query.timestamp = { $gte: date };
    }
    
    // Apply PM2.5 filters if provided
    if (minPm25 || maxPm25) {
      query.pm25 = {};
      if (minPm25) query.pm25.$gte = parseInt(minPm25);
      if (maxPm25) query.pm25.$lte = parseInt(maxPm25);
    }
    
    // Apply source filter if provided
    if (source) {
      query.source = source;
    }
    
    const pollutionData = await Pollution.find(query).sort('-timestamp').limit(1000);
    
    // Convert to GeoJSON FeatureCollection
    const featureCollection = Pollution.toFeatureCollection(pollutionData);
    
    res.json(featureCollection);
  } catch (error) {
    console.error('Failed to fetch pollution data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET mock pollution data (for development)
router.get('/mock', (req, res) => {
  // Mock data for testing
  const mockData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [85.3240, 27.7172] },
        properties: { pm25: 178, source: 'user', id: '1' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
        properties: { pm25: 210, source: 'satellite', id: '2' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [121.4737, 31.2304] },
        properties: { pm25: 156, source: 'sensor', id: '3' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
        properties: { pm25: 42, source: 'sensor', id: '4' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
        properties: { pm25: 28, source: 'sensor', id: '5' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
        properties: { pm25: 35, source: 'sensor', id: '6' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [37.6173, 55.7558] },
        properties: { pm25: 68, source: 'satellite', id: '7' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-43.1729, -22.9068] },
        properties: { pm25: 89, source: 'user', id: '8' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [18.4241, -33.9249] },
        properties: { pm25: 25, source: 'sensor', id: '9' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [151.2093, -33.8688] },
        properties: { pm25: 15, source: 'sensor', id: '10' }
      }
    ]
  };
  
  res.json(mockData);
});

// POST new pollution data
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = pollutionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        error: error.details[0].message 
      });
    }
    
    // Create new pollution record
    const newPollution = new Pollution({
      location: {
        type: 'Point',
        coordinates: [value.longitude, value.latitude]
      },
      pm25: value.pm25,
      source: value.source || 'user',
      notes: value.notes,
      deviceInfo: value.deviceInfo
    });
    
    await newPollution.save();
    
    res.status(201).json({
      success: true,
      message: 'Pollution data saved successfully',
      data: newPollution.toFeature()
    });
  } catch (error) {
    console.error('Failed to save pollution data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET pollution data by ID
router.get('/:id', async (req, res) => {
  try {
    const pollution = await Pollution.findById(req.params.id);
    
    if (!pollution) {
      return res.status(404).json({ success: false, message: 'Pollution data not found' });
    }
    
    res.json({
      success: true,
      data: pollution.toFeature()
    });
  } catch (error) {
    console.error('Failed to fetch pollution data by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 