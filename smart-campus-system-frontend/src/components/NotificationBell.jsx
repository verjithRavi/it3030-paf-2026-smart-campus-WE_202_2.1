import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi';
import EmptyState from './ui/EmptyState';
import Spinner from './ui/Spinner';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      setNotifications([]);
      setError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getNotificationRoute = (notification) => {
    if (notification.type === 'ACCESS_REQUEST_SUBMITTED') {
      return '/pending-approvals';
    }

    if (
      [
        'ACCESS_APPROVED',
        'ACCESS_REJECTED',
        'ACCOUNT_ACTIVATED',
        'ACCOUNT_DEACTIVATED',
      ].includes(notification.type)
    ) {
      return '/dashboard';
    }

    if (
      [
        'BOOKING_APPROVED',
        'BOOKING_REJECTED',
        'BOOKING_CANCELLED',
        'TICKET_STATUS_CHANGED',
        'TICKET_COMMENT_ADDED',
      ].includes(notification.type)
    ) {
      return '/dashboard';
    }

    return '/notifications';
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setError('Unable to mark notifications as read.');
    }
  };

  const handleClickNotif = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        setError('Unable to update this notification.');
        return;
      }
    }

    setOpen(false);
    navigate(getNotificationRoute(n));
  };

  const typeColor = {
    ACCESS_REQUEST_SUBMITTED: 'bg-[#FAEEDA] text-[#854F0B]',
    BOOKING_APPROVED: 'bg-[#EAF3DE] text-[#3B6D11]',
    BOOKING_REJECTED: 'bg-[#FCEBEB] text-[#A32D2D]',
    BOOKING_CANCELLED: 'bg-[#FCEBEB] text-[#A32D2D]',
    TICKET_STATUS_CHANGED: 'bg-[#E6F1FB] text-[#185FA5]',
    TICKET_COMMENT_ADDED: 'bg-[#E6F1FB] text-[#185FA5]',
    ACCESS_APPROVED: 'bg-[#EAF3DE] text-[#3B6D11]',
    ACCESS_REJECTED: 'bg-[#FCEBEB] text-[#A32D2D]',
    ACCOUNT_ACTIVATED: 'bg-[#EAF3DE] text-[#3B6D11]',
    ACCOUNT_DEACTIVATED: 'bg-[#FCEBEB] text-[#A32D2D]',
    GENERAL: 'bg-gray-100 text-gray-600',
  };

  const typeLabel = {
    ACCESS_REQUEST_SUBMITTED: 'Approval',
    BOOKING_APPROVED: 'Booking',
    BOOKING_REJECTED: 'Booking',
    BOOKING_CANCELLED: 'Booking',
    TICKET_STATUS_CHANGED: 'Ticket',
    TICKET_COMMENT_ADDED: 'Comment',
    ACCESS_APPROVED: 'Access',
    ACCESS_REJECTED: 'Access',
    ACCOUNT_ACTIVATED: 'Account',
    ACCOUNT_DEACTIVATED: 'Account',
    GENERAL: 'General',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2a6 6 0 0 0-6 6v3l-1.707 1.707A1 1 0 0 0 3 14h14a1 1 0 0 0 .707-1.707L16 11V8a6 6 0 0 0-6-6z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M8 16a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAll}
                className="text-xs text-[#1D9E75] hover:underline"
              >
                Mark all read
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
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
              <div className="px-4 py-8 text-center text-sm text-[#A32D2D]">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState title="No notifications" subtitle="You're all caught up." />
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                    !n.isRead ? 'bg-[#F0FBF7]' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.isRead ? 'bg-[#1D9E75]' : 'bg-gray-200'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">{n.timeAgo}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      typeColor[n.type] || 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {typeLabel[n.type] || 'Info'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
