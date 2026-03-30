import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { loginUser } from '../api/authApi'
import { setToken } from '../utils/token'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(formData)
      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Login failed. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue managing support requests, service access, approvals, and smart campus operations."
      sideTitle="One secure portal for smart campus access."
      sideText="From daily operations to role-based administration, everything starts with a clean and trusted sign-in experience."
    >
      {location.state?.notice && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {location.state.notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f6e73]">
              Protected
            </span>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f6e73] focus:bg-white focus:ring-4 focus:ring-teal-100"
            required
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-500">
          <span>Campus verified access</span>
          <span className="font-semibold text-slate-700">JWT Active</span>
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
          {loading ? 'Logging in...' : 'Login'}
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
        Need a new account? You can register as a normal user, student, or lecturer.{' '}
        <Link to="/register" className="font-semibold text-slate-900">
          Create one
        </Link>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
