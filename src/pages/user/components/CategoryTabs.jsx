const CategoryTabs = ({ menuCategories, selectedCategory, setSelectedCategory }) => {
  return (
    <div
      className="px-3 sm:px-4 md:px-6 py-2 flex-shrink-0 overflow-x-auto scrollbar-hide"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      role="navigation"
      aria-label="Menu categories"
    >
      <div className="flex gap-1.5" role="tablist">
        {menuCategories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(category.id)}
              className="px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0 active:scale-95"
              style={
                isActive
                  ? {
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    boxShadow: '0 1px 4px rgba(59,130,246,0.3)',
                  }
                  : {
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                  }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
