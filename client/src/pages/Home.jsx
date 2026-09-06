import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">EASYSERVICE NEPAL</span>
          <h1>Trusted help for<br /><span>everyday life.</span></h1>
          <p>Book reliable local professionals for home, repair and everyday services — with transparent pricing and intelligent provider matching.</p>
          <div className="hero-buttons">
            <Link to="/services" className="primary-btn">Explore Services →</Link>
            <Link to="/ai-assistant" className="secondary-btn">✦ Ask AI Concierge</Link>
          </div>
          <div className="hero-trust"><span>✓ Verified providers</span><span>✓ Secure booking</span><span>✓ Smart matching</span></div>
        </div>
      </section>

      <section className="how-it-works">
        <span className="eyebrow">SIMPLE BY DESIGN</span>
        <h2>Everything you need to get the job done.</h2>
        <div className="steps">
          <div className="step-card"><span className="step-number">01</span><h3>Describe your need</h3><p>Browse services or tell our AI Concierge what you need in your own words.</p></div>
          <div className="step-card"><span className="step-number">02</span><h3>Choose your professional</h3><p>Compare trusted providers using ratings, experience and our Smart Match score.</p></div>
          <div className="step-card"><span className="step-number">03</span><h3>Book with confidence</h3><p>See an estimated price, schedule the service and track your booking from one place.</p></div>
        </div>
      </section>

      <section className="home-ai-banner">
        <div><span className="eyebrow">SMARTER SERVICE DISCOVERY</span><h2>Not sure what service you need?</h2><p>Tell EasyService what is wrong. We'll help identify the right service and guide you to suitable professionals.</p></div>
        <Link to="/ai-assistant" className="primary-btn">Try AI Concierge →</Link>
      </section>
    </div>
  );
}

export default Home;
