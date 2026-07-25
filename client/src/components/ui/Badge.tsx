import React from 'react';
import { RoomStatus, InquiryStatus } from '../../types';

interface BadgeProps {
  status: RoomStatus | InquiryStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'RESERVED':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'OCCUPIED':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'NEW':
        return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
      case 'REPLIED':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'VIEWING_SCHEDULED':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'CLOSED':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const formatText = (val: string) => {
    return val.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {formatText(status)}
    </span>
  );
};
