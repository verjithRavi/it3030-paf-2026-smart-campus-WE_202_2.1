import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import {
  getCurrentUser,
  submitAccessRequest,
  updateCurrentUserProfile,
} from '../api/authApi'
import { removeToken } from '../utils/token'

function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState('')
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
    requestedUserType: '',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef4] p-4 sm:p-6">
        <div className="min-h-[calc(100vh-2rem)] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-3rem)]">
          <div className="border-b border-slate-200/80 px-6 py-4">
            <p className="text-2xl font-semibold text-slate-900">
              Loading dashboard...
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
          activeItem="dashboard"
        />

        <div className="min-h-[calc(100vh-72px)] px-6 py-5">
            <main className="min-w-0 space-y-6">
              {searchParams.get('setup') === 'pending' && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
                  Your Google account is active with common access. Use the profile
                  panel to request student or lecturer access if you need academic
                  features.
                </div>
              )}

              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

                  <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      Workspace Overview
                    </p>
                    <h3 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
                      Smart Campus dashboard
                    </h3>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                      This dashboard separates common access from approved academic
                      access. Students and lecturers require admin approval, while
                      admin and technician accounts are created directly by an
                      administrator.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {summaryCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            {card.label}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {isCommonUser && (
                    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                        Common Access
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold leading-none text-slate-900">
                        You are using common access
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Google users start here. If you need academic access, use
                        the request buttons below and wait for approval.
                      </p>

                      {hasPendingAcademicRequest && (
                        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                          Your current request is waiting for admin approval:{' '}
                          <span className="font-semibold">
                            {user?.requestedUserType}
                          </span>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleQuickTypeRequest('STUDENT')}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Request Student Access
                        </button>
                        <button
                          onClick={() => handleQuickTypeRequest('LECTURER')}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Request Lecturer Access
                        </button>
                      </div>
                    </section>
                  )}

                  {hasAcademicAccess && (
                    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                        Academic Access
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold leading-none text-slate-900">
                        {user.userType} workspace is active
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Your academic access has been approved. You can continue
                        using the system with your {user.userType.toLowerCase()}{' '}
                        profile and update your personal details from the profile
                        menu whenever needed.
                      </p>
                    </section>
                  )}

                  {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                        Role Workspace
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold leading-none text-slate-900">
                        {user.role} access is active
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Your account was created directly by an administrator. You
                        can continue with your assigned role-based responsibilities
                        in this workspace.
                      </p>
                    </section>
                  )}
                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              Profile
            </p>
            <h3 className="mt-3 text-4xl font-semibold leading-none text-slate-900">
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
                  className="rounded-xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.28)] transition hover:brightness-105"
                >
                  Save Profile
                </button>
              </div>
            </form>
                </section>

            </main>
          </div>
        </div>
      </div>
  )
}

export default DashboardPage
