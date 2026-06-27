import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import "./Home.css";
import Navbar from "../components/Navbar";
import UrlIcon from "../components/UrlIcon";
import useScrollReveal from "../hooks/useScrollReveal";

/* ── SVG Icons ── */
const PlaneIcon = () => <UrlIcon name="flight" size={22} color="#f5c518" />;
const BriefcaseIcon = () => <UrlIcon name="business-center" size={22} />;
const CarIcon = () => <UrlIcon name="directions-car" size={22} />;
const StarIcon = () => <UrlIcon name="star" size={22} color="#f5c518" />;
const PeopleIcon = () => <UrlIcon name="groups" size={26} />;
const CorporateIcon = () => <UrlIcon name="check-circle" size={26} />;
const ShieldIcon = () => <UrlIcon name="verified-user" size={28} />;
const ClockIcon = () => <UrlIcon name="schedule" size={28} />;
const StarOutlineIcon = () => <UrlIcon name="stars" size={28} />;
const PinIcon = () => <UrlIcon name="location-on" size={22} />;
const UserIcon = () => <UrlIcon name="person" size={20} />;
const ChatIcon = () => <UrlIcon name="chat" size={22} />;
const PhoneIcon = () => <UrlIcon name="call" size={16} />;
const MailIcon = () => <UrlIcon name="mail" size={16} />;
const ArrowIcon = () => <UrlIcon name="arrow-forward" size={18} />;

/* ── Animated Counter Hook ── */
function useCounter(target, duration = 1800, suffix = "") {
  const [display, setDisplay] = useState("0");
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const isFloat = String(target).includes(".");
    const numericTarget = parseFloat(target);
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;
      setDisplay(
        isFloat
          ? current.toFixed(1)
          : Math.floor(current).toLocaleString() + (progress === 1 ? suffix : "")
      );
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay((isFloat ? numericTarget.toFixed(1) : Math.floor(numericTarget).toLocaleString()) + suffix);
    };
    requestAnimationFrame(tick);
  }, [target, duration, suffix]);

  return [display, start];
}

/* ── useScrollReveal Hook ── */
/* ── Particle background component ── */
const PARTICLE_COUNT = 32;
function Particles() {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 8,
      dur: Math.random() * 6 + 8,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current;

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ── Ripple Button ── */
function RippleLink({ to, className, children }) {
  const handleClick = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      width:${diameter}px;height:${diameter}px;
      left:${e.clientX - rect.left - diameter / 2}px;
      top:${e.clientY - rect.top - diameter / 2}px;
    `;
    circle.classList.add("ripple-wave");
    btn.querySelector(".ripple-wave")?.remove();
    btn.appendChild(circle);
  };
  return (
    <Link to={to} className={`${className} ripple-host`} onClick={handleClick}>
      {children}
    </Link>
  );
}

/* ── Stat Card with animated counter ── */
function StatCard({ icon, target, suffix, label, className, delay }) {
  const [ref, visible] = useScrollReveal(0.2);
  const [display, startCount] = useCounter(target, 1600, suffix);

  useEffect(() => {
    if (visible) startCount();
  }, [visible, startCount]);

  return (
    <div
      ref={ref}
      className={`home-stat-card ${className || ""} reveal-card ${visible ? "revealed" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`home-stat-icon ${icon.color}`}>{icon.el}</div>
      <div className="home-stat-number">{display}</div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  /* Navbar scroll effect */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Parallax glow */
  const glowRef = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!glowRef.current) return;
      const { innerWidth, innerHeight } = window;
      const dx = (e.clientX / innerWidth - 0.5) * 40;
      const dy = (e.clientY / innerHeight - 0.5) * 20;
      glowRef.current.style.transform = `translate(${dx}px, calc(-50% + ${dy}px))`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* Hero section scroll-reveal refs */
  const [heroRef, heroVisible] = useScrollReveal(0.05);
  const [servicesRef, servicesVisible] = useScrollReveal(0.1);
  const [trustedRef, trustedVisible] = useScrollReveal(0.1);
  const [citiesRef, citiesVisible] = useScrollReveal(0.1);
  const [ctaRef, ctaVisible] = useScrollReveal(0.1);
  const [footerRef, footerVisible] = useScrollReveal(0.05);

  /* Typewriter badge */
  const BADGE_TEXT = "INDIA'S PREMIER TRAVEL PARTNER";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= BADGE_TEXT.length) {
        setTyped(BADGE_TEXT.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 55);
    return () => clearInterval(timer);
  }, []);

  /* Service cards stagger data */
  const services = [
    {
      icon: "blue-bg", IconEl: PlaneIcon,
      title: "Airport Transfers",
      desc: <>Door-to-door airport pickup and drop with <span className="hl-blue">live flight tracking</span> across all Indian airports.</>,
      linkClass: "blue",
    },
    {
      icon: "green-bg", IconEl: PeopleIcon,
      title: "Employee Transport",
      desc: <>Reliable daily commute for your workforce with <span className="hl-green">optimized routes</span> across Indian cities.</>,
      linkClass: "green",
    },
    {
      icon: "purple-bg", IconEl: CorporateIcon,
      title: "Corporate Travel",
      desc: <>End-to-end business trip management with <span className="hl-purple">dedicated account managers</span>.</>,
      linkClass: "purple",
    },
    {
      icon: "yellow-bg", IconEl: CarIcon,
      title: "City Transfers",
      desc: <>Comfortable point-to-point city transportation with professional drivers.</>,
      linkClass: "yellow",
    },
  ];

  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"];
  const trustedItems = [
    { Icon: ShieldIcon, title: "Safety First", desc: "Rigorous safety protocols, verified drivers, and 24/7 monitoring across India." },
    { Icon: ClockIcon, title: "Always On Time", desc: "Real-time tracking, flight monitoring, and proactive scheduling guaranteed." },
    { Icon: StarOutlineIcon, title: "Premium Experience", desc: "Luxury fleet, professional chauffeurs, and personalized service." },
  ];

  return (
    <div className="home-root">

      <Navbar activePage="Home" />

      {/* ── HERO ── */}
      <section className="home-hero" id="hero" ref={heroRef}>
        <Particles />
        {/* Animated grid lines */}
        <div className="hero-grid" aria-hidden="true" />

        <div className={`home-hero-content hero-content-anim ${heroVisible ? "anim-in" : ""}`}>
          <div className="home-hero-badge badge-glow">
            <span className="home-badge-star spin-star">✦</span>
            {typed}<span className="cursor-blink">|</span>
          </div>

          <h1 className="home-hero-title">
            <span className="hero-word-reveal" style={{ animationDelay: "0.3s" }}>Manivtha Tours </span>
            <span className="home-hero-amp hero-word-reveal" style={{ animationDelay: "0.5s" }}>&amp;</span>
            <br />
            <span className="home-hero-yellow hero-word-reveal hero-title-shimmer" style={{ animationDelay: "0.7s" }}>Travels</span>
          </h1>

          <p className="home-hero-desc hero-fade-up" style={{ animationDelay: "0.9s" }}>
            Luxury corporate travel and fleet management trusted by India's
            leading companies. Seamless, safe, and sophisticated journeys
            across the nation.
          </p>

          <div className="home-hero-btns hero-fade-up" style={{ animationDelay: "1.1s" }}>
            <RippleLink to="/book" className="home-btn-primary btn-magnetic">
              Book Your Ride <ArrowIcon />
            </RippleLink>
            <a href="#services" className="home-btn-outline btn-magnetic">Explore Services</a>
          </div>
        </div>

        {/* Parallax glow */}
        <div className="home-hero-glow glow-rotate" ref={glowRef} />
        {/* Floating plane decoration */}
        <div className="hero-floating-plane" aria-hidden="true">
          <PlaneIcon />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats" id="about">
        <div className="home-stats-grid">
          <StatCard icon={{ el: <PlaneIcon />, color: "yellow" }} target={15000} suffix="+" label="Trips Completed" className="home-stat-active" delay={0} />
          <StatCard icon={{ el: <BriefcaseIcon />, color: "blue" }} target={500} suffix="+" label="Corporate Clients" delay={100} />
          <StatCard icon={{ el: <CarIcon />, color: "green" }} target={200} suffix="+" label="Premium Vehicles" delay={200} />
          <StatCard icon={{ el: <StarIcon />, color: "purple" }} target={4.9} suffix="" label="Average Rating" delay={300} />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="home-services" id="services" ref={servicesRef}>
        <div className={`reveal-from-bottom ${servicesVisible ? "revealed" : ""}`}>
          <div className="home-section-tag shimmer-tag">WHAT WE OFFER</div>
          <h2 className="home-section-title">Our Premium Services</h2>
        </div>
        <div className="home-services-grid">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`home-service-card service-card-hover reveal-card ${servicesVisible ? "revealed" : ""}`}
              style={{ transitionDelay: `${i * 100 + 150}ms` }}
            >
              <div className={`home-service-icon ${s.icon} icon-bounce`}>
                <s.IconEl />
              </div>
              <div className="service-card-bar" />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <a href="/services" className={`home-learn-more ${s.linkClass} learn-more-arrow`}>
                Learn more &rsaquo;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED CHOICE ── */}
      <section className="home-trusted" ref={trustedRef}>
        <div className="home-trusted-inner">
          <div className={`reveal-from-bottom ${trustedVisible ? "revealed" : ""}`}>
            <div className="home-section-tag light shimmer-tag">WHY MANIVTHA</div>
            <h2 className="home-section-title light">The Trusted Choice</h2>
          </div>
          <div className="home-trusted-grid">
            {trustedItems.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className={`home-trusted-item reveal-card ${trustedVisible ? "revealed" : ""}`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <div className="home-trusted-icon trusted-icon-hover icon-ring">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="home-cities" ref={citiesRef}>
        <div className={`reveal-from-bottom ${citiesVisible ? "revealed" : ""}`}>
          <div className="home-section-tag shimmer-tag">PAN INDIA SERVICE</div>
          <h2 className="home-section-title">We Serve Across India</h2>
        </div>
        <div className="home-cities-grid">
          {cities.map((city, i) => (
            <a
              key={city}
              href="/book"
              className={`home-city-card city-card-hover reveal-card ${citiesVisible ? "revealed" : ""}`}
              style={{ transitionDelay: `${i * 80 + 150}ms`, textDecoration: "none", cursor: "pointer" }}
            >
              <span className="home-city-pin yellow pin-bounce"><PinIcon /></span>
              <span className="home-city-name">{city}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="home-cta" id="book" ref={ctaRef}>
        <div className={`home-cta-inner cta-anim ${ctaVisible ? "revealed" : ""}`}>
          <div className="home-cta-content">
            <h2 className={`reveal-from-bottom ${ctaVisible ? "revealed" : ""}`}>
              Ready to Experience India's Best Corporate Travel?
            </h2>
            <p className={`reveal-from-bottom ${ctaVisible ? "revealed" : ""}`} style={{ transitionDelay: "150ms" }}>
              Join hundreds of companies across India already experiencing
              seamless, premium transportation.
            </p>
            <div className="home-cta-btns">
              <RippleLink to="/book" className="home-btn-primary btn-magnetic">
                Book Now <ArrowIcon />
              </RippleLink>
            </div>
          </div>
          <div className="home-cta-deco">
            <div className="home-cta-circle large cta-circle-spin" />
            <div className="home-cta-circle small cta-circle-float" />
            <div className="home-cta-circle tiny cta-circle-pulse" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer" ref={footerRef}>
        <div className={`home-footer-inner reveal-from-bottom ${footerVisible ? "revealed" : ""}`}>
          <div className="home-footer-brand">
            <div className="home-footer-logo">
              <div className="home-logo-icon logo-pulse">
                <PlaneIcon />
              </div>
              <span className="home-footer-brand-name">Manivtha Tours &amp; Travels</span>
            </div>
            <p>India's premium corporate travel and fleet management solutions. Trusted by leading companies nationwide.</p>
          </div>

          <div className="home-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[["Home","/"],["Services","/services"],["Book Now","/book"]].map(([l,h]) => (
                <li key={l}><a href={h} className="footer-link-hover">{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="home-footer-col">
            <h4>Services</h4>
            <ul>
              {["Airport Transfers","Employee Transport","Corporate Travel","Fleet Management","City Transfers"].map((s) => (
                <li key={s}><a href="#services" className="footer-link-hover">{s}</a></li>
              ))}
            </ul>
          </div>


        </div>

        <div className="home-footer-bottom">
          <span>© 2026 Manivtha Tours &amp; Travels. All rights reserved.</span>
          <div className="home-footer-legal">
            <a href="#" className="footer-link-hover">Privacy Policy</a>
            <a href="#" className="footer-link-hover">Terms of Service</a>
          </div>
        </div>
      </footer>


    </div>
  );
}
