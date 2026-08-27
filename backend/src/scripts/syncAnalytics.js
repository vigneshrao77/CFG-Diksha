require('dotenv').config();
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');

async function sync() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Analytics.updateOne(
    { type: 'attendance', period: 'monthly' },
    {
      $set: {
        data: [
          { month: 'Jul', rate: 81.2, govt: 74.0, 'KHEL 1': 88, 'KHEL 2': 84, 'KHEL 3': 80, 'Govt Schools': 74 },
          { month: 'Aug', rate: 84.5, govt: 76.5, 'KHEL 1': 90, 'KHEL 2': 86, 'KHEL 3': 83, 'Govt Schools': 76 },
          { month: 'Sep', rate: 86.8, govt: 77.2, 'KHEL 1': 92, 'KHEL 2': 88, 'KHEL 3': 85, 'Govt Schools': 77 },
          { month: 'Oct', rate: 85.1, govt: 75.8, 'KHEL 1': 90, 'KHEL 2': 87, 'KHEL 3': 84, 'Govt Schools': 75 },
          { month: 'Nov', rate: 89.4, govt: 79.1, 'KHEL 1': 93, 'KHEL 2': 90, 'KHEL 3': 87, 'Govt Schools': 79 },
          { month: 'Dec', rate: 91.2, govt: 80.5, 'KHEL 1': 95, 'KHEL 2': 92, 'KHEL 3': 89, 'Govt Schools': 81 },
        ],
      },
    }
  );
  console.log('✅ Synchronized attendance analytics data');
  process.exit(0);
}

sync();
