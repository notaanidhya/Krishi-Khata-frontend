import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Combobox = ({ options, value, onChange, placeholder, icon: Icon, className = '', getDisplayValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const wrapperRef = useRef(null);

  // Filter options based on search input
  const filteredOptions = options.filter((option) => {
    const display = getDisplayValue ? getDisplayValue(option) : option;
    return display.toLowerCase().includes(search.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-full bg-transparent border-none outline-none text-sm font-medium px-1 focus:ring-0"
        style={{ color: 'var(--color-ink)' }}
      >
        <span className="truncate flex-1 text-left">
          {(getDisplayValue && value) ? getDisplayValue(value) : (value || placeholder)}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--color-muted)' }} className="shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in origin-top" style={{ background: 'var(--color-cream)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center px-3 py-2" style={{ background: 'var(--color-soil-dark)', borderBottom: '1px solid var(--border-subtle)' }}>
            <Search size={14} style={{ color: 'var(--color-muted)' }} className="mr-2 shrink-0" />
            <input
              type="text"
              autoFocus
              className="w-full bg-transparent border-none outline-none text-sm"
              style={{ color: 'var(--color-ink)' }}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto scrollbar-none py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors"
                  style={
                    value === option
                      ? { background: 'var(--color-forest-light)', color: 'var(--color-forest)', fontWeight: 600 }
                      : { color: 'var(--color-muted)' }
                  }
                  onMouseEnter={(e) => { if (value !== option) e.currentTarget.style.background = 'var(--color-soil-dark)'; }}
                  onMouseLeave={(e) => { if (value !== option) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="truncate">{getDisplayValue ? getDisplayValue(option) : option}</span>
                  {value === option && <Check size={14} style={{ color: 'var(--color-forest)' }} className="shrink-0 ml-2" />}
                </li>
              ))
            ) : (
              search.trim().length > 0 ? (
                <li
                  onClick={() => handleSelect(search.trim())}
                  className="px-4 py-3 text-sm cursor-pointer text-center font-medium transition-colors"
                  style={{ color: 'var(--color-forest-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-forest-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Search for "{search.trim()}"
                </li>
              ) : (
                <li className="px-4 py-6 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                  {t('common.noResults', 'No options found')}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Combobox;
