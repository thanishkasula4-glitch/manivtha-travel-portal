import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import UrlIcon from "../components/UrlIcon";
import useScrollReveal from "../hooks/useScrollReveal";
import "./Services.css";

const SERVICES = [
  {
    badge: "Most Popular",
    badgeIcon: "star",
    title: "Airport Transfers",
    description: "Professional door-to-door airport transfer service with flight tracking and meet-and-greet options.",
    features: ["Real-time flight tracking", "Meet & greet service", "Luggage assistance", "Fixed pricing, no surge", "Available 24/7"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    imageAlt: "Airport Transfer Service",
    color: "blue",
  },
  {
    badge: "Enterprise",
    badgeIcon: "groups",
    title: "Employee Transportation",
    description: "Comprehensive daily commute solutions with scheduled routes and real-time tracking for your workforce.",
    features: ["Custom route planning", "Scheduled pickups", "Employee app access", "Monthly reporting", "Dedicated fleet"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    imageAlt: "Employee Transportation",
    color: "green",
    imageLeft: true,
  },
  {
    badge: "Premium",
    badgeIcon: "business-center",
    title: "Corporate Travel",
    description: "End-to-end business trip management with dedicated account managers and global coverage.",
    features: ["Dedicated account manager", "Travel policy compliance", "Expense integration", "VIP lounge access", "Multi-city coordination"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    imageAlt: "Corporate Travel",
    color: "purple",
  },
  {
    badge: "Flexible",
    badgeIcon: "directions-car",
    title: "City Transfers",
    description: "Comfortable point-to-point city transportation with professional chauffeurs and premium vehicles.",
    features: ["On-demand booking", "Professional chauffeurs", "Premium vehicle selection", "Corporate billing", "Door-to-door service"],
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    imageAlt: "City Transfer",
    color: "yellow",
    imageLeft: true,
  },
];

const QUICK_LINKS = [["Home", "/"], ["Services", "/services"], ["Book Now", "/book"]];
const SERVICE_LINKS = ["Airport Transfers", "Employee Transport", "Corporate Travel", "Fleet Management", "City Transfers"];

function ServiceCard({ service }) {
  const [cardRef, isVisible] = useScrollReveal(0.08);
  const { badge, badgeIcon, title, description, features, image, imageAlt, color, imageLeft } = service;

  return (
    <article
      ref={cardRef}
      className={`svc-block ${imageLeft ? "svc-block-reverse" : ""} ${isVisible ? "revealed" : ""}`}
    >
      <div className="svc-text">
        <div className={`svc-badge svc-badge-${color}`}>
          <UrlIcon name={badgeIcon} size={14} />
          {badge}
        </div>

        <h2 className="svc-title">{title}</h2>
        <p className="svc-desc">{description}</p>

        <ul className="svc-features">
          {features.map((feature, index) => (
            <li
              key={feature}
              className={`svc-feature ${isVisible ? "feature-in" : ""}`}
              style={{ transitionDelay: `${index * 70 + 200}ms` }}
            >
              <span className={`svc-check svc-check-${color}`}>
                <UrlIcon name="check" size={16} />
              </span>
              <span className={`hl-${color}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <Link to="/book" className="svc-book-btn">
          Book This Service
          <UrlIcon name="arrow-forward" size={16} color="#ffffff" />
        </Link>
      </div>

      <div className="svc-img-wrap">
        <div className="svc-img-card">
          <img src={image} alt={imageAlt} className="svc-photo" />
        </div>
      </div>
    </article>
  );
}

export default function Services() {
  const [heroRef, heroVisible] = useScrollReveal(0.05);
  const [footerRef, footerVisible] = useScrollReveal(0.05);

  return (
    <div className="svc-root">
      <Navbar activePage="Services" />

      <section className="svc-hero" ref={heroRef}>
        <div className="svc-hero-overlay" />
        <div className={`svc-hero-content ${heroVisible ? "anim-in" : ""}`}>
          <div className="svc-hero-tag">OUR SERVICES</div>
          <h1 className="svc-hero-title">Premium Transportation Solutions</h1>
          <p className="svc-hero-desc">
            From airport transfers to fleet management, we deliver comprehensive travel solutions
            tailored to your business needs.
          </p>
        </div>
      </section>

      <main className="svc-blocks-wrap">
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </main>

      <footer className="svc-footer" ref={footerRef}>
        <div className={`svc-footer-inner reveal-from-bottom ${footerVisible ? "revealed" : ""}`}>
          <div className="svc-footer-brand">
            <div className="svc-footer-logo">
              <div className="svc-logo-icon logo-pulse">
                <UrlIcon name="flight" size={22} color="#f5c518" />
              </div>
              <span className="svc-footer-brand-name">Manivtha Tours &amp; Travels</span>
            </div>
            <p>India's premium corporate travel and fleet management solutions. Trusted by leading companies nationwide.</p>
          </div>

          <div className="svc-footer-col">
            <h4>Quick Links</h4>
            <ul>
              {QUICK_LINKS.map(([label, path]) => (
                <li key={label}><Link to={path} className="footer-link-hover">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="svc-footer-col">
            <h4>Services</h4>
            <ul>
              {SERVICE_LINKS.map((service) => (
                <li key={service}><a href="#" className="footer-link-hover">{service}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="svc-footer-bottom">
          <span>© 2026 Manivtha Tours &amp; Travels. All rights reserved.</span>
          <div className="svc-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
