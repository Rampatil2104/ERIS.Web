// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// -------------------- env --------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const required = [
  'PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME',
  'ADMIN_USER', 'ADMIN_PASS'
];
const missing = required.filter(k => !process.env[k] || process.env[k].trim() === '');
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}

// -------------------- app --------------------
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));

// trailing-slash tolerant helper
const accept = (p) => [p, p.endsWith('/') ? p : p + '/'];

// -------------------- db pool --------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const q = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// -------------------- health --------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// -------------------- LOGIN --------------------
app.post(accept('/api/Login'), (req, res) => {
  const { username, password } = req.body || {};
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
});

// =================================================
// ==============  ASSESSMENT PROFILE  =============
// =================================================

// All profiles (used by Search page)
app.get(accept('/api/AssessmentProfile'), async (_req, res, next) => {
  try {
    // return everything; the frontend filters locally
    const rows = await q(
      `SELECT *
         FROM AssessmentProfile
        ORDER BY AssessmentID DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// Single profile (used by Details page)
app.get('/api/AssessmentProfile/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rows = await q(
      `SELECT * FROM AssessmentProfile WHERE AssessmentID = ?`,
      [id]
    );
    if (!rows[0]) return res.sendStatus(404);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// (Optional) create/update if you need it from UI later
app.post(accept('/api/AssessmentProfile'), async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [
      'Date','District','County','Route','PostMile','EA','ProjectID',
      'DateIncidentReported','Latitude','Longitude',
      'LastName','FirstName','SNumber',
      'DistrictContactLastName','DistrictContactFirstName','DistrictContactSNumber',
      'DistrictContactPhone','DistrictContactCellPhone',
      'AssessmentStatus','Notes','IsUploaded'
    ];
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => b[f] ?? null);

    const r = await q(
      `INSERT INTO AssessmentProfile (${fields.join(',')})
       VALUES (${placeholders})`,
      values
    );
    const created = await q(`SELECT * FROM AssessmentProfile WHERE AssessmentID = ?`, [r.insertId]);
    res.status(201).json(created[0]);
  } catch (e) { next(e); }
});

app.put('/api/AssessmentProfile/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const updatable = [
      'Date','District','County','Route','PostMile','EA','ProjectID',
      'DateIncidentReported','Latitude','Longitude',
      'LastName','FirstName','SNumber',
      'DistrictContactLastName','DistrictContactFirstName','DistrictContactSNumber',
      'DistrictContactPhone','DistrictContactCellPhone',
      'AssessmentStatus','Notes','IsUploaded'
    ];
    const set = updatable.map(f => `${f} = ?`).join(', ');
    const values = updatable.map(f => b[f] ?? null);
    values.push(id);

    await q(`UPDATE AssessmentProfile SET ${set} WHERE AssessmentID = ?`, values);
    const updated = await q(`SELECT * FROM AssessmentProfile WHERE AssessmentID = ?`, [id]);
    if (!updated[0]) return res.sendStatus(404);
    res.json(updated[0]);
  } catch (e) { next(e); }
});

// =================================================
// ==============  ASSESSMENT DETAILS  =============
// =================================================

// list details; supports ?assessmentId=
app.get(accept('/api/AssessmentDetails'), async (req, res, next) => {
  try {
    const { assessmentId } = req.query;
    let sql = `SELECT * FROM AssessmentDetails`;
    const params = [];
    if (assessmentId) { sql += ` WHERE AssessmentID = ?`; params.push(Number(assessmentId)); }
    sql += ` ORDER BY AssessmentDetailsID ASC`;
    res.json(await q(sql, params));
  } catch (e) { next(e); }
});

app.get('/api/AssessmentDetails/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rows = await q(
      `SELECT * FROM AssessmentDetails WHERE AssessmentDetailsID = ?`,
      [id]
    );
    if (!rows[0]) return res.sendStatus(404);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// (optional) create/update
app.post(accept('/api/AssessmentDetails'), async (req, res, next) => {
  try {
    const b = req.body || {};
    // Provide all fields you plan to insert; below is generic "insert what you send"
    const fields = Object.keys(b);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields' });
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => b[f]);

    const r = await q(
      `INSERT INTO AssessmentDetails (${fields.join(',')})
       VALUES (${placeholders})`,
      values
    );
    const created = await q(
      `SELECT * FROM AssessmentDetails WHERE AssessmentDetailsID = ?`,
      [r.insertId]
    );
    res.status(201).json(created[0]);
  } catch (e) { next(e); }
});

app.put('/api/AssessmentDetails/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const fields = Object.keys(b);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    const set = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => b[f]);
    values.push(id);

    await q(`UPDATE AssessmentDetails SET ${set} WHERE AssessmentDetailsID = ?`, values);
    const updated = await q(`SELECT * FROM AssessmentDetails WHERE AssessmentDetailsID = ?`, [id]);
    if (!updated[0]) return res.sendStatus(404);
    res.json(updated[0]);
  } catch (e) { next(e); }
});

// =================================================
// =====================  PHOTO  ===================
// =================================================

app.get(accept('/api/Photo'), async (req, res, next) => {
  try {
    const { assessmentId } = req.query;
    let sql = `SELECT PhotoID, AssessmentID, FilePath, AssociatedMeasurement FROM Photo`;
    const params = [];
    if (assessmentId) { sql += ` WHERE AssessmentID = ?`; params.push(Number(assessmentId)); }
    sql += ` ORDER BY PhotoID DESC`;
    res.json(await q(sql, params));
  } catch (e) { next(e); }
});

app.get('/api/Photo/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rows = await q(`SELECT * FROM Photo WHERE PhotoID = ?`, [id]);
    if (!rows[0]) return res.sendStatus(404);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.post(accept('/api/Photo'), async (req, res, next) => {
  try {
    const { AssessmentID, FilePath, AssociatedMeasurement } = req.body || {};
    const r = await q(
      `INSERT INTO Photo (AssessmentID, FilePath, AssociatedMeasurement)
       VALUES (?,?,?)`,
      [AssessmentID ?? null, FilePath ?? null, AssociatedMeasurement ?? null]
    );
    const created = await q(`SELECT * FROM Photo WHERE PhotoID = ?`, [r.insertId]);
    res.status(201).json(created[0]);
  } catch (e) { next(e); }
});

// -------------------- error handler --------------------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// -------------------- start --------------------
const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`ERIS API listening on http://localhost:${port}`);
});
