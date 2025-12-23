# Hermes Mock API Server

A mock API server for the Hermes web dashboard that simulates all backend endpoints, allowing you to develop the frontend without needing the actual backend services.

## Features

- **Complete API simulation** - All endpoints from the Hermes backend
- **Authentication flow** - Mock JWT tokens and OAuth redirects
- **Realistic data** - Sample users, emails, and accounts
- **CORS enabled** - Works with local development servers
- **Simulated delays** - Realistic API response times

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mock-server
   npm install
   ```

2. **Start the mock server:**
   ```bash
   npm start
   # or with auto-restart on changes:
   npm run dev
   ```

3. **Configure your frontend:**
   Create or update `.env` in the main web-dashboard directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start your frontend:**
   ```bash
   cd ..  # back to web-dashboard root
   npm run dev
   ```

The mock server will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `GET /api/v1/auth/login` - Redirect to mock Google OAuth
- `GET /api/v1/auth/register` - Redirect to mock Google OAuth (signup)
- `GET /api/v1/auth/logout` - Logout and redirect
- `GET /api/v1/auth/callback/google` - OAuth callback handler

### Users
- `GET /api/v1/users/me` - Get current user info

### Email Accounts
- `GET /api/v1/accounts` - Get user's connected email accounts
- `GET /api/v1/accounts/providers` - Get available email providers
- `GET /api/v1/accounts/connect/:provider` - Connect email account (OAuth)
- `DELETE /api/v1/accounts/:id` - Disconnect email account

### Emails
- `GET /api/v1/emails` - Get emails with pagination
- `POST /api/v1/emails/sync` - Sync emails from providers

### Health Check
- `GET /health` - Server status and endpoint list

## Authentication Flow

The mock server simulates the complete OAuth flow:

1. **Frontend calls** `/api/v1/auth/login`
2. **Server redirects** to mock Google OAuth
3. **OAuth completes** and redirects to `/api/v1/auth/callback/google`
4. **Server generates** a JWT token and redirects to frontend
5. **Frontend receives** token via URL parameter

## Mock Data

### Default User
- Email: `user@example.com`
- Name: `John Doe`

### Email Providers
- Google (Gmail)
- Microsoft (Outlook)

### Sample Emails
- 25+ realistic email messages
- Various senders (GitHub, Amazon, newsletters, etc.)
- Different read states and attachment flags
- Proper threading and labels

## Configuration

### Environment Variables
- `PORT` - Server port (default: 8000)
- `FRONTEND_URL` - Frontend URL for redirects (default: http://localhost:5173)

### CORS
Configured to allow requests from common development ports:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Create React App default)

## Development

### Auto-restart
```bash
npm run dev  # Uses --watch flag for auto-restart
```

### Adding Mock Data
Edit `data.js` to add more users, accounts, or emails.

### Response Delays
API endpoints include realistic delays (200-2000ms) to simulate network conditions. Adjust the `delay()` function calls in `server.js` to customize timing.

## Troubleshooting

### CORS Issues
Make sure your frontend is running on an allowed origin. Update the CORS configuration in `server.js` if needed.

### Authentication Issues
Check that the JWT token is being stored in localStorage and included in API requests via the Authorization header.

### Email Sync
The email sync endpoint (`POST /api/v1/emails/sync`) simulates a 2-second delay. This is normal for testing loading states.

## Production Note

This is a development tool only. Do not use in production environments.