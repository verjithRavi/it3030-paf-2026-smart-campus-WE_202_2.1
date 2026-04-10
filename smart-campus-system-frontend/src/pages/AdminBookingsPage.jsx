import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'

import BookingTable from '../components/BookingTable'
import RejectModal from '../components/RejectModal'
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
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null })
  const [rejectLoading, setRejectLoading] = useState(false)

  const loadBookings = useCallback(async (activeFilters = filters) => {
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
  }, [filters])

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
  }, [loadBookings])

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

  const handleReject = (bookingId) => {
    setRejectModal({ open: true, bookingId })
  }

  const handleRejectConfirm = async (reason) => {
    try {
      setRejectLoading(true)
      setMessage('')
      setErrorMessage('')
      await bookingApi.rejectBooking(rejectModal.bookingId, reason)
      setRejectModal({ open: false, bookingId: null })
      setMessage('Booking rejected.')
      loadBookings(filters)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setRejectLoading(false)
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
    const confirmed = window.confirm('Are you sure you want to cancel this approved booking? This cannot be undone.')
    if (!confirmed) return

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

  if (!pageLoading && user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-6">
      {pageLoading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      <PageHeader
        title="Admin booking management"
        subtitle="Review, filter, approve, reject, cancel, and delete booking requests."
      />

      <section className="mb-5 grid gap-4 rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] md:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]">
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Resource ID</label>
          <input type="text" name="resourceId" value={filters.resourceId} onChange={handleFilterChange} placeholder="e.g. lab101" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">User ID</label>
          <input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="e.g. S0001" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75]" />
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
      </>)}

      <RejectModal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, bookingId: null })}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />
    </div>
  )
}
