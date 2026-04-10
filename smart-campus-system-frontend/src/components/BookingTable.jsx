import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function BookingTable({
  bookings,
  role,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}) {
  const navigate = useNavigate()

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

  const isAdmin = role === 'ADMIN'

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: isAdmin ? '900px' : '700px' }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Resource</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Type</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Date</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Time</th>
              {isAdmin && (
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Booked By</th>
              )}
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Status</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => {
              const isPending = booking.status === 'PENDING'
              const isApproved = booking.status === 'APPROVED'
              const isRejected = booking.status === 'REJECTED'

              return (
                <tr
                  key={booking.id}
                  className="border-t border-gray-100 align-middle transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{booking.resourceName}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{booking.resourceId}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{booking.resourceType}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{booking.bookingDate}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {booking.startTime} – {booking.endTime}
                  </td>

                  {isAdmin && (
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{booking.userName}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{booking.userId}</p>
                    </td>
                  )}

                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>

                  {/* Actions — all in one row, no wrap */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* View details */}
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => navigate(`/bookings/${booking.id}`, { state: { booking } })}
                      >
                        View
                      </button>

                      {/* Admin: approve PENDING */}
                      {isAdmin && isPending && onApprove && (
                        <button
                          className="rounded-full bg-[#1D9E75] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0F6E56] whitespace-nowrap"
                          onClick={() => onApprove(booking.id)}
                        >
                          Approve
                        </button>
                      )}

                      {/* Admin: reject PENDING */}
                      {isAdmin && isPending && onReject && (
                        <button
                          className="rounded-full bg-[#E24B4A] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 whitespace-nowrap"
                          onClick={() => onReject(booking.id)}
                        >
                          Reject
                        </button>
                      )}

                      {/* Cancel APPROVED */}
                      {isApproved && onCancel && (
                        <button
                          className="rounded-full bg-[#EF9F27] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 whitespace-nowrap"
                          onClick={() => onCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      )}

                      {/* User: withdraw PENDING */}
                      {!isAdmin && isPending && onDelete && (
                        <button
                          className="rounded-full border border-[#EF9F27] px-3 py-1.5 text-xs font-medium text-[#92580a] transition hover:bg-[#fef3c7] whitespace-nowrap"
                          onClick={() => onDelete(booking.id)}
                        >
                          Withdraw
                        </button>
                      )}

                      {/* Delete REJECTED or CANCELLED */}
                      {(isRejected || booking.status === 'CANCELLED') && onDelete && (
                        <button
                          className="rounded-full border border-[#E24B4A] px-3 py-1.5 text-xs font-medium text-[#A32D2D] transition hover:bg-[#FCEBEB] whitespace-nowrap"
                          onClick={() => onDelete(booking.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
