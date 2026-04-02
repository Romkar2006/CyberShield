import React, { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  type: 'total' | 'critical' | 'high' | 'resolved';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, type }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    
    // easeOutQuart
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
    
    const duration = 1200; // 1.2s
    let startTime: number | null = null;
    let reqId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(end * easeOutQuart(progress)));
        reqId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [value]);

  const borderColors = {
    total: '#00D4FF',
    critical: '#EF4444',
    high: '#F59E0B',
    resolved: '#22C55E'
  };

  return (
    <div 
      className="bg-light-bg-surface dark:bg-dark-bg-surface rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-none border border-transparent dark:border-[rgba(255,255,255,0.08)] transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,153,187,0.15)] dark:hover:shadow-[0_0_20px_rgba(0,212,255,0.10)] dark:hover:border-[currentColor] hover:border-[currentColor]"
      style={{ borderLeft: `3px solid ${borderColors[type]}`, color: borderColors[type] }}
    >
      <div className="text-[36px] font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
        {count}
      </div>
      <div className="text-[11px] uppercase tracking-[1px] text-light-text-muted dark:text-dark-text-muted">
        {label}
      </div>
    </div>
  );
};
