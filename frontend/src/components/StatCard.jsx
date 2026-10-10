import React from 'react';

const StatCard = ({
  title,
  value,
  unit = '',
  target = null,
  progress = null,
  icon: Icon,
  colorScheme = 'emerald', // emerald, blue, indigo, amber, purple, rose
  subtitle,
  badgeText,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      bar: 'bg-sky-500',
      badge: 'bg-sky-100 text-sky-800',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      bar: 'bg-indigo-500',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      bar: 'bg-purple-500',
      badge: 'bg-purple-100 text-purple-800',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      bar: 'bg-rose-500',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">{value}</span>
              {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
            </div>
          </div>
        </div>

        {badgeText && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${scheme.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      {progress !== null && (
        <div className="mt-2">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {target && (
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5 font-medium">
              <span>Goal: {target}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      )}

      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
