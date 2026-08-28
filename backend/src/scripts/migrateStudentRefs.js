/**
 * migrateStudentRefs.js — A1 backfill
 * ─────────────────────────────────────────────────────────────────────────────
 * For every document in Attendance, Assessment, HealthRecord, BehaviourRecord,
 * and Alert that still has student = null/undefined, this script looks up
 * Student.findOne({ studentId: doc.studentId }) and sets doc.student = _id.
 *
 * IDEMPOTENT: safe to re-run — skips docs that already have student set.
 * LOGGING: any doc with no matching student is logged to unmatched.log.
 * ─────────────────────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const UNMATCHED_LOG = path.join(__dirname, 'unmatched_students.log');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // ── Build studentId → ObjectId lookup map ─────────────────────
  const students = await db.collection('students').find({}, { projection: { studentId: 1 } }).toArray();
  const studentMap = new Map();
  for (const s of students) {
    if (s.studentId) studentMap.set(s.studentId, s._id);
  }
  console.log(`\nLoaded ${studentMap.size} students into lookup map.`);

  const unmatchedLines = [];

  // ── Generic backfill helper ────────────────────────────────────
  async function backfillCollection(collectionName) {
    const col = db.collection(collectionName);
    // Find all docs without student field OR student is null
    const docs = await col.find({ $or: [{ student: null }, { student: { $exists: false } }] }).toArray();
    let updated = 0, unmatched = 0;

    for (const doc of docs) {
      const studentObjId = studentMap.get(doc.studentId);
      if (studentObjId) {
        await col.updateOne({ _id: doc._id }, { $set: { student: studentObjId } });
        updated++;
      } else {
        const msg = `[${collectionName}] _id=${doc._id} studentId="${doc.studentId}" — NO MATCH`;
        console.warn('⚠️  ' + msg);
        unmatchedLines.push(msg);
        unmatched++;
      }
    }
    console.log(`✅ ${collectionName}: ${updated} updated, ${unmatched} unmatched (already-set docs skipped)`);
  }

  // ── Run for all five collections ──────────────────────────────
  await backfillCollection('attendances');
  await backfillCollection('assessments');
  await backfillCollection('healthrecords');
  await backfillCollection('behaviourrecords');
  await backfillCollection('alerts');

  // ── Write unmatched log ────────────────────────────────────────
  if (unmatchedLines.length > 0) {
    fs.writeFileSync(UNMATCHED_LOG, unmatchedLines.join('\n') + '\n');
    console.log(`\n⚠️  ${unmatchedLines.length} unmatched documents — see ${UNMATCHED_LOG}`);
  } else {
    console.log('\n✅ No unmatched documents — all student refs resolved.');
  }

  // ── Verification sample ───────────────────────────────────────
  console.log('\n─── Verification samples ───');
  const att = await db.collection('attendances').findOne({}, { projection: { studentId: 1, student: 1, date: 1 } });
  const asmnt = await db.collection('assessments').findOne({}, { projection: { studentId: 1, student: 1, period: 1 } });
  const hr = await db.collection('healthrecords').findOne({}, { projection: { studentId: 1, student: 1, date: 1 } });
  const br = await db.collection('behaviourrecords').findOne({}, { projection: { studentId: 1, student: 1 } });
  const al = await db.collection('alerts').findOne({}, { projection: { studentId: 1, student: 1, title: 1 } });
  console.log('Attendance sample:', JSON.stringify(att));
  console.log('Assessment sample:', JSON.stringify(asmnt));
  console.log('HealthRecord sample:', JSON.stringify(hr));
  console.log('BehaviourRecord sample:', JSON.stringify(br));
  console.log('Alert sample:', JSON.stringify(al));

  console.log('\n✅ A1 migration complete.');
  process.exit(0);
}

run().catch(e => { console.error('❌ Migration error:', e.message); process.exit(1); });
