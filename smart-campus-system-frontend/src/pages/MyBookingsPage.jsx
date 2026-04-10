import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'

import BookingTable from '../components/BookingTable'
import CancelModal from '../components/CancelModal'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'

const STATUS_FILTERS = [
  { label: 'All',       value: 'ALL' },
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Approved',  value: 'APPROVED' },
  { label: 'Rejected',  value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null })
  const [cancelLoading, setCancelLoading] = useState(false)

  const loadBookings = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const [currentUser, data] = await Promise.all([
        getCurrentUser(),
        bookingApi.getMyBookings(),
      ])
      setUser(currentUser)
      setBookings(data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  const handleCancelClick = (bookingId) => {
    setCancelModal({ open: true, bookingId })
  }

  const handleCancelConfirm = async (reason) => {
    try {
      setCancelLoading(true)
      setMessage('')
      setErrorMessage('')
      await bookingApi.cancelBooking(cancelModal.bookingId, reason || null)
      setCancelModal({ open: false, bookingId: null })
      setMessage('Booking cancelled successfully.')
      loadBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setCancelLoading(false)
    }
  }

  const handleDelete = async (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking?')
    if (!confirmed) return
    try {
      setMessage('')
      setErrorMessage('')
      await bookingApi.deleteBooking(bookingId)
      setMessage('Booking deleted successfully.')
      loadBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  const filtered = activeFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === activeFilter)

  return (
    <div className="mx-auto w-full max-w-330 px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <>
          <PageHeader
            title="My bookings"
            subtitle="Keep track of requests, cancellations, and approvals from one place."
            action={
              <button
                type="button"
                onClick={() => navigate('/bookings/new')}
                className="rounded-full bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#085041]"
              >
                New booking
              </button>
            }
          />

          {/* Stat cards — clickable to filter */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total',    value: bookings.length,                                           sub: 'All requests',      filter: 'ALL' },
              { label: 'Pending',  value: bookings.filter(b => b.status === 'PENDING').length,       sub: 'Awaiting review',   filter: 'PENDING' },
              { label: 'Approved', value: bookings.filter(b => b.status === 'APPROVED').length,      sub: 'Confirmed',         filter: 'APPROVED' },
              { label: 'Rejected', value: bookings.filter(b => b.status === 'REJECTED').length,      sub: 'Declined requests', filter: 'REJECTED' },
            ].map(({ label, value, sub, filter }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveFilter(filter === activeFilter ? 'ALL' : filter)}
                className={`text-left transition-opacity hover:opacity-80 focus:outline-none ${
                  activeFilter === filter ? 'ring-2 ring-[#0F6E56] ring-offset-2 rounded-3xl' : ''
                }`}
              >
                <StatCard label={label} value={value} sub={sub} />
              </button>
            ))}
          </div>

          {/* Status filter pills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === value
                    ? 'bg-[#0F6E56] text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
                <span className={`ml-1.5 ${activeFilter === value ? 'text-green-200' : 'text-gray-400'}`}>
                  {value === 'ALL'
                    ? bookings.length
                    : bookings.filter(b => b.status === value).length}
                </span>
              </button>
            ))}
          </div>

          {message && (
            <div className="mb-4 rounded-2xl border border-[#639922] bg-[#EAF3DE] p-4 text-sm text-[#3B6D11]">
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">
              {errorMessage}
            </div>
          )}

          <BookingTable
            bookings={filtered}
            role={user?.role}
            onCancel={handleCancelClick}
            onDelete={handleDelete}
          />

          <CancelModal
            open={cancelModal.open}
            onClose={() => setCancelModal({ open: false, bookingId: null })}
            onConfirm={handleCancelConfirm}
            loading={cancelLoading}
          />
        </>
      )}
    </div>
  )
}
