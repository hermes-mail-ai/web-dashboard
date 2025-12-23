import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for both 'token' (mock server) and 'id_token' (real backend)
    const token = searchParams.get('token') || searchParams.get('id_token');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      console.log('Token received, storing in localStorage');
      localStorage.setItem('token', token);
      // Small delay to ensure token is stored before navigation
      setTimeout(() => {
        navigate('/mail/inbox', { replace: true });
      }, 100);
    } else {
      console.warn('No token in callback URL', searchParams.toString());
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400">Authenticating...</p>
    </div>
  );
}

export default AuthCallback;
