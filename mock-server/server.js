import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { users, providers, accounts, allEmails } from './data.js';

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = 'mock-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Common Vite/React ports
  credentials: true
}));
app.use(express.json());

// Helper function to generate JWT
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Helper function to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

// Simulate delay for more realistic API behavior
function delay(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auth endpoints
app.get('/api/v1/auth/login', async (req, res) => {
  await delay(200);

  // Simulate OAuth redirect to Google
  const redirectUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/callback/google?code=mock_auth_code&state=mock_state`;

  res.redirect(redirectUrl);
});

app.get('/api/v1/auth/register', async (req, res) => {
  await delay(200);

  // Simulate OAuth redirect to Google for registration
  const redirectUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/callback/google?code=mock_auth_code&state=mock_state&signup=true`;

  res.redirect(redirectUrl);
});

app.get('/api/v1/auth/callback/google', async (req, res) => {
  await delay(800); // Simulate OAuth processing time

  const { code, state, signup } = req.query;

  if (!code) {
    return res.status(400).json({ detail: 'Missing authorization code' });
  }

  // Mock successful OAuth exchange
  const user = users[0]; // Use first mock user
  const token = generateToken(user.id);

  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const callbackUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&success=true`;

  res.redirect(callbackUrl);
});

app.get('/api/v1/auth/logout', async (req, res) => {
  await delay(200);

  // In a real app, you'd invalidate the token on the server side
  // For mock purposes, just redirect to login
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/login?logout=true`);
});

// User endpoints
app.get('/api/v1/users/me', verifyToken, async (req, res) => {
  await delay(300);

  const user = users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ detail: 'User not found' });
  }

  res.json(user);
});

// Account endpoints
app.get('/api/v1/accounts', verifyToken, async (req, res) => {
  await delay(400);

  const userAccounts = accounts.filter(acc => acc.user_id === req.userId);
  res.json(userAccounts);
});

app.get('/api/v1/accounts/providers', async (req, res) => {
  await delay(200);
  res.json(providers);
});

app.get('/api/v1/accounts/connect/:provider', verifyToken, async (req, res) => {
  await delay(300);

  const { provider } = req.params;
  const { token } = req.query; // Token passed from frontend

  if (!['google', 'outlook'].includes(provider)) {
    return res.status(400).json({ detail: 'Unsupported provider' });
  }

  // Simulate OAuth flow
  const mockAuthUrl = provider === 'google'
    ? 'https://accounts.google.com/oauth2/v2/auth'
    : 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

  const callbackUrl = `${req.protocol}://${req.get('host')}/api/v1/accounts/callback/${provider}`;

  // Simulate immediate redirect back with success for demo
  setTimeout(() => {
    // In a real scenario, this would be handled by the OAuth provider
  }, 100);

  res.redirect(`${callbackUrl}?code=mock_code&state=mock_state&token=${encodeURIComponent(token)}`);
});

app.get('/api/v1/accounts/callback/:provider', async (req, res) => {
  await delay(800);

  const { provider } = req.params;
  const { code, token } = req.query;

  if (!code) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/account/callback?error=access_denied`);
  }

  // Mock creating a new account connection
  const newAccount = {
    id: accounts.length + 1,
    user_id: 1, // Mock user ID
    provider,
    email: `user@${provider === 'google' ? 'gmail.com' : 'outlook.com'}`,
    is_connected: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  accounts.push(newAccount);

  // Redirect back to frontend
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/account/callback?success=true&provider=${provider}`);
});

app.delete('/api/v1/accounts/:accountId', verifyToken, async (req, res) => {
  await delay(400);

  const accountId = parseInt(req.params.accountId);
  const accountIndex = accounts.findIndex(acc => acc.id === accountId && acc.user_id === req.userId);

  if (accountIndex === -1) {
    return res.status(404).json({ detail: 'Account not found' });
  }

  accounts.splice(accountIndex, 1);
  res.json({ message: 'Account disconnected successfully' });
});

// Email endpoints
app.get('/api/v1/emails', verifyToken, async (req, res) => {
  await delay(600);

  const { limit = 50, offset = 0 } = req.query;
  const userAccounts = accounts.filter(acc => acc.user_id === req.userId);
  const accountIds = userAccounts.map(acc => acc.id);

  let userEmails = allEmails.filter(email => accountIds.includes(email.account_id));

  // Sort by date descending (newest first)
  userEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedEmails = userEmails.slice(startIndex, endIndex);

  res.json({
    emails: paginatedEmails,
    total: userEmails.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
    has_more: endIndex < userEmails.length
  });
});

app.post('/api/v1/emails/sync', verifyToken, async (req, res) => {
  await delay(2000); // Simulate longer sync process

  const { max_results = 50 } = req.query;

  // Mock syncing process - in reality this would fetch from email providers
  const syncedCount = Math.floor(Math.random() * 10) + 1; // Random 1-10 new emails

  res.json({
    message: 'Email sync completed',
    synced_count: syncedCount,
    total_emails: allEmails.length + syncedCount
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hermes Mock API Server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/v1/users/me',
      'GET /api/v1/accounts',
      'GET /api/v1/accounts/providers',
      'GET /api/v1/accounts/connect/:provider',
      'DELETE /api/v1/accounts/:accountId',
      'GET /api/v1/emails',
      'POST /api/v1/emails/sync',
      'GET /api/v1/auth/login',
      'GET /api/v1/auth/register',
      'GET /api/v1/auth/logout'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    detail: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    detail: 'Internal server error',
    message: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hermes Mock API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 Set VITE_API_URL=http://localhost:${PORT} in your frontend .env file`);
});

export default app;