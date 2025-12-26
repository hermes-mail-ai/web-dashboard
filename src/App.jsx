import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

// Eagerly loaded - core pages needed immediately
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import AccountCallback from './pages/AccountCallback';
import Inbox from './pages/Inbox';
import NotFound from './pages/NotFound';

// Lazy loaded - static/marketing pages
const About = lazy(() => import('./pages/About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const BlogIndex = lazy(() => import('./blog/BlogIndex'));
const BlogPost = lazy(() => import('./blog/BlogPost'));

// Lazy loaded - secondary feature pages
const EmailDetail = lazy(() => import('./pages/EmailDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const People = lazy(() => import('./pages/People'));
const PersonContext = lazy(() => import('./pages/PersonContext'));

// Loading fallback component with progress bar
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top loading bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800/50 overflow-hidden z-50">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-loading-bar" />
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
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
            path="/mail/archived"
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
          {/* Legal Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/mail/inbox" />} />
          <Route path="/mail" element={<Navigate to="/mail/inbox" />} />
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
