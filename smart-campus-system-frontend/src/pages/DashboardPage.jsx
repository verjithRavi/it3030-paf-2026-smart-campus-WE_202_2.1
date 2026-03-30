import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  createManagedUser,
  getAllUsers,
  getCurrentUser,
  submitAccessRequest,
  updateApprovalStatus,
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
  const [error, setError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [requestFeedback, setRequestFeedback] = useState({ type: '', message: '' })
  const [requestState, setRequestState] = useState({
    requestedRole: '',
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

  const isBasicUser = user?.role === 'USER' && !user?.userType
  const hasPendingRequest = Boolean(user?.requestedRole || user?.requestedUserType)

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
            : user?.userType || 'Normal User',
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

  const handleRequestChange = (field, value) => {
    setRequestFeedback({ type: '', message: '' })

    if (field === 'requestedRole') {
      setRequestState({
        requestedRole: value,
        requestedUserType: value ? '' : requestState.requestedUserType,
      })
      return
    }

    setRequestState({
      requestedRole: value ? '' : requestState.requestedRole,
      requestedUserType: value,
    })
  }

  const handleSubmitAccessRequest = async (e) => {
    e.preventDefault()
    setRequestFeedback({ type: '', message: '' })

    try {
      const data = await submitAccessRequest({
        requestedRole: requestState.requestedRole || null,
        requestedUserType: requestState.requestedUserType || null,
      })

      setUser(data)
      setRequestState({
        requestedRole: '',
        requestedUserType: '',
      })
      setRequestFeedback({
        type: 'success',
        message:
          'Your request was sent to the admin. You can keep using basic access while it is under review.',
      })
    } catch (err) {
      setRequestFeedback({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Unable to submit your access request.',
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

  const handleRoleUpdate = async (targetUserId, role, userType = null) => {
    setAdminError('')
    setAdminNotice('')

    try {
      const payload = { role }

      if (role === 'USER') {
        payload.userType = userType
      }

      await updateUserRole(targetUserId, payload)
      await refreshUsers()
      setAdminNotice('User access level updated successfully.')
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to update the user role.'
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
        <Navbar user={user} onLogout={handleLogout} />

        {searchParams.get('setup') === 'pending' && (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            Your Google account is active as a normal user. If you need student,
            lecturer, technician, or admin access, submit a request below for
            admin review.
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
              Your authenticated dashboard is now running with approval-aware
              access. Normal users can request a new path, students and lecturers
              wait for admin approval, and admins control final identity.
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
                <span className="font-semibold text-slate-900">
                  Identity:
                </span>{' '}
                {user?.role !== 'USER'
                  ? user?.role
                  : user?.userType || 'Normal User'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">Approval:</span>{' '}
                {user?.approvalStatus || 'APPROVED'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <span className="font-semibold text-slate-900">
                  Pending Request:
                </span>{' '}
                {user?.requestedRole || user?.requestedUserType || 'No active request'}
              </div>
            </div>
          </section>
        </div>

        {isBasicUser && (
          <section className="rounded-[30px] bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Identity Request
            </p>
            <h3 className="mt-3 font-serif text-4xl leading-none text-slate-900">
              Request your campus access path
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Common users can stay as normal users, or request exactly one
              upgrade path. Choose either student or lecturer, or request a role
              review for technician or admin. You cannot request both together.
            </p>

            {hasPendingRequest && (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                Your current pending request is{' '}
                <span className="font-semibold">
                  {user?.requestedRole || user?.requestedUserType}
                </span>
                . Submitting a new request will replace the current one.
              </div>
            )}

            <form
              onSubmit={handleSubmitAccessRequest}
              className="mt-8 grid gap-6 md:grid-cols-2"
            >
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Academic Path
                </p>
                <select
                  value={requestState.requestedUserType}
                  onChange={(e) =>
                    handleRequestChange('requestedUserType', e.target.value)
                  }
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                  disabled={Boolean(requestState.requestedRole)}
                >
                  <option value="">Select user type</option>
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                </select>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Role Request
                </p>
                <select
                  value={requestState.requestedRole}
                  onChange={(e) =>
                    handleRequestChange('requestedRole', e.target.value)
                  }
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                  disabled={Boolean(requestState.requestedUserType)}
                >
                  <option value="">Select role request</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                {requestFeedback.message && (
                  <div
                    className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                      requestFeedback.type === 'error'
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {requestFeedback.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="rounded-2xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.28)] transition hover:brightness-105"
                >
                  Submit Request
                </button>
              </div>
            </form>
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
                  Approve student and lecturer registrations, review Google role
                  requests, create technician or admin accounts directly, and
                  control active access from one dashboard.
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
                <div className="grid grid-cols-[1.15fr_1fr_0.75fr_0.75fr_1fr_1.5fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>User</span>
                  <span>Details</span>
                  <span>Role</span>
                  <span>Approval</span>
                  <span>Pending Request</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {users.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[1.15fr_1fr_0.75fr_0.75fr_1fr_1.5fr] gap-4 px-5 py-5 text-sm text-slate-600"
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
                            ? entry.userType || 'Normal User'
                            : 'No user type'}
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
                        {entry.requestedRole || entry.requestedUserType || 'No request'}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.requestedUserType && (
                          <button
                            onClick={() =>
                              handleRoleUpdate(
                                entry.id,
                                'USER',
                                entry.requestedUserType
                              )
                            }
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Approve {entry.requestedUserType}
                          </button>
                        )}

                        {entry.requestedRole && (
                          <button
                            onClick={() =>
                              handleRoleUpdate(entry.id, entry.requestedRole)
                            }
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Approve {entry.requestedRole}
                          </button>
                        )}

                        {entry.approvalStatus === 'PENDING' &&
                          !entry.requestedRole &&
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
                          onClick={() =>
                            handleRoleUpdate(entry.id, 'USER', 'STUDENT')
                          }
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Student
                        </button>

                        <button
                          onClick={() =>
                            handleRoleUpdate(entry.id, 'USER', 'LECTURER')
                          }
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Lecturer
                        </button>

                        <button
                          onClick={() => handleRoleUpdate(entry.id, 'TECHNICIAN')}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Technician
                        </button>

                        <button
                          onClick={() => handleRoleUpdate(entry.id, 'ADMIN')}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Admin
                        </button>

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
