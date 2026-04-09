import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'
import AppShell from '../components/AppShell'
import BookingTable from '../components/BookingTable'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'

const initialFilters = {
  status: "",
  resourceId: "",
  userId: "",
  date: "",
};

export default function AdminBookingsPage() {
  const [user, setUser] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadBookings = async (activeFilters = filters) => {
    try {
      setLoading(true)
      setErrorMessage('')
      const data = await bookingApi.getAllBookings(activeFilters)
      setBookings(data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser.role === 'ADMIN') {
          await loadBookings(initialFilters)
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      } finally {
        setPageLoading(false)
      }
    }

    loadPage()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApplyFilters = () => {
    loadBookings(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters)
    loadBookings(initialFilters)
  }

  const handleApprove = async (bookingId) => {
    try {
      setMessage('')
      setErrorMessage('')
      await bookingApi.approveBooking(bookingId)
      setMessage('Booking approved successfully.')
      loadBookings(filters)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return

    try {
      setMessage('')
      setErrorMessage('')
      await bookingApi.rejectBooking(bookingId, reason)
      setMessage('Booking rejected successfully.')
      loadBookings(filters)
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
      loadBookings(filters)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      setMessage('')
      setErrorMessage('')
      await bookingApi.cancelBooking(bookingId)
      setMessage('Booking cancelled successfully.')
      loadBookings(filters)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7F5]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />
  }

  return (
    <AppShell user={user}>
      <PageHeader
        title="Admin booking management"
        subtitle="Review, filter, approve, reject, cancel, and delete booking requests."
      />

      <section className="mb-5 grid gap-4 rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] md:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]">
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Resource ID</label>
          <input type="text" name="resourceId" value={filters.resourceId} onChange={handleFilterChange} placeholder="e.g. lab101" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">User ID</label>
          <input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="e.g. user001" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
        </div>

        <div className="flex items-end gap-3">
          <button type="button" className="rounded-full bg-[#0F6E56] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#085041]" onClick={handleApplyFilters}>
            Apply
          </button>
          <button type="button" className="rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </section>

      {message && <div className="mb-4 rounded-2xl border border-[#639922] bg-[#EAF3DE] p-4 text-sm text-[#3B6D11]">{message}</div>}
      {errorMessage && <div className="mb-4 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">{errorMessage}</div>}

      {loading ? (
        <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <Spinner size="lg" />
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
    </AppShell>
  )
}
