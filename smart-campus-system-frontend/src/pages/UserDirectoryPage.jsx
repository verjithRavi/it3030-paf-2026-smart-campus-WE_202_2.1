import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { deleteUser, getAllUsers, updateApprovalStatus, updateUserRole, updateUserStatus } from '../api/authApi';
import {
  getDirectoryCache,
  removeCachedUser,
  replaceCachedUser,
  setDirectoryCache,
  upsertCachedUser,
} from '../utils/directoryCache';

function UserDirectoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const categoryTitle = {
    admins: 'Admins',
    students: 'Students',
    lecturers: 'Lecturers',
    technicians: 'Technicians',
  }[category];

  const categoryUserType = {
    admins: null,
    students: 'STUDENT',
    lecturers: 'LECTURER',
    technicians: null,
  }[category];

  const categoryRole = {
    admins: 'ADMIN',
    students: 'USER',
    lecturers: 'USER',
    technicians: 'TECHNICIAN',
  }[category];
  const isAdminDirectory = category === 'admins';
  const directoryGridClass = isAdminDirectory
    ? 'grid-cols-[minmax(120px,0.95fr)_minmax(220px,2fr)_minmax(140px,1fr)_minmax(120px,0.85fr)_minmax(110px,0.8fr)_minmax(260px,1.25fr)]'
    : 'grid-cols-[minmax(160px,1.4fr)_minmax(200px,2fr)_minmax(140px,1fr)_minmax(120px,0.85fr)_minmax(110px,0.8fr)_minmax(260px,1.25fr)]';

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.createdUser) {
      upsertCachedUser(routeState.createdUser);
      setUsers((prev) => {
        const nextUsers = [
          routeState.createdUser,
          ...prev.filter((user) => user.id !== routeState.createdUser.id),
        ];
        return nextUsers;
      });
    }

    if (routeState.updatedUser) {
      replaceCachedUser(routeState.updatedUser);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === routeState.updatedUser.id
            ? { ...user, ...routeState.updatedUser }
            : user
        )
      );
    }

    if (routeState.deletedUserId) {
      removeCachedUser(routeState.deletedUserId);
      setUsers((prev) =>
        prev.filter((user) => user.id !== routeState.deletedUserId)
      );
    }

    if (!routeState.notice && !routeState.createdUser && !routeState.updatedUser && !routeState.deletedUserId) {
      return;
    }

    if (routeState.notice) {
      setNotice(routeState.notice);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setActiveTab('ALL');
  }, [category]);

  const fetchUsers = useCallback(async () => {
    const cachedUsers = getDirectoryCache(category);

    if (cachedUsers.length > 0) {
      setUsers(cachedUsers);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError('');
    try {
      const data = await getAllUsers();
      const filtered =
        category === 'admins'
          ? data.filter((user) => user.role === 'ADMIN')
          : category === 'technicians'
          ? data.filter((user) => user.role === 'TECHNICIAN')
          : data.filter((user) => user.userType === categoryUserType);
      setUsers(filtered);
      setDirectoryCache(category, filtered);
    } catch {
      if (cachedUsers.length === 0) {
        setUsers([]);
      }
      setError('Unable to load this directory right now.');
    } finally {
      setLoading(false);
    }
  }, [category, categoryUserType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const pendingUsers = useMemo(
    () => users.filter((u) => u.approvalStatus === 'PENDING'),
    [users]
  );

  const filtered = useMemo(() => {
    const base = activeTab === 'PENDING' ? pendingUsers : users;
    const q = search.toLowerCase();
    return base.filter(
      (u) =>
        (u.id || '').toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber || '').toLowerCase().includes(q)
    );
  }, [search, users, pendingUsers, activeTab]);

  const handleToggleStatus = async (user) => {
    try {
      setNotice('');
      const updatedUser = await updateUserStatus(user.id, {
        isActive: !user.isActive,
      });
      replaceCachedUser(updatedUser);
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === updatedUser.id ? { ...entry, ...updatedUser } : entry
        )
      );
    } catch {
      setError('Unable to update account status right now.');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteUser(user.id);
      removeCachedUser(user.id);
      setUsers((prev) => prev.filter((entry) => entry.id !== user.id));
      setNotice(`${user.name} was deleted successfully.`);
    } catch {
      setError('Unable to delete this account right now.');
    }
  };

  const handleApprove = async (user) => {
    try {
      setError('');
      const approvedUserType = user.requestedUserType || user.userType;
      if (approvedUserType) {
        await updateUserRole(user.id, { role: 'USER', userType: approvedUserType, approvalStatus: 'APPROVED' });
      } else {
        await updateApprovalStatus(user.id, { approvalStatus: 'APPROVED' });
      }
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, approvalStatus: 'APPROVED' } : u)
      );
      setNotice(`${user.name} approved successfully.`);
    } catch {
      setError('Unable to approve this request right now.');
    }
  };

  const handleReject = async (user) => {
    const confirmed = window.confirm(`Reject ${user.name}'s request?`);
    if (!confirmed) return;
    try {
      setError('');
      await updateApprovalStatus(user.id, { approvalStatus: 'REJECTED' });
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, approvalStatus: 'REJECTED' } : u)
      );
      setNotice(`${user.name}'s request was rejected.`);
    } catch {
      setError('Unable to reject this request right now.');
    }
  };

  if (!categoryTitle) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
          <PageHeader
            title={categoryTitle + ' directory'}
            subtitle={'Manage and monitor ' + categoryTitle.toLowerCase() + ' accounts.'}
            action={
              <button
                onClick={() => navigate('/users/' + category + '/create')}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0F6E56] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,110,86,0.16)] transition hover:bg-[#085041]"
              >
                + Add {categoryTitle.slice(0, -1)}
              </button>
            }
          />

          {!isAdminDirectory && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={activeTab === 'ALL'
                  ? 'rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm'
                  : 'rounded-full px-4 py-2 text-sm text-gray-400 transition hover:text-gray-600'}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('PENDING')}
                className={activeTab === 'PENDING'
                  ? 'rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm'
                  : 'rounded-full px-4 py-2 text-sm text-gray-400 transition hover:text-gray-600'}
              >
                Pending approvals ({pendingUsers.length})
              </button>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  'Search ' + categoryTitle.toLowerCase() + ' by ID, name, email or phone...'
                }
                className="h-12 w-full rounded-full border border-slate-200 bg-white/90 px-5 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-100"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            {notice && (
              <div className="border-b border-gray-100 px-5 py-4 text-sm text-[#0F6E56]">
                {notice}
              </div>
            )}
            {error && (
              <div className="border-b border-gray-100 px-5 py-4 text-sm text-[#A32D2D]">
                {error}
              </div>
            )}
            <div className="overflow-x-auto">
              <div
                className={`grid min-w-240 gap-4 border-b border-gray-100 bg-slate-50/90 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 ${directoryGridClass}`}
              >
                <span>{isAdminDirectory ? 'Admin ID' : 'User ID'}</span>
                <span>Email</span>
                <span>Phone No</span>
                <span>Approval</span>
                <span>Status</span>
                <span className="text-center">Actions</span>
              </div>

              {users.length === 0 ? (
                <EmptyState
                  title={'No ' + categoryTitle.toLowerCase() + ' found'}
                  subtitle="Create one using the button above."
                />
              ) : filtered.length === 0 ? (
                <EmptyState title="No results found" />
              ) : (
                filtered.map((user) => (
                  <div
                    key={user.id}
                    className={`grid min-w-240 items-center gap-4 border-b border-slate-100 px-6 py-4 transition last:border-0 hover:bg-slate-50/70 ${directoryGridClass}`}
                  >
                    {isAdminDirectory ? (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{user.id}</p>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{user.id}</p>
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-500">{user.email}</p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-500">
                        {user.phoneNumber || <span className="text-slate-300">—</span>}
                      </p>
                    </div>

                    <div>
                      <Badge
                        status={user.approvalStatus}
                        label={user.approvalStatus}
                      />
                    </div>

                    <div>
                      <Badge
                        status={user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        label={user.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>

                    <div className="flex justify-center">
                      <div className="flex flex-nowrap justify-center gap-2">
                        {activeTab === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApprove(user)}
                              className="inline-flex h-10 min-w-22 items-center justify-center rounded-full border border-[#BFE6D6] bg-[#E7F7F0] px-4 text-sm font-medium text-[#0F6E56] transition hover:bg-[#DCF2E9]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user)}
                              className="inline-flex h-10 min-w-22 items-center justify-center rounded-full border border-[#F3C6C6] bg-[#FCEBEB] px-4 text-sm font-medium text-[#B93838] transition hover:bg-[#F9E0E0]"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/users/${category}/${user.id}`)}
                              className="inline-flex h-10 min-w-22 items-center justify-center rounded-full border border-[#BFE6D6] bg-[#E7F7F0] px-4 text-sm font-medium text-[#0F6E56] transition hover:bg-[#DCF2E9]"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/users/${category}/${user.id}`, { state: { startEditing: true } })}
                              className="inline-flex h-10 min-w-22 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="inline-flex h-10 min-w-22 items-center justify-center rounded-full border border-[#F3C6C6] bg-[#FCEBEB] px-4 text-sm font-medium text-[#B93838] transition hover:bg-[#F9E0E0]"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      </>)}
    </div>
  );
}

export default UserDirectoryPage;
