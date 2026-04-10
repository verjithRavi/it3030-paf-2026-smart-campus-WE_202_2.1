import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';

import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi';

const tabMap = {
  ALL: () => true,
  APPROVALS: (n) => n.type === 'ACCESS_REQUEST_SUBMITTED',
  BOOKINGS: (n) =>
    ['BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED'].includes(
      n.type
    ),
  TICKETS: (n) => n.type === 'TICKET_STATUS_CHANGED',
  COMMENTS: (n) => n.type === 'TICKET_COMMENT_ADDED',
  ACCESS: (n) =>
    [
      'ACCESS_APPROVED',
      'ACCESS_REJECTED',
      'ACCOUNT_ACTIVATED',
      'ACCOUNT_DEACTIVATED',
      'ACCESS_REQUEST_SUBMITTED',
    ].includes(n.type),
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

function NotificationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [error, setError] = useState('');

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

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
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
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch {
      setError('Unable to mark all notifications as read.');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      }

      navigate(getNotificationRoute(notification));
    } catch {
      setError('Unable to open this notification right now.');
    }
  };

  const filteredNotifications = notifications.filter(tabMap[activeTab]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
        <PageHeader
          title="Notifications"
          subtitle="Stay updated on approvals, tickets, and comments."
          action={
            <button
              onClick={handleMarkAll}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
            >
              Mark all as read
            </button>
          }
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(tabMap).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                    ? 'rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900'
                    : 'rounded-full px-4 py-2 text-sm text-gray-400 transition hover:text-gray-600'
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          {error ? (
            <div className="px-5 py-6 text-sm text-[#A32D2D]">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              title="No notifications here"
              subtitle="Check back later for updates."
            />
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex cursor-pointer items-start gap-3 border-b border-gray-50 px-5 py-4 transition hover:bg-gray-50 last:border-0 ${
                  !n.isRead ? 'bg-[#F0FBF7]' : ''
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                    !n.isRead ? 'bg-[#1D9E75]' : 'bg-gray-200'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">{n.timeAgo}</p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    typeColor[n.type] || 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {typeLabel[n.type] || 'Info'}
                </span>
              </div>
            ))
          )}
        </div>
      </>)}
    </div>
  );
}

export default NotificationsPage;
