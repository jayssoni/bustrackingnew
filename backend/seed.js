const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const routes = [
  {
    number: '101',
    name: 'City Center - Airport',
    from: 'City Center',
    to: 'Airport',
    distance: '15 km',
    duration: '45 min',
    frequency: 'Every 15 min'
  },
  {
    number: '102',
    name: 'Downtown - Railway Station',
    from: 'Downtown',
    to: 'Railway Station',
    distance: '8 km',
    duration: '30 min',
    frequency: 'Every 10 min'
  },
  {
    number: '103',
    name: 'University - Mall',
    from: 'University',
    to: 'Shopping Mall',
    distance: '12 km',
    duration: '35 min',
    frequency: 'Every 20 min'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Route.deleteMany({});
    await Bus.deleteMany({});
    await User.deleteMany({});

    // Create test users
    const admin = new User({
      name: 'Admin User',
      email: 'admin@bus.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created: admin@bus.com / admin123');

    const drivers = [
      { name: 'Rajesh Kumar', email: 'rajesh@bus.com', password: 'driver123' },
      { name: 'Amit Singh', email: 'amit@bus.com', password: 'driver123' },
      { name: 'Priya Sharma', email: 'priya@bus.com', password: 'driver123' },
      { name: 'Vijay Patel', email: 'vijay@bus.com', password: 'driver123' }
    ];

    const savedDrivers = [];
    for (const driverData of drivers) {
      const driver = new User({
        ...driverData,
        role: 'driver'
      });
      await driver.save();
      savedDrivers.push(driver);
    }
    console.log('Drivers created successfully');

    // Insert routes
    const insertedRoutes = await Route.insertMany(routes);
    console.log('Routes seeded successfully');

    // Create buses for each route
    const buses = [];
    insertedRoutes.forEach((route, index) => {
      const busCount = index === 0 ? 2 : index === 2 ? 2 : 1;
      for (let i = 0; i < busCount; i++) {
        buses.push({
          number: `BUS-${String(buses.length + 1).padStart(3, '0')}`,
          route: route._id,
          capacity: 40,
          currentPassengers: Math.floor(Math.random() * 30) + 5,
          location: {
            lat: 21.2514 + (Math.random() - 0.5) * 0.1,
            lng: 81.6296 + (Math.random() - 0.5) * 0.1
          },
          eta: Math.floor(Math.random() * 20) + 5,
          driver: buses.length < savedDrivers.length ? savedDrivers[buses.length]._id : null
        });
      }
    });

    await Bus.insertMany(buses);
    console.log('Buses seeded successfully');
    console.log('\nDatabase seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@bus.com / admin123');
    console.log('Drivers:');
    drivers.forEach(d => console.log(`  ${d.email} / driver123`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
