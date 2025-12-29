import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EmailImportModal from '../components/EmailImportModal';
import AIComposeModal from '../components/AIComposeModal';
import ContactAutocomplete from '../components/ContactAutocomplete';
import EmptyState from '../components/EmptyState';
import ProductTour from '../components/ProductTour';
import { useTour } from '../hooks/useTour';
import { decodeHtmlEntities } from '../utils/emailHelpers';
import ComposeEditor from '../components/compose/ComposeEditor';
import ComposeToolbar from '../components/compose/ComposeToolbar';

function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showCheckboxDropdown, setShowCheckboxDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailBody, setEmailBody] = useState(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [threadEmails, setThreadEmails] = useState([]); // All emails in the thread
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyingToEmailId, setReplyingToEmailId] = useState(null); // Which email is being replied to
  const [threadCache, setThreadCache] = useState(new Map()); // Cache threads by thread_id to avoid refetching
  const [expandedEmails, setExpandedEmails] = useState(new Set()); // Track which emails have body expanded
  const [expandedQuotedContent, setExpandedQuotedContent] = useState(new Set()); // Track which emails have quoted content expanded
  const [showSummaryEmails, setShowSummaryEmails] = useState(new Set()); // Track which emails are showing summary (for multi-email threads)
  const [inlineReplyEditorFormats, setInlineReplyEditorFormats] = useState({}); // Formatting state for inline reply editor
  const [openMetadataDropdowns, setOpenMetadataDropdowns] = useState(new Set()); // Track which metadata dropdowns are open
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('inbox_category') || 'primary';
  });
  const [showFullContent, setShowFullContent] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => {
    return parseInt(localStorage.getItem('inbox_limit')) || 100;
  });
  const [totalEmails, setTotalEmails] = useState(0);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [newEmailIds, setNewEmailIds] = useState(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState([]);
  const [composeCc, setComposeCc] = useState([]);
  const [composeBcc, setComposeBcc] = useState([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showCcBccMenu, setShowCcBccMenu] = useState(false);
  const [editorFormats, setEditorFormats] = useState({});
  const editorRef = useRef(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAIComposeModal, setShowAIComposeModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Product tour state
  const { isRunning: tourRunning, startTour, stopTour, completeTour, hasCompletedTour, resetTour } = useTour();

  // Draft state
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const draftAutoSaveTimerRef = useRef(null);
  const lastSavedContentRef = useRef('');

  // Thread view state
  const [useThreadView, setUseThreadView] = useState(() => {
    return localStorage.getItem('inbox_thread_view') === 'true';
  });
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [totalThreads, setTotalThreads] = useState(0);

  // Determine folder from path - matches backend API parameters
  const getFolderFromPath = () => {
    const path = location.pathname;
    if (path.includes('/starred')) return { folder: 'starred' };
    if (path.includes('/snoozed')) return { folder: 'inbox' }; // Snoozed not supported yet
    if (path.includes('/sent')) return { folder: 'all' }; // Sent not separate folder yet
    if (path.includes('/drafts')) return { folder: 'inbox' }; // Drafts not supported yet
    if (path.includes('/purchases')) return { folder: 'inbox', category: 'promotions' };
    if (path.includes('/important')) return { folder: 'inbox' };
    if (path.includes('/spam')) return { folder: 'inbox' }; // Could add spam folder later
    if (path.includes('/trash')) return { folder: 'trash' };
    if (path.includes('/all')) return { folder: 'all' };
    if (path.includes('/archived')) return { folder: 'archived' };
    return { folder: 'inbox' };
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate, location.pathname]);

  const loadData = async () => {
    try {
      // Check for account error from callback
      const accountError = sessionStorage.getItem('hermes_account_error');
      if (accountError) {
        sessionStorage.removeItem('hermes_account_error');
        setToast({ show: true, message: accountError, type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
      }

      const [userRes, accountsRes, providersRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/accounts'),
        api.get('/api/v1/accounts/providers'),
      ]);
      setUser(userRes.data);
      setAccounts(accountsRes.data);
      setProviders(providersRes.data);

      if (accountsRes.data.length > 0) {
        // Check if a new account was just added
        const newAccountAdded = sessionStorage.getItem('hermes_new_account_added') === 'true';
        if (newAccountAdded) {
          sessionStorage.removeItem('hermes_new_account_added');
          setShowImportModal(true);
        } else {
          const emailsRes = await api.get('/api/v1/emails', { params: { limit: 1, offset: 0, folder: 'all' } });
          const hasEmails = emailsRes.data.total > 0 || emailsRes.data.emails.length > 0;
          const onboardingComplete = localStorage.getItem('hermes_onboarding_complete') === 'true';

          if (!hasEmails && !onboardingComplete) {
            setShowImportModal(true);
          } else {
            await loadEmails();
          }
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async (resetPage = false) => {
    setLoadingEmails(true);
    try {
      const filters = getFolderFromPath();
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      const API_PAGE_SIZE = 100; // Backend max per request
      const baseOffset = (currentPage - 1) * limit;

      if (useThreadView) {
        // Load threads - fetch multiple pages if needed
        const numRequests = Math.ceil(limit / API_PAGE_SIZE);
        const requests = [];

        for (let i = 0; i < numRequests; i++) {
          const params = {
            limit: Math.min(API_PAGE_SIZE, limit - (i * API_PAGE_SIZE)),
            offset: baseOffset + (i * API_PAGE_SIZE),
            ...filters,
            ...(searchQuery && { search: searchQuery }),
          };
          requests.push(api.get('/api/v1/emails/threads/list', { params }));
        }

        const responses = await Promise.all(requests);
        const allThreads = responses.flatMap(res => res.data.threads);
        const total = responses[0]?.data.total || allThreads.length;

        setThreads(allThreads.slice(0, limit));
        setTotalThreads(total);
        setEmails([]);
        setTotalEmails(0);
      } else {
        // Load emails - fetch multiple pages if needed
        const numRequests = Math.ceil(limit / API_PAGE_SIZE);
        const requests = [];

        for (let i = 0; i < numRequests; i++) {
          const params = {
            limit: Math.min(API_PAGE_SIZE, limit - (i * API_PAGE_SIZE)),
            offset: baseOffset + (i * API_PAGE_SIZE),
            ...filters,
            ...(searchQuery && { search: searchQuery }),
          };
          requests.push(api.get('/api/v1/emails', { params }));
        }

        const responses = await Promise.all(requests);
        const allEmails = responses.flatMap(res => res.data.emails);
        const total = responses[0]?.data.total || allEmails.length;

        setEmails(allEmails.slice(0, limit));
        setTotalEmails(total);
        setThreads([]);
        setTotalThreads(0);
      }
    } catch (err) {
      console.error('Failed to load emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  // Toggle thread view
  const toggleThreadView = () => {
    const newValue = !useThreadView;
    setUseThreadView(newValue);
    localStorage.setItem('inbox_thread_view', newValue.toString());
    setExpandedThreads(new Set()); // Clear expanded state
  };

  // Toggle thread expansion
  const toggleThreadExpansion = (threadId) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (accounts.length > 0) {
      loadEmails();
    }
  }, [location.pathname, searchQuery, page, limit, useThreadView]);

  const syncEmails = async (isAutoSync = false) => {
    // Don't auto-sync if already syncing
    if (isAutoSync && syncing) return;

    setSyncing(true);
    try {
      await api.post('/api/v1/emails/sync', null, { params: { max_results: 100 } });

      // Incremental update: fetch latest emails and merge with existing
      const filters = getFolderFromPath();
      
      // Find the most recent email's date to only fetch emails newer than it
      let mostRecentDate = null;
      if (useThreadView) {
        // In thread view, find the most recent date from threads
        if (threads.length > 0) {
          // Threads are sorted by latest_date descending, so first thread has most recent
          const mostRecentThread = threads[0];
          if (mostRecentThread?.latest_date) {
            mostRecentDate = new Date(mostRecentThread.latest_date);
          }
        }
      } else {
        // In email view, find the most recent date from emails
        if (emails.length > 0) {
          // Emails are sorted by date descending, so first email is most recent
          const mostRecentEmail = emails[0];
          if (mostRecentEmail?.date) {
            mostRecentDate = new Date(mostRecentEmail.date);
          }
        }
      }

      const params = {
        limit: 100, // Can fetch more since we're filtering by date
        offset: 0,
        ...filters,
        ...(searchQuery && { search: searchQuery }),
        // Only add start_date if we have a most recent email (avoids fetching all emails on first sync)
        ...(mostRecentDate && { start_date: mostRecentDate.toISOString() }),
      };

      if (useThreadView) {
        const res = await api.get('/api/v1/emails/threads/list', { params });
        const fetchedThreads = res.data.threads;
        // Deduplicate fetched threads first
        const uniqueFetchedThreads = Array.from(
          new Map(fetchedThreads.map(thread => [thread.thread_id, thread])).values()
        );
        // Deduplicate emails within each fetched thread
        const cleanedFetchedThreads = deduplicateThreadEmails(uniqueFetchedThreads);
        const existingIds = new Set(threads.map(t => t.thread_id));
        const newThreads = cleanedFetchedThreads.filter(t => !existingIds.has(t.thread_id));

        if (newThreads.length > 0) {
          // Add new threads to the top with animation
          const newIds = new Set(newThreads.map(t => t.thread_id));
          setNewEmailIds(newIds);
          // Deduplicate when merging to prevent duplicates
          setThreads(prev => {
            const merged = [...newThreads, ...prev];
            const unique = Array.from(
              new Map(merged.map(thread => [thread.thread_id, thread])).values()
            );
            // Deduplicate emails within each thread after merging
            return deduplicateThreadEmails(unique).slice(0, limit);
          });
          setTotalThreads(res.data.total);

          // Clear animation state after animation completes
          setTimeout(() => setNewEmailIds(new Set()), 600);
        }
      } else {
        const res = await api.get('/api/v1/emails', { params });
        const fetchedEmails = res.data.emails;
        // Deduplicate fetched emails first
        const uniqueFetchedEmails = Array.from(
          new Map(fetchedEmails.map(email => [email.id, email])).values()
        );
        const existingIds = new Set(emails.map(e => e.id));
        const newEmails = uniqueFetchedEmails.filter(e => !existingIds.has(e.id));

        if (newEmails.length > 0) {
          // Add new emails to the top with animation
          const newIds = new Set(newEmails.map(e => e.id));
          setNewEmailIds(newIds);
          // Deduplicate when merging to prevent duplicates
          setEmails(prev => {
            const merged = [...newEmails, ...prev];
            const unique = Array.from(
              new Map(merged.map(email => [email.id, email])).values()
            );
            return unique.slice(0, limit);
          });
          setTotalEmails(res.data.total);

          // Clear animation state after animation completes
          setTimeout(() => setNewEmailIds(new Set()), 600);
        }
      }

      setLastSynced(new Date());
    } catch (err) {
      console.error('Failed to sync emails:', err);
      if (!isAutoSync) {
        setError(err.response?.data?.detail || err.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync every minute when online (skip during onboarding)
  useEffect(() => {
    if (accounts.length === 0) return;

    // Initial sync timestamp
    if (!lastSynced) {
      setLastSynced(new Date());
    }

    const autoSyncInterval = setInterval(() => {
      // Skip auto-sync if import modal is open (onboarding in progress)
      if (navigator.onLine && !showImportModal) {
        syncEmails(true);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(autoSyncInterval);
  }, [accounts.length, showImportModal]);

  // Close Cc/Bcc menu when clicking outside
  useEffect(() => {
    if (!showCcBccMenu) return;

    const handleClickOutside = () => setShowCcBccMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCcBccMenu]);

  // Format last synced time for tooltip
  const formatLastSynced = () => {
    if (!lastSynced) return 'Never synced';
    return `Last synced: ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${lastSynced.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  // Rich text editor formatting functions
  const updateEditorFormats = () => {
    setEditorFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateEditorFormats();
  };

  // Rich text editor formatting functions for inline reply
  const updateInlineReplyEditorFormats = () => {
    setInlineReplyEditorFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const execInlineReplyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateInlineReplyEditorFormats();
  };

  // Helper to convert HTML to plain text for inline preview
  const htmlToPlainText = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    // Get text content and clean up whitespace
    let text = tempDiv.textContent || tempDiv.innerText || '';
    // Replace multiple whitespace with single space, preserve line breaks
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  // Helper to extract quoted content from email body
  const extractQuotedContent = (htmlBody) => {
    if (!htmlBody) return { mainContent: '', quotedContent: '' };

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlBody;

    // First, try to find "On ... wrote:" pattern which is the attribution line
    // This pattern captures various date formats and email attribution styles
    const htmlText = tempDiv.innerHTML;
    const wrotePatterns = [
      // "On Dec 28, 2025, at 6:45 PM, email@example.com wrote:"
      /(<div[^>]*>)?\s*On\s+[A-Z][a-z]{2,8},?\s+[A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4},?\s+(at\s+)?\d{1,2}:\d{2}\s*(AM|PM|am|pm)?,?\s*(<[^>]+>)?[^<]*(<[^>]+>)?\s*wrote:[\s\S]*$/i,
      // "On Fri, Dec 26, 2025 at 4:46 PM <email> wrote:"
      /(<div[^>]*>)?\s*On\s+[A-Z][a-z]{2},?\s+[A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4}\s+(at\s+)?\d{1,2}:\d{2}\s*(AM|PM|am|pm)?\s*(<[^>]+>)?[^<]*(<[^>]+>)?\s*wrote:[\s\S]*$/i,
      // Generic "On ... wrote:" pattern
      /(<div[^>]*>)?\s*On\s+[\s\S]{10,100}?\s+wrote:[\s\S]*$/i,
    ];

    for (const pattern of wrotePatterns) {
      const match = htmlText.match(pattern);
      if (match) {
        const wroteIndex = htmlText.indexOf(match[0]);
        if (wroteIndex > 0) {
          return {
            mainContent: htmlText.substring(0, wroteIndex).trim(),
            quotedContent: htmlText.substring(wroteIndex),
          };
        }
      }
    }

    // Look for common quoted content patterns:
    // 1. Blockquotes
    // 2. Divs with border-left (common in email clients)
    // 3. Gmail's quoted content class
    const quotedElements = tempDiv.querySelectorAll(
      'blockquote, div[style*="border-left"], div[style*="border-left:"], .gmail_quote, div.gmail_extra'
    );

    if (quotedElements.length === 0) {
      return { mainContent: htmlBody, quotedContent: '' };
    }

    // Check if there's a "wrote:" line before the blockquote and include it
    let quotedContent = '';
    quotedElements.forEach(el => {
      // Check if previous sibling contains "wrote:"
      let prevEl = el.previousElementSibling;
      while (prevEl) {
        const prevText = prevEl.textContent || '';
        if (/wrote:\s*$/i.test(prevText)) {
          quotedContent += prevEl.outerHTML;
          prevEl.remove();
          break;
        }
        // Also check for the pattern in the element itself
        if (/On\s+.*wrote:/i.test(prevText)) {
          quotedContent += prevEl.outerHTML;
          prevEl.remove();
          break;
        }
        prevEl = prevEl.previousElementSibling;
      }
      quotedContent += el.outerHTML;
      el.remove(); // Remove from main content
    });

    return {
      mainContent: tempDiv.innerHTML,
      quotedContent: quotedContent,
    };
  };

  const handleCompose = () => {
    setShowCompose(true);
    setIsForwarding(false);
    setSelectedEmail(null);
    setEmailBody(null);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject('');
    setShowCc(false);
    setShowBcc(false);
    setShowCcBccMenu(false);
    setComposeAttachments([]);
    setCurrentDraftId(null);
    lastSavedContentRef.current = '';
    // Clear editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleImportComplete = async (stats) => {
    // Reload emails after import completes
    await loadEmails();
    const message = stats && stats.efficiencyPercent > 0
      ? `You're now ${stats.efficiencyPercent}% more efficient in your email routine!`
      : 'Emails imported successfully!';
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);

    // Start product tour after first import if not completed before
    if (!hasCompletedTour()) {
      setTimeout(() => startTour(), 500);
    }
  };

  // Handle help button click - start or restart the tour
  const handleHelpClick = () => {
    resetTour();
    startTour();
  };

  const handleForward = async (email) => {
    // Clear any previous errors
    setError(null);
    
    // Load full email body if not already loaded
    let emailContent = emailBody;
    if (!emailContent || emailContent.id !== email.id) {
      setLoadingBody(true);
      try {
        const res = await api.get(`/api/v1/emails/${email.id}`);
        emailContent = res.data;
      } catch (err) {
        console.error('Failed to load email for forwarding:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load email for forwarding');
        setLoadingBody(false);
        return;
      } finally {
        setLoadingBody(false);
      }
    }

    // Format forward content (avoid "Fwd: Fwd:" chains)
    const forwardSubject = email.subject?.startsWith('Fwd:')
      ? email.subject
      : `Fwd: ${email.subject || '(no subject)'}`;
    const forwardDate = formatFullDate(email.date);
    const forwardFrom = email.from_name || email.from_email || 'Unknown';
    
    // Create forward body with original email content
    let forwardBody = '';
    if (emailContent?.html_body) {
      forwardBody = `
        <div style="border-left: 3px solid #475569; padding-left: 1rem; margin: 1rem 0; color: #94a3b8;">
          <p style="margin: 0.5rem 0;"><strong>From:</strong> ${forwardFrom} &lt;${email.from_email}&gt;</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${forwardDate}</p>
          <p style="margin: 0.5rem 0;"><strong>Subject:</strong> ${email.subject || '(no subject)'}</p>
          <p style="margin: 0.5rem 0;"><strong>To:</strong> ${email.to_email || ''}</p>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #334155;">
            ${emailContent.html_body}
          </div>
        </div>
      `;
    } else {
      const textBody = emailContent?.text_body || email.snippet || '';
      forwardBody = `
        <div style="border-left: 3px solid #475569; padding-left: 1rem; margin: 1rem 0; color: #94a3b8;">
          <p style="margin: 0.5rem 0;"><strong>From:</strong> ${forwardFrom} &lt;${email.from_email}&gt;</p>
          <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${forwardDate}</p>
          <p style="margin: 0.5rem 0;"><strong>Subject:</strong> ${email.subject || '(no subject)'}</p>
          <p style="margin: 0.5rem 0;"><strong>To:</strong> ${email.to_email || ''}</p>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #334155; white-space: pre-wrap;">${textBody}</div>
        </div>
      `;
    }

    // Set up compose view for forwarding
    setShowCompose(true);
    setIsForwarding(true);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject(forwardSubject);
    setShowCc(false);
    setShowBcc(false);
    setShowCcBccMenu(false);
    
    // Set editor content after a brief delay to ensure editor is ready
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = forwardBody;
      }
    }, 100);
  };

  // Handle reply to an email (inline reply)
  const handleReply = (email) => {
    // Always reply to the latest email in the thread
    const latestEmail = threadEmails.length > 0 
      ? threadEmails[threadEmails.length - 1] 
      : email;
    
    // Set which email we're replying to (use gmail_id for matching in thread view)
    // Store both id and gmail_id for reply endpoint lookup
    setReplyingToEmailId(latestEmail.gmail_id || latestEmail.id);
    
    // Format reply subject
    const replySubject = latestEmail.subject?.startsWith('Re:')
      ? latestEmail.subject
      : `Re: ${latestEmail.subject || '(no subject)'}`;
    
    // Set up reply fields - reply to the sender of the latest email
    setComposeTo(latestEmail.from_email ? [{ email: latestEmail.from_email, display_name: latestEmail.from_name || null }] : []);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject(replySubject);
    setShowCc(false);
    setShowBcc(false);
    setIsForwarding(false);

    // Clear editor content
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        // Focus the editor
        editorRef.current.focus();
      }
    }, 100);
  };

  // Cancel inline reply
  const handleCancelReply = () => {
    setReplyingToEmailId(null);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  // Handle star/unstar an email
  const handleToggleStar = async (email) => {
    try {
      if (email.is_starred) {
        await api.delete(`/api/v1/emails/${email.id}/star`);
      } else {
        await api.post(`/api/v1/emails/${email.id}/star`);
      }

      // Update local state
      setEmails(prev => prev.map(e =>
        e.id === email.id ? { ...e, is_starred: !e.is_starred } : e
      ));

      // Update selected email if it's the one being toggled
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(prev => ({ ...prev, is_starred: !prev.is_starred }));
      }

      setToast({
        show: true,
        message: email.is_starred ? 'Star removed' : 'Email starred',
        type: 'success'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
    } catch (err) {
      console.error('Failed to toggle star:', err);
      setToast({ show: true, message: 'Failed to update star', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    }
  };

  // Handle archive an email
  const handleArchive = async (email) => {
    try {
      await api.post(`/api/v1/emails/${email.id}/archive`);

      // Remove from list
      setEmails(prev => prev.filter(e => e.id !== email.id));

      // Clear selection if archived email was selected
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
        setEmailBody(null);
      }

      setToast({ show: true, message: 'Email archived', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
    } catch (err) {
      console.error('Failed to archive email:', err);
      setToast({ show: true, message: 'Failed to archive email', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    }
  };

  // Handle delete/trash an email
  const handleDelete = async (email) => {
    try {
      await api.post(`/api/v1/emails/${email.id}/trash`);

      // Remove from list
      setEmails(prev => prev.filter(e => e.id !== email.id));

      // Clear selection if deleted email was selected
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
        setEmailBody(null);
      }

      setToast({ show: true, message: 'Email moved to trash', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
    } catch (err) {
      console.error('Failed to delete email:', err);
      setToast({ show: true, message: 'Failed to delete email', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    }
  };

  const closeCompose = () => {
    // Clear auto-save timer
    if (draftAutoSaveTimerRef.current) {
      clearTimeout(draftAutoSaveTimerRef.current);
      draftAutoSaveTimerRef.current = null;
    }
    setShowCompose(false);
    setIsForwarding(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject('');
    setShowCc(false);
    setShowBcc(false);
    setShowCcBccMenu(false);
    setComposeAttachments([]);
    setCurrentDraftId(null);
    lastSavedContentRef.current = '';
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  // Load drafts for the current account
  const loadDrafts = async () => {
    if (accounts.length === 0) return;
    try {
      const accountId = accounts[0].id;
      const res = await api.get(`/api/v1/drafts/${accountId}`);
      setDrafts(res.data.drafts || []);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  };

  // Save draft (create or update)
  const saveDraft = async (showNotification = true) => {
    if (accounts.length === 0) return null;

    const accountId = accounts[0].id;
    const htmlContent = editorRef.current?.innerHTML || '';

    // Helper to convert contact array to email string
    const contactsToEmailString = (contacts) => {
      return contacts.map((c) => c.email).join(', ');
    };

    const toEmails = contactsToEmailString(composeTo);
    const ccEmails = contactsToEmailString(composeCc);
    const bccEmails = contactsToEmailString(composeBcc);

    // Build content signature for comparison
    const contentSignature = JSON.stringify({
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      subject: composeSubject,
      body: htmlContent,
    });

    // Skip if content hasn't changed
    if (contentSignature === lastSavedContentRef.current) {
      return currentDraftId;
    }

    // Skip if compose is empty
    if (!toEmails && !ccEmails && !bccEmails &&
        !composeSubject.trim() && !htmlContent.trim()) {
      return null;
    }

    setSavingDraft(true);
    try {
      const payload = {
        to_email: toEmails || null,
        cc_email: ccEmails || null,
        bcc_email: bccEmails || null,
        subject: composeSubject.trim() || null,
        body_html: htmlContent || null,
        attachments: composeAttachments.length > 0
          ? JSON.stringify(composeAttachments.map(a => ({ filename: a.filename, content_type: a.content_type })))
          : null,
      };

      let draftId = currentDraftId;

      if (currentDraftId) {
        // Update existing draft
        await api.put(`/api/v1/drafts/${accountId}/${currentDraftId}`, payload);
      } else {
        // Create new draft
        const res = await api.post(`/api/v1/drafts/${accountId}`, payload);
        draftId = res.data.id;
        setCurrentDraftId(draftId);
      }

      lastSavedContentRef.current = contentSignature;

      if (showNotification) {
        setToast({ show: true, message: 'Draft saved', type: 'success' });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
      }

      // Reload drafts list
      await loadDrafts();

      return draftId;
    } catch (err) {
      console.error('Failed to save draft:', err);
      if (showNotification) {
        setToast({ show: true, message: 'Failed to save draft', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
      }
      return null;
    } finally {
      setSavingDraft(false);
    }
  };

  // Delete a draft
  const deleteDraft = async (draftId) => {
    if (!draftId || accounts.length === 0) return;
    try {
      const accountId = accounts[0].id;
      await api.delete(`/api/v1/drafts/${accountId}/${draftId}`);
      await loadDrafts();
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  // Helper to convert email string to contact array
  const emailStringToContacts = (emailStr) => {
    if (!emailStr) return [];
    return emailStr.split(',').map((e) => e.trim()).filter(Boolean).map((email) => ({
      email,
      display_name: null,
    }));
  };

  // Open a draft for editing
  const openDraft = (draft) => {
    setShowCompose(true);
    setIsForwarding(false);
    setCurrentDraftId(draft.id);
    setComposeTo(emailStringToContacts(draft.to_email));
    setComposeCc(emailStringToContacts(draft.cc_email));
    setComposeBcc(emailStringToContacts(draft.bcc_email));
    setComposeSubject(draft.subject || '');
    setShowCc(!!draft.cc_email);
    setShowBcc(!!draft.bcc_email);
    setShowCcBccMenu(false);

    // Set content signature to prevent immediate re-save
    lastSavedContentRef.current = JSON.stringify({
      to: draft.to_email || '',
      cc: draft.cc_email || '',
      bcc: draft.bcc_email || '',
      subject: draft.subject || '',
      body: draft.body_html || '',
    });

    // Set editor content
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = draft.body_html || '';
      }
    }, 100);
  };

  // Auto-save effect - saves draft every 30 seconds while compose is open
  useEffect(() => {
    if (!showCompose) return;

    // Set up auto-save interval
    draftAutoSaveTimerRef.current = setInterval(() => {
      saveDraft(false); // Silent save (no notification)
    }, 30000); // 30 seconds

    return () => {
      if (draftAutoSaveTimerRef.current) {
        clearInterval(draftAutoSaveTimerRef.current);
        draftAutoSaveTimerRef.current = null;
      }
    };
  }, [showCompose]);

  // Load drafts when accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      loadDrafts();
    }
  }, [accounts]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Remove the data:...;base64, prefix
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(file);
        });

        return {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          data: base64,
          size: file.size,
        };
      })
    );

    setComposeAttachments((prev) => [...prev, ...newAttachments]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async (skipSubjectCheck = false) => {
    // Clear previous errors
    setError(null);

    // Helper to convert contact array to email string
    const contactsToEmailString = (contacts) => {
      return contacts.map((c) => c.email).join(', ');
    };

    const toEmails = contactsToEmailString(composeTo);
    const ccEmails = contactsToEmailString(composeCc);
    const bccEmails = contactsToEmailString(composeBcc);

    // Check if at least one recipient is provided (to, cc, or bcc)
    if (!toEmails && !ccEmails && !bccEmails) {
      setErrorModalMessage('Please specify at least one recipient');
      setShowErrorModal(true);
      return;
    }

    // Check attachment size (max 25MB total)
    const totalAttachmentSize = composeAttachments.reduce((total, att) => {
      const base64Size = att.data ? (att.data.length * 3) / 4 : 0;
      return total + base64Size;
    }, 0);
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (totalAttachmentSize > maxSize) {
      setErrorModalMessage('Total attachment size exceeds 25MB. Please remove some attachments.');
      setShowErrorModal(true);
      return;
    }

    // Confirm if no subject
    if (!composeSubject.trim() && !skipSubjectCheck) {
      setShowConfirmSendModal(true);
      return;
    }

    setSendingEmail(true);

    // Show sending toast
    setToast({ show: true, message: 'Sending email...', type: 'info' });

    try {
      const htmlContent = editorRef.current?.innerHTML || '';

      // Get account_id from the first account if available
      const accountId = accounts.length > 0 ? accounts[0].id : null;

      const payload = {
        to: toEmails,
        subject: composeSubject.trim(),
        body: htmlContent,
        ...(ccEmails && { cc: ccEmails }),
        ...(bccEmails && { bcc: bccEmails }),
        ...(composeAttachments.length > 0 && {
          attachments: composeAttachments.map(att => ({
            filename: att.filename,
            content_type: att.content_type,
            data: att.data,
          }))
        }),
      };

      const params = accountId ? { account_id: accountId } : {};

      // If replying inline, use the reply endpoint
      if (replyingToEmailId && selectedEmail) {
        // Find the email being replied to in the thread to get its local database id
        const emailToReplyTo = threadEmails.find(e => 
          e.gmail_id === replyingToEmailId || e.id === replyingToEmailId
        );
        
        // Use the email's local id if available, otherwise use selectedEmail's id as fallback
        // (selectedEmail should always have an id since it's from our database)
        const replyEmailId = emailToReplyTo?.id || selectedEmail.id;
        
        await api.post(`/api/v1/emails/${replyEmailId}/reply`, {
          body: htmlContent,
          ...(ccEmails && { cc: ccEmails }),
          ...(bccEmails && { bcc: bccEmails }),
          ...(composeAttachments.length > 0 && {
            attachments: composeAttachments.map(att => ({
              filename: att.filename,
              content_type: att.content_type,
              data: att.data,
            }))
          }),
        }, { params });
        
        // Refetch the thread to show the new reply and update cache
        try {
          const threadRes = await api.get(`/api/v1/emails/${selectedEmail.id}/thread`);
          const threadData = threadRes.data;
          
          // Update cache with fresh data
          if (threadData.thread_id) {
            setThreadCache(prev => {
              const newCache = new Map(prev);
              newCache.set(threadData.thread_id, threadData);
              return newCache;
            });
          }
          
          setThreadEmails(threadData.emails || []);
        } catch (threadErr) {
          console.error('Failed to refetch thread:', threadErr);
        }
        
        // Clear inline reply state
        handleCancelReply();
      } else {
        // Regular send (new email or forward)
      await api.post('/api/v1/emails/send', payload, { params });

      // Delete draft if it exists (before closing compose clears the ID)
      if (currentDraftId) {
        await deleteDraft(currentDraftId);
      }

      // Clear error and reset compose state
      setError(null);
      closeCompose();
      }

      // Show success toast
      const successMessage = isForwarding ? 'Email forwarded successfully' : 
                            replyingToEmailId ? 'Reply sent successfully' : 
                            'Email sent successfully';
      setToast({ show: true, message: successMessage, type: 'success' });
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'info' });
      }, 3000);
    } catch (err) {
      console.error('Failed to send email:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to send email');

      // Show error toast
      setToast({ show: true, message: 'Failed to send email', type: 'error' });
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'info' });
      }, 3000);
    } finally {
      setSendingEmail(false);
    }
  };

  const connectAccount = (providerName) => {
    const token = localStorage.getItem('token');
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/accounts/connect/${providerName}?token=${encodeURIComponent(token)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setEmailBody(null);
    setLoadingBody(true);
    setLoadingThread(true);
    setShowFullContent(false);
    setReplyingToEmailId(null); // Clear any active reply
    // Expand the selected email by default in the thread view
    const emailKey = email.gmail_id || email.id;
    if (emailKey) {
      setExpandedEmails(new Set([emailKey]));
    }

    // Check if we have this thread cached
    const cachedThread = threadCache.get(email.thread_id);
    if (cachedThread) {
      // Use cached thread data
      setThreadEmails(cachedThread.emails || []);
      const selectedEmailInThread = cachedThread.emails?.find(e => 
        e.id === email.id || e.gmail_id === email.gmail_id
      ) || cachedThread.emails?.[0];
      if (selectedEmailInThread) {
        setEmailBody({
          text_body: selectedEmailInThread.text_body,
          html_body: selectedEmailInThread.html_body,
          attachments: selectedEmailInThread.attachments || [],
        });
      }
      setLoadingBody(false);
      setLoadingThread(false);
      
      // Mark as read if unread (still do this even with cached data)
      if (!email.is_read) {
        await api.patch(`/api/v1/emails/${email.id}/read`);
        setEmails(prev => {
          const updated = prev.map(e => e.id === email.id ? { ...e, is_read: true } : e);
          return Array.from(
            new Map(updated.map(e => [e.id, e])).values()
          );
        });
      }
      return;
    }

    // No cache - fetch from API
    setThreadEmails([]);
    try {
      // Fetch the full thread from Gmail
      const threadRes = await api.get(`/api/v1/emails/${email.id}/thread`);
      const threadData = threadRes.data;
      
      // Cache the thread data
      if (threadData.thread_id) {
        setThreadCache(prev => {
          const newCache = new Map(prev);
          newCache.set(threadData.thread_id, threadData);
          return newCache;
        });
      }
      
      // Set thread emails (already sorted by date from backend)
      setThreadEmails(threadData.emails || []);
      
      // Set the selected email's body (find by id or gmail_id, fallback to first email)
      const selectedEmailInThread = threadData.emails?.find(e => 
        e.id === email.id || e.gmail_id === email.gmail_id
      ) || threadData.emails?.[0];
      if (selectedEmailInThread) {
        setEmailBody({
          text_body: selectedEmailInThread.text_body,
          html_body: selectedEmailInThread.html_body,
          attachments: selectedEmailInThread.attachments || [],
        });
      }

      // Mark as read if unread
      if (!email.is_read) {
        await api.patch(`/api/v1/emails/${email.id}/read`);
        setEmails(prev => {
          const updated = prev.map(e => e.id === email.id ? { ...e, is_read: true } : e);
          return Array.from(
            new Map(updated.map(e => [e.id, e])).values()
          );
        });
      }
    } catch (err) {
      console.error('Failed to load email thread:', err);
      setError(err.response?.data?.detail || err.message);
      // Fallback to single email if thread fetch fails
      try {
        const res = await api.get(`/api/v1/emails/${email.id}`);
        setEmailBody(res.data);
      } catch (fallbackErr) {
        console.error('Failed to load email body:', fallbackErr);
      }
    } finally {
      setLoadingBody(false);
      setLoadingThread(false);
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Dark mode styles for email content
  const darkModeStyles = `
    <style>
      html, body {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
        margin: 0 !important;
        padding: 24px 32px !important;
      }
      * {
        color: #e2e8f0 !important;
        border-color: #334155 !important;
      }
      div, td, th, tr, table, section, article, header, footer, main, aside, nav, p, span, li, ul, ol {
        background-color: transparent !important;
      }
      body > *, table, td {
        background-color: #0f172a !important;
      }
      a { color: #60a5fa !important; }
      h1, h2, h3, h4, h5, h6 { color: #f1f5f9 !important; }
      strong, b { color: #ffffff !important; }
      img {
        opacity: 0.9;
      }
    </style>
    <script>
      document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (link && link.href) {
          e.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
        }
      });
    </script>
  `;

  // Category tabs for filtering
  const categories = [
    { id: 'primary', label: 'Primary' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'notifications', label: 'Notifications' },
  ];

  // Filter emails by category
  const getFilteredEmails = () => {
    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase() || 'primary';

      if (activeCategory === 'primary') {
        // Primary includes emails without category or with 'primary' category
        return !emailCategory || emailCategory === 'primary' ||
               !['promotions', 'notifications', 'updates', 'social'].includes(emailCategory);
      }

      if (activeCategory === 'notifications') {
        // Notifications includes 'notifications', 'updates', 'social'
        return ['notifications', 'updates', 'social'].includes(emailCategory);
      }

      return emailCategory === activeCategory;
    });
  };

  const filteredEmails = getFilteredEmails();

  // Get promotions from last 7 days for the board
  const getRecentPromotions = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase();
      const emailDate = new Date(email.date);
      return emailCategory === 'promotions' && emailDate >= sevenDaysAgo;
    });
  };

  const recentPromotions = getRecentPromotions();

  // Get unread notifications
  const getUnreadNotifications = () => {
    return emails.filter(email => {
      const emailCategory = email.analysis?.category?.toLowerCase();
      return ['notifications', 'updates', 'social'].includes(emailCategory) && !email.is_read;
    });
  };

  const unreadNotifications = getUnreadNotifications();

  // Dismiss notification (mark as read without opening)
  const dismissNotification = async (e, email) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/v1/emails/${email.id}/read`);
      setEmails(emails.map(e => e.id === email.id ? { ...e, is_read: true } : e));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleSelectOption = (option) => {
    const newSelected = new Set();
    switch (option) {
      case 'All':
        emails.forEach(email => newSelected.add(email.id));
        break;
      case 'None':
        break;
      case 'Read':
        emails.filter(email => email.is_read).forEach(email => newSelected.add(email.id));
        break;
      case 'Unread':
        emails.filter(email => !email.is_read).forEach(email => newSelected.add(email.id));
        break;
      case 'Starred':
        emails.filter(email => email.is_starred).forEach(email => newSelected.add(email.id));
        break;
      case 'Unstarred':
        emails.filter(email => !email.is_starred).forEach(email => newSelected.add(email.id));
        break;
    }
    setSelectedEmails(newSelected);
  };

  const toggleEmailSelection = (emailId) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const markAllAsRead = async () => {
    try {
      const unreadEmails = emails.filter(email => !email.is_read);
      await Promise.all(unreadEmails.map(email => 
        api.patch(`/api/v1/emails/${email.id}/read`)
      ));
      setEmails(emails.map(email => ({ ...email, is_read: true })));
      setShowMoreMenu(false);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError(err.response?.data?.detail || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header user={user} showMenuButton onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} onHelpClick={handleHelpClick} />
        <Sidebar user={user} draftsCount={drafts.length} isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <main className="pt-14 min-h-screen flex items-center justify-center ml-0 md:ml-16">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Check if we're on the drafts folder
  const isDraftsFolder = location.pathname.includes('/drafts');

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} showMenuButton onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} onHelpClick={handleHelpClick} />
      <Sidebar user={user} draftsCount={drafts.length} isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      {/* Loading Progress Bar - below header */}
      {(syncing || loadingEmails) && (
        <div className="fixed top-14 left-0 md:left-16 right-0 h-1 bg-slate-800/50 z-50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-loading-bar" />
        </div>
      )}

      <main className="pt-14 h-screen overflow-hidden flex flex-col ml-0 md:ml-16">
        {error && (
          <div className="flex-shrink-0 bg-red-900/30 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              </div>
              <h2 className="text-xl font-normal text-gray-200 mb-2">Connect your email</h2>
              <p className="text-gray-400 mb-8">Connect an email account to get started</p>
              <div className="flex flex-col gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => connectAccount(provider.name)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Connect {provider.display_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Email List - Left Panel */}
            <div className="w-[420px] flex-shrink-0 border-r border-slate-700 flex flex-col">
              {/* List Header / Toolbar */}
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-700">
                {/* Left side - Search, More menu and count */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2 hover:bg-slate-800 rounded-full transition-colors ${showSearch ? 'bg-slate-800' : ''}`}
                    title="Search"
                  >
                    <svg className={`w-4 h-4 ${showSearch ? 'text-blue-400' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="More options"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500 ml-1">{filteredEmails.length}</span>
                </div>

                {/* Right side - Thread toggle, Unread filter, Refresh, Compose */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleThreadView}
                    className={`p-2 rounded-full transition-colors ${useThreadView ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-gray-400'}`}
                    title={useThreadView ? 'Switch to email view' : 'Switch to thread view'}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="Show unread only"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </button>
                  <button
                    data-tour="sync-button"
                    onClick={() => syncEmails(false)}
                    disabled={syncing}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title={formatLastSynced()}
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  </button>
                  <button
                    data-tour="compose-button"
                    onClick={handleCompose}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    title="Compose"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search Bar - Expandable */}
              {showSearch && (
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800/50">
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                    title="Close search"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search emails..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                      title="Clear"
                    >
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Category Tabs - Only show on main inbox */}
              {location.pathname === '/mail/inbox' && (
                <div className="flex-shrink-0 flex gap-2 p-3 border-b border-slate-700">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      data-tour={`category-${category.id}`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        localStorage.setItem('inbox_category', category.id);
                        setSelectedEmail(null);
                        setEmailBody(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-gray-200 border border-slate-600/50'
                      }`}
                    >
                      {category.id === 'primary' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                      {category.id === 'promotions' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                        </svg>
                      )}
                      {category.id === 'notifications' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                        </svg>
                      )}
                      {category.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Email List / Drafts List */}
              <div className="flex-1 overflow-y-auto relative" data-tour="primary-board" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
                {/* Loading Overlay */}
                {loadingEmails && !isDraftsFolder && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {isDraftsFolder ? (
                  // Drafts folder view
                  drafts.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400">No drafts</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-800/30 group"
                        >
                          <div className="flex-1 min-w-0" onClick={() => openDraft(draft)}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm truncate text-gray-300">
                                {draft.to_email || '(no recipient)'}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatDate(draft.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm truncate text-gray-400">
                              {draft.subject || '(no subject)'}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {draft.body_html ? draft.body_html.replace(/<[^>]*>/g, '').substring(0, 100) : '(empty)'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this draft?')) {
                                deleteDraft(draft.id);
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete draft"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : useThreadView ? (
                  // Thread view
                  threads.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 mb-4">No conversations</p>
                      <button
                        onClick={() => syncEmails(false)}
                        disabled={syncing}
                        className="text-blue-500 hover:text-blue-400 text-sm"
                      >
                        Sync emails
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {threads.map((thread) => (
                        <div
                          key={thread.thread_id}
                          className={`rounded-lg border bg-slate-800/40 overflow-hidden transition-all duration-200 ${
                            thread.has_unread
                              ? 'border-l-2 border-l-blue-500 border-t-slate-700 border-r-slate-700 border-b-slate-700'
                              : 'border-slate-700'
                          } ${
                            expandedThreads.has(thread.thread_id) || selectedEmail?.thread_id === thread.thread_id
                              ? 'border-slate-600 bg-slate-800/60'
                              : 'hover:border-slate-600 hover:bg-slate-800/50'
                          } ${newEmailIds.has(thread.thread_id) ? 'animate-slide-in-top' : ''}`}
                        >
                          {/* Thread header row */}
                          <div
                            onClick={() => {
                              if (thread.email_count === 1) {
                                handleSelectEmail(thread.emails[0]);
                              } else {
                                toggleThreadExpansion(thread.thread_id);
                              }
                            }}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className={`text-sm truncate ${thread.has_unread ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                                    {thread.participants.slice(0, 3).join(', ')}
                                    {thread.participant_count > 3 && ` +${thread.participant_count - 3}`}
                                  </p>
                                  {thread.email_count > 1 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full flex-shrink-0 font-medium">
                                      {thread.email_count}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {thread.is_starred && (
                                    <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatDate(thread.latest_date)}
                                  </span>
                                </div>
                              </div>
                              <p className={`text-sm truncate mt-0.5 ${thread.has_unread ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
                                {thread.subject || '(no subject)'}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {decodeHtmlEntities(thread.snippet)}
                              </p>
                            </div>
                            {thread.email_count > 1 && (
                              <div className="flex-shrink-0 text-gray-500 mt-1">
                                <svg
                                  className={`w-4 h-4 transition-transform duration-200 ${expandedThreads.has(thread.thread_id) ? 'rotate-180' : ''}`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Expanded thread emails */}
                          {expandedThreads.has(thread.thread_id) && thread.email_count > 1 && (
                            <div className="border-t border-slate-700/50 bg-slate-900/30 px-3 py-2 space-y-1.5 animate-expand-thread">
                              {thread.emails.map((email, idx) => (
                                <div
                                  key={email.id}
                                  onClick={() => handleSelectEmail(email)}
                                  className={`rounded-md px-3 py-2 cursor-pointer transition-all duration-150 ${
                                    selectedEmail?.id === email.id
                                      ? 'bg-blue-500/20 border border-blue-500/30'
                                      : 'bg-slate-800/50 border border-transparent hover:bg-slate-700/50 hover:border-slate-600/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-100' : 'text-gray-400'}`}>
                                      {email.from_name || email.from_email || 'Unknown'}
                                    </p>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                      {formatDate(email.date)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {decodeHtmlEntities(email.snippet)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Regular email list view
                  filteredEmails.length === 0 ? (
                    (() => {
                      const path = location.pathname;
                      const getEmptyStateConfig = () => {
                        if (path.includes('/starred')) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                            title: 'No starred emails',
                            description: 'Star emails to find them easily later.'
                          };
                        }
                        if (path.includes('/sent')) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
                            title: 'No sent emails',
                            description: 'Emails you send will appear here.'
                          };
                        }
                        if (path.includes('/drafts')) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
                            title: 'No drafts',
                            description: 'Drafts you start will be saved here.'
                          };
                        }
                        if (path.includes('/trash')) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
                            title: 'Trash is empty',
                            description: 'Deleted emails will appear here.'
                          };
                        }
                        if (path.includes('/spam')) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
                            title: 'No spam',
                            description: 'Spam messages will appear here.'
                          };
                        }
                        if (searchQuery) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
                            title: 'No results found',
                            description: `No emails match "${searchQuery}". Try a different search term.`
                          };
                        }
                        if (emails.length === 0) {
                          return {
                            icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                            title: 'No emails yet',
                            description: 'Sync your inbox to see your emails.',
                            action: { label: 'Sync emails', onClick: () => syncEmails(false) }
                          };
                        }
                        return {
                          icon: <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                          title: `No ${activeCategory} emails`,
                          description: 'Switch categories or sync to see more emails.'
                        };
                      };
                      const config = getEmptyStateConfig();
                      return <EmptyState {...config} />;
                    })()
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => handleSelectEmail(email)}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-300 ${
                            selectedEmail?.id === email.id
                              ? 'bg-slate-800'
                              : !email.is_read
                              ? 'bg-slate-900 hover:bg-slate-800/50'
                              : 'hover:bg-slate-800/30'
                          } ${newEmailIds.has(email.id) ? 'animate-slide-in-top' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>
                                {email.from_name || email.from_email || 'Unknown'}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatDate(email.date)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
                              {email.subject || '(no subject)'}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-xs text-gray-500 truncate flex-1">
                                {decodeHtmlEntities(email.snippet)}
                              </p>
                              {email.analysis?.priority && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                                  email.analysis.priority === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : email.analysis.priority === 'medium'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-slate-700 text-gray-400'
                                }`}>
                                  {email.analysis.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredEmails.length > 0 && (
                        <div className="border-t border-slate-700/50"></div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Pagination Bar - aligned with sidebar profile */}
              <div className="flex-shrink-0 flex items-center justify-between px-3 border-t border-slate-700 bg-slate-800/50 h-[52px]">
                {/* Page Info */}
                <div className="text-xs text-gray-500">
                  {useThreadView ? (
                    totalThreads > 0 ? (
                      <>
                        {((page - 1) * limit) + 1}-{Math.min(page * limit, totalThreads)} of {totalThreads} {totalThreads === 1 ? 'thread' : 'threads'}
                      </>
                    ) : (
                      '0 threads'
                    )
                  ) : totalEmails > 0 ? (
                    <>
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, totalEmails)} of {totalEmails}
                    </>
                  ) : (
                    '0 emails'
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Limit Selector */}
                  <select
                    value={limit}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setLimit(newLimit);
                      setPage(1);
                      localStorage.setItem('inbox_limit', newLimit.toString());
                    }}
                    className="bg-slate-700 border border-slate-600 rounded text-xs text-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>{totalEmails <= 200 ? 'All' : '200'}</option>
                  </select>

                  {/* Prev/Next Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-400 min-w-[3rem] text-center">
                      Page {page}
                    </span>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * limit >= (useThreadView ? totalThreads : totalEmails)}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Viewer - Right Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {showCompose ? (
                /* Compose Email View */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* API Error Message (not validation errors) */}
                  {error && !showErrorModal && (
                    <div className="flex-shrink-0 bg-red-900/30 border-l-4 border-red-500 p-4 m-4 rounded">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Compose Header */}
                  <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-medium text-white">
                      {isForwarding ? 'Forward' : 'New Message'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEmail ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                            Send
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => saveDraft(true)}
                        disabled={savingDraft}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
                        title="Save Draft"
                      >
                        {savingDraft ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                        )}
                        {savingDraft ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={closeCompose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                        title="Close"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* To Field */}
                  <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
                    <div className="flex items-start gap-2">
                      <label className="w-16 text-sm text-gray-500 pt-2">To</label>
                      <div className="flex-1">
                        <ContactAutocomplete
                          value={composeTo}
                          onChange={setComposeTo}
                          accountId={accounts.length > 0 ? accounts[0].id : null}
                          placeholder="recipient@example.com"
                        />
                      </div>
                      {/* Add Cc/Bcc dropdown */}
                      {(!showCc || !showBcc) && (
                        <div className="relative pt-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCcBccMenu(!showCcBccMenu);
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300"
                            title="Add Cc/Bcc"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                          {showCcBccMenu && (
                            <div
                              className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1 min-w-[100px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!showCc && (
                                <button
                                  onClick={() => {
                                    setShowCc(true);
                                    setShowCcBccMenu(false);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                                >
                                  Add Cc
                                </button>
                              )}
                              {!showBcc && (
                                <button
                                  onClick={() => {
                                    setShowBcc(true);
                                    setShowCcBccMenu(false);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                                >
                                  Add Bcc
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cc Field */}
                  {showCc && (
                    <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
                      <div className="flex items-start gap-2">
                        <label className="w-16 text-sm text-gray-500 pt-2">Cc</label>
                        <div className="flex-1">
                          <ContactAutocomplete
                            value={composeCc}
                            onChange={setComposeCc}
                            accountId={accounts.length > 0 ? accounts[0].id : null}
                            placeholder="cc@example.com"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setShowCc(false);
                            setComposeCc([]);
                          }}
                          className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300 mt-1.5"
                          title="Remove Cc"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bcc Field */}
                  {showBcc && (
                    <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
                      <div className="flex items-start gap-2">
                        <label className="w-16 text-sm text-gray-500 pt-2">Bcc</label>
                        <div className="flex-1">
                          <ContactAutocomplete
                            value={composeBcc}
                            onChange={setComposeBcc}
                            accountId={accounts.length > 0 ? accounts[0].id : null}
                            placeholder="bcc@example.com"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setShowBcc(false);
                            setComposeBcc([]);
                          }}
                          className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-300 mt-1.5"
                          title="Remove Bcc"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subject Field */}
                  <div className="flex-shrink-0 flex items-center px-6 py-3 border-b border-slate-700/50">
                    <label className="w-16 text-sm text-gray-500">Subject</label>
                    <input
                      type="text"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Enter subject"
                      className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm"
                    />
                  </div>

                  {/* Rich Text Toolbar */}
                  <div className="flex-shrink-0 flex items-center gap-1 px-6 py-2 border-b border-slate-700/50 flex-wrap">
                    {/* Text Formatting */}
                    <button onClick={() => execFormat('bold')} className={`p-2 rounded transition-colors ${editorFormats.bold ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Bold">
                      <span className="font-bold text-sm">B</span>
                    </button>
                    <button onClick={() => execFormat('italic')} className={`p-2 rounded transition-colors ${editorFormats.italic ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Italic">
                      <span className="italic text-sm">I</span>
                    </button>
                    <button onClick={() => execFormat('underline')} className={`p-2 rounded transition-colors ${editorFormats.underline ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Underline">
                      <span className="underline text-sm">U</span>
                    </button>
                    <button onClick={() => execFormat('strikeThrough')} className={`p-2 rounded transition-colors ${editorFormats.strikeThrough ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Strikethrough">
                      <span className="line-through text-sm">S</span>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Lists */}
                    <button onClick={() => execFormat('insertUnorderedList')} className={`p-2 rounded transition-colors ${editorFormats.insertUnorderedList ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Bullet List">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="9" y1="6" x2="20" y2="6" />
                        <line x1="9" y1="12" x2="20" y2="12" />
                        <line x1="9" y1="18" x2="20" y2="18" />
                        <circle cx="4" cy="6" r="1" fill="currentColor" />
                        <circle cx="4" cy="12" r="1" fill="currentColor" />
                        <circle cx="4" cy="18" r="1" fill="currentColor" />
                      </svg>
                    </button>
                    <button onClick={() => execFormat('insertOrderedList')} className={`p-2 rounded transition-colors ${editorFormats.insertOrderedList ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Numbered List">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="10" y1="6" x2="20" y2="6" />
                        <line x1="10" y1="12" x2="20" y2="12" />
                        <line x1="10" y1="18" x2="20" y2="18" />
                        <text x="3" y="8" fontSize="8" fill="currentColor">1</text>
                        <text x="3" y="14" fontSize="8" fill="currentColor">2</text>
                        <text x="3" y="20" fontSize="8" fill="currentColor">3</text>
                      </svg>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Alignment */}
                    <button onClick={() => execFormat('justifyLeft')} className={`p-2 rounded transition-colors ${editorFormats.justifyLeft ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Align Left">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="15" y2="12" />
                        <line x1="3" y1="18" x2="18" y2="18" />
                      </svg>
                    </button>
                    <button onClick={() => execFormat('justifyCenter')} className={`p-2 rounded transition-colors ${editorFormats.justifyCenter ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Align Center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="6" y1="12" x2="18" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                      </svg>
                    </button>
                    <button onClick={() => execFormat('justifyRight')} className={`p-2 rounded transition-colors ${editorFormats.justifyRight ? 'bg-slate-600 text-white' : 'hover:bg-slate-700 text-gray-400 hover:text-white'}`} title="Align Right">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="9" y1="12" x2="21" y2="12" />
                        <line x1="6" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Headings */}
                    <button onClick={() => execFormat('formatBlock', 'h1')} className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold" title="Heading 1">
                      H1
                    </button>
                    <button onClick={() => execFormat('formatBlock', 'h2')} className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold" title="Heading 2">
                      H2
                    </button>
                    <button onClick={() => execFormat('formatBlock', 'h3')} className="px-2 py-1 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white text-xs font-bold" title="Heading 3">
                      H3
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Quote & Code */}
                    <button onClick={() => execFormat('formatBlock', 'blockquote')} className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white" title="Quote">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                      </svg>
                    </button>
                    <button onClick={() => execFormat('formatBlock', 'pre')} className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white" title="Code Block">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Link */}
                    <button
                      onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) execFormat('createLink', url);
                      }}
                      className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white"
                      title="Insert Link"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Undo/Redo */}
                    <button onClick={() => execFormat('undo')} className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white" title="Undo">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7v6h6" />
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                      </svg>
                    </button>
                    <button onClick={() => execFormat('redo')} className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white" title="Redo">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 7v6h-6" />
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                      </svg>
                    </button>

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* Attachment */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-400 hover:text-white"
                      title="Attach files"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="w-px h-5 bg-slate-600 mx-1" />

                    {/* AI Compose */}
                    <button
                      onClick={() => setShowAIComposeModal(true)}
                      disabled={composeTo.length === 0}
                      className={`p-2 rounded transition-colors ${
                        composeTo.length > 0
                          ? 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 text-purple-400 hover:text-purple-300'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                      title={composeTo.length > 0 ? 'AI Compose' : 'Enter recipient first'}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
                      </svg>
                    </button>
                  </div>

                  {/* Editor Content */}
                  <div className="flex-1 overflow-y-auto">
                    <style>{`
                      .compose-editor ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                        margin: 0.5rem 0;
                      }
                      .compose-editor ol {
                        list-style-type: decimal;
                        padding-left: 1.5rem;
                        margin: 0.5rem 0;
                      }
                      .compose-editor li {
                        color: #e2e8f0;
                        margin: 0.25rem 0;
                      }
                      .compose-editor li::marker {
                        color: #9ca3af;
                      }
                      .compose-editor blockquote {
                        border-left: 3px solid #475569;
                        padding-left: 1rem;
                        margin: 0.5rem 0;
                        color: #9ca3af;
                        font-style: italic;
                      }
                      .compose-editor pre {
                        background: #1e293b;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        font-family: monospace;
                        margin: 0.5rem 0;
                      }
                      .compose-editor h1 { font-size: 1.5rem; font-weight: 600; margin: 0.5rem 0; }
                      .compose-editor h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0; }
                      .compose-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
                      .compose-editor a { color: #60a5fa; text-decoration: underline; }
                    `}</style>
                    <div
                      ref={editorRef}
                      contentEditable
                      className="compose-editor min-h-full p-6 text-gray-200 outline-none"
                      style={{
                        minHeight: '300px',
                        lineHeight: '1.6'
                      }}
                      onKeyUp={updateEditorFormats}
                      onMouseUp={updateEditorFormats}
                      onKeyDown={(e) => {
                        // Handle tab key for indentation
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          execFormat('insertText', '\t');
                        }
                      }}
                    />
                  </div>

                  {/* Attachments List */}
                  {composeAttachments.length > 0 && (
                    <div className="flex-shrink-0 px-6 py-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span className="text-sm text-gray-400">
                          {composeAttachments.length} attachment{composeAttachments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {composeAttachments.map((att, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 group"
                          >
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                              <polyline points="13 2 13 9 20 9" />
                            </svg>
                            <span className="text-sm text-gray-300 max-w-[150px] truncate">{att.filename}</span>
                            <span className="text-xs text-gray-500">
                              {(att.size / 1024).toFixed(0)} KB
                            </span>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="p-0.5 hover:bg-slate-700 rounded text-gray-500 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="flex-shrink-0 p-6 border-b border-slate-700">
                    {/* Back Button for Promotions/Notifications */}
                    {(activeCategory === 'promotions' || activeCategory === 'notifications') && (
                      <button
                        onClick={() => {
                          setSelectedEmail(null);
                          setEmailBody(null);
                        }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to {activeCategory === 'promotions' ? 'Deals' : 'Notifications'}
                      </button>
                    )}
                    {/* Subject and Action Buttons */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-xl font-semibold text-white flex-1">
                        {selectedEmail.subject || '(no subject)'}
                      </h2>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Reply */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReply(selectedEmail); }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="Reply"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 17 4 12 9 7" />
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                          </svg>
                        </button>
                        {/* Forward */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleForward(selectedEmail);
                          }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="Forward"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 17 20 12 15 7" />
                            <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                          </svg>
                        </button>
                        {/* Archive */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchive(selectedEmail); }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                          title="Archive"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="21 8 21 21 3 21 3 8" />
                            <rect x="1" y="3" width="22" height="5" />
                            <line x1="10" y1="12" x2="14" y2="12" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(selectedEmail); }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        {/* Star */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(selectedEmail); }}
                          className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${selectedEmail.is_starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          title={selectedEmail.is_starred ? 'Unstar' : 'Star'}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={selectedEmail.is_starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {getInitials(selectedEmail.from_name || selectedEmail.from_email)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {selectedEmail.from_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedEmail.from_email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFullDate(selectedEmail.date)}
                      </p>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="flex-1 overflow-y-auto min-h-0 relative">
                    {/* Loading bar for email content */}
                    {loadingBody && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/50 overflow-hidden z-10">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-loading-bar" />
                      </div>
                    )}
                    {loadingBody ? (
                      <div className="h-full" />
                    ) : emailBody ? (
                      <div className="h-full flex flex-col">
                        {/* Show Summary for Primary category - only for single-email threads (multi-email threads handle summary per-email) */}
                        {activeCategory === 'primary' && !showFullContent && selectedEmail.analysis?.summary && threadEmails.length <= 1 ? (
                          <div className="flex-1 p-6 overflow-y-auto">
                            {/* Toggle Button - Top Right */}
                            <div className="flex justify-end mb-6">
                              <button
                                onClick={() => setShowFullContent(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                View Full Email
                              </button>
                            </div>

                            {/* Summary Header */}
                            <div className="mb-4">
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Summary</span>
                            </div>

                            {/* Summary Points - Separate Cards */}
                            <div className="space-y-3">
                              {(() => {
                                const summary = selectedEmail.analysis?.summary;
                                if (!summary) return null;
                                const summaryArray = Array.isArray(summary) ? summary : [summary];
                                return summaryArray.slice(0, 5).filter(Boolean).map((point, index) => (
                                  <div
                                    key={index}
                                    className="group relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-default"
                                  >
                                    {/* Hover gradient accent */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="relative flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors duration-300">
                                        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </div>
                                      <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-100 transition-colors duration-300">{point}</p>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>

                            {/* Action Required Badge */}
                            {selectedEmail.analysis?.action_required?.type &&
                              selectedEmail.analysis?.action_required?.type !== 'no_action' && (
                              <div className="mt-5">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span className="text-xs font-medium text-amber-400">
                                    {selectedEmail.analysis?.action_required?.type?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Important Content */}
                            {selectedEmail.analysis?.important_content && (
                              <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <p className="text-sm text-blue-300/80 italic">
                                  "{selectedEmail.analysis?.important_content}"
                                </p>
                              </div>
                            )}

                            {/* Attachments Section */}
                            {emailBody?.attachments && emailBody.attachments.length > 0 && (
                              <div className="mt-6">
                                <div className="mb-3">
                                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Attachments ({emailBody.attachments.length})
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {emailBody.attachments.map((attachment, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {/* File icon based on mime type */}
                                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                                          {attachment.mime_type?.startsWith('image/') ? (
                                            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                              <circle cx="8.5" cy="8.5" r="1.5" />
                                              <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                          ) : attachment.mime_type === 'application/pdf' ? (
                                            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                              <polyline points="14 2 14 8 20 8" />
                                              <line x1="16" y1="13" x2="8" y2="13" />
                                              <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                          ) : (
                                            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                              <polyline points="13 2 13 9 20 9" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm text-gray-300 truncate">{attachment.filename}</p>
                                          <p className="text-xs text-gray-500">
                                            {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const token = localStorage.getItem('token');
                                          window.open(
                                            `${import.meta.env.VITE_API_URL}/api/v1/emails/${selectedEmail.id}/attachments/${attachment.id}?token=${encodeURIComponent(token)}`,
                                            '_blank'
                                          );
                                        }}
                                        className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                                        title="Download"
                                      >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                          <polyline points="7 10 12 15 17 10" />
                                          <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Full Email Content */
                          <div className="h-full flex flex-col">
                            {/* Back to Summary Button (only for Primary with summary, and single-email threads) */}
                            {activeCategory === 'primary' && showFullContent && selectedEmail.analysis?.summary && threadEmails.length <= 1 && (
                              <div className="flex-shrink-0 flex justify-end p-4 pb-0">
                                <button
                                  onClick={() => setShowFullContent(false)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                                    <circle cx="7.5" cy="14.5" r="1.5" />
                                    <circle cx="16.5" cy="14.5" r="1.5" />
                                  </svg>
                                  View Summary
                                </button>
                              </div>
                            )}
                            <div className="flex-1 overflow-y-auto">
                              {loadingThread ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-400">Loading conversation...</p>
                                  </div>
                                </div>
                              ) : threadEmails.length > 0 ? (
                                /* Conversation View - Show all emails in thread */
                                <div className="py-2">
                                  {threadEmails.map((threadEmail, index) => {
                                    // Use gmail_id for matching since id might be None for emails not in our DB
                                    const isReplyingToThis = replyingToEmailId === threadEmail.gmail_id || 
                                                             (threadEmail.id && replyingToEmailId === threadEmail.id);
                                    // Check if email is from current user (compare with account emails)
                                    const isFromMe = accounts.some(acc => 
                                      acc.email?.toLowerCase() === threadEmail.from_email?.toLowerCase()
                                    );
                                    
                                    const emailKey = threadEmail.gmail_id || threadEmail.id || index;
                                    // If there's only one email in the thread, show it expanded by default
                                    const isSingleEmailThread = threadEmails.length === 1;
                                    const isExpanded = isSingleEmailThread || expandedEmails.has(emailKey);
                                    const isMetadataOpen = openMetadataDropdowns.has(emailKey);
                                    const isQuotedExpanded = expandedQuotedContent.has(emailKey);
                                    
                                    // Extract quoted content if HTML body exists
                                    const { mainContent, quotedContent } = threadEmail.html_body 
                                      ? extractQuotedContent(threadEmail.html_body)
                                      : { mainContent: '', quotedContent: '' };
                                    const hasQuotedContent = quotedContent.length > 0;

                                    // Check if this email has a summary
                                    const hasEmailSummary = activeCategory === 'primary' && threadEmail.analysis?.summary;
                                    const isShowingSummary = hasEmailSummary && showSummaryEmails.has(emailKey);

                                    // Get inline text preview - only main content, no quoted parts
                                    const inlinePreview = threadEmail.html_body 
                                      ? htmlToPlainText(mainContent || threadEmail.html_body)
                                      : (threadEmail.text_body || decodeHtmlEntities(threadEmail.snippet || ''));
                                    
                                    // Get sender name for dropdown
                                    const senderName = threadEmail.from_name || threadEmail.from_email || 'Unknown';
                                    
                                    // Toggle expand/collapse
                                    const toggleExpand = () => {
                                      setExpandedEmails(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(emailKey)) {
                                          newSet.delete(emailKey);
                                        } else {
                                          newSet.add(emailKey);
                                        }
                                        return newSet;
                                      });
                                    };
                                    
                                    // Toggle metadata dropdown
                                    const toggleMetadata = (e) => {
                                      e.stopPropagation();
                                      setOpenMetadataDropdowns(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(emailKey)) {
                                          newSet.delete(emailKey);
                                        } else {
                                          newSet.add(emailKey);
                                        }
                                        return newSet;
                                      });
                                    };

                                    // Toggle summary view for this email
                                    const toggleSummary = () => {
                                      setShowSummaryEmails(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(emailKey)) {
                                          newSet.delete(emailKey);
                                        } else {
                                          newSet.add(emailKey);
                                        }
                                        return newSet;
                                      });
                                    };

                                    // Check if we should show reply button (not from me, and this is the latest email)
                                    const isLatestEmail = index === threadEmails.length - 1;
                                    
                                    return (
                                      <div key={emailKey} className={`${!isSingleEmailThread ? 'rounded-lg border border-slate-700/50 bg-slate-800/30 mx-2 mb-2 overflow-hidden' : ''}`}>
                                        {/* Email Content */}
                                        <div className={isSingleEmailThread ? 'p-6' : 'p-4'}>
                                          {/* Header - Only show for multi-email threads (single email threads don't need redundant sender info) */}
                                          {!isSingleEmailThread && (
                                            <div className="relative mb-3">
                                              <div
                                                onClick={toggleExpand}
                                                className="w-full flex items-center gap-3 hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                                              >
                                                {/* Compact Avatar */}
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                  <span className="text-xs font-medium text-white">
                                                    {getInitials(threadEmail.from_name || threadEmail.from_email)}
                                                  </span>
                                                </div>
                                                {/* Compact Info - Name only */}
                                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                                  <p className="text-sm font-medium text-white truncate">
                                                    {threadEmail.from_name || threadEmail.from_email || 'Unknown'}
                                                  </p>
                                                  {/* Metadata Dropdown */}
                                                  <div className="relative">
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleMetadata(e);
                                                      }}
                                                      className="p-1 hover:bg-slate-600 rounded transition-colors flex-shrink-0"
                                                    >
                                                      <svg
                                                        className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isMetadataOpen ? 'rotate-180' : ''}`}
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                      >
                                                        <polyline points="6 9 12 15 18 9" />
                                                      </svg>
                                                    </button>

                                                    {/* Metadata Popup */}
                                                    {isMetadataOpen && (
                                                      <>
                                                        {/* Backdrop */}
                                                        <div
                                                          className="fixed inset-0 z-40"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMetadata(e);
                                                          }}
                                                        />
                                                        {/* Popup */}
                                                        <div className="absolute z-50 top-full left-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl p-4 min-w-[300px]">
                                                          <div className="space-y-2 text-sm">
                                                            <div>
                                                              <span className="text-gray-500">From:</span>
                                                              <span className="text-gray-300 ml-2">
                                                                {threadEmail.from_name ? `${threadEmail.from_name} <${threadEmail.from_email}>` : threadEmail.from_email}
                                                              </span>
                                                            </div>
                                                            {threadEmail.to_email && (
                                                              <div>
                                                                <span className="text-gray-500">To:</span>
                                                                <span className="text-gray-300 ml-2">{threadEmail.to_email}</span>
                                                              </div>
                                                            )}
                                                            {threadEmail.cc && Array.isArray(threadEmail.cc) && threadEmail.cc.length > 0 && (
                                                              <div>
                                                                <span className="text-gray-500">Cc:</span>
                                                                <span className="text-gray-300 ml-2">{threadEmail.cc.join(', ')}</span>
                                                              </div>
                                                            )}
                                                            {threadEmail.bcc && Array.isArray(threadEmail.bcc) && threadEmail.bcc.length > 0 && (
                                                              <div>
                                                                <span className="text-gray-500">Bcc:</span>
                                                                <span className="text-gray-300 ml-2">{threadEmail.bcc.join(', ')}</span>
                                                              </div>
                                                            )}
                                                            {threadEmail.subject && (
                                                              <div>
                                                                <span className="text-gray-500">Subject:</span>
                                                                <span className="text-gray-300 ml-2">{threadEmail.subject}</span>
                                                              </div>
                                                            )}
                                                            {threadEmail.date && (
                                                              <div>
                                                                <span className="text-gray-500">Date:</span>
                                                                <span className="text-gray-300 ml-2">{formatFullDate(threadEmail.date)}</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                                {/* Date on the right */}
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                  {formatDate(threadEmail.date)}
                                                </span>
                                                {/* Expand/collapse indicator */}
                                                <svg
                                                  className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                >
                                                  <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                              </div>
                                            </div>
                                          )}

                                          {!isExpanded && !isSingleEmailThread ? (
                                            /* Default Preview - Inline Text Body (clickable) - only for multi-email threads */
                                            <button
                                              onClick={toggleExpand}
                                              className="w-full text-left hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors"
                                            >
                                              <p className="text-sm text-gray-400 whitespace-normal break-words line-clamp-2">
                                                {inlinePreview}
                                              </p>
                                            </button>
                                          ) : isExpanded || isSingleEmailThread ? (
                                            /* Expanded View - Summary or Full HTML Body */
                                            <>
                                              {/* Summary/Full Email Toggle - Only for multi-email threads with summary */}
                                              {hasEmailSummary && !isSingleEmailThread && (
                                                <div className="flex justify-end mb-3">
                                                  <button
                                                    onClick={toggleSummary}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md border border-slate-600/50 hover:border-slate-500 transition-all"
                                                  >
                                                    {isShowingSummary ? (
                                                      <>
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                          <polyline points="14 2 14 8 20 8" />
                                                          <line x1="16" y1="13" x2="8" y2="13" />
                                                          <line x1="16" y1="17" x2="8" y2="17" />
                                                        </svg>
                                                        View Full Email
                                                      </>
                                                    ) : (
                                                      <>
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                                                          <circle cx="7.5" cy="14.5" r="1.5" />
                                                          <circle cx="16.5" cy="14.5" r="1.5" />
                                                        </svg>
                                                        View Summary
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                              )}

                                              {/* Show Summary or Full Content */}
                                              {isShowingSummary ? (
                                                /* Summary View */
                                                <div className="space-y-2">
                                                  {(() => {
                                                    const summary = threadEmail.analysis?.summary;
                                                    if (!summary) return null;
                                                    const summaryArray = Array.isArray(summary) ? summary : [summary];
                                                    return summaryArray.slice(0, 5).filter(Boolean).map((point, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="group relative p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-200"
                                                      >
                                                        <div className="flex items-start gap-2">
                                                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                              <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                          </div>
                                                          <p className="text-gray-300 text-sm leading-relaxed">{point}</p>
                                                        </div>
                                                      </div>
                                                    ));
                                                  })()}
                                                </div>
                                              ) : (
                                              /* Full HTML Body */
                                              threadEmail.html_body ? (
                                                <div className="mb-4">
                                                  {hasQuotedContent ? (
                                                    <>
                                                      {/* Show main content (the actual reply) */}
                                                      <div className="text-left">
                                                        <iframe
                                                          srcDoc={darkModeStyles + mainContent}
                                                          className="border-0 bg-slate-950 rounded-lg"
                                                          style={{ 
                                                            height: '1px',
                                                            width: '100%',
                                                            display: 'block',
                                                            overflow: 'hidden',
                                                            border: 'none'
                                                          }}
                                                          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                                          title="Email content"
                                                          onLoad={(e) => {
                                                            // Auto-resize iframe to fit content
                                                            const iframe = e.target;
                                                            try {
                                                              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                                              const body = iframeDoc.body;
                                                              const html = iframeDoc.documentElement;
                                                              // Get the full height including margins and padding
                                                              const height = Math.max(
                                                                body.scrollHeight,
                                                                body.offsetHeight,
                                                                html.clientHeight,
                                                                html.scrollHeight,
                                                                html.offsetHeight
                                                              );
                                                              iframe.style.height = height + 'px';
                                                            } catch (err) {
                                                              // Cross-origin or other error, use default
                                                              console.error('Failed to resize iframe:', err);
                                                            }
                                                          }}
                                                        />
                                                      </div>
                                                      {/* Quoted content with "See more" button */}
                                                      {!isQuotedExpanded ? (
                                                        <div className="mt-4">
                                                          {/* Dividing line */}
                                                          <div className="h-px bg-slate-700/50 mb-3" />
                                                          <button
                                                            onClick={() => {
                                                              setExpandedQuotedContent(prev => {
                                                                const newSet = new Set(prev);
                                                                newSet.add(emailKey);
                                                                return newSet;
                                                              });
                                                            }}
                                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                          >
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                              <polyline points="6 9 12 15 18 9" />
                                                            </svg>
                                                            See more
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <div className="mt-4">
                                                          {/* Dividing line */}
                                                          <div className="h-px bg-slate-700/50 mb-3" />
                                                          <button
                                                            onClick={() => {
                                                              setExpandedQuotedContent(prev => {
                                                                const newSet = new Set(prev);
                                                                newSet.delete(emailKey);
                                                                return newSet;
                                                              });
                                                            }}
                                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3"
                                                          >
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                              <polyline points="18 15 12 9 6 15" />
                                                            </svg>
                                                            Show less
                                                          </button>
                                                          <div className="border-l-2 border-slate-700 pl-4 text-gray-500 opacity-75 text-left">
                                                            <iframe
                                                              srcDoc={darkModeStyles + quotedContent}
                                                              className="border-0 bg-slate-950 rounded-lg"
                                                              style={{ 
                                                                height: '1px',
                                                                width: '100%',
                                                                display: 'block',
                                                                overflow: 'hidden',
                                                                border: 'none'
                                                              }}
                                                              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                                              title="Quoted content"
                                                              onLoad={(e) => {
                                                                // Auto-resize iframe to fit content
                                                                const iframe = e.target;
                                                                try {
                                                                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                                                  const body = iframeDoc.body;
                                                                  const html = iframeDoc.documentElement;
                                                                  // Get the full height including margins and padding
                                                                  const height = Math.max(
                                                                    body.scrollHeight,
                                                                    body.offsetHeight,
                                                                    html.clientHeight,
                                                                    html.scrollHeight,
                                                                    html.offsetHeight
                                                                  );
                                                                  iframe.style.height = height + 'px';
                                                                } catch (err) {
                                                                  // Cross-origin or other error, use default
                                                                  console.error('Failed to resize iframe:', err);
                                                                }
                                                              }}
                                                            />
                                                          </div>
                                                        </div>
                                                      )}
                                                    </>
                                                  ) : (
                                                    <div className="text-left">
                                                      <iframe
                                                        srcDoc={darkModeStyles + threadEmail.html_body}
                                                        className="border-0 bg-slate-950 rounded-lg"
                                                        style={{ 
                                                          height: '1px',
                                                          width: '100%',
                                                          display: 'block',
                                                          overflow: 'hidden',
                                                          border: 'none'
                                                        }}
                                                        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                                        title="Email content"
                                                        onLoad={(e) => {
                                                          // Auto-resize iframe to fit content
                                                          const iframe = e.target;
                                                          try {
                                                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                                            const body = iframeDoc.body;
                                                            const html = iframeDoc.documentElement;
                                                            // Get the full height including margins and padding
                                                            const height = Math.max(
                                                              body.scrollHeight,
                                                              body.offsetHeight,
                                                              html.clientHeight,
                                                              html.scrollHeight,
                                                              html.offsetHeight
                                                            );
                                                            iframe.style.height = height + 'px';
                                                          } catch (err) {
                                                            // Cross-origin or other error, use default
                                                            console.error('Failed to resize iframe:', err);
                                                          }
                                                        }}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans mb-4">
                                                  {threadEmail.text_body || decodeHtmlEntities(threadEmail.snippet || '')}
                                                </pre>
                                              ))}

                                              {/* Reply button when expanded */}
                                              {!isFromMe && isLatestEmail && (
                                                <div className="mt-4">
                                                  <button
                                                    onClick={() => handleReply(threadEmail)}
                                                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                  >
                                                    Reply
                                                  </button>
                                                </div>
                                              )}
                                            </>
                                          ) : null}
                                        </div>

                                        {/* Separator (only for single email threads, multi-email threads use card spacing) */}
                                        {isSingleEmailThread && index < threadEmails.length - 1 && (
                                          <div className="h-px bg-slate-700/50 mx-6" />
                                        )}
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Reply Composer - Always at the bottom of the thread */}
                                  {replyingToEmailId && (
                                    <div className="px-6 pb-6 border-t border-slate-700/50 pt-4">
                                      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col">
                                        {/* Reply Header */}
                                        <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">To:</span>
                                            <span className="text-sm text-gray-300">
                                              {composeTo.map(c => c.display_name || c.email).join(', ')}
                                            </span>
                                          </div>
                                          <button
                                            onClick={handleCancelReply}
                                            className="text-gray-400 hover:text-white transition-colors"
                                          >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <line x1="18" y1="6" x2="6" y2="18" />
                                              <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                          </button>
                                        </div>
                                        
                                        {/* Rich Text Toolbar */}
                                        <ComposeToolbar
                                          editorFormats={inlineReplyEditorFormats}
                                          execFormat={execInlineReplyFormat}
                                          onAttachClick={() => fileInputRef.current?.click()}
                                          onAIComposeClick={() => setShowAIComposeModal(true)}
                                          hasRecipients={composeTo.length > 0}
                                        />
                                        
                                        {/* Rich Text Editor */}
                                        <div style={{ minHeight: '200px', maxHeight: '400px', overflow: 'hidden' }}>
                                          <ComposeEditor
                                            ref={editorRef}
                                            onKeyUp={updateInlineReplyEditorFormats}
                                            onMouseUp={updateInlineReplyEditorFormats}
                                            execFormat={execInlineReplyFormat}
                                          />
                                        </div>
                                        
                                        {/* Footer with Send/Cancel */}
                                        <div className="px-4 py-2 border-t border-slate-700/50 flex items-center justify-end gap-2">
                                          <button
                                            onClick={handleCancelReply}
                                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleSendEmail(true)}
                                            disabled={sendingEmail}
                                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {sendingEmail ? 'Sending...' : 'Send'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : emailBody ? (
                                /* Fallback to single email if thread fetch failed */
                                emailBody.html_body ? (
                                <iframe
                                  srcDoc={darkModeStyles + emailBody.html_body}
                                  className="w-full h-full border-0 bg-slate-950"
                                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                  title="Email content"
                                />
                              ) : (
                                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans p-8">
                                    {emailBody.text_body || decodeHtmlEntities(selectedEmail.snippet)}
                                </pre>
                                )
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6">
                        <p className="text-gray-400 text-sm">{decodeHtmlEntities(selectedEmail.snippet)}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : activeCategory === 'promotions' ? (
                /* Promotions Board */
                <div className="flex-1 overflow-y-auto p-6" data-tour="promotions-board">
                  <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-1">This Week's Deals</h2>
                      <p className="text-gray-500 text-sm">Promotions from the last 7 days</p>
                    </div>

                    {/* Promotions Grid */}
                    {recentPromotions.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No promotions this week</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentPromotions.map((promo, index) => (
                          <div
                            key={promo.id}
                            onClick={() => handleSelectEmail(promo)}
                            className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
                          >
                            {/* Decorative gradient line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-4">
                              {/* Brand Avatar */}
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                  {getInitials(promo.from_name || promo.from_email)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Brand Name & Date */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {promo.from_name || promo.from_email}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {formatDate(promo.date)}
                                  </span>
                                </div>

                                {/* Subject */}
                                <p className="text-sm text-gray-300 truncate mb-2">
                                  {promo.subject}
                                </p>

                                {/* Summary */}
                                {promo.analysis?.summary && (
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {Array.isArray(promo.analysis.summary)
                                      ? promo.analysis.summary.join(' • ')
                                      : promo.analysis.summary}
                                  </p>
                                )}
                              </div>

                              {/* Arrow */}
                              <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : activeCategory === 'notifications' ? (
                /* Notifications Board */
                <div className="flex-1 overflow-y-auto p-6" data-tour="notifications-board">
                  <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
                      <p className="text-gray-500 text-sm">
                        {unreadNotifications.length === 0
                          ? 'All caught up!'
                          : `${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>

                    {/* Notifications List */}
                    {unreadNotifications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="text-gray-400">No new notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unreadNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleSelectEmail(notif)}
                            className="group relative p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                          >
                            {/* Unread indicator dot */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />

                            <div className="flex items-start gap-4 pl-4">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                  {getInitials(notif.from_name || notif.from_email)}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Sender & Date */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {notif.from_name || notif.from_email}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {formatDate(notif.date)}
                                  </span>
                                </div>

                                {/* Subject */}
                                <p className="text-sm text-gray-300 truncate mb-1">
                                  {notif.subject}
                                </p>

                                {/* Summary */}
                                {notif.analysis?.summary && (
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {Array.isArray(notif.analysis.summary)
                                      ? notif.analysis.summary.join(' • ')
                                      : notif.analysis.summary}
                                  </p>
                                )}
                              </div>

                              {/* Dismiss Button */}
                              <button
                                onClick={(e) => dismissNotification(e, notif)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                title="Dismiss"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Default - No Email Selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <polyline points="3 7 12 13 21 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Select an email to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full mx-4 animate-modalFadeIn">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
                  <p className="text-gray-300 text-sm">{errorModalMessage}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setErrorModalMessage('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Send Without Subject Modal */}
      {showConfirmSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full mx-4 animate-modalFadeIn">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Send without subject?</h3>
                  <p className="text-gray-300 text-sm">Are you sure you want to send this message without a subject line?</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmSendModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmSendModal(false);
                    handleSendEmail(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Send anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Import Modal */}
      <EmailImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onComplete={handleImportComplete}
      />

      {/* AI Compose Modal */}
      <AIComposeModal
        isOpen={showAIComposeModal}
        onClose={() => setShowAIComposeModal(false)}
        toEmail={composeTo.length > 0 ? composeTo[0].email : ''}
        threadId={selectedEmail?.thread_id}
        onGenerated={(subject, bodyHtml) => {
          // Only update subject if we're not replying (subject is already set for replies)
          if (!replyingToEmailId) {
            setComposeSubject(subject);
          }
          if (editorRef.current) {
            editorRef.current.innerHTML = bodyHtml;
            // Update editor formats after setting content
            updateInlineReplyEditorFormats();
            updateEditorFormats();
          }
        }}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-900/90 border-green-700 text-green-100'
              : toast.type === 'error'
              ? 'bg-red-900/90 border-red-700 text-red-100'
              : 'bg-blue-900/90 border-blue-700 text-blue-100'
          }`}
          style={{
            animation: 'slideInUp 0.3s ease-out',
          }}
        >
          {toast.type === 'info' && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          {toast.type === 'success' && (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'info' })}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Product Tour */}
      <ProductTour
        run={tourRunning}
        onComplete={completeTour}
        onSkip={stopTour}
      />

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalFadeIn {
          animation: modalFadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Inbox;
