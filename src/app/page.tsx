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
              <div className="quick-item"><span className="quick-icon">02</span><div><strong>Service Booking</strong><div className="muted">Online booking is being prepared</div></div></div>
              <div className="quick-item"><span className="quick-icon">03</span><div><strong>Explore Products</strong><div className="muted">Product catalogue is being prepared</div></div></div>
            </aside>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">What we do</span>
              <h2>Technology services for everyday life</h2>
              <p>Explore the service areas of 3B TECH HUB. Service details, availability and pricing will be published as they are confirmed.</p>
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
                <p>3B TECH HUB brings technical services and practical technology support together in one place.</p>
              </div>
              <a className="button secondary" href="#contact">Get updates</a>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Get in touch</span>
              <h2>Contact and service booking</h2>
              <p>Our verified business contact channels and online booking options are being prepared. We will publish them here once they are confirmed.</p>
            </div>
            <p className="muted">Please check back soon for official contact details. No unverified email address or phone number is displayed.</p>
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
