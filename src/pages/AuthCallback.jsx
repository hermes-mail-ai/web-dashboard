import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const idToken = searchParams.get('id_token');

    if (idToken) {
      localStorage.setItem('token', idToken);
      navigate('/mail/inbox');
    } else {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400">Authenticating...</p>
    </div>
  );
}

export default AuthCallback;
