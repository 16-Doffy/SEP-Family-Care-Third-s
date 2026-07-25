import React from 'react'

export function ContainerDot({ state }: { state: string }) {
  if (state === 'running') return <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
  if (state === 'restarting') return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
  return <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
}

export function ContainerStateBadge({ state }: { state: string }) {
  if (state === 'running') {
    return (
      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
        Running
      </span>
    )
  }
  if (state === 'restarting') {
    return (
      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        Restarting
      </span>
    )
  }
  return (
    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full capitalize">
      {state || 'Stopped'}
    </span>
  )
}
