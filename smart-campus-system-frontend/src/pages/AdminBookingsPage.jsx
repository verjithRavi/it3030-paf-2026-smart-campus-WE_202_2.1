import { useEffect, useState } from "react";
import BookingTable from "../components/BookingTable";
import { bookingApi, getErrorMessage } from "../api/bookingApi";

const initialFilters = {
  status: "",
  resourceId: "",
  userId: "",
  date: "",
};

export default function AdminBookingsPage({ user }) {
  const [filters, setFilters] = useState(initialFilters);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadBookings = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await bookingApi.getAllBookings(activeFilters);
      setBookings(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "ADMIN") {
      loadBookings();
    }
  }, [user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadBookings(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    loadBookings(initialFilters);
  };

  const handleApprove = async (bookingId) => {
    try {
      setMessage("");
      setErrorMessage("");
      await bookingApi.approveBooking(bookingId);
      setMessage("Booking approved successfully.");
      loadBookings(filters);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setMessage("");
      setErrorMessage("");
      await bookingApi.rejectBooking(bookingId, reason);
      setMessage("Booking rejected successfully.");
      loadBookings(filters);
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
      loadBookings(filters);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      setMessage("");
      setErrorMessage("");
      await bookingApi.cancelBooking(bookingId);
      setMessage("Booking cancelled successfully.");
      loadBookings(filters);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (user.role !== "ADMIN") {
    return (
      <div className="card">
        <h2>Admin Bookings</h2>
        <p>You must switch to the Admin user to access this page.</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="card">
        <h2>Admin Booking Management</h2>
        <p>Review, filter, approve, reject, cancel, and delete bookings.</p>
      </div>

      <div className="card filter-grid">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="form-group">
          <label>Resource ID</label>
          <input
            type="text"
            name="resourceId"
            value={filters.resourceId}
            onChange={handleFilterChange}
            placeholder="e.g. lab101"
          />
        </div>

        <div className="form-group">
          <label>User ID</label>
          <input
            type="text"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            placeholder="e.g. user001"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-actions">
          <button className="primary-button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="secondary-button" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
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
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}