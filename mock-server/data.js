// Mock data for the Hermes API

// Test users - you can add more users here for testing different scenarios
export const users = [
  {
    id: 1,
    email: "user@example.com",
    name: "John Doe",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    name: "Jane Smith",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  },
  {
    id: 3,
    email: "test.user@example.com",
    name: "Test User",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z"
  }
];

export const providers = [
  {
    name: "google",
    display_name: "Gmail",
    oauth_url: "https://accounts.google.com/oauth2/v2/auth"
  },
  {
    name: "outlook",
    display_name: "Outlook",
    oauth_url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
  }
];

// Email accounts - each user can have multiple accounts from different providers
export const accounts = [
  {
    id: 1,
    user_id: 1,
    provider: "google",
    email: "john.doe@gmail.com",
    is_connected: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    user_id: 1,
    provider: "outlook",
    email: "john.doe@outlook.com",
    is_connected: true,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  },
  {
    id: 3,
    user_id: 2,
    provider: "google",
    email: "jane.smith@gmail.com",
    is_connected: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  }
];

export const emails = [
  {
    id: 1,
    account_id: 1,
    external_id: "msg_001",
    from_email: "newsletter@company.com",
    from_name: "Company Newsletter",
    to_email: "john.doe@gmail.com",
    subject: "Weekly Newsletter - December 2024",
    snippet: "Check out our latest features and updates from this week...",
    body_text: "This week we've been working on exciting new features...",
    body_html: "<p>This week we've been working on exciting new features...</p>",
    date: "2024-12-23T10:30:00Z",
    is_read: false,
    has_attachments: false,
    labels: ["INBOX", "IMPORTANT"],
    thread_id: "thread_001"
  },
  {
    id: 2,
    account_id: 1,
    external_id: "msg_002",
    from_email: "support@github.com",
    from_name: "GitHub",
    to_email: "john.doe@gmail.com",
    subject: "Your pull request has been merged",
    snippet: "Great news! Your pull request #123 has been successfully merged...",
    body_text: "Great news! Your pull request #123 has been successfully merged into the main branch.",
    body_html: "<p>Great news! Your pull request #123 has been successfully merged into the main branch.</p>",
    date: "2024-12-23T09:15:00Z",
    is_read: true,
    has_attachments: false,
    labels: ["INBOX"],
    thread_id: "thread_002"
  },
  {
    id: 3,
    account_id: 1,
    external_id: "msg_003",
    from_email: "noreply@bank.com",
    from_name: "Bank Security",
    to_email: "john.doe@gmail.com",
    subject: "Security Alert: New login detected",
    snippet: "We detected a new login to your account from a new device...",
    body_text: "We detected a new login to your account from a new device on December 23, 2024.",
    body_html: "<p>We detected a new login to your account from a new device on December 23, 2024.</p>",
    date: "2024-12-23T08:45:00Z",
    is_read: false,
    has_attachments: false,
    labels: ["INBOX", "IMPORTANT"],
    thread_id: "thread_003"
  },
  {
    id: 4,
    account_id: 1,
    external_id: "msg_004",
    from_email: "receipts@amazon.com",
    from_name: "Amazon",
    to_email: "john.doe@gmail.com",
    subject: "Your order has shipped - Order #123456789",
    snippet: "Good news! Your order is on its way and should arrive soon...",
    body_text: "Good news! Your order is on its way and should arrive by December 25, 2024.",
    body_html: "<p>Good news! Your order is on its way and should arrive by December 25, 2024.</p>",
    date: "2024-12-22T16:20:00Z",
    is_read: true,
    has_attachments: true,
    labels: ["INBOX"],
    thread_id: "thread_004"
  },
  {
    id: 5,
    account_id: 1,
    external_id: "msg_005",
    from_email: "calendar-notification@google.com",
    from_name: "Google Calendar",
    to_email: "john.doe@gmail.com",
    subject: "Reminder: Team meeting in 1 hour",
    snippet: "Don't forget about your upcoming meeting: Team Standup...",
    body_text: "Don't forget about your upcoming meeting: Team Standup at 2:00 PM today.",
    body_html: "<p>Don't forget about your upcoming meeting: <strong>Team Standup</strong> at 2:00 PM today.</p>",
    date: "2024-12-22T13:00:00Z",
    is_read: false,
    has_attachments: false,
    labels: ["INBOX"],
    thread_id: "thread_005"
  }
];

// Helper function to generate more emails for pagination testing
export function generateMoreEmails(startId = 6, count = 20) {
  const senders = [
    { email: "updates@linkedin.com", name: "LinkedIn" },
    { email: "noreply@spotify.com", name: "Spotify" },
    { email: "news@techcrunch.com", name: "TechCrunch" },
    { email: "hello@stripe.com", name: "Stripe" },
    { email: "support@slack.com", name: "Slack" },
    { email: "team@figma.com", name: "Figma" },
    { email: "alerts@aws.amazon.com", name: "AWS" },
    { email: "noreply@dropbox.com", name: "Dropbox" }
  ];

  const subjects = [
    "Weekly digest - Don't miss out",
    "Your monthly report is ready",
    "Security update required",
    "New features available",
    "Payment confirmation",
    "Account activity summary",
    "Team collaboration invite",
    "System maintenance scheduled"
  ];

  const moreEmails = [];
  for (let i = 0; i < count; i++) {
    const sender = senders[i % senders.length];
    const subject = subjects[i % subjects.length];
    const date = new Date();
    date.setHours(date.getHours() - (i + 1));

    moreEmails.push({
      id: startId + i,
      account_id: 1,
      external_id: `msg_${String(startId + i).padStart(3, '0')}`,
      from_email: sender.email,
      from_name: sender.name,
      to_email: "john.doe@gmail.com",
      subject: subject,
      snippet: `This is a preview of the email content for ${subject}...`,
      body_text: `Full email content for ${subject}`,
      body_html: `<p>Full email content for <strong>${subject}</strong></p>`,
      date: date.toISOString(),
      is_read: Math.random() > 0.3, // 70% read
      has_attachments: Math.random() > 0.8, // 20% with attachments
      labels: ["INBOX"],
      thread_id: `thread_${String(startId + i).padStart(3, '0')}`
    });
  }

  return moreEmails;
}

export const allEmails = [...emails, ...generateMoreEmails()];