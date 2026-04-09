import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, submitAccessRequest } from '../api/authApi';
import { bookingApi } from '../api/bookingApi';
import { getNotifications, getUnreadCount } from '../api/notificationApi';
import AppShell from '../components/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/ui/StatCard';
import { getGreeting } from '../utils/time';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [error, setError] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      setNotificationError('');

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser.role === 'ADMIN') {
          const pendingBookings = await bookingApi.getAllBookings({ status: 'PENDING' });
          setPendingBookingCount(pendingBookings.length);
        }
      } catch {
        setError('Unable to load your dashboard right now.');
        setLoading(false);
        return;
      } finally {
      }

      try {
        const [notificationsRes, unreadCountRes] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ]);

        setNotifications(notificationsRes.data.slice(0, 3));
        setUnreadCount(unreadCountRes.data.count);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationError('Notifications are unavailable right now.');
      } finally {
        const params = new URLSearchParams(window.location.search);
        setSetupMode(params.get('setup') === 'pending');
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleAccessRequest = async (requestedUserType) => {
    try {
      setRequestMessage('');
      const updatedUser = await submitAccessRequest({ requestedUserType });
      setUser(updatedUser);
      setRequestMessage(
        `Your ${requestedUserType.toLowerCase()} access request has been submitted.`
      );
    } catch {
      setRequestMessage('Unable to submit your access request right now.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7F5]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell user={user} contentClassName="w-full max-w-[1200px] px-6 py-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] p-4 text-sm text-[#A32D2D]">
              {error}
            </div>
          )}

          {setupMode && (
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#EF9F27] bg-[#FAEEDA] p-4 text-sm text-[#854F0B]">
              <span>Complete your profile to get the most out of Smart Campus.</span>
              <button
                onClick={() => navigate('/profile')}
                className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#854F0B]"
              >
                Complete profile
              </button>
            </div>
          )}

          <PageHeader
            title={`${getGreeting()}, ${user?.name?.split(' ')[0]}`}
            subtitle="Here's what's happening on campus today."
          />

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="My bookings" value="-" sub="Coming soon" />
            <StatCard label="My tickets" value="-" sub="Coming soon" />
            <StatCard
              label="Unread notifications"
              value={unreadCount}
              sub={unreadCount === 1 ? 'notification' : 'notifications'}
            />
            <StatCard
              label="Account"
              value={<Badge status={user?.approvalStatus} label={user?.approvalStatus} />}
              sub={user?.userType || user?.role}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">
                  Recent notifications
                </h2>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs font-medium text-[#1D9E75]"
                >
                  View all
                </button>
              </div>

              {notificationError ? (
                <div className="rounded-xl border border-[#E24B4A] bg-[#FCEBEB] p-3 text-sm text-[#A32D2D]">
                  {notificationError}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState title="No notifications yet" />
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 border-b border-gray-50 py-3 last:border-0"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#1D9E75]" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-300">
                        {notification.timeAgo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <h2 className="mb-4 text-sm font-medium text-gray-900">
                Account status
              </h2>

              <div className="flex flex-col items-center text-center">
                <Avatar name={user?.name || ''} size="lg" />
                <p className="mt-3 text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {user?.role} {user?.userType ? `• ${user.userType}` : ''}
                </p>
                <div className="mt-3">
                  <Badge status={user?.approvalStatus} label={user?.approvalStatus} />
                </div>
              </div>

              {user?.approvalStatus === 'PENDING' && (
                <div className="mt-4 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] p-3 text-sm text-[#854F0B]">
                  Your account is pending admin approval. You will be notified once
                  reviewed.
                </div>
              )}

              {user?.role === 'USER' &&
                user?.userType === null &&
                user?.approvalStatus !== 'PENDING' && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs text-gray-500">
                      Want student or lecturer access?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccessRequest('STUDENT')}
                        className="rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-700"
                      >
                        Request Student
                      </button>
                      <button
                        onClick={() => handleAccessRequest('LECTURER')}
                        className="rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-700"
                      >
                        Request Lecturer
                      </button>
                    </div>
                    {requestMessage && (
                      <p className="mt-3 text-xs text-[#1D9E75]">{requestMessage}</p>
                    )}
                  </div>
                )}
            </section>

            {user?.role === 'ADMIN' && (
              <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] md:col-span-2">
                <h2 className="mb-4 text-sm font-medium text-gray-900">
                  Admin quick actions
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={() => navigate('/pending-approvals')}
                    className="rounded-[24px] border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Pending approvals
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Review user access requests.
                    </p>
                  </button>
                  <button
                    onClick={() => navigate('/users/students')}
                    className="rounded-[24px] border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      User directory
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Manage campus user accounts.
                    </p>
                  </button>
                  <button
                    onClick={() => navigate('/admin/bookings')}
                    className="rounded-[24px] border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Booking approvals
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Review pending booking requests{pendingBookingCount > 0 ? ` (${pendingBookingCount})` : ''}.
                    </p>
                  </button>
                </div>
              </section>
            )}
          </div>
    </AppShell>
  );
}

export default DashboardPage;
