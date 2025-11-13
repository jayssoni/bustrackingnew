const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// Get all buses
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('route')
      .populate('driver', '-password');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bus location (Driver only)
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng, currentPassengers, eta } = req.body;
    
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { 
        location: { lat, lng },
        currentPassengers,
        eta,
        lastUpdated: Date.now()
      },
      { new: true }
    );
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bus (Admin only)
router.post('/', async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    const populatedBus = await Bus.findById(bus._id)
      .populate('route')
      .populate('driver', '-password');
    res.status(201).json(populatedBus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bus (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('route')
      .populate('driver', '-password');
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bus (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle bus active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    bus.active = !bus.active;
    await bus.save();
    
    const updatedBus = await Bus.findById(bus._id)
      .populate('route')
      .populate('driver', '-password');
    
    res.json(updatedBus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
