const express = require("express");
const cors    = require("cors");
const db      = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

function sendDbError(res, err, message) {
  const status = err?.code === "DB_NOT_CONFIGURED" ? 503 : 500;
  return res.status(status).json({ success: false, message });
}

/* ================================================
   HEALTH CHECK
================================================ */
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Manivtha Travel Portal API running" });
});

/* ================================================
   BOOKINGS  (client-facing: Book Now page)
================================================ */

/** GET /api/bookings — list all bookings (newest first) */
app.get("/api/bookings", (req, res) => {
  const sql = "SELECT * FROM bookings ORDER BY created_at DESC";
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET /api/bookings error:", err);
      return sendDbError(res, err, "Failed to fetch bookings");
    }
    res.json({ success: true, data: rows });
  });
});

/** GET /api/bookings/:id — single booking by id */
app.get("/api/bookings/:id", (req, res) => {
  const sql = "SELECT * FROM bookings WHERE id = ?";
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) {
      console.error("GET /api/bookings/:id error:", err);
      return sendDbError(res, err, "Failed to fetch booking");
    }
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: rows[0] });
  });
});

/** POST /api/bookings — create a new booking */
app.post("/api/bookings", (req, res) => {
  const {
    customer_name,
    email,
    phone,
    company,
    service,
    vehicle,
    pickup,
    dropoff,
    booking_date,
    booking_time,
    notes,
  } = req.body;

  /* Validate required fields */
  if (!customer_name || !email || !phone || !service || !pickup || !dropoff || !booking_date || !booking_time) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: customer_name, email, phone, service, pickup, dropoff, booking_date, booking_time",
    });
  }

  const sql = `
    INSERT INTO bookings
      (customer_name, email, phone, company, service, vehicle, pickup, dropoff, booking_date, booking_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    customer_name,
    email,
    phone,
    company   || null,
    service,
    vehicle   || null,
    pickup,
    dropoff,
    booking_date,
    booking_time,
    notes     || null,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("POST /api/bookings error:", err);
      return sendDbError(res, err, "Failed to create booking");
    }
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      id: result.insertId,
    });
  });
});

/** PUT /api/bookings/:id/status — management approve / reject */
app.put("/api/bookings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "status must be pending | approved | rejected" });
  }

  const sql = "UPDATE bookings SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("PUT /api/bookings/:id/status error:", err);
      return sendDbError(res, err, "Failed to update booking status");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: `Booking ${status} successfully` });
  });
});

/** DELETE /api/bookings/:id — remove a booking */
app.delete("/api/bookings/:id", (req, res) => {
  const sql = "DELETE FROM bookings WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("DELETE /api/bookings/:id error:", err);
      return sendDbError(res, err, "Failed to delete booking");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted successfully" });
  });
});

/* ================================================
   LEGACY travel_requests  (kept for backward compat)
================================================ */
app.get("/api/requests", (req, res) => {
  db.query("SELECT * FROM travel_requests ORDER BY created_at DESC", (err, rows) => {
    if (err) return sendDbError(res, err, "Failed");
    res.json(rows);
  });
});

/* ================================================
   START SERVER
================================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Production URL: https://manivtha-travel-portal.onrender.com`);
  console.log(`   Endpoints:`);
  console.log(`   GET    /api/bookings`);
  console.log(`   GET    /api/bookings/:id`);
  console.log(`   POST   /api/bookings`);
  console.log(`   PUT    /api/bookings/:id/status`);
  console.log(`   DELETE /api/bookings/:id`);
});
