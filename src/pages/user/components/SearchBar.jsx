import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div
      className="px-3 sm:px-4 md:px-6 py-2.5 flex-shrink-0"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="relative">
        <HiOutlineSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
          style={{ color: searchQuery ? 'var(--primary)' : 'var(--text-muted)' }}
          aria-hidden="true"
        />
        <input
          type="text"
          id="menu-search"
          placeholder="Search pizzas, drinks, deals…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search menu items"
          autoComplete="off"
          spellCheck="false"
          className="w-full pl-9 pr-8 py-2 rounded-lg text-sm min-h-[38px] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="Clear search"
          >
            <HiOutlineX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
