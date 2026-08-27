require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const cols = ['students', 'teachers', 'alerts', 'attendances', 'healthrecords', 'behaviourrecords', 'assessments'];
  for (const c of cols) {
    const sample = await db.collection(c).findOne({});
    console.log(`\n=== SAMPLE FROM ${c} ===`);
    console.log(JSON.stringify(sample, null, 2));
  }
  process.exit(0);
}

main();
