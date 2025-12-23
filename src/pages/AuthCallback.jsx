import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const idToken = searchParams.get('id_token');

    if (idToken) {
      localStorage.setItem('token', idToken);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
}

export default AuthCallback;
