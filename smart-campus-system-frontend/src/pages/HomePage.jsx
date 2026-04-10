import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { bookingApi } from '../api/bookingApi'
import { getCurrentUser } from '../api/authApi'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'

function QuickAction({ title, copy, onClick, accent, cta }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${accent} p-5 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5`}
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-600">{copy}</p>
      <span className="mt-5 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0F6E56]">
        {cta}
      </span>
    </button>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHome = async () => {
      setLoading(true)
      setError('')

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const myBookings = await bookingApi.getMyBookings()
        setBookings(myBookings)
      } catch {
        setError('Unable to load your home page right now.')
      } finally {
        setLoading(false)
      }
    }

    loadHome()
  }, [])

  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      {error && (
        <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">
          {error}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(29,158,117,0.22),_transparent_35%),linear-gradient(135deg,_#ffffff_0%,_#edf7f2_58%,_#dff1eb_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#BEE6D8]/50 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F6E56]">
              Student Home
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}. Ready to plan your next campus booking?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Use this home space to jump into your dashboard, reserve labs or rooms,
              and keep an eye on your requests without digging through separate pages.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/bookings/new')}
                className="rounded-full bg-[#0F6E56] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#085041]"
              >
                Create booking
              </button>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Open dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/bookings/my')}
                className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                View my bookings
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-medium text-gray-900">Account snapshot</p>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge status={user?.approvalStatus} label={user?.approvalStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span>Role</span>
                <span className="font-medium text-gray-900">
                  {user?.userType || user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email</span>
                <span className="max-w-[13rem] truncate font-medium text-gray-900">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total bookings"
          value={bookings.length}
          sub="Requests across your account"
        />
        <StatCard
          label="Pending requests"
          value={bookings.filter((booking) => booking.status === 'PENDING').length}
          sub="Awaiting admin review"
        />
        <StatCard
          label="Approved bookings"
          value={bookings.filter((booking) => booking.status === 'APPROVED').length}
          sub="Ready for use"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <QuickAction
          title="Go to dashboard"
          copy="Open your main workspace for notifications, account status, and campus updates."
          onClick={() => navigate('/home')}
          accent="from-[#FFF7E8] via-[#FFFDF7] to-[#FFFFFF]"
          cta="Open dashboard"
        />
        <QuickAction
          title="Create a booking"
          copy="Reserve a lab, room, lecture hall, or equipment with a cleaner booking form."
          onClick={() => navigate('/bookings/new')}
          accent="from-[#E7F8F1] via-[#F6FFFB] to-[#FFFFFF]"
          cta="Start booking"
        />
        <QuickAction
          title="Review my bookings"
          copy="Track upcoming requests, cancellations, and approvals in one place."
          onClick={() => navigate('/bookings/my')}
          accent="from-[#EDF1FF] via-[#FAFBFF] to-[#FFFFFF]"
          cta="See bookings"
        />
      </section>

      <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Recent booking activity</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your latest requests and their current status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Manage all
          </button>
        </div>

        <div className="mt-5">
          {bookings.length === 0 ? (
            <EmptyState title="No bookings yet" description="Create your first booking to start using campus resources." />
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.resourceName}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={booking.status} label={booking.status} />
                    <span className="text-sm text-gray-500">{booking.resourceType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      </>)}
    </div>
  )
}

export default HomePage
