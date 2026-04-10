import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi'
import EmptyState from './ui/EmptyState'
import Spinner from './ui/Spinner'
import NotificationToast from './NotificationToast'

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

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])

  const panelRef = useRef(null)
  const prevCountRef = useRef(null)   // null = not yet initialized
  const knownIdsRef = useRef(new Set())
  const navigate = useNavigate()

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== toastId))
  }

  const fetchCount = async () => {
    try {
      const res = await getUnreadCount()
      const newCount = res.data.count

      if (prevCountRef.current === null) {
        // First load: populate known IDs silently, no toasts
        if (newCount > 0) {
          const notifsRes = await getNotifications()
          notifsRes.data.forEach((n) => knownIdsRef.current.add(n.id))
          if (open) setNotifications(notifsRes.data)
        }
        prevCountRef.current = newCount
      } else if (newCount > prevCountRef.current) {
        // New notifications arrived — fetch and show toasts
        const notifsRes = await getNotifications()
        const all = notifsRes.data
        const brandNew = all.filter((n) => !knownIdsRef.current.has(n.id))

        if (brandNew.length > 0) {
          const newToasts = brandNew.slice(0, 3).map((n) => ({
            ...n,
            _toastId: `${n.id}-${Date.now()}`,
          }))
          setToasts((prev) => [...prev, ...newToasts].slice(-5))
          brandNew.forEach((n) => knownIdsRef.current.add(n.id))
        }

        all.forEach((n) => knownIdsRef.current.add(n.id))
        if (open) setNotifications(all)
        prevCountRef.current = newCount
      } else {
        prevCountRef.current = newCount
      }

      setUnreadCount(newCount)
    } catch {
      setUnreadCount(0)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getNotifications()
      setNotifications(res.data)
      res.data.forEach((n) => knownIdsRef.current.add(n.id))
    } catch {
      setNotifications([])
      setError('Unable to load notifications right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      setError('Unable to mark notifications as read.')
    }
  }

  const handleClickNotif = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id)
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        setError('Unable to update this notification.')
        return
      }
    }
    setOpen(false)
    navigate(getRoute(n))
  }

  return (
    <>
      {/* Toast stack — rendered as fixed overlay, visible on all pages */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50"
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a6 6 0 0 0-6 6v3l-1.707 1.707A1 1 0 0 0 3 14h14a1 1 0 0 0 .707-1.707L16 11V8a6 6 0 0 0-6-6z"
              stroke="currentColor" strokeWidth="1.3"
            />
            <path d="M8 16a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={handleMarkAll} className="text-xs text-[#1D9E75] hover:underline">
                  Mark all read
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/notifications') }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  View all
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : error ? (
                <div className="px-4 py-8 text-center text-sm text-[#A32D2D]">{error}</div>
              ) : notifications.length === 0 ? (
                <EmptyState title="No notifications" subtitle="You're all caught up." />
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClickNotif(n)}
                    className={`flex cursor-pointer items-start gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 ${
                      !n.isRead ? 'bg-[#F0FBF7]' : ''
                    }`}
                  >
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? 'bg-[#1D9E75]' : 'bg-gray-200'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug text-gray-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{n.message}</p>
                      <p className="mt-1 text-xs text-gray-300">{n.timeAgo}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${typeColor[n.type] || 'bg-gray-100 text-gray-500'}`}>
                      {typeLabel[n.type] || 'Info'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
