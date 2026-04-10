import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../api/notificationApi'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'

const TABS = [
  { key: 'ALL',       label: 'All' },
  { key: 'BOOKINGS',  label: 'Bookings' },
  { key: 'TICKETS',   label: 'Tickets' },
  { key: 'APPROVALS', label: 'Approvals' },
  { key: 'ACCOUNT',   label: 'Account' },
]

const tabFilter = {
  ALL:       () => true,
  BOOKINGS:  (n) => ['BOOKING_SUBMITTED', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED'].includes(n.type),
  TICKETS:   (n) => ['TICKET_SUBMITTED', 'TICKET_STATUS_CHANGED', 'TICKET_COMMENT_ADDED'].includes(n.type),
  APPROVALS: (n) => n.type === 'ACCESS_REQUEST_SUBMITTED',
  ACCOUNT:   (n) => ['ACCESS_APPROVED', 'ACCESS_REJECTED', 'ACCOUNT_ACTIVATED', 'ACCOUNT_DEACTIVATED'].includes(n.type),
}

const typeColor = {
  BOOKING_SUBMITTED:        'bg-[#FAEEDA] text-[#854F0B]',
  BOOKING_APPROVED:         'bg-[#EAF3DE] text-[#3B6D11]',
  BOOKING_REJECTED:         'bg-[#FCEBEB] text-[#A32D2D]',
  BOOKING_CANCELLED:        'bg-[#FCEBEB] text-[#A32D2D]',
  TICKET_SUBMITTED:         'bg-[#FAEEDA] text-[#854F0B]',
  TICKET_STATUS_CHANGED:    'bg-[#E6F1FB] text-[#185FA5]',
  TICKET_COMMENT_ADDED:     'bg-[#E6F1FB] text-[#185FA5]',
  ACCESS_REQUEST_SUBMITTED: 'bg-[#FAEEDA] text-[#854F0B]',
  ACCESS_APPROVED:          'bg-[#EAF3DE] text-[#3B6D11]',
  ACCESS_REJECTED:          'bg-[#FCEBEB] text-[#A32D2D]',
  ACCOUNT_ACTIVATED:        'bg-[#EAF3DE] text-[#3B6D11]',
  ACCOUNT_DEACTIVATED:      'bg-[#FCEBEB] text-[#A32D2D]',
  GENERAL:                  'bg-gray-100 text-gray-600',
}

const typeLabel = {
  BOOKING_SUBMITTED:        'Booking',
  BOOKING_APPROVED:         'Booking',
  BOOKING_REJECTED:         'Booking',
  BOOKING_CANCELLED:        'Booking',
  TICKET_SUBMITTED:         'Ticket',
  TICKET_STATUS_CHANGED:    'Ticket',
  TICKET_COMMENT_ADDED:     'Comment',
  ACCESS_REQUEST_SUBMITTED: 'Approval',
  ACCESS_APPROVED:          'Access',
  ACCESS_REJECTED:          'Access',
  ACCOUNT_ACTIVATED:        'Account',
  ACCOUNT_DEACTIVATED:      'Account',
  GENERAL:                  'General',
}

const getRoute = (n) => {
  if (['BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'BOOKING_SUBMITTED'].includes(n.type) && n.relatedEntityId) {
    return `/bookings/${n.relatedEntityId}`
  }
  if (['TICKET_SUBMITTED', 'TICKET_STATUS_CHANGED', 'TICKET_COMMENT_ADDED'].includes(n.type) && n.relatedEntityId) {
    return `/tickets/${n.relatedEntityId}`
  }
  if (n.type === 'ACCESS_REQUEST_SUBMITTED') return '/pending-approvals'
  if (['ACCESS_APPROVED', 'ACCESS_REJECTED', 'ACCOUNT_ACTIVATED', 'ACCOUNT_DEACTIVATED'].includes(n.type)) return '/profile'
  return '/notifications'
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [error, setError] = useState('')

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch {
      setNotifications([])
      setError('Unable to load notifications right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      setError('Unable to mark all as read.')
    }
  }

  const handleClick = async (n) => {
    try {
      if (!n.isRead) {
        await markNotificationRead(n.id)
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        )
      }
      navigate(getRoute(n))
    } catch {
      setError('Unable to open this notification.')
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      setError('Unable to delete notification.')
    }
  }

  const filtered = notifications.filter(tabFilter[activeTab])
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const tabCount = (key) => {
    if (key === 'ALL') return notifications.length
    return notifications.filter(tabFilter[key]).length
  }

  return (
    <div className="mx-auto w-full max-w-330 px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <>
          <PageHeader
            title="Notifications"
            subtitle="Stay updated on bookings, tickets, and account events."
            action={
              unreadCount > 0 ? (
                <button
                  onClick={handleMarkAll}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
                >
                  Mark all as read
                </button>
              ) : null
            }
          />

          {error && (
            <div className="mb-4 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">
              {error}
            </div>
          )}

          {/* Tab pills */}
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map(({ key, label }) => {
              const count = tabCount(key)
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0F6E56] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            {filtered.length === 0 ? (
              <EmptyState title="No notifications here" subtitle="Check back later for updates." />
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`group flex cursor-pointer items-start gap-3 border-b border-gray-50 px-5 py-4 transition hover:bg-gray-50 last:border-0 ${
                    !n.isRead ? 'bg-[#F0FBF7]' : ''
                  }`}
                >
                  {/* Unread dot */}
                  <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${!n.isRead ? 'bg-[#1D9E75]' : 'bg-gray-200'}`} />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-300">{n.timeAgo}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${typeColor[n.type] || 'bg-gray-100 text-gray-500'}`}>
                      {typeLabel[n.type] || 'Info'}
                    </span>
                    {/* Delete button — visible on hover */}
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="rounded-full p-1 text-gray-200 opacity-0 transition hover:bg-red-50 hover:text-[#E24B4A] group-hover:opacity-100"
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
