import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import "./BookNow.css";
import Navbar from "../components/Navbar";
import UrlIcon from "../components/UrlIcon";

/* ── Icons ── */
const PlaneIcon = () => <UrlIcon name="flight" size={22} color="#f5c518" />;
const PinIcon = () => <UrlIcon name="location-on" size={16} />;
const AirportIcon = () => <UrlIcon name="flight" size={26} />;
const PeopleIcon = () => <UrlIcon name="groups" size={26} />;
const BriefcaseIcon = () => <UrlIcon name="business-center" size={26} />;
const CarIcon = () => <UrlIcon name="directions-car" size={26} />;
const ArrowIcon = () => <UrlIcon name="arrow-forward" size={18} color="#ffffff" />;
const CheckCircleIcon = () => <UrlIcon name="check-circle" size={64} color="#22c55e" />;
const ClockIcon = () => <UrlIcon name="schedule" size={64} color="#f5c518" />;

/* ── Step Indicator ── */
const API = "https://manivtha-travel-portal.onrender.com";
const VEHICLE_SERVICES = new Set(["rent_car", "corporate"]);
const needsVehicle = (service) => VEHICLE_SERVICES.has(service);

function StepBar({ current, service }) {
  const steps = needsVehicle(service)
    ? ["Service", "Details", "Vehicle", "Confirm"]
    : ["Service", "Details", "Confirm"];

  const visualStep = needsVehicle(service)
    ? current
    : current === 4 ? 3 : current;

  return (
    <div className="book-stepbar">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < visualStep;
        const active = num === visualStep;
        return (
          <div key={label} className="book-step-item">
            <div className={`book-step-circle ${done ? "done" : active ? "active" : ""}`}>
              {done ? "✓" : num}
            </div>
            <span className={`book-step-label ${active ? "active" : ""}`}>{label}</span>
            {i < steps.length - 1 && (
              <div className={`book-step-line ${done ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Service Selection ── */
const SERVICES = [
  { id: "airport",   icon: <AirportIcon />,   title: "Airport Transfer",   desc: "Door-to-door airport service",      badge: null },
  { id: "employee",  icon: <PeopleIcon />,     title: "Employee Transport", desc: "Daily commute solutions",           badge: null },
  { id: "corporate", icon: <BriefcaseIcon />,  title: "Corporate Travel",   desc: "Business trip management",          badge: null },
  { id: "city",      icon: <CarIcon />,        title: "City Transfer",      desc: "Point-to-point city rides",         badge: null },
  { id: "rent_car",  icon: <CarIcon />,        title: "Rent a Car",         desc: "Self-drive or chauffeur, your pick", badge: null },
];

function Step1({ data, setData }) {
  return (
    <div className="book-step-content">
      <div className="book-service-grid">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            className={`book-service-card ${data.service === s.id ? "selected" : ""} ${s.id === "rent_car" ? "book-service-card-featured" : ""}`}
            onClick={() => setData((d) => ({ ...d, service: s.id, vehicle: "" }))}
          >
            {s.badge && <span className={`book-svc-badge ${s.badge === "New" ? "badge-new" : "badge-biz"}`}>{s.badge}</span>}
            <div className="book-service-icon">{s.icon}</div>
            <div>
              <div className="book-service-title">{s.title}</div>
              <div className="book-service-desc">{s.desc}</div>
            </div>
            {data.service === s.id && <div className="book-service-check">✓</div>}
          </button>
        ))}
      </div>
      {data.service && needsVehicle(data.service) && (
        <div className="book-vehicle-hint">
          🚗 You'll choose your car in the next step.
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Details ── */
function Step2({ data, setData }) {
  const up = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="book-step-content">
      <div className="book-form-grid">
        <div className="book-form-row">
          <div className="book-field">
            <label>Full Name *</label>
            <input type="text" placeholder="John Smith" value={data.name || ""} onChange={up("name")} />
          </div>
          <div className="book-field">
            <label>Email Address *</label>
            <input type="email" placeholder="john@company.com" value={data.email || ""} onChange={up("email")} />
          </div>
        </div>
        <div className="book-form-row">
          <div className="book-field">
            <label>Phone Number *</label>
            <input type="tel" placeholder="+91 98765 43210" value={data.phone || ""} onChange={up("phone")} />
          </div>
          <div className="book-field">
            <label>Company</label>
            <input type="text" placeholder="Your Company Ltd." value={data.company || ""} onChange={up("company")} />
          </div>
        </div>
        <div className="book-form-row">
          <div className="book-field">
            <label>Pickup Location *</label>
            <div className="book-field-icon-wrap">
              <span className="book-field-icon"><PinIcon /></span>
              <input type="text" placeholder="Enter pickup address or airport" value={data.pickup || ""} onChange={up("pickup")} className="has-icon" />
            </div>
          </div>
          <div className="book-field">
            <label>Drop-off Location *</label>
            <div className="book-field-icon-wrap">
              <span className="book-field-icon"><PinIcon /></span>
              <input type="text" placeholder="Enter destination address" value={data.dropoff || ""} onChange={up("dropoff")} className="has-icon" />
            </div>
          </div>
        </div>
        <div className="book-form-row">
          <div className="book-field">
            <label>Date *</label>
            <input type="date" value={data.date || ""} onChange={up("date")} />
          </div>
          <div className="book-field">
            <label>Time *</label>
            <input type="time" value={data.time || ""} onChange={up("time")} />
          </div>
        </div>
        <div className="book-field full">
          <label>Special Instructions</label>
          <textarea placeholder="Any special requirements, flight number, etc." value={data.notes || ""} onChange={up("notes")} rows={3} />
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Fleet Browser ── */
const FLEET_CATEGORIES = [
  { id: "all",    label: "ALL VEHICLES"     },
  { id: "sedan",  label: "SEDANS"           },
  { id: "suv",    label: "SUVS"             },
  { id: "tempo",  label: "TEMPO TRAVELLERS" },
  { id: "bus",    label: "BUSES"            },
  { id: "luxury", label: "LUXURY"           },
];

const BADGE_COLORS = {
  sedan:  { bg: "#b03a2e", text: "#fff" },
  suv:    { bg: "#1a5276", text: "#fff" },
  tempo:  { bg: "#b7950b", text: "#fff" },
  bus:    { bg: "#0e6655", text: "#fff" },
  luxury: { bg: "#6c3483", text: "#fff" },
};

const imageUrl = (src) => new URL(src, window.location.origin).href;

const VEHICLES = [
  { id: "swift",      label: "Maruti Suzuki Swift Dzire", seats: "4 passengers", price: "₹3,500/day", features: ["AC", "Music System", "GPS"],        category: "sedan",  src: imageUrl("/cars/sedan.png"),    badge: "SEDAN",           color: "blue"   },
  { id: "honda_city", label: "Honda City",                seats: "4 passengers", price: "₹5,000/day", features: ["AC", "Music System", "GPS"],        category: "sedan",  src: imageUrl("/cars/sedan.png"),    badge: "SEDAN",           color: "blue"   },
  { id: "verna",      label: "Hyundai Verna",             seats: "4 passengers", price: "₹5,500/day", features: ["AC", "Music System", "GPS"],        category: "sedan",  src: imageUrl("/cars/sedan.png"),    badge: "SEDAN",           color: "blue"   },
  { id: "ertiga",     label: "Maruti Ertiga",             seats: "7 passengers", price: "₹5,500/day", features: ["AC", "Music System", "GPS"],        category: "suv",    src: imageUrl("/cars/innova.png"),   badge: "SUV",             color: "green"  },
  { id: "creta",      label: "Hyundai Creta",             seats: "5 passengers", price: "₹6,000/day", features: ["AC", "Platinum Sound", "GPS"],      category: "suv",    src: imageUrl("/cars/innova.png"),   badge: "SUV",             color: "green"  },
  { id: "seltos",     label: "Kia Seltos",                seats: "5 passengers", price: "₹6,500/day", features: ["AC", "Platinum Sound", "GPS"],      category: "suv",    src: imageUrl("/cars/innova.png"),   badge: "SUV",             color: "green"  },
  { id: "innova",     label: "Toyota Innova Crysta",      seats: "7 passengers", price: "₹7,500/day", features: ["AC", "Platinum Sound", "GPS"],      category: "suv",    src: imageUrl("/cars/innova.png"),   badge: "SUV",             color: "purple", popular: true },
  { id: "fortuner",   label: "Toyota Fortuner",           seats: "7 passengers", price: "₹12,000/day",features: ["AC", "Premium Sound", "GPS"],       category: "suv",    src: imageUrl("/cars/fortuner.png"), badge: "SUV",             color: "yellow" },
  { id: "tempo12",    label: "Tempo Traveller 12-Seater", seats: "12 passengers",price: "₹12,000/day",features: ["AC", "Music System", "GPS"],        category: "tempo",  src: imageUrl("/cars/tempo.png"),    badge: "TEMPO TRAVELLER", color: "purple" },
  { id: "volvo_bus",  label: "Volvo B10R Bus",            seats: "45 passengers",price: "₹45,000/day",features: ["AC", "TV", "Music System"],         category: "bus",    src: imageUrl("/cars/tempo.png"),    badge: "BUS",             color: "purple" },
  { id: "bmw5",       label: "BMW 5 Series",              seats: "4 passengers", price: "₹18,000/day",features: ["AC", "Premium Audio", "Leather"],   category: "luxury", src: imageUrl("/cars/bmw.png"),      badge: "LUXURY",          color: "yellow" },
  { id: "mercedes_e", label: "Mercedes-Benz E-Class",     seats: "4 passengers", price: "₹22,000/day",features: ["AC", "Massage Seats", "Burmester"], category: "luxury", src: imageUrl("/cars/mercedes.png"), badge: "LUXURY",          color: "yellow" },
];

function Step3({ data, setData }) {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = activeCat === "all" ? VEHICLES : VEHICLES.filter(v => v.category === activeCat);

  return (
    <div className="fleet-browser">
      <div className="fleet-header">
        <div className="fleet-tag">OUR FLEET</div>
        <h2 className="fleet-title">Available <em>Vehicles</em></h2>
        <p className="fleet-desc">From nimble sedans to spacious buses — find the perfect vehicle for your journey.</p>
      </div>

      <div className="fleet-filters">
        {FLEET_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`fleet-filter-btn ${activeCat === cat.id ? "active" : ""}`}
            onClick={() => setActiveCat(cat.id)}
          >{cat.label}</button>
        ))}
      </div>

      <div className="fleet-grid">
        {filtered.map(v => {
          const bc = BADGE_COLORS[v.category];
          const selected = data.vehicle === v.id;
          return (
            <div
              key={v.id}
              className={`fleet-card ${selected ? "fleet-card-selected" : ""}`}
              onClick={() => setData(d => ({ ...d, vehicle: v.id }))}
            >
              <div className="fleet-card-img-wrap">
                <img src={v.src} alt={v.label} className="fleet-card-img" />
                <span className="fleet-card-badge" style={{ background: bc.bg, color: bc.text }}>{v.badge}</span>
                {v.popular && <span className="fleet-card-hot">⭐ Most Popular</span>}
                {selected && <div className="fleet-selected-overlay">✓ Selected</div>}
              </div>
              <div className="fleet-card-body">
                <div className="fleet-card-name">{v.label}</div>
                <div className="fleet-card-seats">
                  <UrlIcon name="person" size={13} />
                  {v.seats}
                </div>
                <div className="fleet-features">
                  {v.features.map(f => <span key={f} className="fleet-feat">{f}</span>)}
                </div>
                <div className="fleet-card-footer">
                  <div className="fleet-price">
                    <span className="fleet-price-from">From</span>
                    <span className="fleet-price-val">{v.price}</span>
                  </div>
                  <button
                    className={`fleet-book-btn ${selected ? "fleet-book-selected" : ""}`}
                    onClick={e => { e.stopPropagation(); setData(d => ({ ...d, vehicle: v.id })); }}
                  >{selected ? "Selected ✓" : "BOOK →"}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 4: Review & Confirm ── */
function Step4({ data }) {
  const svc = SERVICES.find((s) => s.id === data.service);
  const veh = VEHICLES.find((v) => v.id === data.vehicle);
  return (
    <div className="book-step-content">
      <div className="book-review-wrap">
        <div className="book-review-header">
          <h3 className="pay-heading">Review Your Booking</h3>
          <p className="book-review-note">
            Please confirm your details. After submission, your request will be sent to management for approval.
          </p>
        </div>
        <div className="book-review-grid">
          <div className="book-review-section">
            <div className="book-review-section-title">🚗 Service &amp; Vehicle</div>
            <div className="review-row"><span>Service</span><strong>{svc?.title || "—"}</strong></div>
            <div className="review-row"><span>Vehicle</span><strong>{veh?.label || "—"}</strong></div>
            <div className="review-row"><span>Est. Price</span><strong>{veh?.price || "—"}</strong></div>
          </div>
          <div className="book-review-section">
            <div className="book-review-section-title">📍 Trip Details</div>
            <div className="review-row"><span>From</span><strong>{data.pickup || "—"}</strong></div>
            <div className="review-row"><span>To</span><strong>{data.dropoff || "—"}</strong></div>
            <div className="review-row"><span>Date</span><strong>{data.date || "—"}</strong></div>
            <div className="review-row"><span>Time</span><strong>{data.time || "—"}</strong></div>
          </div>
          <div className="book-review-section">
            <div className="book-review-section-title">👤 Passenger Info</div>
            <div className="review-row"><span>Name</span><strong>{data.name || "—"}</strong></div>
            <div className="review-row"><span>Email</span><strong>{data.email || "—"}</strong></div>
            <div className="review-row"><span>Phone</span><strong>{data.phone || "—"}</strong></div>
            {data.company && <div className="review-row"><span>Company</span><strong>{data.company}</strong></div>}
          </div>
        </div>
        <div className="book-review-approval-notice">
          <div className="approval-notice-icon">⏳</div>
          <div>
            <strong>What happens next?</strong>
            <p>Your ride request will be sent to management. Once approved, you'll see a <span className="approval-pay-badge">Ride Booked ✅</span> confirmation in your bookings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 5 (after submit): Status Tracker ── */
function StepPending({ data, bookingId }) {
  const svc = SERVICES.find((s) => s.id === data.service);
  const veh = VEHICLES.find((v) => v.id === data.vehicle);

  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/bookings/${bookingId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setStatus(json.data.status);
          }
        }
      } catch { /* backend unreachable — keep showing current status */ }
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  /* ── APPROVED ── */
  if (status === "approved") {
    return (
      <div className="book-step-content book-confirm">
        <div className="confirm-icon" style={{ color: "#22c55e" }}>
          <CheckCircleIcon />
        </div>
        <h2 className="confirm-title" style={{ color: "#22c55e" }}>Your Ride is Booked! 🎉</h2>
        <p className="confirm-sub">
          Management has approved your booking. Your driver will be assigned shortly.<br />
          A confirmation will be sent to <strong>{data.email || "your email"}</strong>.
        </p>
        <div className="confirm-card" style={{ marginTop: "24px" }}>
          <div className="confirm-row"><span>Booking ID</span><strong>#{bookingId}</strong></div>
          <div className="confirm-row"><span>Service</span><strong>{svc?.title}</strong></div>
          {veh && <div className="confirm-row"><span>Vehicle</span><strong>{veh.label}</strong></div>}
          <div className="confirm-row"><span>From</span><strong>{data.pickup || "—"}</strong></div>
          <div className="confirm-row"><span>To</span><strong>{data.dropoff || "—"}</strong></div>
          <div className="confirm-row"><span>Date &amp; Time</span><strong>{data.date} {data.time}</strong></div>
          <div className="confirm-row"><span>Passenger</span><strong>{data.name}</strong></div>
        </div>
        <div className="confirm-actions">
          <Link to="/" className="confirm-home-btn">Back to Home</Link>
        </div>
      </div>
    );
  }

  /* ── REJECTED ── */
  if (status === "rejected") {
    return (
      <div className="book-step-content book-confirm">
        <div className="confirm-icon" style={{ color: "#ef5350" }}>
          <UrlIcon name="cancel" size={64} color="#ef5350" />
        </div>
        <h2 className="confirm-title" style={{ color: "#ef5350" }}>Booking Rejected</h2>
        <p className="confirm-sub">Unfortunately, management was unable to accommodate your request. Please try booking again with different details.</p>
        <div className="confirm-actions">
          <Link to="/" className="confirm-home-btn">Back to Home</Link>
          <Link to="/book" className="confirm-download-btn" style={{ textDecoration: "none" }}>Book Again</Link>
        </div>
      </div>
    );
  }

  /* ── PENDING — waiting for management ── */
  return (
    <div className="book-step-content book-confirm">
      <div className="confirm-icon" style={{ color: "#f5c518" }}>
        <ClockIcon />
      </div>
      <h2 className="confirm-title">Request Submitted!</h2>
      <p className="confirm-sub">
        Your booking request has been sent to management for review.<br />
        <strong>Booking ID: #{bookingId}</strong><br />
        You'll be notified once management approves your ride.
      </p>

      <div className="pending-status-card">
        <div className="pending-step pending-step-done">
          <div className="pending-step-dot done">✓</div>
          <div>
            <strong>Request Submitted</strong>
            <p>Your booking details have been sent to management</p>
          </div>
        </div>
        <div className="pending-step pending-step-active">
          <div className="pending-step-dot pulse">⏳</div>
          <div>
            <strong>Awaiting Management Approval</strong>
            <p>Management is reviewing your request</p>
          </div>
        </div>
        <div className="pending-step">
          <div className="pending-step-dot upcoming">🚗</div>
          <div>
            <strong>Ride Confirmed</strong>
            <p>Your driver will be assigned once approved</p>
          </div>
        </div>
      </div>

      <div className="confirm-card" style={{ marginTop: "24px" }}>
        <div className="confirm-row"><span>Service</span><strong>{svc?.title}</strong></div>
        {veh && <div className="confirm-row"><span>Vehicle</span><strong>{veh.label}</strong></div>}
        <div className="confirm-row"><span>From</span><strong>{data.pickup || "—"}</strong></div>
        <div className="confirm-row"><span>To</span><strong>{data.dropoff || "—"}</strong></div>
        <div className="confirm-row"><span>Date &amp; Time</span><strong>{data.date} {data.time}</strong></div>
        <div className="confirm-row"><span>Passenger</span><strong>{data.name}</strong></div>
      </div>

      <div className="confirm-actions" style={{ marginTop: "24px" }}>
        <Link to="/" className="confirm-home-btn">Back to Home</Link>
      </div>
    </div>
  );
}

/* ── My Bookings Section ── */
const SERVICE_LABELS = {
  airport: "Airport Transfer",
  employee: "Employee Transport",
  corporate: "Corporate Travel",
  city: "City Transfer",
  rent_car: "Rent a Car",
};

function MyBookings({ activeBookingId }) {
  const [bookings, setBookings] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/bookings`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const mapped = json.data.map(b => ({
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
            date:      b.booking_date,
            time:      b.booking_time,
            notes:     b.notes,
            createdAt: b.created_at,
          }));
          setBookings(mapped);
        }
      }
    } catch { /* backend unreachable — show nothing */ }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 3000);
    return () => clearInterval(iv);
  }, [refresh]);

  if (bookings.length === 0) return null;

  const statusConfig = {
    pending:  { label: "Awaiting Approval",  icon: "⏳", cls: "mbk-status-pending",  bg: "mbk-card-pending"  },
    approved: { label: "Ride Booked ✅",      icon: "✅", cls: "mbk-status-accepted", bg: "mbk-card-accepted" },
    rejected: { label: "Rejected",            icon: "❌", cls: "mbk-status-rejected", bg: "mbk-card-rejected" },
  };

  return (
    <section className="my-bookings-section">
      <div className="my-bookings-inner">
        <div className="my-bookings-header">
          <div className="my-bookings-title">
            <span className="mbk-title-icon">📋</span>
            My Bookings
          </div>
          <p className="my-bookings-sub">Track all your ride requests below</p>
        </div>

        <div className="mbk-list">
          {[...bookings].reverse().map((b) => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            const isActive = b.id === activeBookingId;
            const isApproved = b.status === "approved";
            return (
              <div
                key={b.id}
                className={`mbk-card ${cfg.bg} ${isActive ? "mbk-card-active" : ""} ${isApproved ? "mbk-card-pulse" : ""}`}
              >
                {/* Left: booking details */}
                <div className="mbk-details">
                  <div className="mbk-id">
                    #{String(b.id).slice(-6)}
                    {isActive && <span className="mbk-new-badge">New</span>}
                  </div>
                  <div className="mbk-service">
                    {SERVICE_LABELS[b.service] || b.service}
                    {b.vehicle && <>&nbsp;·&nbsp;{b.vehicle}</>}
                  </div>
                  <div className="mbk-route">
                    <span className="mbk-route-pin">📍</span>{b.pickup || "—"}
                    <span className="mbk-route-arrow">→</span>
                    <span className="mbk-route-pin">🏁</span>{b.dropoff || "—"}
                  </div>
                  <div className="mbk-datetime">{b.date}&nbsp;{b.time}</div>
                </div>

                {/* Right: status */}
                <div className="mbk-status-col">
                  <div className={`mbk-status-badge ${cfg.cls}`}>
                    <span>{cfg.icon}</span> {cfg.label}
                  </div>
                  {isApproved && (
                    <div className="mbk-approved-note">🎉 Your ride is confirmed!</div>
                  )}
                  {b.status === "rejected" && (
                    <div className="mbk-rejected-note">Contact us for help</div>
                  )}
                  {b.status === "pending" && (
                    <div className="mbk-pending-note">Waiting for management…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── MAIN ── */
export default function BookNow() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({ service: "", vehicle: "" });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const canContinue = () => {
    if (step === 1) return !!data.service;
    if (step === 2) return !!(data.name && data.email && data.phone && data.pickup && data.dropoff && data.date && data.time);
    if (step === 3) return needsVehicle(data.service) ? !!data.vehicle : true;
    if (step === 4) return true;
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    if (step === 2 && !needsVehicle(data.service)) {
      setStep(4);
    } else if (step < 4) {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (step === 4 && !needsVehicle(data.service)) {
      setStep(2);
    } else if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: data.name,
          email:         data.email,
          phone:         data.phone,
          company:       data.company || "",
          service:       data.service,
          vehicle:       data.vehicle || "",
          pickup:        data.pickup,
          dropoff:       data.dropoff,
          booking_date:  data.date,
          booking_time:  data.time,
          notes:         data.notes || "",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Server error");

      setBookingId(json.id);
      setSubmitted(true);
    } catch (err) {
      console.error("Booking submission failed:", err);
      setSubmitError(
        err.message === "Failed to fetch"
          ? "❌ Cannot reach the server. Please try again shortly."
          : `❌ ${err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="book-root">

      <Navbar activePage="Book Now" />

      {/* HERO */}
      <section className="book-hero">
        <div className="book-hero-overlay" />
        <div className="book-hero-content">
          <div className="book-hero-tag">BOOK YOUR RIDE</div>
          <h1 className="book-hero-title">Reserve Transportation</h1>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className={`book-main${step === 3 && !submitted ? " book-main-fleet" : ""}`}>
        {!submitted && <StepBar current={step} service={data.service} />}

        <div className="book-card">
          {!submitted && (
            <>
              {step === 1 && <Step1 data={data} setData={setData} />}
              {step === 2 && <Step2 data={data} setData={setData} />}
              {step === 3 && needsVehicle(data.service) && <Step3 data={data} setData={setData} />}
              {step === 4 && <Step4 data={data} />}

              <div className="book-nav-btns">
                <button className="book-back-btn" onClick={back} disabled={step === 1 || submitting}>Back</button>
                {step < 4 ? (
                  <button
                    className={`book-continue-btn ${canContinue() ? "" : "disabled"}`}
                    onClick={next}
                  >
                    Continue <ArrowIcon />
                  </button>
                ) : (
                  <button
                    className={`book-continue-btn ${canContinue() && !submitting ? "" : "disabled"}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : <>Submit Request <ArrowIcon /></>}
                  </button>
                )}
              </div>
              {submitError && (
                <div style={{
                  margin: "12px 24px 0",
                  padding: "12px 16px",
                  background: "#2d1414",
                  border: "1px solid #7f1d1d",
                  borderRadius: "10px",
                  color: "#f87171",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                }}>
                  {submitError}
                </div>
              )}
            </>
          )}

          {submitted && <StepPending data={data} bookingId={bookingId} />}
        </div>
      </main>

      {/* ── MY BOOKINGS ── */}
      <MyBookings activeBookingId={bookingId} />

      {/* FOOTER */}
      <footer className="book-footer">
        <div className="book-footer-inner">
          <div className="book-footer-brand">
            <div className="book-footer-logo">
              <div className="book-logo-icon logo-pulse"><PlaneIcon /></div>
              <span className="book-footer-brand-name">Manivtha Tours &amp; Travels</span>
            </div>
            <p>India's premium corporate travel and fleet management solutions. Trusted by leading companies nationwide.</p>
          </div>
          <div className="book-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[["Home","/"],["Services","/services"],["Book Now","/book"]].map(([l,h])=>(
                <li key={l}><Link to={h} className="footer-link-hover">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className="book-footer-col">
            <h4>Services</h4>
            <ul>
              {["Airport Transfers","Employee Transport","Corporate Travel","Fleet Management","City Transfers"].map(s=>(
                <li key={s}><a href="#" className="footer-link-hover">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="book-footer-bottom">
          <span>© 2026 Manivtha Tours &amp; Travels. All rights reserved.</span>
          <div className="book-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
