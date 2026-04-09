import StatusBadge from "./StatusBadge";

export default function BookingTable({
  bookings,
  role,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}) {
  if (!bookings.length) {
    return (
      <div className="card">
        <p>No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="card table-wrapper">
      <table className="booking-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Purpose</th>
            <th>Attendees</th>
            {role === "ADMIN" && <th>Booked By</th>}
            <th>Status</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.resourceName}</td>
              <td>{booking.resourceType}</td>
              <td>{booking.bookingDate}</td>
              <td>
                {booking.startTime} - {booking.endTime}
              </td>
              <td>{booking.purpose}</td>
              <td>{booking.expectedAttendees}</td>
              {role === "ADMIN" && (
                <td>
                  {booking.userName}
                  <br />
                  <small>{booking.userId}</small>
                </td>
              )}
              <td>
                <StatusBadge status={booking.status} />
              </td>
              <td>{booking.adminReason || "-"}</td>
              <td>
                <div className="action-buttons">
                  {role === "ADMIN" && booking.status === "PENDING" && onApprove && (
                    <button
                      className="success-button"
                      onClick={() => onApprove(booking.id)}
                    >
                      Approve
                    </button>
                  )}

                  {role === "ADMIN" && booking.status === "PENDING" && onReject && (
                    <button
                      className="danger-button"
                      onClick={() => onReject(booking.id)}
                    >
                      Reject
                    </button>
                  )}

                  {booking.status === "APPROVED" && onCancel && (
                    <button
                      className="warning-button"
                      onClick={() => onCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  )}

                  {booking.status !== "APPROVED" && onDelete && (
                    <button
                      className="danger-button"
                      onClick={() => onDelete(booking.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}