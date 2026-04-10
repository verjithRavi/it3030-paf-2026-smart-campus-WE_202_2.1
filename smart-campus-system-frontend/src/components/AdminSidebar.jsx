import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllUsers } from '../api/authApi';
import { bookingApi } from '../api/bookingApi';
import { NAV_ACTIVE, NAV_INACTIVE } from '../constants/theme';

function Icon({ type }) {
  if (type === 'grid') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <rect x="2" y="2" width="7" height="7" rx="1" />
        <rect x="11" y="2" width="7" height="7" rx="1" />
        <rect x="2" y="11" width="7" height="7" rx="1" />
        <rect x="11" y="11" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === 'check') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <circle cx="7" cy="8" r="3" />
        <path d="M2 17c0-3 2.5-5 5-5M13 10l2 2 4-4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M6 2.5v3M14 2.5v3M3 8h14" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path d="M3 6h14M3 10h10M3 14h7" strokeLinecap="round" />
    </svg>
  );
}

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingStudentCount, setPendingStudentCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

  useEffect(() => {
    const loadPendingCounts = async () => {
      try {
        const [users, bookings] = await Promise.all([
          getAllUsers(),
          bookingApi.getAllBookings({ status: 'PENDING' }),
        ]);
        const studentCount = users.filter(
          (user) =>
            user.approvalStatus === 'PENDING' &&
            (user.userType === 'STUDENT' || user.requestedUserType === 'STUDENT')
        ).length;
        setPendingStudentCount(studentCount);
        setPendingBookingCount(bookings.length);
      } catch {
        setPendingStudentCount(0);
        setPendingBookingCount(0);
      }
    };

    loadPendingCounts();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    {
      label: 'Booking approvals',
      path: '/admin/bookings',
      icon: 'calendar',
      badge: pendingBookingCount,
    },
    { label: 'Admins', path: '/users/admins', icon: 'list' },
    { label: 'Students', path: '/users/students', icon: 'list', badge: pendingStudentCount },
    { label: 'Lecturers', path: '/users/lecturers', icon: 'list' },
    { label: 'Technicians', path: '/users/technicians', icon: 'list' },
  ];

  return (
    <aside className="glass-panel flex h-screen w-60 shrink-0 flex-col border-r border-white/60 bg-white/70 px-3 py-5 overflow-y-auto">
      <div className="mb-5 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F6E56]">
          Admin console
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Review approvals, bookings, and campus directory activity.
        </p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? NAV_ACTIVE : NAV_INACTIVE}
            >
              <Icon type={item.icon} />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="rounded-full bg-[#FCEBEB] px-1.5 py-0.5 text-xs text-[#A32D2D]">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
