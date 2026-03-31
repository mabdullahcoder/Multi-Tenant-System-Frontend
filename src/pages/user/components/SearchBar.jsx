
import React from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0">
      <div className="relative group">
        <HiOutlineSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm min-h-[44px] hover:border-gray-300 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 active:scale-90 p-1.5 rounded transition-all"
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
