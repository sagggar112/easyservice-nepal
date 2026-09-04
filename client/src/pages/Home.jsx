import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">

      <section className="hero">

        <div className="hero-content">
          <h1>
            Find Trusted Services
            <br />
            <span>Near You</span>
          </h1>

          <p>
            Easy Service connects you with trusted professionals
            for all your service needs.
          </p>

          <div className="hero-buttons">
            <Link to="/services" className="primary-btn">
              Explore Services
            </Link>

            <Link to="/register" className="secondary-btn">
              Become a Provider
            </Link>
          </div>
        </div>

      </section>

      <section className="how-it-works">

        <h2>How Easy Service Works</h2>

        <div className="steps">

          <div className="step-card">
            <h3>1. Choose a Service</h3>
            <p>
              Browse available services and find what you need.
            </p>
          </div>

          <div className="step-card">
            <h3>2. Book a Provider</h3>
            <p>
              Choose a trusted provider and schedule your service.
            </p>
          </div>

          <div className="step-card">
            <h3>3. Get It Done</h3>
            <p>
              Your provider completes the service at your location.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;