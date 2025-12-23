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

    navigate('/dashboard');
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Connecting account...</p>
    </div>
  );
}

export default AccountCallback;
