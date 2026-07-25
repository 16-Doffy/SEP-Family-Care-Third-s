import React from 'react'
import { Users, Home, Crown, Server, Activity } from 'lucide-react'
import type { AdminAuditLog } from '@/hooks/useAdmin'

export function AuditIcon({ log }: { log: AdminAuditLog }) {
  const t = log.targetType?.toUpperCase()
  if (t === 'USER') {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <Users className="w-3.5 h-3.5 text-blue-500" />
      </div>
    )
  }
  if (t === 'FAMILY') {
    return (
      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
        <Home className="w-3.5 h-3.5 text-violet-500" />
      </div>
    )
  }
  if (t === 'SUBSCRIPTION') {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
        <Crown className="w-3.5 h-3.5 text-amber-500" />
      </div>
    )
  }
  if (t === 'CONTAINER') {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <Server className="w-3.5 h-3.5 text-slate-500" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      <Activity className="w-3.5 h-3.5 text-slate-400" />
    </div>
  )
}

export function AuditTag({ log }: { log: AdminAuditLog }) {
  const t = log.targetType?.toUpperCase()
  if (t === 'USER') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">User</span>
  }
  if (t === 'FAMILY') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">Family</span>
  }
  if (t === 'SUBSCRIPTION') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">Sub</span>
  }
  if (t === 'CONTAINER') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">Container</span>
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
      {log.targetType ?? 'System'}
    </span>
  )
}
