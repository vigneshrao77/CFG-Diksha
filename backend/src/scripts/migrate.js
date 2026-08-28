/**
 * migrate.js — Backfills ObjectId references for all existing documents.
 * Safe to re-run: only updates documents that still have null refs.
 *
 * T001 → Teacher._id: 6a9055f1d2dc6a272f91dc8f  (Ms. Anika Reddy)
 * KHEL Centre - Danapur → School._id: 6a9062a963f1bf9a6395b06d
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const { ObjectId } = mongoose.Types;

  // ── Load all teachers and schools once ───────────────────────
  const teachers = await db.collection('teachers').find({}).toArray();
  const schools  = await db.collection('schools').find({}).toArray();

  // Build lookup maps
  const teacherByStringId = {};
  for (const t of teachers) teacherByStringId[t.teacherId] = t._id;

  const schoolByName = {};
  for (const s of schools) schoolByName[s.name.toLowerCase().trim()] = s._id;

  const danapur = schoolByName['khel centre - danapur'];
  const t001    = teacherByStringId['T001'];

  console.log(`\nTeacher T001 ObjectId: ${t001}`);
  console.log(`KHEL Centre - Danapur ObjectId: ${danapur}`);
  console.log('\n─── Starting migration ───\n');

  // ── 1. Students → assign school (Danapur) + teacher (T001) ──
  const studentResult = await db.collection('students').updateMany(
    { school: { $exists: false } },
    { $set: { school: danapur, assignedTeacher: t001 } }
  );
  console.log(`✅ Students: ${studentResult.modifiedCount} documents updated (school + assignedTeacher)`);

  // ── 2. Teacher T001 → assign centre (Danapur school) ─────────
  const teacherT001 = await db.collection('teachers').findOne({ teacherId: 'T001' });
  if (teacherT001 && !teacherT001.centre) {
    const t1Res = await db.collection('teachers').updateOne(
      { teacherId: 'T001' },
      { $set: { centre: danapur, centreName: 'KHEL Centre - Danapur' } }
    );
    console.log(`✅ Teacher T001: centre assigned → KHEL Centre - Danapur (modified: ${t1Res.modifiedCount})`);
  } else {
    console.log('ℹ️  Teacher T001 already has centre, skipping');
  }

  // Teacher T002 → assign same centre (or leave null)
  const teacherT002 = await db.collection('teachers').findOne({ teacherId: 'T002' });
  if (teacherT002 && !teacherT002.centre) {
    await db.collection('teachers').updateOne(
      { teacherId: 'T002' },
      { $set: { centre: danapur, centreName: 'KHEL Centre - Danapur' } }
    );
    console.log(`✅ Teacher T002: centre assigned → KHEL Centre - Danapur`);
  }

  // ── 3. School → push teacher IDs into teachers[] ─────────────
  const teacherIds = teachers.map(t => t._id);
  const schoolRes = await db.collection('schools').updateOne(
    { _id: danapur },
    { $addToSet: { teachers: { $each: teacherIds } } }
  );
  console.log(`✅ School (Danapur) teachers[]: ${schoolRes.modifiedCount} document updated`);

  // ── 4. Attendances → teacher + school refs ───────────────────
  const attResult = await db.collection('attendances').updateMany(
    { teacher: { $exists: false } },
    { $set: { teacher: t001, school: danapur } }
  );
  console.log(`✅ Attendances: ${attResult.modifiedCount} documents updated`);

  // ── 5. Assessments → teacher + school refs ───────────────────
  const assResult = await db.collection('assessments').updateMany(
    { teacher: { $exists: false } },
    { $set: { teacher: t001, school: danapur } }
  );
  console.log(`✅ Assessments: ${assResult.modifiedCount} documents updated`);

  // ── 6. HealthRecords → recordedByTeacher + school ────────────
  const hrResult = await db.collection('healthrecords').updateMany(
    { recordedByTeacher: { $exists: false } },
    { $set: { recordedByTeacher: t001, school: danapur } }
  );
  console.log(`✅ HealthRecords: ${hrResult.modifiedCount} documents updated`);

  // ── 7. BehaviourRecords → recordedByTeacher + school + date ──
  const brResult = await db.collection('behaviourrecords').updateMany(
    { recordedByTeacher: { $exists: false } },
    { $set: { recordedByTeacher: t001, school: danapur, date: new Date().toISOString().slice(0, 10) } }
  );
  console.log(`✅ BehaviourRecords: ${brResult.modifiedCount} documents updated`);

  // ── 8. Alerts → teacher + school refs ────────────────────────
  const alertResult = await db.collection('alerts').updateMany(
    { teacher: { $exists: false } },
    { $set: { teacher: t001, school: danapur } }
  );
  console.log(`✅ Alerts: ${alertResult.modifiedCount} documents updated`);

  // ── 9. Verify ─────────────────────────────────────────────────
  console.log('\n─── Verification ───');
  const sampleStudent = await db.collection('students').findOne({}, { projection: { name: 1, school: 1, assignedTeacher: 1 } });
  const sampleAttend  = await db.collection('attendances').findOne({}, { projection: { studentId: 1, teacher: 1, school: 1 } });
  console.log('Sample Student:', JSON.stringify(sampleStudent));
  console.log('Sample Attendance:', JSON.stringify(sampleAttend));

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

migrate().catch(e => { console.error('❌ Migration error:', e.message); process.exit(1); });
