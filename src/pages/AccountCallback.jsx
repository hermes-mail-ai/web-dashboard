import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AccountCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'success') {
      // Set flag to trigger import modal for new account
      sessionStorage.setItem('hermes_new_account_added', 'true');
    } else if (status === 'error' && message) {
      // Store error message to display on inbox
      sessionStorage.setItem('hermes_account_error', message);
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
