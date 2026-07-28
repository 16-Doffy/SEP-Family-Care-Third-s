'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Download, UserPlus, ChevronLeft, ChevronRight, ChevronDown,
  RefreshCw, Bell, Loader2, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '@/lib/api'
import {
  useAdminUsers, useUpdateAdminUser,
  useAdminFamilyMembers, useAdminFamilies,
  useAdminPayments, useAdminSubscriptionPlans,
  type AdminUser,
} from '@/hooks/useAdmin'
import { useAuth } from '@/context/AuthContext'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const AVATAR_PALETTES = [
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
]

function avatarColor(id: string) {
  let code = 0
  for (let i = 0; i < id.length; i++) code += id.charCodeAt(i)
  return AVATAR_PALETTES[code % AVATAR_PALETTES.length]
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

/* ─── Plan badge ─────────────────────────────────────────────────────────── */
/* ─── Plan badge ─────────────────────────────────────────────────────────── */
function PlanBadge({ planCode, planName }: { planCode?: string; planName?: string }) {
  if (!planCode) return <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">Miễn phí</span>
  const code = planCode.toUpperCase()
  const label = planName ?? planCode
  if (code.includes('PREMIUM') || code.includes('PRO') || code.includes('VIP')) {
    return <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-sm">👑 {label}</span>
  }
  if (code.includes('BASIC') || code.includes('STANDARD') || code.includes('MONTHLY')) {
    return <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">⚡ {label}</span>
  }
  return <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">{label}</span>
}

/* ─── Status Badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Hoạt động
    </span>
  )
  if (status === 'SUSPENDED') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
      <ShieldOff className="w-3 h-3" /> Tạm khóa
    </span>
  )
  return (
    <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
      Không HĐ
    </span>
  )
}

/* ─── Role Badge ──────────────────────────────────────────────────────────── */
function RoleBadge({ userType, familyRole, hasFamily }: { userType: string; familyRole?: string; hasFamily?: boolean }) {
  if (userType === 'SYSTEM_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-sm">
        <ShieldCheck className="w-3 h-3 text-violet-500" /> Admin System
      </span>
    )
  }

  if (hasFamily) {
    if (familyRole === 'FAMILY_MANAGER' || familyRole === 'MANAGER') {
      return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">👑 Quản lý GD</span>
    }
    if (familyRole === 'FAMILY_DEPUTY' || familyRole === 'DEPUTY') {
      return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">⭐ Phó quản lý</span>
    }
    return <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">👥 Thành viên</span>
  }

  return (
    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      User
    </span>
  )
}

const PAGE_SIZES = [10, 20, 50] as const
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
type RoleFilter = 'ALL' | 'NORMAL_USER' | 'SYSTEM_ADMIN'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZES[number]>(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const searchTimerRef = useState<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimerRef[0]) clearTimeout(searchTimerRef[0])
    searchTimerRef[0] = setTimeout(() => { setDebouncedSearch(val); setPage(1) }, 350)
  }

  /* ── Users list (paginated, filtered) ── */
  const { data, isLoading, isFetching } = useAdminUsers({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    accountStatus: statusFilter === 'ALL' ? undefined : statusFilter,
    userType: roleFilter === 'ALL' ? undefined : roleFilter,
  })
  const updateUser = useUpdateAdminUser()
  const users = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  /* ── Lookup data for family name + plan ── */
  const { data: allMembersData } = useAdminFamilyMembers({ limit: 100 })
  const { data: allFamiliesData } = useAdminFamilies({ limit: 100 })
  const { data: allPaymentsData } = useAdminPayments({ status: 'PAID', limit: 100 })
  const { data: plansData } = useAdminSubscriptionPlans({ limit: 20 })

  /* ── Build lookup maps ── */
  const userFamilyMap = useMemo(() => {
    const map: Record<string, { familyId: string; familyRole: string }> = {}
    for (const m of allMembersData?.items ?? []) {
      const uid = m.userId || m.user?.id
      if (!uid) continue
      if (!map[uid] || m.status === 'ACTIVE') {
        map[uid] = { familyId: m.familyId, familyRole: m.familyRole }
      }
    }
    return map
  }, [allMembersData])

  const familyNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const f of allFamiliesData?.items ?? []) {
      map[f.id] = f.name
    }
    return map
  }, [allFamiliesData])

  const familyPlanMap = useMemo(() => {
    const sorted = [...(allPaymentsData?.items ?? [])].sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    const map: Record<string, string> = {}
    for (const p of sorted) {
      if (p.familyId && p.planCode && !map[p.familyId]) {
        map[p.familyId] = p.planCode
      }
    }
    return map
  }, [allPaymentsData])

  const planNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of plansData?.items ?? []) {
      map[p.planCode] = p.name
    }
    return map
  }, [plansData])

  /* ── Row select ── */
  const allPageIds = useMemo(() => users.map(u => u.id), [users])
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selected.has(id))

  const toggleSelectAll = () => {
    setSelected(prev => {
      const s = new Set(prev)
      if (allSelected) allPageIds.forEach(id => s.delete(id))
      else allPageIds.forEach(id => s.add(id))
      return s
    })
  }
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  /* ── Actions ── */
  const toggleStatus = (u: AdminUser) => {
    updateUser.mutate(
      { id: u.id, accountStatus: u.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' },
      {
        onSuccess: () => toast.success('Đã cập nhật trạng thái'),
        onError: e => toast.error(getApiErrorMessage(e, 'Cập nhật thất bại')),
      },
    )
  }

  const roleChips: { label: string; value: RoleFilter }[] = [
    { label: 'Tất cả vai trò', value: 'ALL' },
    { label: 'User', value: 'NORMAL_USER' },
    { label: 'Admin', value: 'SYSTEM_ADMIN' },
  ]

  return (
    <div className="space-y-6">


        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{total.toLocaleString('vi-VN')}</span> người dùng tổng cộng
          </p>
          <div className="flex items-center gap-2">
            {/* Export and Add User buttons removed */}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên, email, hoặc gia đình..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            {roleChips.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setRoleFilter(value); setPage(1) }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  roleFilter === value
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1) }}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-400/20 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
            <option value="SUSPENDED">Tạm khóa</option>
          </select>
          {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-500" />}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-10 py-3 px-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-teal-500 focus:ring-teal-400"
                    />
                  </th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Người dùng</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Vai trò</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Gia đình</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Gói</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Ngày tham gia</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                        <p className="text-sm">Đang tải...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-sm text-slate-400">
                      Không tìm thấy người dùng phù hợp
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const colorClass = avatarColor(u.id)
                    const initials = getInitials(u.fullName || u.email || '?')
                    const isSelected = selected.has(u.id)

                    // Lookup family + plan
                    const membership = userFamilyMap[u.id]
                    const familyId = membership?.familyId
                    const familyName = familyId ? familyNameMap[familyId] : undefined
                    const planCode = familyId ? familyPlanMap[familyId] : undefined
                    const planName = planCode ? (planNameMap[planCode] ?? planCode) : undefined

                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-teal-50/30' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(u.id)}
                            className="rounded border-slate-300 text-teal-500 focus:ring-teal-400"
                          />
                        </td>

                        {/* NGƯỜI DÙNG */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${colorClass}`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-800 leading-tight block max-w-[130px] truncate text-left">
                                {u.fullName || '—'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                usr-{u.id.slice(-4)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="py-3 px-3">
                          <p className="text-[12px] text-slate-600 max-w-[180px] truncate">{u.email}</p>
                        </td>

                        {/* VAI TRÒ */}
                        <td className="py-3 px-3">
                          <RoleBadge userType={u.userType} familyRole={userFamilyMap[u.id]?.familyRole} hasFamily={!!userFamilyMap[u.id]} />
                        </td>

                        {/* GIA ĐÌNH — từ useAdminFamilyMembers + useAdminFamilies */}
                        <td className="py-3 px-3">
                          {familyName ? (
                            <Link href={`/admin/families`}>
                              <span className="text-[12px] text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer">
                                🏠 {familyName}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-[12px] text-slate-300">—</span>
                          )}
                        </td>

                        {/* GÓI — từ useAdminPayments + useAdminSubscriptionPlans */}
                        <td className="py-3 px-3">
                          <PlanBadge planCode={planCode} planName={planName} />
                        </td>

                        {/* TRẠNG THÁI */}
                        <td className="py-3 px-3">
                          <StatusBadge status={u.accountStatus} />
                        </td>

                        {/* NGÀY THAM GIA */}
                        <td className="py-3 px-3">
                          <p className="text-[12px] text-slate-500 whitespace-nowrap">{formatDate(u.createdAt)}</p>
                        </td>

                        {/* THAO TÁC */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={updateUser.isPending || u.id === user?.id || u.userType === 'SYSTEM_ADMIN'}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                              u.id === user?.id || u.userType === 'SYSTEM_ADMIN'
                                ? 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed'
                                : u.accountStatus === 'SUSPENDED'
                                  ? 'text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100'
                            }`}
                            title={u.id === user?.id ? 'Không thể thao tác lên chính mình' : u.userType === 'SYSTEM_ADMIN' ? 'Không thể thao tác lên Admin khác' : ''}
                          >
                            {u.accountStatus === 'SUSPENDED' ? 'Mở khóa' : 'Khóa'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value) as typeof PAGE_SIZES[number]); setPage(1) }}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>/ {total.toLocaleString('vi-VN')} người dùng</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        page === p
                          ? 'bg-teal-500 text-white border border-teal-500'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}


