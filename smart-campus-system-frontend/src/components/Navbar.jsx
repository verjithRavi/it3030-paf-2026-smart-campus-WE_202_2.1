import { useEffect, useMemo, useState } from 'react'
import { updateCurrentUserProfile } from '../api/authApi'

function Navbar({ user, onMenuToggle, onUserUpdate }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileNotice, setProfileNotice] = useState('')
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
    requestedUserType: '',
    pictureUrl: '',
  })

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      department: user?.department || '',
      requestedUserType: user?.requestedUserType || '',
      pictureUrl: user?.pictureUrl || '',
    })
  }, [user])

  const initials = useMemo(() => {
    if (!user?.name) {
      return 'SC'
    }

    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user?.name])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setProfileError('')
    setProfileNotice('')
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProfileForm((prev) => ({
        ...prev,
        pictureUrl: typeof reader.result === 'string' ? reader.result : '',
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setProfileError('')
    setProfileNotice('')

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber || null,
        department: profileForm.department || null,
        pictureUrl: profileForm.pictureUrl || null,
        requestedUserType:
          user?.role === 'USER' ? profileForm.requestedUserType || null : null,
      })

      onUserUpdate?.(updatedUser)
      setEditMode(false)
      setProfileNotice('Profile details updated successfully.')
    } catch (err) {
      setProfileError(
        err?.response?.data?.message ||
          'Unable to update your profile right now.'
      )
    } finally {
      setSaving(false)
    }
  }

  const profileImage = profileForm.pictureUrl || user?.pictureUrl

  return (
    <>
      <header className="h-[72px] border-b border-slate-200 bg-white px-5 sm:px-6">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMenuToggle}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Open navigation menu"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 stroke-current"
                fill="none"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f6e73,#8af7c1)] text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(15,94,99,0.18)]">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Smart Campus System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev)
              setEditMode(false)
              setProfileError('')
              setProfileNotice('')
            }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={user?.name || 'Profile'}
                className="h-10 w-10 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f6e73,#8af7c1)] text-sm font-bold uppercase text-white">
                {initials}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || 'Campus User'}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                {user?.role || 'USER'}
              </p>
            </div>
          </button>
        </div>
      </header>

      {profileOpen && (
        <div className="absolute right-5 top-[84px] z-40 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:right-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || 'Profile'}
                  className="h-16 w-16 rounded-3xl object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[linear-gradient(135deg,#0f6e73,#8af7c1)] text-lg font-bold uppercase text-white">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {user?.name || 'Campus User'}
                </p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Close profile panel"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 stroke-current"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          {!editMode ? (
            <>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Name:</span>{' '}
                  {user?.name || 'Not set'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Phone:</span>{' '}
                  {user?.phoneNumber || 'Not set'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">
                    Department:
                  </span>{' '}
                  {user?.department || 'Not set'}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Role:</span>{' '}
                  {user?.role === 'USER'
                    ? user?.userType || 'Common User'
                    : user?.role}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">Approval:</span>{' '}
                  {user?.approvalStatus || 'APPROVED'}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="rounded-xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.22)] transition hover:brightness-105"
                >
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleFieldChange}
                placeholder="Full name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="text"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleFieldChange}
                placeholder="Phone number"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="text"
                name="department"
                value={profileForm.department}
                onChange={handleFieldChange}
                placeholder="Department"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />

              {user?.role === 'USER' && (
                <select
                  name="requestedUserType"
                  value={profileForm.requestedUserType}
                  onChange={handleFieldChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Keep current access</option>
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                </select>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Upload profile picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#0f6e73]/10 file:px-4 file:py-2 file:font-semibold file:text-[#0b5e63]"
                />
              </div>

              {profileError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              {profileNotice && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {profileNotice}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false)
                    setProfileError('')
                    setProfileNotice('')
                    setProfileForm({
                      name: user?.name || '',
                      phoneNumber: user?.phoneNumber || '',
                      department: user?.department || '',
                      requestedUserType: user?.requestedUserType || '',
                      pictureUrl: user?.pictureUrl || '',
                    })
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar
