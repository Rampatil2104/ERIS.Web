import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Vite proxy -> no CORS issues
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Mock DB ----
const rows = [
  {
    id: "P-1001",
    district: "Sacramento",
    route: "I-80",
    postMile: 1.2,
    status: "Working",
    createdOn: "2022-05-09T12:00:00Z"
  },
  {
    id: "P-1002",
    district: "Fresno",
    route: "SR-99",
    postMile: 8.5,
    status: "Submitted",
    createdOn: "2022-06-01T12:00:00Z"
  }
];

// Helper: normalize trailing slashes for endpoints your client builds as BASE + endpoint + '/'
const accept = (path) => [path, path + "/"];

// ---- LOGIN ----
// POST /api/Login
app.post(accept("/api/Login"), (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "pass") return res.json({ ok: true });
  return res.status(401).json({ ok: false, error: "Invalid credentials" });
});

// ---- ASSESSMENT PROFILE ----
// GET /api/AssessmentProfile/         -> list/search
app.get(accept("/api/AssessmentProfile"), (_req, res) => {
  res.json(rows);
});

// GET /api/AssessmentProfile/:id      -> single profile
app.get("/api/AssessmentProfile/:id", (req, res) => {
  const item = rows.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// PUT /api/AssessmentProfile/:id      -> update fields (e.g., status/notes)
app.put("/api/AssessmentProfile/:id", (req, res) => {
  const i = rows.findIndex((r) => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  rows[i] = { ...rows[i], ...req.body };
  res.json(rows[i]);
});

// ---- ASSESSMENT DETAILS ----
// GET /api/AssessmentDetails/         -> list (or filtered)
app.get(accept("/api/AssessmentDetails"), (_req, res) => {
  // You can expand this with real detail fields later
  res.json(rows.map((r) => ({ ...r, notes: "Sample details" })));
});

// GET /api/AssessmentDetails/:id
app.get("/api/AssessmentDetails/:id", (req, res) => {
  const item = rows.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ ...item, notes: "Sample details for " + item.id });
});

// ---- PHOTO ----
// GET /api/PHOTO/:id
app.get("/api/PHOTO/:id", (req, res) => {
  res.json({ id: req.params.id, url: `/images/${req.params.id}.jpg` });
});

// Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ERIS Express API running at http://localhost:${PORT}`);
});
