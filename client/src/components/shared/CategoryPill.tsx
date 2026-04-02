import React from 'react';

interface CategoryPillProps {
  category: string;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, className = '' }) => {
  return (
    <span className={`inline-flex items-center rounded-[20px] bg-cyan/10 text-cyan dark:text-cyan-dark border border-cyan/25 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {category}
    </span>
  );
};
