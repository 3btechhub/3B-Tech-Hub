const services = [
  { icon: "TV", title: "TV & Display Repair", description: "Troubleshooting and repair support for televisions, screens and display-related issues." },
  { icon: "M", title: "Mobile Phone Services", description: "Mobile diagnostics, repair support and accessories for everyday devices." },
  { icon: "SAT", title: "Satellite & Dish Setup", description: "Satellite dish installation, signal alignment and reception troubleshooting." },
  { icon: "PC", title: "Computer & Electronics", description: "Technical support for computers, electronics and connected devices." },
  { icon: "ACC", title: "Accessories & Products", description: "A future-ready catalogue for useful technology products and accessories." },
  { icon: "HELP", title: "Technical Consultation", description: "Get guidance to identify the right service before arranging a repair." },
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#" aria-label="3B TECH HUB home">
            <span className="brand-mark">3B</span>
            <span>3B TECH HUB</span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="button" href="#contact">Get Support</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Three Brothers · Technology Hub</span>
              <h1>Technology solutions.<br />Built on trust.</h1>
              <p>
                Your destination for electronics repair, mobile services, TV support,
                satellite solutions and practical technology products.
              </p>
              <div className="hero-actions">
                <a className="button" href="#services">Explore Services <span aria-hidden="true">→</span></a>
                <a className="button secondary" href="#contact">Contact Our Team</a>
              </div>
            </div>
            <aside className="hero-panel" aria-label="Service highlights">
              <h2>How can we help?</h2>
              <div className="quick-item"><span className="quick-icon">01</span><div><strong>Repair & Diagnose</strong><div className="muted">Find the right technical support</div></div></div>
              <div className="quick-item"><span className="quick-icon">02</span><div><strong>Book a Service</strong><div className="muted">Booking workflow coming soon</div></div></div>
              <div className="quick-item"><span className="quick-icon">03</span><div><strong>Explore Products</strong><div className="muted">Product catalogue foundation</div></div></div>
            </aside>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">What we do</span>
              <h2>Technology services for everyday life</h2>
              <p>Explore the service areas planned for 3B TECH HUB. Final service details, availability and pricing will be managed from the owner-controlled admin dashboard.</p>
            </div>
            <div className="card-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <div className="quick-icon" aria-hidden="true">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="callout">
              <div>
                <span className="eyebrow">Three Brothers, one hub</span>
                <h2>Practical support. Clear communication.</h2>
                <p>We are building a customer-friendly technology hub with service information, helpful guidance and convenient ways to connect.</p>
              </div>
              <a className="button secondary" href="#contact">Talk to us</a>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Get in touch</span>
              <h2>Tell us what you need help with</h2>
              <p>Contact details and secure booking forms will be configured after the business contact channels are confirmed.</p>
            </div>
            <a className="button" href="mailto:hello@3btechhub.example">Email contact placeholder</a>
            <p className="muted">Temporary placeholder only — replace with the verified business email before public launch.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div><strong>3B TECH HUB</strong><p>Three Brothers · Technology Hub</p></div>
          <p>© {new Date().getFullYear()} 3B TECH HUB. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
