import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllUsers } from '../api/authApi';
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
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const users = await getAllUsers();
        const count = users.filter(
          (user) => user.approvalStatus === 'PENDING'
        ).length;
        setPendingCount(count);
      } catch {
        setPendingCount(0);
      }
    };

    loadPendingCount();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    {
      label: 'Pending approvals',
      path: '/pending-approvals',
      icon: 'check',
      badge: pendingCount,
    },
    { label: 'Students', path: '/users/students', icon: 'list' },
    { label: 'Lecturers', path: '/users/lecturers', icon: 'list' },
    { label: 'Technicians', path: '/users/technicians', icon: 'list' },
  ];

  return (
    <aside className="flex min-h-screen w-52 flex-col border-r border-gray-100 bg-gray-50 py-4">
      <nav className="flex-1 space-y-0.5 px-2">
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
