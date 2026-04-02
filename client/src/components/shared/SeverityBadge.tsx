import React from 'react';
import { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const styles = {
    Critical: 'bg-critical/15 text-critical border-critical/30',
    High: 'bg-high/15 text-high border-high/30',
    Medium: 'bg-medium/15 text-medium border-medium/30',
    Low: 'bg-low/15 text-low border-low/30',
  };

  return (
    <span className={`inline-flex items-center justify-center rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.5px] uppercase border whitespace-nowrap ${styles[severity]} ${className}`}>
      {severity}
    </span>
  );
};
