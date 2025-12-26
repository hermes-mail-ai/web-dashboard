import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AccountCallback from './pages/AccountCallback';
import Inbox from './pages/Inbox';
import EmailDetail from './pages/EmailDetail';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import People from './pages/People';
import PersonContext from './pages/PersonContext';
import { isAuthenticated } from './services/auth';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
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
          path="/mail/starred"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/snoozed"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/sent"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/drafts"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/purchases"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/important"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/scheduled"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/all"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/spam"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/trash"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/mail/emails/:emailId"
          element={
            <PrivateRoute>
              <EmailDetail />
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
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/people"
          element={
            <PrivateRoute>
              <People />
            </PrivateRoute>
          }
        />
        <Route
          path="/people/:accountId/:contactId"
          element={
            <PrivateRoute>
              <PersonContext />
            </PrivateRoute>
          }
        />
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/mail/inbox" />} />
        <Route path="/mail" element={<Navigate to="/mail/inbox" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
