import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, getErrorMessage } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'

import BookingForm from '../components/BookingForm'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'

export default function NewBookingPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } finally {
        setPageLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleCreateBooking = async (formData) => {
    try {
      setLoading(true)
      setSuccessMessage('')
      setErrorMessage('')

      await bookingApi.createBooking(formData)

      setSuccessMessage('Booking request submitted successfully.')
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-6">
      {pageLoading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      <PageHeader
        title="Create booking"
        subtitle="Reserve a lab, room, lecture hall, or equipment with all the details admins need."
        action={
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View my bookings
          </button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#1D9E75]">Booking guide</p>
          <p className="mt-3 text-lg font-medium text-gray-900">Tell us what you need</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Choose the resource, date, time, and purpose. Requests are submitted in
            pending status until reviewed.
          </p>
        </div>
        <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#1D9E75]">Signed in as</p>
          <p className="mt-3 text-lg font-medium text-gray-900">{user?.name}</p>
          <p className="mt-2 text-sm text-gray-600">{user?.email}</p>
        </div>
        <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#1D9E75]">Quick jump</p>
          <button
            type="button"
            onClick={() => navigate(user?.role === 'ADMIN' ? '/dashboard' : '/home')}
            className="mt-3 rounded-full bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#085041]"
          >
            Go to {user?.role === 'ADMIN' ? 'dashboard' : 'home'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-2xl border border-[#639922] bg-[#EAF3DE] p-4 text-sm text-[#3B6D11]">
          {successMessage}
        </div>
      )}
      <BookingForm onSubmit={handleCreateBooking} loading={loading} submitError={errorMessage} />
      </>)}
    </div>
  )
}
