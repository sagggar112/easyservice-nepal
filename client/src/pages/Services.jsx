import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/services");
        setServices(
          Array.isArray(response.data.services) ? response.data.services : []
        );
      } catch (requestError) {
        console.error(requestError);
        setError(
          requestError.response?.data?.message ||
            "Unable to load services. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleBook = (service) => {
    navigate(`/booking/${service.id}`, { state: { service } });
  };

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Find trusted professionals for your everyday needs.</p>
      </div>

      {loading && <p className="no-services">Loading services...</p>}

      {!loading && error && <p className="no-services">{error}</p>}

      {!loading && !error && services.length === 0 && (
        <p className="no-services">No services available right now.</p>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="service-icon" aria-hidden="true">
                🛠️
              </div>
              <h2>{service.service_name}</h2>
              <p className="service-description">{service.description}</p>

              <div className="service-footer">
                <span className="service-price">Rs. {service.base_price}</span>
                <button
                  className="book-btn"
                  onClick={() => handleBook(service)}
                >
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Services;
