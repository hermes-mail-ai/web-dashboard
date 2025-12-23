import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AccountCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    if (status === 'success') {
      alert(`Successfully connected: ${email}`);
    }

    navigate('/mail/inbox');
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400">Connecting account...</p>
    </div>
  );
}

export default AccountCallback;
