import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/appointments";

function App() {
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    doctor: "General Physician",
    appointmentDate: "",
    appointmentTime: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Get appointments from MongoDB through the backend
  async function fetchAppointments() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      setMessage("Could not load appointments. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Update form fields
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  // Book a new appointment
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setMessage("Appointment booked successfully!");

      setFormData({
        patientName: "",
        phone: "",
        doctor: "General Physician",
        appointmentDate: "",
        appointmentTime: "",
      });

      await fetchAppointments();
    } catch (error) {
      setMessage(error.message || "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  }

  // Cancel a selected appointment
  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(id);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cancellation failed");
      }

      // Remove the cancelled appointment from the displayed list
      setAppointments((previous) =>
        previous.filter((appointment) => appointment._id !== id)
      );

      setMessage("Appointment cancelled successfully!");
    } catch (error) {
      setMessage(error.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1>MediCare</h1>
        <p>Online Doctor Appointment System</p>
      </header>

      <section className="welcome-section">
        <h2>Welcome to MediCare</h2>
        <p>Book your appointment with a doctor easily.</p>
      </section>

      <section className="appointment-card">
        <h2>Book an Appointment</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Select Doctor</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
            >
              <option>General Physician</option>
              <option>Cardiologist</option>
              <option>Dentist</option>
              <option>Dermatologist</option>
              <option>Neurologist</option>
              <option>Orthopedic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Appointment Date</label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toLocaleDateString("en-CA")}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Time</label>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="appointments-list">
        <h2>All Appointments</h2>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="appointments-grid">
            {appointments.map((appointment) => (
              <div className="appointment-item" key={appointment._id}>
                <h3>{appointment.patientName}</h3>

                <p>
                  <strong>Phone:</strong> {appointment.phone}
                </p>

                <p>
                  <strong>Doctor:</strong> {appointment.doctor}
                </p>

                <p>
                  <strong>Date:</strong> {appointment.appointmentDate}
                </p>

                <p>
                  <strong>Time:</strong> {appointment.appointmentTime}
                </p>

                <button
                  type="button"
                  className="cancel-button"
                  disabled={cancellingId === appointment._id}
                  onClick={() => handleCancel(appointment._id)}
                >
                  {cancellingId === appointment._id
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>© MediCare - Online Doctor Appointment System</p>
      </footer>
    </div>
  );
}

export default App;