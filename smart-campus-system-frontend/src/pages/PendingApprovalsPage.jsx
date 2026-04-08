import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import {
  getAllUsers,
  getCurrentUser,
  updateApprovalStatus,
  updateUserRole,
} from '../api/authApi'
import { removeToken } from '../utils/token'

function PendingApprovalsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [approvalFilter, setApprovalFilter] = useState('ALL')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setAdminError('')

      try {
        const currentUser = await getCurrentUser()

        if (currentUser.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true })
          return
        }

        setUser(currentUser)
        setAdminLoading(true)
        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setAdminError(
          err?.response?.data?.message ||
            'Unable to load the pending approvals page right now.'
        )
      } finally {
        setLoading(false)
        setAdminLoading(false)
      }
    }

    load()
  }, [navigate])

  const refreshUsers = async () => {
    setAdminLoading(true)

    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } finally {
      setAdminLoading(false)
    }
  }

  const pendingApprovalUsers = useMemo(() => {
    return users.filter((entry) => {
      const isPending =
        entry.approvalStatus === 'PENDING' || Boolean(entry.requestedUserType)

      if (!isPending) {
        return false
      }

      if (approvalFilter === 'ALL') {
        return true
      }

      if (approvalFilter === 'STUDENT') {
        return (
          entry.requestedUserType === 'STUDENT' ||
          (entry.userType === 'STUDENT' && entry.approvalStatus === 'PENDING')
        )
      }

      if (approvalFilter === 'LECTURER') {
        return (
          entry.requestedUserType === 'LECTURER' ||
          (entry.userType === 'LECTURER' && entry.approvalStatus === 'PENDING')
        )
      }

      if (approvalFilter === 'TECHNICIAN') {
        return entry.role === 'TECHNICIAN'
      }

      return true
    })
  }, [approvalFilter, users])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef4] p-4 sm:p-6">
        <div className="min-h-[calc(100vh-2rem)] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-3rem)]">
          <div className="border-b border-slate-200/80 px-6 py-4">
            <p className="text-2xl font-semibold text-slate-900">
              Loading pending approvals...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eceef4] text-slate-900">
      <div className="relative min-h-screen overflow-hidden bg-[#eceef4]">
        <Navbar
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
          onUserUpdate={setUser}
        />

        <AdminSidebar
          user={user}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem="pending"
        />

        <div className="min-h-[calc(100vh-72px)] px-6 py-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  Approval Workspace
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-none text-slate-900">
                  Pending Approvals
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Review all users waiting for approval and filter by students,
                  lecturers, or technicians.
                </p>
              </div>

              {adminLoading && (
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Refreshing approvals...
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['ALL', 'STUDENT', 'LECTURER', 'TECHNICIAN'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setApprovalFilter(filter)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    approvalFilter === filter
                      ? 'border-[#0f6e73]/20 bg-[#0f6e73]/10 text-[#0b5e63]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {filter === 'ALL'
                    ? 'All'
                    : filter === 'TECHNICIAN'
                      ? 'Technicians'
                      : `${filter.charAt(0)}${filter.slice(1).toLowerCase()}s`}
                </button>
              ))}
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

            <div className="mt-6 overflow-x-auto rounded-[26px] border border-slate-200">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[1.15fr_1fr_0.8fr_0.9fr_1fr_1.3fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>User</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Approval</span>
                  <span>Request</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {pendingApprovalUsers.length > 0 ? (
                    pendingApprovalUsers.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-[1.15fr_1fr_0.8fr_0.9fr_1fr_1.3fr] gap-4 px-5 py-5 text-sm text-slate-600"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {entry.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {entry.authProvider}
                          </p>
                        </div>

                        <div>{entry.email}</div>

                        <div className="flex items-center">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                            {entry.role}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                            {entry.approvalStatus}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-slate-500">
                          {entry.requestedUserType || entry.userType || 'No request'}
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
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Approve
                              </button>
                            )}

                          {entry.approvalStatus === 'PENDING' &&
                            entry.role === 'TECHNICIAN' && (
                              <button
                                onClick={() =>
                                  handleApprovalUpdate(entry.id, 'APPROVED')
                                }
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Approve Technician
                              </button>
                            )}

                          <button
                            onClick={() =>
                              handleApprovalUpdate(entry.id, 'REJECTED')
                            }
                            className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-sm text-slate-500">
                      No pending approvals found for this filter.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalsPage
