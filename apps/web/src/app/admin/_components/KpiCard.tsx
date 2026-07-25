import React from 'react'

export interface KpiCardProps {
  label: string
  value?: string | number | null
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accentColor: string
  warning?: boolean
  loading?: boolean
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accentColor,
  warning,
  loading,
}: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow ${
        warning ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${warning ? 'text-amber-600' : 'text-slate-400'}`}>
          {label}
        </p>
        <Icon className={`w-4 h-4 ${warning ? 'text-amber-400' : accentColor}`} />
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-100 rounded-md animate-pulse mb-1" />
      ) : (
        <p className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">
          {value != null ? value : <span className="text-slate-300 text-xl">—</span>}
        </p>
      )}
      {sub && <p className="text-[11px] text-slate-400 mt-2 leading-snug">{sub}</p>}
    </div>
  )
}
