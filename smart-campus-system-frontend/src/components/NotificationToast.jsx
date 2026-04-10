import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const typeColor = {
  BOOKING_SUBMITTED:    'bg-[#FAEEDA] text-[#854F0B]',
  BOOKING_APPROVED:     'bg-[#EAF3DE] text-[#3B6D11]',
  BOOKING_REJECTED:     'bg-[#FCEBEB] text-[#A32D2D]',
  BOOKING_CANCELLED:    'bg-[#FCEBEB] text-[#A32D2D]',
  TICKET_SUBMITTED:     'bg-[#FAEEDA] text-[#854F0B]',
  TICKET_STATUS_CHANGED:'bg-[#E6F1FB] text-[#185FA5]',
  TICKET_COMMENT_ADDED: 'bg-[#E6F1FB] text-[#185FA5]',
  ACCESS_REQUEST_SUBMITTED: 'bg-[#FAEEDA] text-[#854F0B]',
  ACCESS_APPROVED:      'bg-[#EAF3DE] text-[#3B6D11]',
  ACCESS_REJECTED:      'bg-[#FCEBEB] text-[#A32D2D]',
  ACCOUNT_ACTIVATED:    'bg-[#EAF3DE] text-[#3B6D11]',
  ACCOUNT_DEACTIVATED:  'bg-[#FCEBEB] text-[#A32D2D]',
  GENERAL:              'bg-gray-100 text-gray-600',
}

const typeLabel = {
  BOOKING_SUBMITTED:    'Booking',
  BOOKING_APPROVED:     'Booking',
  BOOKING_REJECTED:     'Booking',
  BOOKING_CANCELLED:    'Booking',
  TICKET_SUBMITTED:     'Ticket',
  TICKET_STATUS_CHANGED:'Ticket',
  TICKET_COMMENT_ADDED: 'Comment',
  ACCESS_REQUEST_SUBMITTED: 'Approval',
  ACCESS_APPROVED:      'Access',
  ACCESS_REJECTED:      'Access',
  ACCOUNT_ACTIVATED:    'Account',
  ACCOUNT_DEACTIVATED:  'Account',
  GENERAL:              'General',
}

const getRoute = (n) => {
  if (['BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'BOOKING_SUBMITTED'].includes(n.type) && n.relatedEntityId) {
    return `/bookings/${n.relatedEntityId}`
  }
  if (['TICKET_SUBMITTED', 'TICKET_STATUS_CHANGED', 'TICKET_COMMENT_ADDED'].includes(n.type) && n.relatedEntityId) {
    return `/tickets/${n.relatedEntityId}`
  }
  if (n.type === 'ACCESS_REQUEST_SUBMITTED') return '/pending-approvals'
  return '/notifications'
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10)
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 350)
    }, 5500)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [])

  const handleView = () => {
    onDismiss()
    navigate(getRoute(toast))
  }

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 350)
  }

  return (
    <div
      className={`pointer-events-auto w-80 rounded-2xl border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.18)] transition-all duration-350 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full rounded-t-2xl bg-[#1D9E75]" />

      <div className="flex items-start gap-3 p-4">
        {/* Bell icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F0FBF7]">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a6 6 0 0 0-6 6v3l-1.707 1.707A1 1 0 0 0 3 14h14a1 1 0 0 0 .707-1.707L16 11V8a6 6 0 0 0-6-6z"
              stroke="#1D9E75" strokeWidth="1.4"
            />
            <path d="M8 16a2 2 0 0 0 4 0" stroke="#1D9E75" strokeWidth="1.4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[toast.type] || 'bg-gray-100 text-gray-600'}`}>
              {typeLabel[toast.type] || 'Info'}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{toast.title}</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed line-clamp-2">{toast.message}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleView}
              className="rounded-full bg-[#0F6E56] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#085041]"
            >
              View
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function NotificationToast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-[64px] z-[200] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast._toastId}
          toast={toast}
          onDismiss={() => onDismiss(toast._toastId)}
        />
      ))}
    </div>
  )
}
