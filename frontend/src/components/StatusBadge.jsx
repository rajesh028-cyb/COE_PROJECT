import React from 'react';
import { Clock, CheckCheck, CalendarClock, CheckCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const s = status || 'Pending Review';

  let config = {
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Clock
  };

  if (s === 'Pending Review') {
    config = {
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Clock
    };
  } else if (s === 'Reviewed') {
    config = {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCheck
    };
  } else if (s === 'Assigned' || s === 'Follow-up Pending') {
    config = {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: CalendarClock
    };
  } else if (s === 'Completed') {
    config = {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: CheckCircle
    };
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {s}
    </span>
  );
}
