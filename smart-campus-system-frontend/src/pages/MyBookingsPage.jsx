import { useEffect, useState } from "react";
import BookingTable from "../components/BookingTable";
import { bookingApi, getErrorMessage } from "../api/bookingApi";

export default function MyBookingsPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm("Cancel this approved booking?");
    if (!confirmed) return;

    try {
      setMessage("");
      setErrorMessage("");
      await bookingApi.cancelBooking(bookingId);
      setMessage("Booking cancelled successfully.");
      loadBookings();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleDelete = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    try {
      setMessage("");
      setErrorMessage("");
      await bookingApi.deleteBooking(bookingId);
      setMessage("Booking deleted successfully.");
      loadBookings();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="page-section">
      <div className="card">
        <h2>My Bookings</h2>
        <p>
          Logged in as <strong>{user.name}</strong> ({user.role})
        </p>
      </div>

      {message && <div className="alert success-alert">{message}</div>}
      {errorMessage && <div className="alert error-alert">{errorMessage}</div>}

      {loading ? (
        <div className="card">
          <p>Loading bookings...</p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          role={user.role}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}