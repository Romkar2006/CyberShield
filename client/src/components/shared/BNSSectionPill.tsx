import React from 'react';

interface BNSSectionPillProps {
  section: string;
  className?: string;
}

export const BNSSectionPill: React.FC<BNSSectionPillProps> = ({ section, className = '' }) => {
  return (
    <span className={`inline-flex items-center rounded-[20px] bg-violet/15 text-[#A78BFA] border border-violet/30 px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${className}`}>
      {section}
    </span>
  );
};
