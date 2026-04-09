import { useState } from "react";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

const initialForm = {
  resourceId: "",
  resourceName: "",
  resourceType: "LAB",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: 1,
};

export default function BookingForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "expectedAttendees" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.resourceId.trim()) {
      setError("Resource ID is required");
      return;
    }

    if (!formData.resourceName.trim()) {
      setError("Resource name is required");
      return;
    }

    if (!formData.bookingDate) {
      setError("Booking date is required");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError("Start time and end time are required");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setError("End time must be after start time");
      return;
    }

    if (!formData.purpose.trim() || formData.purpose.trim().length < 5) {
      setError("Purpose must be at least 5 characters");
      return;
    }

    if (formData.expectedAttendees < 1) {
      setError("Expected attendees must be at least 1");
      return;
    }

    const success = await onSubmit(formData);

    if (success) {
      setFormData(initialForm);
    }
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>Create Booking Request</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>Resource ID</label>
        <input
          type="text"
          name="resourceId"
          value={formData.resourceId}
          onChange={handleChange}
          placeholder="e.g. lab101"
        />
      </div>

      <div className="form-group">
        <label>Resource Name</label>
        <input
          type="text"
          name="resourceName"
          value={formData.resourceName}
          onChange={handleChange}
          placeholder="e.g. Computer Lab 101"
        />
      </div>

      <div className="form-group">
        <label>Resource Type</label>
        <select
          name="resourceType"
          value={formData.resourceType}
          onChange={handleChange}
        >
          <option value="LAB">LAB</option>
          <option value="ROOM">ROOM</option>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>
      </div>

      <div className="form-group">
        <label>Booking Date</label>
        <input
          type="date"
          name="bookingDate"
          min={getToday()}
          value={formData.bookingDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
        />
      </div>

      <div className="form-group full-width">
        <label>Purpose</label>
        <textarea
          name="purpose"
          rows="4"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Enter the reason for the booking"
        />
      </div>

      <div className="form-group">
        <label>Expected Attendees</label>
        <input
          type="number"
          name="expectedAttendees"
          min="1"
          value={formData.expectedAttendees}
          onChange={handleChange}
        />
      </div>

      <div className="full-width">
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Booking"}
        </button>
      </div>
    </form>
  );
}