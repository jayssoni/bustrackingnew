const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// Get all drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign bus to driver
router.put('/buses/:busId/assign', async (req, res) => {
  try {
    const { busId } = req.params;
    const { driverId } = req.body;

    // Validate driver exists and is a driver
    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== 'driver') {
        return res.status(400).json({ error: 'Invalid driver' });
      }
    }

    // Update bus
    const bus = await Bus.findByIdAndUpdate(
      busId,
      { driver: driverId || null },
      { new: true }
    ).populate('route').populate('driver', '-password');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments({ active: true });
    const totalRoutes = await Route.countDocuments({ active: true });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Calculate total passengers
    const buses = await Bus.find({ active: true });
    const totalPassengers = buses.reduce((sum, bus) => sum + bus.currentPassengers, 0);

    res.json({
      totalBuses,
      totalRoutes,
      totalDrivers,
      totalUsers,
      totalPassengers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new driver
router.post('/drivers', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const driver = new User({
      name,
      email,
      password,
      role: 'driver'
    });

    await driver.save();
    
    const driverData = driver.toObject();
    delete driverData.password;
    
    res.status(201).json(driverData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    // Unassign all buses from this driver
    await Bus.updateMany({ driver: req.params.id }, { driver: null });
    
    // Delete driver
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
