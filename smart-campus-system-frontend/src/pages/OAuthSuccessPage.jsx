import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import { setToken } from '../utils/token';

function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const profileCompleted = params.get('profileCompleted');

    if (token) {
      setToken(token);

      if (profileCompleted === 'false') {
        navigate('/dashboard?setup=pending');
        return;
      }

      navigate('/dashboard');
      return;
    }

    navigate('/?error=oauth_failed');
  }, []);

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
