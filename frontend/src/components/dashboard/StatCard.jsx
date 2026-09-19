import React from 'react';

export const StatCard = ({ title, value, unit, subtitle }) => {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
      <p className="text-xs font-medium text-slate-400">{title}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
