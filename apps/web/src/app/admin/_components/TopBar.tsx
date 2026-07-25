'use client'

import { Search, Bell, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user } = useAuth()
  const now = new Date()
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const initials = (user?.displayName ?? 'SA')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tổng quan SEPFamilyCare — cập nhật lúc {timeStr}, {dateStr}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-400">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[13px]">Tìm kiếm...</span>
        </div>
        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 font-bold text-[10px]">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-slate-700 hidden sm:block">
            {user?.displayName ?? 'Super Admin'}
          </span>
        </div>
      </div>
    </div>
  )
}
