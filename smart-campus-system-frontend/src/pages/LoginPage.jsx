import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Spinner from '../components/ui/Spinner';
import { loginUser } from '../api/authApi';
import { INPUT_CLASS, PRIMARY_BTN } from '../constants/theme';
import { setAuthSession } from '../utils/token';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully. Awaiting admin approval.');
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({
        email: email.trim(),
        password,
      });
      setAuthSession(data);
      navigate(data.role === 'ADMIN' ? '/dashboard' : '/home');
    } catch (error) {
      const validationMessages = error.response?.data?.messages;
      const firstValidationMessage = validationMessages
        ? Object.values(validationMessages)[0]
        : null;

      setError(
        error.response?.data?.message ||
          firstValidationMessage ||
          'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {successMessage && (
        <div className="mb-4 rounded-xl border border-[#1D9E75] bg-[#E1F5EE] p-3 text-sm text-[#0F6E56]">
          <div className="flex items-start gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              className="mt-0.5 flex-shrink-0"
            >
              <path
                d="M16.667 5L7.5 14.167 3.333 10"
                stroke="#0F6E56"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <h1 className="text-xl font-medium text-gray-900">Sign in</h1>
      <p className="mb-6 text-sm text-gray-400">Welcome back to Smart Campus</p>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/oauth2/authorization/google';
        }}
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

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
          required
        />

        {error && (
          <div className="mb-2 rounded-xl border border-[#E24B4A] bg-[#FCEBEB] p-3 text-sm text-[#A32D2D]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${PRIMARY_BTN} flex items-center justify-center gap-2`}
        >
          {loading ? <Spinner size="sm" /> : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        Don&apos;t have an account?{' '}
        <span
          className="cursor-pointer font-medium text-[#0F6E56]"
          onClick={() => navigate('/register')}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/register');
            }
          }}
        >
          Register
        </span>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
