import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import { createManagedUser, getCurrentUser, registerUser } from '../api/authApi'
import { removeToken } from '../utils/token'
import { upsertCachedUser } from '../utils/directoryCache'

const FACULTY_OPTIONS = [
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Engineering',
  'Faculty of Humanities & Sciences',
  'Faculty of Architecture',
  'Faculty of Hospitality & Culinary',
]

const createConfig = {
  admins: {
    title: 'Create Admin',
    activeKey: 'admins',
    submitLabel: 'Create Admin',
    createMode: 'managed',
    payload: { role: 'ADMIN' },
  },
  students: {
    title: 'Create Student',
    activeKey: 'students',
    submitLabel: 'Create Student',
    createMode: 'register',
    payload: { registrationType: 'STUDENT' },
  },
  lecturers: {
    title: 'Create Lecturer',
    activeKey: 'lecturers',
    submitLabel: 'Create Lecturer',
    createMode: 'managed',
    payload: { role: 'USER', userType: 'LECTURER' },
  },
  technicians: {
    title: 'Create Technician',
    activeKey: 'technicians',
    submitLabel: 'Create Technician',
    createMode: 'managed',
    payload: { role: 'TECHNICIAN' },
  },
}

function CreateDirectoryUserPage() {
  const navigate = useNavigate()
  const { category } = useParams()
  const config = createConfig[category]

  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    department: '',
  })
  const [formError, setFormError] = useState('')
  const [formNotice, setFormNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isStudentForm = category === 'students'
  const isLecturerForm = category === 'lecturers'
  const isAdminForm = category === 'admins'
  const isTechnicianForm = category === 'technicians'
  const requiresDepartment = isStudentForm || isLecturerForm || isTechnicianForm

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
      setFormError('')

      try {
        const currentUser = await getCurrentUser()

        if (currentUser.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true })
          return
        }

      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setFormError(
          err?.response?.data?.message ||
            `Unable to open the ${config.title.toLowerCase()} screen right now.`
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [config, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormError('')
    setFormNotice('')
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormNotice('')
    setSubmitting(true)

    try {
      const normalizedPhoneNumber = formState.phoneNumber.trim()
      const normalizedDepartment = formState.department.trim()

      if (formState.password !== formState.confirmPassword) {
        setFormError('Password and confirm password do not match.')
        setSubmitting(false)
        return
      }

      if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
        setFormError('Phone number must contain exactly 10 digits.')
        setSubmitting(false)
        return
      }

      if (requiresDepartment && !normalizedDepartment) {
        setFormError('Department is required.')
        setSubmitting(false)
        return
      }

      if (config.createMode === 'managed') {
        const createdUser = await createManagedUser({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          role: config.payload.role,
          userType: config.payload.userType || null,
          phoneNumber: normalizedPhoneNumber,
          department: normalizedDepartment || null,
        })

        upsertCachedUser(createdUser)

        navigate(`/users/${category}`, {
          replace: true,
          state: {
            notice: `${createdUser.name} was created successfully.`,
            createdUser,
          },
        })
      } else {
        const createdUser = await registerUser({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          confirmPassword: formState.confirmPassword,
          phoneNumber: normalizedPhoneNumber,
          department: normalizedDepartment || null,
          registrationType: config.payload.registrationType,
        })

        const normalizedCreatedUser = {
          id: createdUser.userId,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          userType: createdUser.userType,
          authProvider: createdUser.authProvider,
          pictureUrl: createdUser.pictureUrl,
          phoneNumber: createdUser.phoneNumber,
          department: createdUser.department,
          isActive: true,
          emailVerified: true,
          approvalStatus: createdUser.approvalStatus,
          requestedRole: createdUser.requestedRole,
          requestedUserType: createdUser.requestedUserType,
        }

        upsertCachedUser(normalizedCreatedUser)

        navigate(`/users/${category}`, {
          replace: true,
          state: {
            notice: `${normalizedCreatedUser.name} was created successfully.`,
            createdUser: normalizedCreatedUser,
          },
        })
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          `Unable to create this ${category.slice(0, -1)} right now.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!config) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : (<>
      <PageHeader
        title={config.title}
        subtitle="Add a new campus user with a consistent setup flow."
        action={
          <button
            type="button"
            onClick={() => navigate(`/users/${category}`)}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to List
          </button>
        }
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
              User Creation
            </p>

            {formError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {formNotice && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {formNotice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Full name"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Email address"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="phoneNumber"
                value={formState.phoneNumber}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: 'phoneNumber',
                      value: e.target.value.replace(/\D/g, '').slice(0, 10),
                    },
                  })
                }
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              {(isStudentForm || isLecturerForm) ? (
                <select
                  name="department"
                  value={formState.department}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                  required
                >
                  <option value="">Select department</option>
                  {FACULTY_OPTIONS.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              ) : isTechnicianForm ? (
                <input
                  type="text"
                  name="department"
                  value={formState.department}
                  onChange={handleChange}
                  placeholder="Department"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                  required
                />
              ) : isAdminForm ? null : null}

              <div className="md:col-span-2">
                {isAdminForm && (
                  <p className="mb-3 text-sm text-slate-500">
                    Admin accounts are created with name, email, phone number, password, and confirm password.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-6 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Spinner size="sm" /> : config.submitLabel}
                </button>
              </div>
            </form>
      </section>
      </>)}
    </div>
  )
}

export default CreateDirectoryUserPage
