require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const teacher = await db.collection('teachers').findOne({});
  const school  = await db.collection('schools').findOne({});
  const student = await db.collection('students').findOne({});

  console.log('Teacher _id:', teacher?._id, '| teacherId:', teacher?.teacherId, '| centre:', teacher?.centre);
  console.log('School  _id:', school?._id,  '| name:', school?.name);
  console.log('Student _id:', student?._id, '| studentId:', student?.studentId, '| class:', student?.class);

  // Count of teachers per teacherId string
  const allTeachers = await db.collection('teachers').find({}).toArray();
  console.log('\nAll teachers:', allTeachers.map(t => ({ _id: t._id, teacherId: t.teacherId, name: t.name })));

  const allSchools = await db.collection('schools').find({}).project({ _id: 1, name: 1 }).toArray();
  console.log('\nAll schools:', allSchools);

  process.exit(0);
}
inspect().catch(e => { console.error(e.message); process.exit(1); });
