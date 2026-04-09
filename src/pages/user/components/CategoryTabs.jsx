import React from 'react';

const CategoryTabs = ({ menuCategories, selectedCategory, setSelectedCategory }) => {
  return (
    <div
      className="px-2 sm:px-3 md:px-6 py-2.5 sm:py-4 flex-shrink-0 overflow-x-auto scrollbar-hide"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex gap-1.5 sm:gap-2 pb-1">
        {menuCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all min-h-[36px] sm:min-h-[40px] active:scale-95 border"
            style={selectedCategory === category.id
              ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
              : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
            }
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
