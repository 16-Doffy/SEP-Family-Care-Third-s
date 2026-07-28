import React from 'react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value?: string | number | null
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accentColor?: string
  gradientScheme?: 'teal' | 'indigo' | 'violet' | 'amber' | 'emerald' | 'cyan' | 'rose'
  warning?: boolean
  loading?: boolean
  trend?: string
}

const GRADIENT_SCHEMES = {
  teal: {
    card: 'from-teal-500/10 via-emerald-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20',
    valueText: 'text-teal-950 dark:text-teal-100',
    badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
  },
  indigo: {
    card: 'from-indigo-500/10 via-blue-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/20',
    valueText: 'text-indigo-950 dark:text-indigo-100',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  },
  violet: {
    card: 'from-violet-500/10 via-purple-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/20',
    valueText: 'text-violet-950 dark:text-violet-100',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
  },
  amber: {
    card: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20',
    valueText: 'text-amber-950 dark:text-amber-100',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  emerald: {
    card: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
    valueText: 'text-emerald-950 dark:text-emerald-100',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  cyan: {
    card: 'from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-cyan-500/20',
    valueText: 'text-cyan-950 dark:text-cyan-100',
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
  },
  rose: {
    card: 'from-rose-500/10 via-red-500/5 to-transparent border-rose-500/20 hover:border-rose-500/40',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20',
    valueText: 'text-rose-950 dark:text-rose-100',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  gradientScheme = 'teal',
  warning,
  loading,
  trend,
}: KpiCardProps) {
  const scheme = warning ? GRADIENT_SCHEMES.rose : (GRADIENT_SCHEMES[gradientScheme] || GRADIENT_SCHEMES.teal)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300',
        'bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl hover:-translate-y-1 group',
        scheme.card
      )}
    >
      {/* Background glow orb */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-current opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-2xl" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          {trend && (
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', scheme.badge)}>
              {trend}
            </span>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 shrink-0', scheme.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="h-9 w-28 bg-slate-200/80 dark:bg-slate-800 rounded-lg animate-pulse mb-1" />
        ) : (
          <p className={cn('text-3xl font-extrabold leading-none tracking-tight font-sans', scheme.valueText)}>
            {value != null ? value : <span className="text-slate-300 dark:text-slate-700 text-xl">—</span>}
          </p>
        )}
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium leading-relaxed">{sub}</p>}
      </div>
    </div>
  )
}
