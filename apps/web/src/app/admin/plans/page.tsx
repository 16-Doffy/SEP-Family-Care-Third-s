'use client'
import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, HardDrive, Users, Loader2, CreditCard, BadgePercent, CalendarDays, Tag, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '@/lib/api'
import {
  useAdminSubscriptionPlans, useCreateSubscriptionPlan, useUpdateSubscriptionPlan, useDeleteSubscriptionPlan,
  type SubscriptionPlan,
} from '@/hooks/useAdmin'
import {
  KNOWN_FEATURES, FEATURE_GROUPS, TIER_META, CORE_FEATURE_KEYS, CONFIGURABLE_FEATURE_KEYS, BASELINE_FEATURES,
  isFeatureAvailable, isFeatureConfigurable, featureLabel, isOfficialFeatureKey, isDisplayableFeatureKey,
  type FeatureTier,
} from '@/lib/feature-catalog'

interface FormState {
  planCode: string
  name: string
  billingPeriod: 'FREE' | 'MONTHLY' | 'YEARLY'
  monthlyPrice: string
  yearlyPrice: string
  maxMembers: string   // required on CREATE per swagger
  storageLimit: string
  stripePriceId: string
  features: Record<string, boolean>
  isActive: boolean
}

const EMPTY: FormState = {
  planCode: '', name: '', billingPeriod: 'FREE', monthlyPrice: '', yearlyPrice: '', maxMembers: '', storageLimit: '0',
  stripePriceId: '',
  features: Object.fromEntries(KNOWN_FEATURES.map((f) => [f.key, false])),
  isActive: true,
}

const PLAN_CODE_RE = /^[A-Z0-9_]+$/

const toPrice = (value: number | string) => Number(value) || 0
const money = (value: number) => `${value.toLocaleString('vi-VN')} VND`
const planBillingPeriod = (plan: SubscriptionPlan): FormState['billingPeriod'] =>
  plan.billingPeriod ?? (plan.planCode === 'FREE' ? 'FREE' : /YEAR|NAM/i.test(plan.planCode) ? 'YEARLY' : 'MONTHLY')
const monthlyPlanPrice = (plan: SubscriptionPlan) => toPrice(plan.monthlyPrice ?? plan.annualPrice ?? 0)
const yearlyPlanPrice = (plan: SubscriptionPlan) => toPrice(plan.yearlyPrice ?? plan.annualPrice ?? 0)

function PriceSummary({ plan, plans }: { plan: SubscriptionPlan; plans: SubscriptionPlan[] }) {
  const billingPeriod = planBillingPeriod(plan)
  const price = billingPeriod === 'YEARLY' ? yearlyPlanPrice(plan) : monthlyPlanPrice(plan)
  const monthlyPlan = plans.find((candidate) => planBillingPeriod(candidate) === 'MONTHLY')
  const monthlyPrice = monthlyPlan ? monthlyPlanPrice(monthlyPlan) : 0
  const originalYearlyPrice = billingPeriod === 'YEARLY' && monthlyPrice ? monthlyPrice * 12 : 0
  const saving = originalYearlyPrice > price ? originalYearlyPrice - price : 0
  const savingPercent = saving ? Math.round((saving / originalYearlyPrice) * 100) : 0

  if (billingPeriod === 'FREE') return <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3"><p className="text-2xl font-bold text-emerald-700">Miễn phí</p><p className="mt-1 text-xs text-emerald-700/80">Không phát sinh chi phí</p></div>
  if (billingPeriod === 'MONTHLY') return <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 px-3 py-3"><p className="text-xs font-medium text-muted-foreground">Thanh toán theo tháng</p><p className="mt-0.5 text-2xl font-bold tracking-tight text-violet-700">{money(price)} <span className="text-sm font-medium">/ tháng</span></p><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Tổng 12 tháng: <span className="font-semibold text-foreground">{money(price * 12)}</span></p></div>
  return <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-medium text-muted-foreground">Thanh toán theo năm</p><p className="mt-0.5 text-2xl font-bold tracking-tight text-blue-700">{money(price)}</p></div>{saving > 0 && <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600"><BadgePercent className="h-3 w-3" />Tiết kiệm {savingPercent}%</Badge>}</div>{originalYearlyPrice > 0 && <div className="mt-2 flex items-center gap-2 text-xs"><span className="text-muted-foreground line-through">{money(originalYearlyPrice)}</span><span className="font-semibold text-emerald-700">Giảm {money(saving)}</span></div>}<p className="mt-2 text-xs text-muted-foreground">Tương đương {money(Math.round(price / 12))} / tháng</p></div>
}

export default function PlansAdminPage() {
  const { data, isLoading } = useAdminSubscriptionPlans({ limit: 100 })
  const createPlan = useCreateSubscriptionPlan()
  const updatePlan = useUpdateSubscriptionPlan()
  const deletePlan = useDeleteSubscriptionPlan()

  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [codeError, setCodeError] = useState('')

  const plans = data?.items ?? []
  const legacyFeatureKeys = editing
    ? Object.entries((editing.featureAccess ?? {}) as Record<string, unknown>)
      .filter(([key, value]) => Boolean(value) && !isOfficialFeatureKey(key))
      .map(([key]) => key)
    : []
  /**
   * Quyền chính thức nhưng KHÔNG cấu hình được (5 key "chưa xây" / "không phải
   * công tắc riêng", xem `feature-catalog.ts`) mà dữ liệu đã lưu lỡ bật true —
   * submit() không gửi lại 5 key này nên chúng tự bị dọn sạch ở lần lưu tới.
   */
  const ghostKeysPresent = editing
    ? Object.entries((editing.featureAccess ?? {}) as Record<string, unknown>)
      .filter(([key, value]) => Boolean(value) && isOfficialFeatureKey(key) && !CONFIGURABLE_FEATURE_KEYS.includes(key))
      .map(([key]) => featureLabel(key))
    : []

  useEffect(() => {
    if (!open) return
    if (editing) {
      const fa = (editing.featureAccess ?? {}) as Record<string, boolean>
      const features: Record<string, boolean> = {}
      KNOWN_FEATURES.forEach((f) => { features[f.key] = !!fa[f.key] })
      setForm({
        planCode: editing.planCode,
        name: editing.name,
        billingPeriod: planBillingPeriod(editing),
        monthlyPrice: editing.monthlyPrice != null ? String(editing.monthlyPrice) : planBillingPeriod(editing) === 'MONTHLY' ? String(editing.annualPrice ?? '') : '',
        yearlyPrice: editing.yearlyPrice != null ? String(editing.yearlyPrice) : planBillingPeriod(editing) === 'YEARLY' ? String(editing.annualPrice ?? '') : '',
        maxMembers: editing.maxMembers != null ? String(editing.maxMembers) : '',
        storageLimit: String(editing.storageLimit ?? 0),
        stripePriceId: editing.stripePriceId ?? '',
        features,
        isActive: editing.isActive,
      })
    } else {
      setForm(EMPTY)
    }
    setCodeError('')
  }, [editing, open])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (p: SubscriptionPlan) => { setEditing(p); setOpen(true) }
  const closeDialog = () => { setOpen(false); setEditing(null) }

  const setCode = (v: string) => {
    const upper = v.toUpperCase().replace(/[^A-Z0-9_]/g, '')
    const billingPeriod = upper === 'FREE' ? 'FREE' : upper === 'YEARLY' ? 'YEARLY' : upper === 'MONTHLY' ? 'MONTHLY' : undefined
    setForm((prev) => ({ ...prev, planCode: upper, ...(billingPeriod ? { billingPeriod } : {}) }))
    setCodeError(upper && !PLAN_CODE_RE.test(upper) ? 'Chỉ dùng chữ HOA, số, dấu gạch dưới' : '')
  }

  const toggleFeature = (key: string) =>
    setForm((prev) => ({ ...prev, features: { ...prev.features, [key]: !prev.features[key] } }))

  const setGroupFeatures = (keys: string[], on: boolean) =>
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, ...Object.fromEntries(keys.map((k) => [k, on])) },
    }))

  /** Preset để admin khỏi tick tay 26 ô mỗi lần tạo gói. */
  const applyPreset = (preset: 'core' | 'all' | 'none') =>
    setForm((prev) => ({
      ...prev,
      features: Object.fromEntries(
        KNOWN_FEATURES.map((f) => [
          f.key,
          isFeatureAvailable(f) && (preset === 'all' || (preset === 'core' && f.tier === 'core')),
        ]),
      ),
    }))

  const enabledFeatureCount = CONFIGURABLE_FEATURE_KEYS.filter((key) => form.features[key]).length

  const validate = (): boolean => {
    if (!form.planCode.trim()) { toast.error('Mã gói không được để trống'); return false }
    if (!PLAN_CODE_RE.test(form.planCode)) { toast.error('Mã gói chỉ dùng chữ HOA, số, dấu _'); return false }
    if (!form.name.trim()) { toast.error('Tên hiển thị không được để trống'); return false }
    if (form.billingPeriod === 'MONTHLY' && Number(form.monthlyPrice) <= 0) { toast.error('Nhập giá tháng lớn hơn 0'); return false }
    if (form.billingPeriod === 'YEARLY' && Number(form.yearlyPrice) <= 0) { toast.error('Nhập giá năm lớn hơn 0'); return false }
    if (form.billingPeriod !== 'FREE' && !form.stripePriceId.trim()) { toast.error('Gói trả phí cần Stripe Price ID'); return false }
    if (!editing && !form.maxMembers) { toast.error('Số thành viên tối đa là bắt buộc'); return false }
    return true
  }

  const submit = () => {
    if (!validate()) return
    const payload = {
      planCode: form.planCode,
      name: form.name.trim(),
      billingPeriod: form.billingPeriod,
      monthlyPrice: form.billingPeriod === 'MONTHLY' ? Number(form.monthlyPrice) : undefined,
      yearlyPrice: form.billingPeriod === 'YEARLY' ? Number(form.yearlyPrice) : undefined,
      maxMembers: form.maxMembers ? Number(form.maxMembers) : undefined,
      storageLimit: Number(form.storageLimit) || 0,
      stripePriceId: form.billingPeriod === 'FREE' ? undefined : form.stripePriceId.trim() || undefined,
      // Chỉ gửi 21 key admin thật sự chọn được. BE REPLACE toàn bộ featureAccess mỗi
      // lần PATCH (không merge) nên bỏ 5 key ẩn ra khỏi đây tự động dọn sạch dữ liệu
      // ma còn sót từ trước — không cần admin tự tay tắt từng ô.
      featureAccess: Object.fromEntries(
        CONFIGURABLE_FEATURE_KEYS.map((key) => [key, !!form.features[key]]),
      ),
      isActive: form.isActive,
    }
    const callbacks = {
      onSuccess: () => { toast.success(editing ? 'Đã cập nhật gói' : 'Đã tạo gói mới'); closeDialog() },
      onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Lưu thất bại')),
    }
    if (editing) {
      const { planCode: _pc, ...updatePayload } = payload
      updatePlan.mutate({ id: editing.id, ...updatePayload }, callbacks)
    } else {
      createPlan.mutate(payload as Parameters<typeof createPlan.mutate>[0], callbacks)
    }
  }

  const handleDelete = (p: SubscriptionPlan) => {
    if (p._count && p._count.families > 0) {
      toast.error(`Gói đang được ${p._count.families} gia đình sử dụng`)
      return
    }
    if (!confirm(`Xoá gói "${p.name}" (${p.planCode})?`)) return
    deletePlan.mutate(p.id, {
      onSuccess: () => toast.success('Đã xoá gói'),
      onError: (e) => toast.error(getApiErrorMessage(e, 'Không thể xoá')),
    })
  }

  const isPending = createPlan.isPending || updatePlan.isPending

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Danh sách Gói dịch vụ ({plans.length})</h2>
          <p className="text-xs text-slate-500">Cấu hình tính năng và mức giá cho các gói thuê bao gia đình</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4" />Tạo gói mới
        </Button>
      </div>


        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Chưa có gói thuê bao nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {plans.map((p) => {
              const fa = (p.featureAccess ?? {}) as Record<string, unknown>
              const displayable = Object.entries(fa).filter(([key, v]) => Boolean(v) && isDisplayableFeatureKey(key)).map(([k]) => k)
              const shownFeatures = displayable.slice(0, 6)
              const moreFeaturesCount = displayable.length - shownFeatures.length
              const hasLegacyKeys = Object.entries(fa).some(([key, value]) => Boolean(value) && !isOfficialFeatureKey(key))
              const hasGhostKeys = Object.entries(fa).some(([key, value]) => Boolean(value) && isOfficialFeatureKey(key) && !isDisplayableFeatureKey(key))
              return (
                <Card key={p.id} className={cn('flex flex-col', !p.isActive && 'opacity-55')}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base truncate">{p.name}</CardTitle>
                      <div className="flex gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(p)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <PriceSummary plan={p} plans={plans} />

                    {/* planCode là định danh kỹ thuật (mobile gửi lên khi checkout), không phải nhãn
                        cho người đọc — để cùng hàng với Stripe Price ID thay vì làm badge trên tiêu đề. */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />Mã gói: <span className="font-mono">{p.planCode}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />{p.storageLimit} MB
                      </span>
                      {p.maxMembers != null && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />tối đa {p.maxMembers} thành viên
                        </span>
                      )}
                      {p.stripePriceId && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span className="font-mono truncate max-w-[120px]">{p.stripePriceId}</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {displayable.length + BASELINE_FEATURES.length} tính năng người dùng thấy
                        <span className="font-normal"> ({displayable.length} cấu hình được + {BASELINE_FEATURES.length} nền tảng)</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {BASELINE_FEATURES.map((label) => (
                          <Badge key={label} variant="outline" className="text-[10px] text-muted-foreground border-dashed" title="Luôn có ở mọi gói, không cấu hình được ở đây">
                            {label}
                          </Badge>
                        ))}
                        {shownFeatures.map((k) => (
                          <Badge key={k} variant="secondary" className="text-[10px]">{featureLabel(k)}</Badge>
                        ))}
                        {moreFeaturesCount > 0 && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                            +{moreFeaturesCount} nữa
                          </Badge>
                        )}
                      </div>
                    </div>

                    {(hasLegacyKeys || hasGhostKeys) && (
                      <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-snug text-amber-800">
                        <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {hasLegacyKeys && <p>Có quyền kiểu cũ không khớp key chuẩn — mở Sửa để chọn lại.</p>}
                          {hasGhostKeys && <p>Có quyền chưa dùng được còn lưu trong dữ liệu — mở Sửa rồi bấm Cập nhật (không cần tick gì) để tự dọn.</p>}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto flex justify-between items-center pt-2 border-t">
                      <Badge variant={p.isActive ? 'default' : 'secondary'} className="text-xs">
                        {p.isActive ? 'Đang hoạt động' : 'Tắt'}
                      </Badge>
                      {p._count != null && (
                        <span className="text-xs text-muted-foreground">{p._count.families} gia đình</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}


      <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Sửa gói: ${editing.planCode}` : 'Tạo gói mới'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'planCode không thể thay đổi sau khi tạo.'
                : 'planCode là định danh duy nhất — chỉ CHỮ HOA, số và dấu _ (VD: FREE, MONTHLY, YEARLY).'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Row 1: planCode + name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Mã gói <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.planCode}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VD: MONTHLY"
                  disabled={!!editing}
                  className={`font-mono ${codeError ? 'border-red-400' : ''}`}
                />
                {codeError && <p className="text-xs text-red-500">{codeError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Tên hiển thị <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Gói tháng"
                />
              </div>
            </div>

            {/* Row 2: billing + price + maxMembers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Chu kỳ thanh toán</Label>
                <select
                  value={form.billingPeriod}
                  onChange={(e) => setForm({ ...form, billingPeriod: e.target.value as FormState['billingPeriod'] })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="FREE">Miễn phí</option>
                  <option value="MONTHLY">Theo tháng</option>
                  <option value="YEARLY">Theo năm</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{form.billingPeriod === 'MONTHLY' ? 'Giá / tháng (VND)' : form.billingPeriod === 'YEARLY' ? 'Giá / năm (VND)' : 'Giá'}</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={form.billingPeriod === 'FREE'}
                  value={form.billingPeriod === 'MONTHLY' ? form.monthlyPrice : form.yearlyPrice}
                  onChange={(e) => setForm({ ...form, ...(form.billingPeriod === 'MONTHLY' ? { monthlyPrice: e.target.value } : { yearlyPrice: e.target.value }) })}
                  placeholder={form.billingPeriod === 'FREE' ? 'Miễn phí' : '0'}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Số thành viên tối đa
                  {!editing && <span className="text-red-500"> *</span>}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
                  placeholder={editing ? 'Không đổi' : 'Bắt buộc'}
                  className={!editing && !form.maxMembers ? 'border-amber-400' : ''}
                />
              </div>
            </div>

            {/* Row 3: storageLimit + stripePriceId */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dung lượng (MB)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.storageLimit}
                  onChange={(e) => setForm({ ...form, storageLimit: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stripe Price ID {form.billingPeriod !== 'FREE' && <span className="text-red-500">*</span>}</Label>
                <Input
                  value={form.stripePriceId}
                  onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })}
                  disabled={form.billingPeriod === 'FREE'}
                  placeholder="price_xxx (gói trả phí)"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Tính năng của gói */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Tính năng của gói</Label>
                <span className="text-xs text-muted-foreground">
                  Đã bật <span className="font-semibold text-foreground tabular-nums">{enabledFeatureCount}</span>/{CONFIGURABLE_FEATURE_KEYS.length} tính năng
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Chọn nhanh:</span>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyPreset('core')}>
                  Gói miễn phí ({CORE_FEATURE_KEYS.length} tính năng cơ bản)
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyPreset('all')}>
                  Gói trả phí (tất cả)
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => applyPreset('none')}>
                  Bỏ chọn hết
                </Button>
              </div>

              {enabledFeatureCount === 0 && (
                <p className="text-[11px] leading-snug text-amber-700">
                  Gói chưa bật tính năng nào. Người dùng gói này sẽ không tạo được sự kiện lịch và không dùng được các thao tác cơ bản khác — bấm “Gói miễn phí” ở trên để bật nhóm cơ bản.
                </p>
              )}
              {ghostKeysPresent.length > 0 && (
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Gói này còn {ghostKeysPresent.length} quyền chưa dùng được ({ghostKeysPresent.join(', ')}) từ trước — không hiện ở danh sách bên dưới,
                  sẽ tự bị xoá khỏi gói khi bạn bấm Cập nhật.
                </p>
              )}
              {legacyFeatureKeys.length > 0 && (
                <p className="text-[11px] leading-snug text-amber-700">
                  Gói này còn {legacyFeatureKeys.length} quyền kiểu cũ không còn dùng nữa và sẽ bị bỏ khi lưu. Hãy chọn lại quyền trong danh sách bên dưới.
                </p>
              )}

              {/*
                Chỉ vẽ ô tick cho quyền `configurable` (21/26) — 5 quyền còn lại
                (chưa xây tính năng, hoặc không phải công tắc riêng theo BE) ẩn
                hẳn khỏi đây thay vì hiện xám, để admin không phải đoán vì sao có
                ô không bấm được. Xem `feature-catalog.ts` để biết chi tiết 5 key.
              */}
              {/* Mỗi nhóm là một khối bo góc riêng, cách nhau bằng khoảng trống thật (space-y-3)
                  thay vì chỉ một đường viền mỏng — trước đó header nhóm sau dính sát vào hàng
                  cuối của nhóm trước, nhìn như cùng một khối. */}
              <div className="space-y-3">
                {FEATURE_GROUPS.map((group) => {
                  const items = KNOWN_FEATURES.filter((f) => f.group === group && isFeatureConfigurable(f))
                  if (items.length === 0) return null
                  const onCount = items.filter((f) => form.features[f.key]).length
                  const allOn = onCount === items.length
                  return (
                    <div key={group} className="rounded-md border overflow-hidden">
                      <div className="flex items-center justify-between gap-2 border-l-4 border-l-violet-500 bg-muted/60 px-3 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{group}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-muted-foreground tabular-nums">{onCount}/{items.length}</span>
                          <button
                            type="button"
                            className="text-[11px] font-medium text-violet-700 hover:underline"
                            onClick={() => setGroupFeatures(items.map((i) => i.key), !allOn)}
                          >
                            {allOn ? 'Bỏ cả nhóm' : 'Chọn cả nhóm'}
                          </button>
                        </div>
                      </div>
                      <div className="divide-y">
                        {items.map((f) => (
                          <label
                            key={f.key}
                            title={`Mã kỹ thuật: ${f.key}`}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-violet-600 shrink-0"
                              checked={!!form.features[f.key]}
                              onChange={() => toggleFeature(f.key)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-none">{f.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${TIER_META[f.tier].className}`}>
                              {TIER_META[f.tier].label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                {(Object.keys(TIER_META) as FeatureTier[]).map((tier) => (
                  <span key={tier} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded border ${TIER_META[tier].className}`}>{TIER_META[tier].label}</span>
                    {TIER_META[tier].hint}
                  </span>
                ))}
              </div>
            </div>

            {/* isActive */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-violet-600"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm font-medium">Đang hoạt động</span>
              <span className="text-xs text-muted-foreground">(tắt để ẩn khỏi danh sách gói công khai)</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>Huỷ</Button>
            <Button onClick={submit} disabled={isPending || !!codeError}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? 'Cập nhật' : 'Tạo gói'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
