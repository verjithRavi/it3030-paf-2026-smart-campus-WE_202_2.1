import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'

import BookingTable from '../components/BookingTable'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm('Cancel this approved booking?')
    if (!confirmed) return

    try {
      setMessage('')
      setErrorMessage('')
      await bookingApi.cancelBooking(bookingId)
      setMessage('Booking cancelled successfully.')
      loadBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
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

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
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

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={bookings.length} sub="All requests" />
        <StatCard
          label="Pending"
          value={bookings.filter((b) => b.status === 'PENDING').length}
          sub="Awaiting review"
        />
        <StatCard
          label="Approved"
          value={bookings.filter((b) => b.status === 'APPROVED').length}
          sub="Confirmed bookings"
        />
        <StatCard
          label="Rejected"
          value={bookings.filter((b) => b.status === 'REJECTED').length}
          sub="Declined requests"
        />
      </div>

      {message && <div className="mb-4 rounded-2xl border border-[#639922] bg-[#EAF3DE] p-4 text-sm text-[#3B6D11]">{message}</div>}
      {errorMessage && <div className="mb-4 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">{errorMessage}</div>}

      <BookingTable
        bookings={bookings}
        role={user?.role}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
      </>)}
    </div>
  )
}
