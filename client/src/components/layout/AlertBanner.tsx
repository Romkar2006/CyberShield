import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getActiveAlerts } from '../../lib/api';
import { ScamAlert } from '../../types';

export const AlertBanner = () => {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('cybershield_alert_dismissed')) {
      setDismissed(true);
      return;
    }
    
    getActiveAlerts()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setAlerts(res.data);
        }
      })
      .catch(err => console.error('Failed to fetch alerts:', err));
  }, []);

  if (dismissed || alerts.length === 0) return null;

  const currentAlert = alerts[0];

  const handleDismiss = () => {
    sessionStorage.setItem('cybershield_alert_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="w-full bg-critical/10 border-b border-critical/25 px-6 py-2.5 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-critical animate-blink shrink-0"></div>
        <AlertTriangle className="w-4 h-4 text-critical shrink-0" />
        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary hidden sm:inline">
          ACTIVE ALERT: {currentAlert.title}
        </span>
        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary sm:hidden">
          {currentAlert.title}
        </span>
        <span className="hidden md:inline text-light-text-secondary dark:text-dark-text-secondary">
          — {currentAlert.description}
        </span>
        <a href="/hub" className="text-cyan dark:text-cyan-dark hover:underline ml-2 font-medium whitespace-nowrap">Learn more</a>
      </div>
      <button onClick={handleDismiss} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors ml-4 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
