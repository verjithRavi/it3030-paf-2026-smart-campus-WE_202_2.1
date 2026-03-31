import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  createManagedUser,
  getAllUsers,
  getCurrentUser,
  submitAccessRequest,
  updateApprovalStatus,
  updateCurrentUserProfile,
  updateUserRole,
  updateUserStatus,
} from '../api/authApi'
import { removeToken } from '../utils/token'

function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [error, setError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
    requestedUserType: '',
  })
  const [managedUserForm, setManagedUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
    phoneNumber: '',
    department: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setProfileForm({
          name: currentUser.name || '',
          phoneNumber: currentUser.phoneNumber || '',
          department: currentUser.department || '',
          requestedUserType: currentUser.requestedUserType || '',
        })

        if (currentUser.role === 'ADMIN') {
          setAdminLoading(true)
          const allUsers = await getAllUsers()
          setUsers(allUsers)
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setError(
          err?.response?.data?.message ||
            'Unable to load your dashboard right now.'
        )
      } finally {
        setLoading(false)
        setAdminLoading(false)
      }
    }

    load()
  }, [navigate])

  const isCommonUser = user?.role === 'USER' && !user?.userType
  const hasAcademicAccess = user?.role === 'USER' && Boolean(user?.userType)
  const hasPendingAcademicRequest = Boolean(user?.requestedUserType)

  const summaryCards = useMemo(
    () => [
      {
        label: 'Current Role',
        value: user?.role || 'USER',
      },
      {
        label: 'Approval',
        value: user?.approvalStatus || 'APPROVED',
      },
      {
        label: 'Access Profile',
        value:
          user?.role !== 'USER'
            ? user?.role
            : user?.userType || 'Common Access',
      },
    ],
    [user]
  )

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  const refreshUsers = async () => {
    if (user?.role !== 'ADMIN') {
      return
    }

    setAdminLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target
    setProfileMessage({ type: '', text: '' })
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        department: profileForm.department,
        requestedUserType: profileForm.requestedUserType || null,
      })

      setUser(updatedUser)
      setProfileForm({
        name: updatedUser.name || '',
        phoneNumber: updatedUser.phoneNumber || '',
        department: updatedUser.department || '',
        requestedUserType: updatedUser.requestedUserType || '',
      })
      setProfileMessage({
        type: 'success',
        text:
          updatedUser.requestedUserType
            ? 'Profile saved. Your student or lecturer request is waiting for admin approval.'
            : 'Profile details updated successfully.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to update your profile right now.',
      })
    }
  }

  const handleQuickTypeRequest = async (requestedUserType) => {
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await submitAccessRequest({ requestedUserType })
      setUser(updatedUser)
      setProfileForm((prev) => ({
        ...prev,
        requestedUserType: updatedUser.requestedUserType || '',
      }))
      setProfileMessage({
        type: 'success',
        text: 'Your request was sent to the admin for approval.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to submit your request right now.',
      })
    }
  }

  const handleManagedUserChange = (e) => {
    const { name, value } = e.target
    setManagedUserForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateManagedUser = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminNotice('')

    try {
      await createManagedUser({
        ...managedUserForm,
        phoneNumber: managedUserForm.phoneNumber || null,
        department: managedUserForm.department || null,
      })
      await refreshUsers()
      setManagedUserForm({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        phoneNumber: '',
        department: '',
      })
      setAdminNotice('Managed account created successfully.')
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to create the managed account.'
      )
    }
  }

  const handleApprovalUpdate = async (targetUserId, approvalStatus) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateApprovalStatus(targetUserId, { approvalStatus })
      await refreshUsers()
      setAdminNotice(`User marked as ${approvalStatus.toLowerCase()}.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to update the approval status.'
      )
    }
  }

  const handleAcademicApproval = async (targetUserId, userType) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserRole(targetUserId, { role: 'USER', userType })
      await refreshUsers()
      setAdminNotice(`${userType} access approved successfully.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to approve this academic access request.'
      )
    }
  }

  const handleStatusToggle = async (targetUserId, isActive) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserStatus(targetUserId, { isActive: !isActive })
      await refreshUsers()
      setAdminNotice(
        isActive ? 'User account deactivated.' : 'User account activated.'
      )
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to update the user status.'
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef4] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1480px] rounded-[32px] bg-white/90 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
          <p className="font-serif text-4xl text-slate-900">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eceef4] px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onProfileClick={() => setShowProfile((prev) => !prev)}
        />

        {searchParams.get('setup') === 'pending' && (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            Your Google account is active with common access. Use the profile panel
            to request student or lecturer access if you need academic features.
          </div>
        )}

        {error && (
          <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,#0f6e73,#0b4f55)] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">
              Protected Workspace
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.04em]">
              Welcome, {user?.name || 'Campus User'}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/76">
              This dashboard now separates common access from approved academic
              access. Students and lecturers require admin approval, while admin
              and technician accounts are created directly by an administrator.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-white/12 bg-white/10 p-5 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Account Details
            </p>
            <h3 className="mt-4 font-serif text-4xl leading-none text-slate-900">
              Profile Snapshot
            </h3>

            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">Email:</span>{' '}
                {user?.email}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">Profile:</span>{' '}
                {user?.role !== 'USER'
                  ? user?.role
                  : user?.userType || 'Common User'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">Approval:</span>{' '}
                {user?.approvalStatus || 'APPROVED'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">
                  Pending academic request:
                </span>{' '}
                {user?.requestedUserType || 'No active request'}
              </div>
            </div>
          </section>
        </div>

        {showProfile && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Profile
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
              Edit your details
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Update your personal details here. Common users can also request
              student or lecturer access from this panel.
            </p>

            <form
              onSubmit={handleProfileSave}
              className="mt-8 grid gap-4 md:grid-cols-2"
            >
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileFieldChange}
                placeholder="Full name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="text"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleProfileFieldChange}
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <input
                type="text"
                name="department"
                value={profileForm.department}
                onChange={handleProfileFieldChange}
                placeholder="Department"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100 md:col-span-2"
              />

              {user?.role === 'USER' && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Request student or lecturer access
                  </label>
                  <select
                    name="requestedUserType"
                    value={profileForm.requestedUserType}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="">Keep current access</option>
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Any student or lecturer request needs admin approval before
                    the academic access becomes active.
                  </p>
                </div>
              )}

              {profileMessage.text && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm md:col-span-2 ${
                    profileMessage.type === 'error'
                      ? 'border border-red-200 bg-red-50 text-red-700'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.28)] transition hover:brightness-105"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </section>
        )}

        {isCommonUser && !showProfile && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Common Access
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
              You are using common access
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Google users start here. If you need academic access, open Profile
              from the top-right menu and request student or lecturer approval.
            </p>

            {hasPendingAcademicRequest && (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                Your current request is waiting for admin approval:{' '}
                <span className="font-semibold">{user?.requestedUserType}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickTypeRequest('STUDENT')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Request Student Access
              </button>
              <button
                onClick={() => handleQuickTypeRequest('LECTURER')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Request Lecturer Access
              </button>
            </div>
          </section>
        )}

        {hasAcademicAccess && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Academic Access
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
              {user.userType} workspace is active
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Your academic access has been approved. You can continue using the
              system with your {user.userType.toLowerCase()} profile and update
              your personal details from the profile menu whenever needed.
            </p>
          </section>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Role Workspace
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
              {user.role} access is active
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Your account was created directly by an administrator. You can edit
              your profile details from the top-right menu and continue with your
              assigned role-based responsibilities.
            </p>
          </section>
        )}

        {user?.role === 'ADMIN' && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  Admin Controls
                </p>
                <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
                  User Management
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Approve student and lecturer registrations, review common-user
                  academic requests, and create new admin or technician accounts.
                </p>
              </div>
              {adminLoading && (
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Refreshing users...
                </div>
              )}
            </div>

            {adminError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {adminError}
              </div>
            )}

            {adminNotice && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {adminNotice}
              </div>
            )}

            <form
              onSubmit={handleCreateManagedUser}
              className="mt-6 grid gap-4 rounded-[26px] bg-slate-50 p-5 md:grid-cols-5"
            >
              <input
                type="text"
                name="name"
                value={managedUserForm.name}
                onChange={handleManagedUserChange}
                placeholder="Name"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="email"
                name="email"
                value={managedUserForm.email}
                onChange={handleManagedUserChange}
                placeholder="Email"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="password"
                name="password"
                value={managedUserForm.password}
                onChange={handleManagedUserChange}
                placeholder="Temporary password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="text"
                name="department"
                value={managedUserForm.department}
                onChange={handleManagedUserChange}
                placeholder="Department (optional)"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <select
                  name="role"
                  value={managedUserForm.role}
                  onChange={handleManagedUserChange}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                >
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Create
                </button>
              </div>
            </form>

            <div className="mt-8 overflow-x-auto rounded-[26px] border border-slate-200">
              <div className="min-w-[1180px]">
                <div className="grid grid-cols-[1.15fr_1fr_0.75fr_0.75fr_1fr_1.4fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>User</span>
                  <span>Details</span>
                  <span>Role</span>
                  <span>Approval</span>
                  <span>Request</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {users.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[1.15fr_1fr_0.75fr_0.75fr_1fr_1.4fr] gap-4 px-5 py-5 text-sm text-slate-600"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {entry.authProvider}
                        </p>
                      </div>

                      <div>
                        <p>{entry.email}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {entry.role === 'USER'
                            ? entry.userType || 'Common User'
                            : 'Managed account'}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {entry.role}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                            entry.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : entry.approvalStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {entry.approvalStatus}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-slate-500">
                        {entry.requestedUserType || 'No request'}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.requestedUserType && (
                          <button
                            onClick={() =>
                              handleAcademicApproval(
                                entry.id,
                                entry.requestedUserType
                              )
                            }
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Approve {entry.requestedUserType}
                          </button>
                        )}

                        {entry.approvalStatus === 'PENDING' &&
                          entry.role === 'USER' &&
                          entry.userType &&
                          !entry.requestedUserType && (
                            <button
                              onClick={() =>
                                handleApprovalUpdate(entry.id, 'APPROVED')
                              }
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Approve
                            </button>
                          )}

                        <button
                          onClick={() => handleApprovalUpdate(entry.id, 'REJECTED')}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleStatusToggle(entry.id, entry.isActive)}
                          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          {entry.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
