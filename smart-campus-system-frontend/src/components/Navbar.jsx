import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import NotificationBell from './NotificationBell';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { getCurrentUserData, removeToken, setCurrentUserData } from '../utils/token';

function Navbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const cachedUser = getCurrentUserData()

      if (cachedUser) {
        setUser(cachedUser)
        setLoading(false)
      }

      try {
        const data = await getCurrentUser();
        setUser(data);
        setCurrentUserData(data)
      } catch {
        setUser(cachedUser || null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-6 py-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 transition hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F6E56]">
            <div className="h-3 w-3 rounded-sm bg-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">Smart Campus</span>
        </button>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <Avatar name={user?.name || ''} size="sm" />
              <span className="hidden text-xs text-gray-600 sm:block">
                {loading ? 'Loading...' : user?.name}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-xl">
              <div className="border-b border-gray-100 px-3 py-3">
                <div className="flex items-start gap-3">
                  <Avatar name={user?.name || ''} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user?.name || 'Campus User'}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user?.email || 'No email'}
                    </p>
                    <div className="mt-2">
                      <Badge
                        status={user?.role || 'USER'}
                        label={user?.role || 'USER'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate(user?.role === 'ADMIN' ? '/dashboard' : '/home');
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 10.5 10 4l7 6.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1v-5.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{user?.role === 'ADMIN' ? 'Dashboard' : 'Home'}</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/bookings/new');
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span>Create booking</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/bookings/my');
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M5 4.5h10M5 10h10M5 15.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span>My bookings</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 3.333a3.333 3.333 0 1 0 0 6.667 3.333 3.333 0 0 0 0-6.667Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M4.167 16.667c.833-2.5 3.055-4.167 5.833-4.167s5 1.667 5.833 4.167"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Edit profile</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/notifications');
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
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
                <span>Notifications</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  removeToken();
                  navigate('/', { replace: true });
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M8.333 5H5.667A1.667 1.667 0 0 0 4 6.667v6.666A1.667 1.667 0 0 0 5.667 15h2.666"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11.667 12.5 15 9.167 11.667 5.833"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 9.167H8.333"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Sign out</span>
              </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
