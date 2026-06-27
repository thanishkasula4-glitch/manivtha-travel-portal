import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import UrlIcon from "../components/UrlIcon";
import "./AdminPanel.css";

/* ── API base ── */
const API = "https://manivtha-travel-portal.onrender.com";

/* ── localStorage helpers (cache layer) ── */
function getLocalBookings()  { return JSON.parse(localStorage.getItem("mtb_bookings") || "[]"); }
function setLocalBookings(l) { localStorage.setItem("mtb_bookings", JSON.stringify(l)); }

/* ── Map MySQL row → local shape ── */
function mapBooking(b) {
  return {
    id:        b.id,
    status:    b.status,
    name:      b.customer_name,
    email:     b.email,
    phone:     b.phone,
    company:   b.company,
    service:   b.service,
    vehicle:   b.vehicle,
    pickup:    b.pickup,
    dropoff:   b.dropoff,
    date:      b.booking_date ?? b.date,
    time:      b.booking_time ?? b.time,
    notes:     b.notes,
    createdAt: b.created_at ?? b.createdAt,
  };
}

async function fetchBookingsFromDB() {
  try {
    const res = await fetch(`${API}/api/bookings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const mapped = json.data.map(mapBooking);
    setLocalBookings(mapped); // keep cache in sync
    return mapped;
  } catch (e) {
    console.warn("AdminPanel: MySQL fetch failed, using localStorage:", e.message);
    return getLocalBookings();
  }
}

async function updateStatusInDB(id, status) {
  try {
    const res = await fetch(`${API}/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return true;
  } catch (e) {
    console.warn("AdminPanel: status update failed, updating localStorage only:", e.message);
    /* fallback: update localStorage */
    setLocalBookings(getLocalBookings().map(b => b.id === id ? { ...b, status } : b));
    return false;
  }
}

const INIT_VEHICLES = [
  { id:"V001",  type:"Hatchback", model:"Maruti Swift",         plate:"KA01 AB 1001", status:"Available",  driver:"Ramesh K.",  seats:4,  pricePerDay:2500  },
  { id:"V002",  type:"Hatchback", model:"Maruti Baleno",        plate:"KA01 AB 1002", status:"Available",  driver:"Suresh M.",  seats:5,  pricePerDay:2800  },
  { id:"V003",  type:"Sedan",     model:"Maruti Dzire",         plate:"KA01 AB 1003", status:"Available",  driver:"Kiran P.",   seats:4,  pricePerDay:3500  },
  { id:"V004",  type:"Sedan",     model:"Honda City",           plate:"KA01 AB 1004", status:"Available",  driver:"Vijay S.",   seats:4,  pricePerDay:5000  },
  { id:"V005",  type:"Sedan",     model:"Hyundai Verna",        plate:"KA01 AB 1005", status:"Available",  driver:"Arun R.",    seats:4,  pricePerDay:5500  },
  { id:"V006",  type:"SUV",       model:"Hyundai Creta",        plate:"KA01 AB 1006", status:"Available",  driver:"Raju T.",    seats:5,  pricePerDay:6000  },
  { id:"V007",  type:"SUV",       model:"Kia Seltos",           plate:"KA01 AB 1007", status:"Available",  driver:"Sanjay D.",  seats:5,  pricePerDay:6500  },
  { id:"V008",  type:"MPV",       model:"Toyota Innova Crysta", plate:"KA01 AB 1008", status:"In Service", driver:"Manoj B.",   seats:7,  pricePerDay:7500  },
  { id:"V009",  type:"SUV",       model:"Toyota Fortuner",      plate:"KA01 AB 1009", status:"Available",  driver:"Deepak N.",  seats:7,  pricePerDay:12000 },
  { id:"V010",  type:"Luxury",    model:"BMW 5 Series",         plate:"KA01 AB 1010", status:"Available",  driver:"Arjun M.",   seats:4,  pricePerDay:18000 },
  { id:"V011",  type:"Luxury",    model:"Mercedes E-Class",     plate:"KA01 AB 1011", status:"Available",  driver:"Pradeep K.", seats:4,  pricePerDay:22000 },
];

function getVehicles()  { const d = localStorage.getItem("mtb_vehicles_v2");  return d ? JSON.parse(d) : INIT_VEHICLES; }
function saveVehicles(v){ localStorage.setItem("mtb_vehicles_v2",  JSON.stringify(v)); }

/* ── SVG Bar Chart ── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 420, H = 200, PAD = { t: 20, r: 20, b: 50, l: 36 };
  const bw = (W - PAD.l - PAD.r) / data.length;
  const barW = bw * 0.5;
  const [tooltip, setTooltip] = useState(null);

  const yGridLines = [0, 0.75, 1.5, 2.25, 3];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="bar-svg" preserveAspectRatio="xMidYMid meet">
        {yGridLines.map(v => {
          const y = PAD.t + (1 - v / 3) * (H - PAD.t - PAD.b);
          return (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#e8ecf0" strokeWidth="1" />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#90a4ae">{v}</text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const bh = ((d.value / max) * (H - PAD.t - PAD.b)) || 2;
          const x = PAD.l + i * bw + (bw - barW) / 2;
          const y = H - PAD.b - bh;
          return (
            <g key={d.label}
              onMouseEnter={(e) => setTooltip({ x: x + barW / 2, y, label: d.label, value: d.value })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            >
              <rect x={x} y={y} width={barW} height={bh} rx={4}
                fill={tooltip?.label === d.label ? "#e6b800" : "#f5c518"} />
              <text x={x + barW / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#607d8b">
                {d.label}
              </text>
            </g>
          );
        })}

        {tooltip && (
          <g>
            <rect x={tooltip.x - 44} y={tooltip.y - 34} width={88} height={26} rx={6} fill="#0d1b2a" opacity=".9" />
            <text x={tooltip.x} y={tooltip.y - 17} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">
              {tooltip.label}
            </text>
            <text x={tooltip.x} y={tooltip.y - 7} textAnchor="middle" fontSize="9" fill="#f5c518">
              count : {tooltip.value}
            </text>
          </g>
        )}

        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#e0e6ed" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* ── SVG Donut Chart ── */
function DonutChart({ slices }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const [hovered, setHovered] = useState(null);
  let current = 0;
  const gradient = slices.map((slice) => {
    const start = current;
    current += (slice.value / total) * 100;
    return `${slice.color} ${start}% ${current}%`;
  }).join(", ");

  return (
    <div className="chart-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", minHeight: "200px" }}>
      <div
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
          boxShadow: hovered ? "0 0 0 5px rgba(13, 27, 42, 0.06)" : "none",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: "36px", borderRadius: "50%", background: "#fff" }} />
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {slices.map((slice) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHovered(slice.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ display: "flex", alignItems: "center", gap: "8px", color: slice.color, fontSize: "0.78rem", fontWeight: 600 }}
          >
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: slice.color }} />
            {slice.label} {Math.round((slice.value / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat icons ── */
const CalIcon = () => <UrlIcon name="calendar-month" size={22} />;
const ClockIcon = () => <UrlIcon name="schedule" size={22} />;
const CheckIcon = () => <UrlIcon name="check-circle" size={22} />;
const CarIcon2 = () => <UrlIcon name="directions-car" size={22} />;
const TrendIcon = () => <UrlIcon name="trending-up" size={22} />;
const CancelIcon = () => <UrlIcon name="cancel" size={22} />;

const TABS = ["Overview", "Bookings", "Vehicles"];

const BAR_DATA = [
  { label: "airport transfer",   value: 3 },
  { label: "city transfer",      value: 2 },
  { label: "employee transport", value: 1 },
  { label: "corporate travel",   value: 1 },
];

const DONUT_DATA = [
  { label: "approved", value: 6, color: "#22c55e" },
  { label: "pending",  value: 1, color: "#3b82f6"  },
  { label: "rejected", value: 1, color: "#ef4444"  },
];

/* ══════════════════════════════════
   VEHICLES TAB
══════════════════════════════════ */
function VehiclesTab() {
  const [vehicles, setVehicles] = useState(getVehicles());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"Sedan", model:"", plate:"", src:"" });

  const up = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, src: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.model || !form.plate) { alert("Please fill Model and Plate."); return; }
    const next = [...vehicles];
    const newId = "V" + String(next.length + 1).padStart(3, "0");
    const newV = { id: newId, ...form };
    next.push(newV);
    saveVehicles(next);
    setVehicles(next);
    setForm({ type:"Sedan", model:"", plate:"", src:"" });
    setShowForm(false);
  };

  const handleRemove = (id) => {
    if (!window.confirm(`Remove vehicle ${id}?`)) return;
    const next = vehicles.filter(v => v.id !== id);
    saveVehicles(next);
    setVehicles(next);
  };

  return (
    <div className="ap-tab-placeholder">
      <div className="ap-tab-header-row">
        <div>
          <div className="ap-placeholder-icon">🚗</div>
          <h2>Fleet Management</h2>
          <p>{vehicles.length} vehicles in your fleet.</p>
        </div>
        <button className="ap-add-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Add Vehicle"}
        </button>
      </div>

      {showForm && (
        <div className="ap-add-form">
          <h4>Add New Vehicle</h4>
          <div className="ap-form-row">
            <div className="ap-form-field">
              <label>Type</label>
              <select value={form.type} onChange={up("type")}>
                {["Sedan","SUV","Luxury","Van"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="ap-form-field">
              <label>Model *</label>
              <input type="text" placeholder="Toyota Camry" value={form.model} onChange={up("model")} />
            </div>
            <div className="ap-form-field">
              <label>Plate *</label>
              <input type="text" placeholder="KA01 AB 1234" value={form.plate} onChange={up("plate")} />
            </div>
            <div className="ap-form-field ap-form-field-full">
              <label>Car Image</label>
              <div className="ap-upload-area">
                {form.src ? (
                  <div className="ap-upload-preview">
                    <img src={form.src} alt="Preview" />
                    <button type="button" className="ap-upload-remove" onClick={() => setForm(f => ({ ...f, src: "" }))}>✕</button>
                  </div>
                ) : (
                  <label className="ap-upload-label">
                    <span className="ap-upload-icon">📷</span>
                    <span>Click to upload car image</span>
                    <small>JPG, PNG up to 2MB</small>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <button className="ap-save-btn" onClick={handleAdd}>Save Vehicle</button>
        </div>
      )}

      <table className="ap-table">
        <thead><tr><th>Photo</th><th>ID</th><th>Type</th><th>Model</th><th>Plate</th><th>Seats</th><th>₹/Day</th><th>Action</th></tr></thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td>
                {v.src || v.imageUrl
                  ? <img src={v.src || v.imageUrl} alt={v.model} style={{ width: "64px", height: "42px", objectFit: "cover", borderRadius: "8px", display: "block" }} />
                  : <div style={{ width: "64px", height: "42px", background: "#e8ecf0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🚗</div>
                }
              </td>
              <td>{v.id}</td>
              <td>{v.type}</td>
              <td>{v.model}</td>
              <td>{v.plate}</td>
              <td>{v.seats || "—"}</td>
              <td>{v.pricePerDay ? "₹" + v.pricePerDay.toLocaleString("en-IN") : "—"}</td>
              <td>
                <button className="ap-remove-btn" onClick={() => handleRemove(v.id)}>🗑 Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [bookings, setBookingsState] = useState([]);

  const refreshBookings = useCallback(async () => {
    const data = await fetchBookingsFromDB();
    setBookingsState(data);
  }, []);

  useEffect(() => {
    refreshBookings();
    const iv = setInterval(refreshBookings, 3000);
    return () => clearInterval(iv);
  }, [refreshBookings]);

  /* Live stats computed from real bookings */
  const stats = [
    { label: "Total Bookings", value: String(bookings.length),                                          icon: <CalIcon />,   color: "stat-blue",   bg: "stat-bg-blue"   },
    { label: "Pending",        value: String(bookings.filter(b => b.status === "pending").length),       icon: <ClockIcon />, color: "stat-orange", bg: "stat-bg-orange" },
    { label: "Approved",       value: String(bookings.filter(b => b.status === "approved").length),      icon: <CheckIcon />, color: "stat-green",  bg: "stat-bg-green"  },
    { label: "Rejected",       value: String(bookings.filter(b => b.status === "rejected").length),      icon: <CancelIcon />,color: "stat-red",    bg: "stat-bg-red"    },
    { label: "Vehicles",       value: String(getVehicles().length),                                      icon: <CarIcon2 />,  color: "stat-purple", bg: "stat-bg-purple" },
    { label: "Available",      value: String(getVehicles().filter(v => v.status === "Available").length),icon: <TrendIcon />, color: "stat-teal",   bg: "stat-bg-teal"   },
  ];

  const donutData = [
    { label: "approved", value: Math.max(bookings.filter(b => b.status === "approved").length, 0), color: "#22c55e" },
    { label: "pending",  value: Math.max(bookings.filter(b => b.status === "pending").length,  0), color: "#3b82f6" },
    { label: "rejected", value: Math.max(bookings.filter(b => b.status === "rejected").length, 0), color: "#ef4444" },
  ].filter(s => s.value > 0);

  const handleApprove = async (id) => {
    await updateStatusInDB(id, "approved");
    refreshBookings();
  };

  const handleReject = async (id) => {
    await updateStatusInDB(id, "rejected");
    refreshBookings();
  };

  return (
    <div className="ap-root">
      <Navbar activePage="" />

      {/* HERO */}
      <section className="ap-hero">
        <div className="ap-hero-overlay" />
        <div className="ap-hero-content">
          <div className="ap-hero-tag">ADMINISTRATION</div>
          <h1 className="ap-hero-title">Admin Dashboard</h1>
        </div>
      </section>

      {/* TABS */}
      <div className="ap-tabs-bar">
        <div className="ap-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`ap-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "Overview" && <UrlIcon name="dashboard" size={15} />}
              {t === "Bookings" && <UrlIcon name="calendar-month" size={15} />}
              {t === "Vehicles" && <UrlIcon name="directions-car" size={15} />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="ap-main">
        {activeTab === "Overview" && (
          <>
            {/* Stats Grid */}
            <div className="ap-stats-grid">
              {stats.map((s, i) => (
                <div className="ap-stat-card" key={s.label} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`ap-stat-icon ${s.bg}`}>
                    <span className={s.color}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="ap-stat-value">{s.value}</div>
                    <div className="ap-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="ap-charts-row">
              <div className="ap-chart-card">
                <h3 className="ap-chart-title">Bookings by Service</h3>
                <BarChart data={BAR_DATA} />
              </div>
              <div className="ap-chart-card">
                <h3 className="ap-chart-title">Bookings by Status</h3>
                {donutData.length > 0
                  ? <DonutChart slices={donutData} />
                  : <div style={{ padding: "40px", textAlign: "center", color: "#90a4ae" }}>No bookings yet</div>
                }
              </div>
            </div>
          </>
        )}

        {activeTab === "Bookings" && (
          <div className="ap-tab-placeholder">
            <div className="ap-placeholder-icon">📋</div>
            <h2>All Bookings</h2>
            <p>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} submitted — {bookings.filter(b => b.status === "pending").length} pending,{" "}
              {bookings.filter(b => b.status === "approved").length} approved,{" "}
              {bookings.filter(b => b.status === "rejected").length} rejected.
            </p>

            {bookings.length === 0 ? (
              <div className="ap-empty-bookings">
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</div>
                <p>No bookings yet. Bookings submitted from the <Link to="/book" style={{ color: "#f5c518" }}>Book Now</Link> page will appear here.</p>
              </div>
            ) : (
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Vehicle</th>
                    <th>From → To</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>#{String(b.id).slice(-6)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.name || "—"}</div>
                        <div style={{ fontSize: ".75rem", color: "#90a4ae" }}>{b.email || ""}</div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{b.service || "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{b.vehicle || "—"}</td>
                      <td style={{ fontSize: ".78rem" }}>
                        <div>📍 {b.pickup || "—"}</div>
                        <div>🏁 {b.dropoff || "—"}</div>
                      </td>
                      <td>{b.date || "—"}<br /><span style={{ fontSize: ".75rem", color: "#90a4ae" }}>{b.time || ""}</span></td>
                      <td>
                        <span className={`ap-badge ap-badge-${b.status}`}>
                          {b.status === "pending"  ? "⏳ Pending"  :
                           b.status === "approved" ? "✅ Approved" :
                           b.status === "rejected" ? "❌ Rejected" : b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === "pending" && (
                          <div className="ap-action-btns">
                            <button className="ap-accept-btn" onClick={() => handleApprove(b.id)}>✓ Approve</button>
                            <button className="ap-reject-btn" onClick={() => handleReject(b.id)}>✗ Reject</button>
                          </div>
                        )}
                        {b.status === "approved" && (
                          <span style={{ fontSize: ".8rem", color: "#2e7d32" }}>✅ Ride Confirmed</span>
                        )}
                        {b.status === "rejected" && (
                          <span style={{ fontSize: ".8rem", color: "#c62828" }}>❌ Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "Vehicles" && <VehiclesTab />}
      </main>

      {/* FOOTER */}
      <footer className="ap-footer">
        <div className="ap-footer-inner">
          <div className="ap-footer-brand">
            <div className="ap-footer-logo-row">
              <div className="ap-flogo-icon">
                <UrlIcon name="flight" size={18} color="#f5c518" />
              </div>
              <span className="ap-footer-name">Manivtha Tours &amp; Travels</span>
            </div>
            <p>India's premium corporate travel and fleet management solutions. Trusted by leading companies nationwide.</p>
          </div>
          <div className="ap-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[["Home","/"],["Services","/services"],["Book Now","/book"]].map(([l,h])=>(
                <li key={l}><Link to={h}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className="ap-footer-col">
            <h4>Services</h4>
            <ul>
              {["Airport Transfers","Employee Transport","Corporate Travel","Fleet Management","City Transfers"].map(s=>(
                <li key={s}><Link to="/services">{s}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ap-footer-bottom">
          <span>© 2026 Manivtha Tours &amp; Travels. All rights reserved.</span>
          <div><a href="#">Privacy Policy</a> &nbsp; <a href="#">Terms of Service</a></div>
        </div>
      </footer>
    </div>
  );
}
