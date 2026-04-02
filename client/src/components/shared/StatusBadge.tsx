import React from 'react';
import { CaseStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles = {
    RECEIVED: 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/30',
    ASSIGNED: 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30',
    UNDER_INVESTIGATION: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    RESOLVED: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
  };
  
  const displayLabels = {
    RECEIVED: 'Received',
    ASSIGNED: 'Assigned',
    UNDER_INVESTIGATION: 'Under Investigation',
    RESOLVED: 'Resolved'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.5px] uppercase border whitespace-nowrap ${styles[status]} ${className}`}>
      {status === 'UNDER_INVESTIGATION' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
      )}
      {displayLabels[status]}
    </span>
  );
};
