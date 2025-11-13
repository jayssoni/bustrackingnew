const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Bus = require('../models/Bus');

// Get all routes with buses
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({ active: true });
    const buses = await Bus.find({ active: true }).populate('route');

    // Group buses by route
    const routesWithBuses = routes.map(route => {
      const routeBuses = buses.filter(bus => 
        bus.route._id.toString() === route._id.toString()
      ).map(bus => ({
        id: bus._id,
        number: bus.number,
        eta: bus.eta,
        passengers: bus.currentPassengers,
        capacity: bus.capacity,
        lat: bus.location.lat,
        lng: bus.location.lng
      }));

      return {
        id: route._id,
        number: route.number,
        name: route.name,
        from: route.from,
        to: route.to,
        distance: route.distance,
        duration: route.duration,
        frequency: route.frequency,
        buses: routeBuses,
        favorite: false
      };
    });

    res.json(routesWithBuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single route
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create route (Admin only)
router.post('/', async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update route (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete route (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
