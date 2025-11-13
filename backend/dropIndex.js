const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('MongoDB connected');
  
  // Drop all problematic indexes
  const collections = ['users', 'routes', 'buses'];
  
  for (const collName of collections) {
    try {
      const indexes = await mongoose.connection.db.collection(collName).indexes();
      console.log(`\n${collName} indexes:`, indexes.map(i => i.name));
      
      // Drop problematic indexes
      for (const index of indexes) {
        if (index.name !== '_id_' && (index.name.includes('phoneNumber') || index.name.includes('driverId') || index.name.includes('routeNumber') || index.name.includes('busNumber') || index.name.includes('registrationNumber'))) {
          try {
            await mongoose.connection.db.collection(collName).dropIndex(index.name);
            console.log(`  ✓ Dropped ${index.name}`);
          } catch (err) {
            console.log(`  ✗ ${index.name}: ${err.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`${collName}: ${error.message}`);
    }
  }
  
  console.log('\n✅ All problematic indexes cleaned up!');
  process.exit(0);
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
