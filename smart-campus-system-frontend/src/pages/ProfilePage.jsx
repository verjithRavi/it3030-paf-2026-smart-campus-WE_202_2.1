import { useEffect, useState } from 'react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { INPUT_CLASS, PRIMARY_BTN } from '../constants/theme';
import { getCurrentUser, updateCurrentUserProfile } from '../api/authApi';
import { setAuthSession } from '../utils/token';

const FACULTY_OPTIONS = [
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Engineering',
  'Faculty of Humanities & Sciences',
  'Faculty of Architecture',
  'Faculty of Hospitality & Culinary',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    pictureUrl: '',
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setMessage('');

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setForm({
          pictureUrl: currentUser.pictureUrl || '',
          name: currentUser.name || '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          department: currentUser.department || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } catch {
        setMessage('Unable to load your profile right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateCurrentUserProfile({
        pictureUrl: form.pictureUrl || null,
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber || null,
        department: form.department || null,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
        confirmNewPassword: form.confirmNewPassword || null,
      });

      setUser(updatedUser);
      setAuthSession(updatedUser);
      setFieldErrors({});
      setForm({
        pictureUrl: updatedUser.pictureUrl || '',
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phoneNumber || '',
        department: updatedUser.department || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setEditing(false);
      setMessage('Profile updated successfully.');
    } catch (error) {
      const validationMessages = error.response?.data?.messages;
      const firstValidationMessage = validationMessages
        ? Object.values(validationMessages)[0]
        : null;
      const nextMessage =
        error.response?.data?.message ||
        firstValidationMessage ||
        'Unable to update your profile right now.';

      if (
        nextMessage === 'Email is already registered' ||
        validationMessages?.email
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          email: validationMessages?.email || nextMessage,
        }));
      }

      setMessage(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadMessage('Please upload an image file only.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadMessage('Profile picture must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        pictureUrl: reader.result,
      }));
      setUploadMessage('Profile picture selected successfully.');
      setMessage('');
      setEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditToggle = () => {
    if (!user) {
      return;
    }

    if (editing) {
      setForm({
        pictureUrl: user.pictureUrl || '',
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setUploadMessage('');
      setFieldErrors({});
    }

    setEditing((prev) => !prev);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      <PageHeader
        title="My profile"
        subtitle="View and manage your personal account details."
      />

      <div className="grid gap-5">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#fbfdfc,#f4faf7)] px-7 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar
                  name={user?.name || ''}
                  imageUrl={form.pictureUrl || user?.pictureUrl || ''}
                  size="lg"
                  color="blue"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold text-slate-900">
                    {user?.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{user?.email}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Your account details and profile photo are managed here.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Badge
                  status={user?.userType || user?.role || 'USER'}
                  label={user?.userType || user?.role || 'USER'}
                />
                <Badge
                  status={user?.approvalStatus}
                  label={user?.approvalStatus}
                />
              </div>
            </div>
          </div>

          <div className="px-7 py-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Profile picture
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar
                    name={form.name || user?.name || ''}
                    imageUrl={form.pictureUrl || user?.pictureUrl || ''}
                    size="lg"
                    color="blue"
                  />
                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Upload picture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-400">
                      Upload JPG, PNG, or WEBP up to 2MB.
                    </p>
                    {uploadMessage && (
                      <p className="mt-2 text-xs text-[#0F6E56]">{uploadMessage}</p>
                    )}
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  setFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={INPUT_CLASS}
                disabled={!editing}
              />
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={INPUT_CLASS}
                  disabled={!editing}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-[#A32D2D]">{fieldErrors.email}</p>
                )}
              </div>
              <input
                type="text"
                placeholder="Phone number"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className={INPUT_CLASS}
                disabled={!editing}
              />
              {!isAdmin && (
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className={INPUT_CLASS}
                  disabled={!editing}
                >
                  <option value="">Select department</option>
                  {FACULTY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              )}

              {user?.authProvider === 'LOCAL' && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Change password
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={form.currentPassword}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      disabled={!editing}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={form.newPassword}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      disabled={!editing}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={form.confirmNewPassword}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      disabled={!editing}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Enter your current password and a new password to update it.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  User ID
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {user?.userId || 'Not available'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </p>
                <p className="mt-2 break-words text-sm font-medium text-slate-700">
                  {form.email || user?.email || 'Not available'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Role
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {user?.userType || user?.role || 'Not available'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/85 px-4 py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Approval status
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {user?.approvalStatus || 'Not available'}
                </p>
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition ${
                    editing
                      ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      : 'bg-[#0F6E56] text-white hover:bg-[#085041]'
                  }`}
                >
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              {message && (
                <div
                  className={`md:col-span-2 rounded-2xl border px-4 py-3 text-sm ${
                    message.includes('successfully')
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              {editing && (
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`${PRIMARY_BTN} flex w-auto items-center justify-center gap-2 rounded-full px-6`}
                  >
                    {saving ? <Spinner size="sm" /> : 'Save Profile'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
      </>)}
    </div>
  );
}

export default ProfilePage;
