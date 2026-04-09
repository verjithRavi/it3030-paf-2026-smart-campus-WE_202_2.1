import StatusBadge from './StatusBadge'

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
      <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <p className="text-base font-medium text-gray-900">No bookings found.</p>
        <p className="mt-2 text-sm text-gray-500">
          Your booking activity will appear here once requests are submitted.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Resource</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Type</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Date</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Time</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Purpose</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Attendees</th>
            {role === 'ADMIN' && <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Booked By</th>}
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Status</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Reason</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-gray-100 align-top">
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-gray-900">{booking.resourceName}</p>
                <p className="mt-1 text-xs text-gray-500">{booking.resourceId}</p>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">{booking.resourceType}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{booking.bookingDate}</td>
              <td className="px-4 py-4 text-sm text-gray-600">
                {booking.startTime} - {booking.endTime}
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">{booking.purpose}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{booking.expectedAttendees}</td>
              {role === 'ADMIN' && (
                <td className="px-4 py-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{booking.userName}</p>
                  <p className="mt-1 text-xs text-gray-500">{booking.userId}</p>
                </td>
              )}
              <td className="px-4 py-4">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">{booking.adminReason || '-'}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {role === 'ADMIN' && booking.status === 'PENDING' && onApprove && (
                    <button
                      className="rounded-full bg-[#1D9E75] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#0F6E56]"
                      onClick={() => onApprove(booking.id)}
                    >
                      Approve
                    </button>
                  )}

                  {role === 'ADMIN' && booking.status === 'PENDING' && onReject && (
                    <button
                      className="rounded-full bg-[#E24B4A] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                      onClick={() => onReject(booking.id)}
                    >
                      Reject
                    </button>
                  )}

                  {booking.status === 'APPROVED' && onCancel && (
                    <button
                      className="rounded-full bg-[#EF9F27] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                      onClick={() => onCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  )}

                  {booking.status !== 'APPROVED' && onDelete && (
                    <button
                      className="rounded-full border border-[#E24B4A] px-3 py-2 text-xs font-medium text-[#A32D2D] transition hover:bg-[#FCEBEB]"
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
    </div>
  )
}
