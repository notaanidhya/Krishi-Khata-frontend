import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const Combobox = ({ options, value, onChange, placeholder, icon: Icon, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Filter options based on search input
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

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
        className="flex items-center justify-between w-full h-full bg-transparent border-none outline-none text-sm font-medium text-emerald-950 px-1 focus:ring-0"
      >
        <span className="truncate flex-1 text-left">
          {value || placeholder}
        </span>
        <ChevronDown size={14} className="text-stone-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-fade-in origin-top">
          <div className="flex items-center px-3 py-2 border-b border-stone-100 bg-stone-50">
            <Search size={14} className="text-stone-400 mr-2 shrink-0" />
            <input
              type="text"
              autoFocus
              className="w-full bg-transparent border-none outline-none text-sm text-emerald-950"
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
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between
                    ${value === option ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-stone-600 hover:bg-stone-50 hover:text-emerald-900'}
                  `}
                >
                  <span className="truncate">{option}</span>
                  {value === option && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-sm text-center text-stone-400">
                No results found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Combobox;
