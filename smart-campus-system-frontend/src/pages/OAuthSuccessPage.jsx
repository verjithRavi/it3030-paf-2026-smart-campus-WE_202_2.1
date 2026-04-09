import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import Spinner from '../components/ui/Spinner';
import { setCurrentUserData, setToken } from '../utils/token';

function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const profileCompleted = params.get('profileCompleted');

    const completeSignIn = async () => {
      if (!token) {
        navigate('/?error=oauth_failed');
        return;
      }

      setToken(token);

      try {
        const user = await getCurrentUser();
        setCurrentUserData(user);

        if (user.role === 'ADMIN') {
          navigate('/dashboard');
          return;
        }

        if (profileCompleted === 'false') {
          navigate('/home?setup=pending');
          return;
        }

        navigate('/home');
      } catch {
        navigate('/?error=oauth_failed');
      }
    };

    completeSignIn();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">Completing sign in...</p>
      <p className="text-xs text-gray-300">
        Please wait while we set up your account.
      </p>
    </div>
  );
}

export default OAuthSuccessPage;
