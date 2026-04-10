import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/StatusBadge'
import RejectModal from '../components/RejectModal'
import CancelModal from '../components/CancelModal'
import Spinner from '../components/ui/Spinner'

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:gap-4 border-b border-gray-100 last:border-0">
      <p className="w-44 shrink-0 text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-sm ${highlight ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  )
}

export default function BookingDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  // Use booking from navigation state immediately (no flicker/API call needed)
  // Fall back to API fetch only when accessed directly via URL
  const [booking, setBooking] = useState(state?.booking ?? null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setErrorMessage('')

      if (forceRefresh || !state?.booking) {
        // Fetch fresh data from API (direct URL access or after an action)
        const [currentUser, bookingData] = await Promise.all([
          getCurrentUser(),
          bookingApi.getBookingById(id),
        ])
        setUser(currentUser)
        setBooking(bookingData)
      } else {
        // Just fetch current user — booking already in state
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      setMessage('')
      setErrorMessage('')
      const updated = await bookingApi.approveBooking(id)
      setBooking(updated)
      setMessage('Booking approved successfully.')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async (reason) => {
    try {
      setActionLoading(true)
      setMessage('')
      setErrorMessage('')
      const updated = await bookingApi.rejectBooking(id, reason)
      setBooking(updated)
      setRejectOpen(false)
      setMessage('Booking rejected.')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelConfirm = async (reason) => {
    try {
      setActionLoading(true)
      setMessage('')
      setErrorMessage('')
      const updated = await bookingApi.cancelBooking(id, reason || null)
      setBooking(updated)
      setCancelOpen(false)
      setMessage('Booking cancelled successfully.')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    const label = booking?.status === 'PENDING' ? 'withdraw' : 'delete'
    if (!window.confirm(`Are you sure you want to ${label} this booking?`)) return
    try {
      setActionLoading(true)
      setMessage('')
      setErrorMessage('')
      await bookingApi.deleteBooking(id)
      navigate(-1)
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setActionLoading(false)
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const isPending = booking?.status === 'PENDING'
  const isApproved = booking?.status === 'APPROVED'
  const isRejected = booking?.status === 'REJECTED'
  const isCancelled = booking?.status === 'CANCELLED'

  const backPath = isAdmin ? '/admin/bookings' : '/bookings/my'

  return (
    <div className="mx-auto w-full max-w-330 px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : errorMessage && !booking ? (
        <div className="rounded-[28px] border border-gray-100 bg-white p-10 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-base font-medium text-gray-900">Booking not found</p>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
          <button
            onClick={() => navigate(backPath)}
            className="mt-5 rounded-full bg-[#0F6E56] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#085041]"
          >
            Go back
          </button>
        </div>
      ) : (
        <>
          <PageHeader
            title="Booking details"
            subtitle="Full details of this booking request."
            action={
              <button
                type="button"
                onClick={() => navigate(backPath)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                ← Back
              </button>
            }
          />

          {message && (
            <div className="mb-5 rounded-2xl border border-[#639922] bg-[#EAF3DE] p-4 text-sm text-[#3B6D11]">
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Main detail card */}
            <div className="lg:col-span-2 rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Booking information</h2>
                <StatusBadge status={booking?.status} />
              </div>

              <DetailRow label="Resource Name" value={booking?.resourceName} highlight />
              <DetailRow label="Resource ID" value={booking?.resourceId} />
              <DetailRow label="Resource Type" value={booking?.resourceType} />
              <DetailRow label="Booking Date" value={booking?.bookingDate} />
              <DetailRow label="Time Slot" value={`${booking?.startTime} – ${booking?.endTime}`} />
              <DetailRow label="Purpose" value={booking?.purpose} />
              <DetailRow label="Expected Attendees" value={booking?.expectedAttendees} />
              {isAdmin && <DetailRow label="Requested By" value={`${booking?.userName} (${booking?.userId})`} />}
              {isRejected && booking?.adminReason && (
                <div className="flex flex-col gap-1 py-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                  <p className="mt-1 rounded-2xl bg-[#FCEBEB] px-4 py-3 text-sm text-[#A32D2D]">
                    {booking.adminReason}
                  </p>
                </div>
              )}
              {isCancelled && booking?.cancelReason && (
                <div className="flex flex-col gap-1 py-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">Cancellation Reason</p>
                  <p className="mt-1 rounded-2xl bg-[#fef3c7] px-4 py-3 text-sm text-[#92580a]">
                    {booking.cancelReason}
                  </p>
                </div>
              )}
            </div>

            {/* Side panel — actions + meta */}
            <div className="flex flex-col gap-4">
              {/* Actions card */}
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Actions</h3>
                <div className="flex flex-col gap-3">
                  {isAdmin && isPending && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full rounded-full bg-[#1D9E75] py-3 text-sm font-medium text-white transition hover:bg-[#0F6E56] disabled:opacity-50"
                    >
                      Approve Booking
                    </button>
                  )}
                  {isAdmin && isPending && (
                    <button
                      onClick={() => setRejectOpen(true)}
                      disabled={actionLoading}
                      className="w-full rounded-full bg-[#E24B4A] py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      Reject Booking
                    </button>
                  )}
                  {isApproved && (
                    <button
                      onClick={() => setCancelOpen(true)}
                      disabled={actionLoading}
                      className="w-full rounded-full bg-[#EF9F27] py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {isPending && (
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full rounded-full border border-[#EF9F27] py-3 text-sm font-medium text-[#92580a] transition hover:bg-[#fef3c7] disabled:opacity-50"
                    >
                      {isAdmin ? 'Delete' : 'Withdraw Request'}
                    </button>
                  )}
                  {(isRejected || isCancelled) && (
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full rounded-full border border-[#E24B4A] py-3 text-sm font-medium text-[#A32D2D] transition hover:bg-[#FCEBEB] disabled:opacity-50"
                    >
                      Delete Booking
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(backPath)}
                    className="w-full rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to list
                  </button>
                </div>
              </div>

              {/* Meta card */}
              <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Timeline</h3>
                <div className="flex flex-col gap-3 text-xs text-gray-500">
                  <div>
                    <p className="font-medium text-gray-400 uppercase tracking-[0.16em]">Submitted</p>
                    <p className="mt-0.5 text-gray-700">{booking?.createdAt ? new Date(booking.createdAt).toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400 uppercase tracking-[0.16em]">Last updated</p>
                    <p className="mt-0.5 text-gray-700">{booking?.updatedAt ? new Date(booking.updatedAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RejectModal
            open={rejectOpen}
            onClose={() => setRejectOpen(false)}
            onConfirm={handleRejectConfirm}
            loading={actionLoading}
          />
          <CancelModal
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
            onConfirm={handleCancelConfirm}
            loading={actionLoading}
          />
        </>
      )}
    </div>
  )
}
