import React from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div
      className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="relative group">
        <HiOutlineSearch
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm min-h-[44px] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all active:scale-90"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            aria-label="Clear search"
          >
            <HiOutlineX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
