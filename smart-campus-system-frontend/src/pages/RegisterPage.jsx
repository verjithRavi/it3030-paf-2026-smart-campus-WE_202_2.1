import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { registerUser } from '../api/authApi'
import { setToken } from '../utils/token'

function getRegisterErrorMessage(err) {
  const validationMessages = err?.response?.data?.messages

  if (validationMessages && typeof validationMessages === 'object') {
    return Object.values(validationMessages).join(' ')
  }

  return (
    err?.response?.data?.message ||
    'Registration failed. Please review your details and try again.'
  )
}

function RegisterPage() {
  const navigate = useNavigate()
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      registrationType: 'STUDENT',
      phoneNumber: '',
      department: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
      }

      const data = await registerUser(payload)

      if (data.token) {
        setToken(data.token)
        navigate('/dashboard')
        return
      }

      navigate('/', {
        replace: true,
        state: {
          notice:
            data.approvalStatus === 'PENDING'
              ? 'Registration submitted. Your account is waiting for admin approval.'
              : 'Account created successfully. You can log in now.',
          },
      })
    } catch (err) {
      setError(getRegisterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Set up your campus access profile for bookings, support, and notifications."
      sideTitle="Create a trusted smart campus identity."
      sideText="Register once, then move between local sign-in, Google access, protected dashboards, and role-based campus services."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Account Option
          </label>
          <select
            name="registrationType"
            value={formData.registrationType}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
          >
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Student and lecturer accounts need admin approval. Common access is available through Google sign-in, and admin or technician accounts are created directly by an administrator.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[linear-gradient(135deg,#0b5e63,#113d41)] py-3.5 font-semibold text-white shadow-[0_18px_35px_rgba(15,94,99,0.28)] transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Or continue
        </span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-bold">
          G
        </span>
        Continue with Google
      </button>

      <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
        Already have an account?{' '}
        <Link to="/" className="font-semibold text-slate-900">
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
