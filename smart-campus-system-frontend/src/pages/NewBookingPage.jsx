import { useState } from "react";
import BookingForm from "../components/BookingForm";
import { bookingApi, getErrorMessage } from "../api/bookingApi";

export default function NewBookingPage({ user }) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateBooking = async (formData) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      await bookingApi.createBooking(formData);

      setSuccessMessage("Booking request submitted successfully.");
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section">
      <div className="card">
        <h2>Current User</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {successMessage && <div className="alert success-alert">{successMessage}</div>}
      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      <BookingForm onSubmit={handleCreateBooking} loading={loading} />
    </div>
  );
}