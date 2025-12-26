import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function ContactAutocomplete({ value, onChange, accountId, placeholder, disabled }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (!accountId) return;

      setLoading(true);
      try {
        const res = await api.get(`/api/v1/contacts/${accountId}/search?q=${encodeURIComponent(query)}`);
        // Filter out already selected contacts
        const selectedEmails = value.map((c) => c.email.toLowerCase());
        const filtered = res.data.filter((c) => !selectedEmails.includes(c.email.toLowerCase()));
        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0 || isValidEmail(query));
        setHighlightedIndex(-1);
      } catch (err) {
        console.error('Failed to search contacts:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, accountId, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const selectContact = (contact) => {
    onChange([...value, { email: contact.email, display_name: contact.display_name }]);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const addCustomEmail = (email) => {
    if (isValidEmail(email)) {
      const selectedEmails = value.map((c) => c.email.toLowerCase());
      if (!selectedEmails.includes(email.toLowerCase())) {
        onChange([...value, { email, display_name: null }]);
      }
      setQuery('');
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const removeContact = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectContact(suggestions[highlightedIndex]);
      } else if (isValidEmail(query)) {
        addCustomEmail(query);
      }
    } else if (e.key === 'Backspace' && query === '' && value.length > 0) {
      removeContact(value.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const maxIndex = suggestions.length + (isValidEmail(query) ? 0 : -1);
      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === ',' || e.key === 'Tab') {
      if (query && isValidEmail(query)) {
        e.preventDefault();
        addCustomEmail(query);
      }
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-[32px] ${
          disabled ? 'opacity-50' : ''
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((contact, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full text-sm"
          >
            <span>{contact.display_name || contact.email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeContact(idx);
              }}
              className="text-blue-400 hover:text-blue-200 ml-0.5"
              disabled={disabled}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] bg-transparent text-gray-200 text-sm focus:outline-none placeholder:text-gray-500 py-1"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-gray-400 text-sm flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin" />
              Searching...
            </div>
          )}

          {!loading && suggestions.length === 0 && isValidEmail(query) && (
            <div
              className={`px-3 py-2 cursor-pointer ${
                highlightedIndex === 0 ? 'bg-slate-700' : 'hover:bg-slate-700'
              }`}
              onClick={() => addCustomEmail(query)}
            >
              <div className="text-gray-200 text-sm">Add "{query}"</div>
            </div>
          )}

          {!loading &&
            suggestions.map((contact, idx) => (
              <div
                key={contact.id}
                className={`px-3 py-2 cursor-pointer ${
                  highlightedIndex === idx ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
                onClick={() => selectContact(contact)}
              >
                <div className="text-gray-200 text-sm">
                  {contact.display_name || contact.email}
                </div>
                {contact.display_name && (
                  <div className="text-gray-500 text-xs">{contact.email}</div>
                )}
              </div>
            ))}

          {!loading && suggestions.length > 0 && isValidEmail(query) && (
            <div
              className={`px-3 py-2 cursor-pointer border-t border-slate-700 ${
                highlightedIndex === suggestions.length ? 'bg-slate-700' : 'hover:bg-slate-700'
              }`}
              onClick={() => addCustomEmail(query)}
            >
              <div className="text-gray-200 text-sm">Add "{query}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContactAutocomplete;
