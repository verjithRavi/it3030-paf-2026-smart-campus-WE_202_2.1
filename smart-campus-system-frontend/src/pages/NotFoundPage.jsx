import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-6xl font-medium text-gray-200">404</p>
      <p className="text-lg text-gray-600">Page not found</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="rounded-xl bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#085041]"
      >
        Go to dashboard
      </button>
    </div>
  );
}

export default NotFoundPage;
