import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { getAllUsers, getCurrentUser, updateUserStatus } from '../api/authApi'
import { removeToken } from '../utils/token'

const directoryConfig = {
  students: {
    title: 'Students',
    createLabel: 'Create Student',
    activeKey: 'students',
    matches: (entry) => entry.role === 'USER' && entry.userType === 'STUDENT',
  },
  lecturers: {
    title: 'Lecturers',
    createLabel: 'Create Lecturer',
    activeKey: 'lecturers',
    matches: (entry) => entry.role === 'USER' && entry.userType === 'LECTURER',
  },
  technicians: {
    title: 'Technicians',
    createLabel: 'Create Technician',
    activeKey: 'technicians',
    matches: (entry) => entry.role === 'TECHNICIAN',
  },
}

function UserDirectoryPage() {
  const navigate = useNavigate()
  const { category } = useParams()
  const config = directoryConfig[category]

  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pageError, setPageError] = useState('')
  const [pageNotice, setPageNotice] = useState('')
  const [pageLoading, setPageLoading] = useState(false)

  useEffect(() => {
    if (!config) {
      navigate('/dashboard', { replace: true })
    }
  }, [config, navigate])

  useEffect(() => {
    if (!config) {
      return
    }

    const load = async () => {
      setLoading(true)
      setPageError('')

      try {
        const currentUser = await getCurrentUser()

        if (currentUser.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true })
          return
        }

        setUser(currentUser)
        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setPageError(
          err?.response?.data?.message ||
            `Unable to load the ${config.title.toLowerCase()} list right now.`
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [config, navigate])

  const filteredUsers = useMemo(() => {
    if (!config) {
      return []
    }

    return users.filter(config.matches)
  }, [config, users])

  const refreshUsers = async () => {
    setPageLoading(true)

    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } finally {
      setPageLoading(false)
    }
  }

  const handleStatusToggle = async (targetUserId, isActive) => {
    setPageError('')
    setPageNotice('')

    try {
      await updateUserStatus(targetUserId, { isActive: !isActive })
      await refreshUsers()
      setPageNotice(
        isActive ? 'User account deactivated.' : 'User account activated.'
      )
    } catch (err) {
      setPageError(
        err?.response?.data?.message || 'Unable to update the user status.'
      )
    }
  }

  if (!config) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef4] p-4 sm:p-6">
        <div className="min-h-[calc(100vh-2rem)] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-3rem)]">
          <div className="border-b border-slate-200/80 px-6 py-4">
            <p className="text-2xl font-semibold text-slate-900">
              Loading {config.title.toLowerCase()}...
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
          activeItem={config.activeKey}
        />

        <div className="min-h-[calc(100vh-72px)] px-6 py-5">
          <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  User Directory
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-none text-slate-900">
                  {config.title} List
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {pageLoading && (
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Refreshing list...
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/users/${category}/create`)}
                  className="rounded-xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.22)] transition hover:brightness-105"
                >
                  {config.createLabel}
                </button>
              </div>
            </div>

            {pageError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pageError}
              </div>
            )}

            {pageNotice && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {pageNotice}
              </div>
            )}

            <div className="mt-6 overflow-x-auto rounded-[26px] border border-slate-200">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_1fr_1fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>User</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Approval</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_1fr_1fr] gap-4 px-5 py-5 text-sm text-slate-600"
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
                            {entry.role === 'USER' ? entry.userType : entry.role}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                              entry.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {entry.isActive ? 'ACTIVE' : 'INACTIVE'}
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

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(entry.id, entry.isActive)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {entry.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-sm text-slate-500">
                      No {config.title.toLowerCase()} found yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default UserDirectoryPage
