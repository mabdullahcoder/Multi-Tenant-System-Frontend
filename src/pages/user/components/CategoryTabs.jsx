
import React from 'react';

const CategoryTabs = ({ menuCategories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-3 md:px-6 py-2.5 sm:py-4 flex-shrink-0 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1.5 sm:gap-2 pb-1">
        {menuCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all min-h-[36px] sm:min-h-[40px] active:scale-95 border ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
