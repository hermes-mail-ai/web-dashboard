import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AccountCallback from './pages/AccountCallback';
import Inbox from './pages/Inbox';
import Settings from './pages/Settings';
import { isAuthenticated } from './services/auth';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/accounts/callback" element={<AccountCallback />} />
        <Route
          path="/mail/inbox"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/mail/inbox" />} />
        <Route path="/mail" element={<Navigate to="/mail/inbox" />} />
        <Route path="/" element={<Navigate to="/mail/inbox" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
