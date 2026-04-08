import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import AuthLayout from '../components/AuthLayout';
import Spinner from '../components/ui/Spinner';
import { INPUT_CLASS, PRIMARY_BTN } from '../constants/theme';

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [userType, setUserType] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        confirmPassword,
        phoneNumber,
        department,
        userType,
        registrationType: userType,
      });
      navigate('/?registered=true');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const typeCardClass = (type) =>
    userType === type
      ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56] font-medium'
      : 'border-gray-200 text-gray-500 hover:border-gray-300';

  return (
    <AuthLayout>
      <h1 className="text-xl font-medium text-gray-900">Create account</h1>
      <p className="mb-5 text-sm text-gray-400">Join Smart Campus</p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.796 2.7164v2.2582h2.9086c1.7018-1.5668 2.6838-3.8741 2.6838-6.6155Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1791l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3291C2.4382 15.9832 5.4818 18 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.9636 10.7105A5.4092 5.4092 0 0 1 3.6818 9c0-.5932.1018-1.17.2818-1.7105V4.9604H.9573A8.9977 8.9977 0 0 0 0 9c0 1.4523.3477 2.8273.9573 4.0396l3.0063-2.3291Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9604l3.0063 2.3291C4.6718 5.1627 6.6559 3.5795 9 3.5795Z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative my-4 flex items-center">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="px-3 text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLASS}
            required
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-[#A32D2D]">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-[#A32D2D]">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
            required
          />
          <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-[#A32D2D]">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT_CLASS}
            required
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-[#A32D2D]">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Phone number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.phoneNumber && (
            <p className="mt-1 text-xs text-[#A32D2D]">
              {fieldErrors.phoneNumber}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Department (optional)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.department && (
            <p className="mt-1 text-xs text-[#A32D2D]">
              {fieldErrors.department}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">I am a</p>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition ${typeCardClass(
                'STUDENT'
              )}`}
            >
              <input
                type="radio"
                name="userType"
                value="STUDENT"
                checked={userType === 'STUDENT'}
                onChange={(e) => setUserType(e.target.value)}
                className="sr-only"
              />
              Student
            </label>
            <label
              className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition ${typeCardClass(
                'LECTURER'
              )}`}
            >
              <input
                type="radio"
                name="userType"
                value="LECTURER"
                checked={userType === 'LECTURER'}
                onChange={(e) => setUserType(e.target.value)}
                className="sr-only"
              />
              Lecturer
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[#E24B4A] bg-[#FCEBEB] p-3 text-sm text-[#A32D2D]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${PRIMARY_BTN} flex items-center justify-center gap-2`}
        >
          {loading ? <Spinner size="sm" /> : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        Already have an account?{' '}
        <span
          className="cursor-pointer font-medium text-[#0F6E56]"
          onClick={() => navigate('/')}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/');
            }
          }}
        >
          Sign in
        </span>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
