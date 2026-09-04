import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/Api";

function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    address: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // Temporary IDs for testing.
      // Later these will come automatically from the logged-in user.
      const bookingData = {
        customer_id: 1,
        provider_id: 1,
        service_id: Number(serviceId),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        address: formData.address,
        notes: formData.notes,
      };

      const response = await api.post("/bookings", bookingData);

      setMessage(
        response.data.message || "Booking created successfully!"
      );

      setTimeout(() => {
        navigate("/services");
      }, 1500);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Book a Service</h1>

        <p className="booking-subtitle">
          Fill in the details below to request this service.
        </p>

        {message && (
          <div className="booking-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Booking Date</label>

            <input
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Booking Time</label>

            <input
              type="time"
              name="booking_time"
              value={formData.booking_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Service Address</label>

            <input
              type="text"
              name="address"
              placeholder="Enter your service address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>

            <textarea
              name="notes"
              placeholder="Describe your problem or requirements"
              value={formData.notes}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <button
            type="submit"
            className="submit-booking-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;