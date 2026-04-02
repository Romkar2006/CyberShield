import React from 'react';

export const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 bg-transparent mt-12">
      <div className="w-12 h-12 rounded-full border-4 border-cyan/20 border-t-cyan dark:border-cyan-dark/20 dark:border-t-cyan-dark animate-spin"></div>
      <p className="text-cyan dark:text-cyan-dark font-mono text-sm animate-pulse tracking-widest">LOADING MODULES...</p>
    </div>
  );
};
