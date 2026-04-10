import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  updateManagedUser,
} from '../api/authApi';
import { INPUT_CLASS, PRIMARY_BTN } from '../constants/theme';

const FACULTY_OPTIONS = [
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Engineering',
  'Faculty of Humanities & Sciences',
  'Faculty of Architecture',
  'Faculty of Hospitality & Culinary',
];
import {
  getDirectoryCache,
  removeCachedUser,
  replaceCachedUser,
} from '../utils/directoryCache';

const categoryConfig = {
  admins: {
    title: 'Admin details',
    subtitle: 'View and manage the selected admin account.',
    expectedRole: 'ADMIN',
    accent: 'green',
    backLabel: 'Back to Admins',
    singularLabel: 'admin',
  },
  students: {
    title: 'Student details',
    subtitle: 'View and manage the selected student account.',
    expectedUserType: 'STUDENT',
    accent: 'blue',
    backLabel: 'Back to Students',
    singularLabel: 'student',
  },
  lecturers: {
    title: 'Lecturer details',
    subtitle: 'View and manage the selected lecturer account.',
    expectedUserType: 'LECTURER',
    accent: 'purple',
    backLabel: 'Back to Lecturers',
    singularLabel: 'lecturer',
  },
  technicians: {
    title: 'Technician details',
    subtitle: 'View and manage the selected technician account.',
    expectedRole: 'TECHNICIAN',
    accent: 'amber',
    backLabel: 'Back to Technicians',
    singularLabel: 'technician',
  },
};

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatValue(value) {
  if (!value) {
    return 'Not provided';
  }

  return value;
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function DirectoryUserDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, userId } = useParams();
  const config = categoryConfig[category];
  const [, setAdminUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    pictureUrl: '',
    userType: '',
    approvalStatus: '',
    isActive: true,
  });

  const backPath = `/users/${category}`;
const canEditApprovalStatus = category !== 'admins';
  const entityLabel = config?.singularLabel || 'user';
  const entityLabelTitle =
    entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);

  useEffect(() => {
    if (!config) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      setMessage('');

      try {
        const cachedUser =
          getDirectoryCache(category).find((entry) => entry.id === userId) || null;
        const currentUserPromise = getCurrentUser();
        const usersPromise = cachedUser ? Promise.resolve(null) : getAllUsers();
        const [currentUser, users] = await Promise.all([
          currentUserPromise,
          usersPromise,
        ]);
        const matchedUser =
          cachedUser || users?.find((entry) => entry.id === userId);

        if (currentUser.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true });
          return;
        }

        if (!matchedUser) {
          setMessage('Unable to find this user.');
          setUser(null);
          setAdminUser(currentUser);
          return;
        }

        const categoryMismatch =
          (config.expectedUserType &&
            matchedUser.userType !== config.expectedUserType) ||
          (config.expectedRole && matchedUser.role !== config.expectedRole);

        if (categoryMismatch) {
          navigate(backPath, { replace: true });
          return;
        }

        setAdminUser(currentUser);
        setUser(matchedUser);
        replaceCachedUser(matchedUser);
        setForm({
          name: matchedUser.name || '',
          email: matchedUser.email || '',
          phoneNumber: matchedUser.phoneNumber || '',
          department: matchedUser.department || '',
          pictureUrl: matchedUser.pictureUrl || '',
          userType: matchedUser.userType || '',
          approvalStatus: matchedUser.approvalStatus || 'PENDING',
          isActive: Boolean(matchedUser.isActive),
        });
      } catch {
        setMessage('Unable to load this user right now.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [backPath, category, config, navigate, userId]);

  useEffect(() => {
    if (!location.state?.startEditing) {
      return;
    }

    setEditing(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setMessage('');
  };

  const handleEditToggle = () => {
    if (!user) {
      return;
    }

    if (editing) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        pictureUrl: user.pictureUrl || '',
        userType: user.userType || '',
        approvalStatus: user.approvalStatus || 'PENDING',
        isActive: Boolean(user.isActive),
      });
      setMessage('');
    }

    setEditing((prev) => !prev);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const updatedUser = await updateManagedUser(user.id, {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber || null,
        department: form.department || null,
        pictureUrl: form.pictureUrl || null,
        userType: form.userType || null,
        approvalStatus: form.approvalStatus || null,
        isActive: form.isActive,
      });

      replaceCachedUser(updatedUser);
      setUser(updatedUser);
      setEditing(false);
      setMessage(`${entityLabelTitle} details updated successfully.`);
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          `Unable to update this ${entityLabel} right now.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      await deleteUser(user.id);
      removeCachedUser(user.id);
      navigate(backPath, {
        replace: true,
        state: {
          notice: `${user.name} was deleted successfully.`,
          deletedUserId: user.id,
        },
      });
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          `Unable to delete this ${entityLabel} right now.`
      );
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="mb-4 inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeftIcon />
        {config?.backLabel || 'Back'}
      </button>

      <PageHeader
        title={config?.title || 'User details'}
        subtitle={config?.subtitle}
      />

      {message && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            message.includes('successfully')
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {!user ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm text-slate-600">This user could not be loaded.</p>
        </section>
      ) : (
        <div>
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#fbfdfc,#f4faf7)] px-7 py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  {user.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt={user.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <Avatar name={user.name} color={config?.accent || 'blue'} />
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold text-slate-900">
                      {user.name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Full profile overview and account controls for this {entityLabel}.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Badge
                    status={user.userType || user.role}
                    label={user.userType || user.role}
                  />
                  <Badge status={user.approvalStatus} label={user.approvalStatus} />
                  <Badge
                    status={user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    label={user.isActive ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="mb-5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Last Login
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </div>

              <div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {/* Full name */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Full name</p>
                      {editing ? (
                        <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Full name" className={INPUT_CLASS + ' mt-2'} required />
                      ) : (
                        <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.name)}</p>
                      )}
                    </div>
                    {/* Email */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Email</p>
                      {editing ? (
                        <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email address" className={INPUT_CLASS + ' mt-2'} required />
                      ) : (
                        <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.email)}</p>
                      )}
                    </div>
                    {/* Phone number */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Phone number</p>
                      {editing ? (
                        <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} placeholder="Phone number" className={INPUT_CLASS + ' mt-2'} />
                      ) : (
                        <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.phoneNumber)}</p>
                      )}
                    </div>
                    {/* Department — students only */}
                    {['students', 'lecturers'].includes(category) && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Department</p>
                        {editing ? (
                          <select name="department" value={form.department} onChange={handleFormChange} className={INPUT_CLASS + ' mt-2'}>
                            <option value="">Select department</option>
                            {FACULTY_OPTIONS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="mt-2 wrap-break-word text-sm font-medium text-slate-700">{formatValue(user.department)}</p>
                        )}
                      </div>
                    )}
                    {/* Role — read-only */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.userType || user.role)}</p>
                    </div>
                    {/* Approval status */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Approval status</p>
                      {editing && canEditApprovalStatus ? (
                        <select name="approvalStatus" value={form.approvalStatus} onChange={handleFormChange} className={INPUT_CLASS + ' mt-2'}>
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      ) : (
                        <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.approvalStatus)}</p>
                      )}
                    </div>
                    {/* Account status */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Account status</p>
                      {editing ? (
                        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} className="h-4 w-4 rounded border-slate-300 text-[#0F6E56] focus:ring-[#0F6E56]" />
                          Active
                        </label>
                      ) : (
                        <p className="mt-2 break-words text-sm font-medium text-slate-700">{user.isActive ? 'Active' : 'Inactive'}</p>
                      )}
                    </div>
                    {/* Created at — read-only */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Created at</p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatDate(user.createdAt)}</p>
                    </div>
                    {/* Updated at — read-only */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Updated at</p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatDate(user.updatedAt)}</p>
                    </div>
                    {/* Last login — read-only */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Last login</p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatDate(user.lastLoginAt)}</p>
                    </div>
                    {/* User ID — read-only */}
                    <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">User ID</p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-700">{formatValue(user.id)}</p>
                    </div>
                  </div>

                  {editing ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <button type="button" onClick={handleSave} disabled={saving} className={`${PRIMARY_BTN} flex h-11 w-auto items-center justify-center gap-2 rounded-full px-6`}>
                        {saving ? <Spinner size="sm" /> : 'Save Changes'}
                      </button>
                      <button type="button" onClick={handleEditToggle} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <button type="button" onClick={handleEditToggle} className="inline-flex h-11 min-w-[104px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        Edit
                      </button>
                      <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex h-11 min-w-[104px] items-center justify-center rounded-full border border-[#E8B9B9] bg-[#FCEBEB] px-5 text-sm font-semibold text-[#A32D2D] transition hover:bg-[#F8DDDD] disabled:cursor-not-allowed disabled:opacity-60">
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </section>

        </div>
      )}
      </>)}
    </div>
  );
}

export default DirectoryUserDetailsPage;
