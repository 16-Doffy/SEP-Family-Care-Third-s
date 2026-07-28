'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAdminSystemHealth } from '@/hooks/useAdmin'
import { Activity, Bell, ChevronRight, Search, ShieldCheck, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Tổng quan Dashboard',
  '/admin/users': 'Quản lý Người dùng',
  '/admin/families': 'Quản lý Gia đình',
  '/admin/revenue': 'Thống kê Doanh thu',
  '/admin/system': 'Giám sát Hạ tầng & Docker',
  '/admin/audit-logs': 'Nhật ký Hoạt động (Audit Logs)',
  '/admin/plans': 'Gói dịch vụ (Subscription Plans)',
  '/admin/backups': 'Sao lưu & Khôi phục (Backup & Restore)',
  '/admin/provisioning-logs': 'Nhật ký Khởi tạo (Provisioning)',
}

export function AdminTopBar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: healthData, isFetching, refetch } = useAdminSystemHealth()

  const isHealthy = healthData?.status === 'ok' || healthData?.status === 'UP'
  const currentTitle = ROUTE_LABELS[pathname] || 'Admin Workspace'

  const initials = (user?.displayName ?? 'SA')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 transition-colors">
      {/* ── Left: Breadcrumbs & Page Title ── */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="hover:text-slate-900 dark:hover:text-slate-200">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold truncate">{currentTitle}</span>
        </div>
      </div>

      {/* ── Right: System Health Indicator, Search & User Profile ── */}
      <div className="flex items-center gap-3">
        {/* System Health Heartbeat Badge */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
            isHealthy
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
          )}
          title="Tình trạng Hệ thống (cập nhật tự động 30s)"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              )}
            />
          </span>
          <span className="truncate">{isHealthy ? 'Hệ thống Hoạt động' : 'Cảnh báo Hạ tầng'}</span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Làm mới tình trạng"
          >
            <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 pl-2.5 rounded-full border border-slate-200/80 dark:border-slate-700/60">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
              {user?.displayName ?? 'Super Admin'}
            </span>
            <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase">
              SYSTEM ADMIN
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm ml-1">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
