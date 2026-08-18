'use client'
/**
 * @module UpgradePlanDialog
 * @description Dialog nâng cấp gói thuê bao gia đình.
 *
 * Hiển thị tất cả các gói đang hoạt động theo dạng lưới (tối đa 3 cột).
 * Mỗi gói hiển thị tên, giá, giới hạn thành viên/nhiệm vụ và danh sách tính năng.
 *
 * Luồng thanh toán:
 * - Mock mode: xác nhận ngay lập tức, làm mới dữ liệu gia đình và lịch sử thanh toán.
 * - Stripe mode: chuyển hướng trình duyệt đến trang Stripe Checkout.
 *
 * Gói hiện tại và gói miễn phí được vô hiệu hoá nút chọn.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Crown } from 'lucide-react'
import { startCheckout } from '@/lib/payments'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from '@/hooks/useAdmin'
import { isDisplayableFeatureKey } from '@/lib/feature-catalog'

/** true nếu gói là gói miễn phí (billingPeriod FREE hoặc không có giá). */
function isFreePlan(p: SubscriptionPlan) {
  const period = p.billingPeriod ?? (p.planCode === 'FREE' ? 'FREE' : undefined)
  return period === 'FREE' || (Number(p.monthlyPrice ?? 0) === 0 && Number(p.yearlyPrice ?? p.annualPrice ?? 0) === 0)
}

/**
 * Đếm số tính năng được bật trong featureAccess — CHỈ tính key đã có tính
 * năng thật (`isDisplayableFeatureKey`). Đây là màn khách hàng thật sự thấy
 * khi cân nhắc nâng cấp; đếm cả 5 key BE mới khai enum nhưng chưa xây (vd
 * `chat.announcements`) là hứa suông một con số cao hơn thực tế.
 */
function featureCount(p: SubscriptionPlan) {
  if (!p.featureAccess) return 0
  return Object.entries(p.featureAccess).filter(([key, v]) => Boolean(v) && isDisplayableFeatureKey(key)).length
}

/**
 * Định dạng giá tiền và chu kỳ thanh toán thành chuỗi hiển thị thân thiện.
 * Gói miễn phí trả về `'Miễn phí'`; gói tháng hiển thị `/tháng`, còn lại `/năm`.
 *
 * @param p - Đối tượng gói thuê bao (shape BE live)
 * @returns User-facing price string.
 */
function formatPrice(p: SubscriptionPlan) {
  if (isFreePlan(p)) return 'Miễn phí'
  const period = p.billingPeriod ?? 'YEARLY'
  if (period === 'MONTHLY') {
    return `${Number(p.monthlyPrice ?? 0).toLocaleString('vi-VN')} VND/tháng`
  }
  const yearly = Number(p.yearlyPrice ?? p.annualPrice ?? 0)
  return `${yearly.toLocaleString('vi-VN')} VND/năm`
}

/**
 * Dialog chọn và nâng cấp gói thuê bao.
 *
 * @param open - Trạng thái mở/đóng dialog
 * @param onOpenChange - Callback khi trạng thái dialog thay đổi
 * @param currentPlanId - ID gói thuê bao hiện tại của gia đình (dùng để đánh dấu "Gói hiện tại")
 */
export function UpgradePlanDialog({
  open,
  onOpenChange,
  currentPlanId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentPlanId?: string | null
}) {
  const qc = useQueryClient()
  /** ID gói đang được xử lý thanh toán, dùng để hiển thị spinner đúng nút */
  const [pendingId, setPendingId] = useState<string | null>(null)

  /** Tải danh sách gói đang hoạt động cho subscriber, chỉ khi dialog đang mở */
  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['public-plans'],
    // GET /subscription-plans trả envelope { data: SubscriptionPlan[] } (chỉ gói active)
    queryFn: () => api.get('/subscription-plans').then((r) => (r.data?.data ?? []) as SubscriptionPlan[]).catch(() => []),
    enabled: open, // Chỉ fetch khi dialog mở để tránh request thừa
  })

  /** Mutation xử lý nâng cấp gói: khởi tạo checkout và xử lý kết quả */
  const upgradeMut = useMutation({
    mutationFn: async (planId: string) => {
      setPendingId(planId)
      return startCheckout({ type: 'SUBSCRIPTION', planId })
    },
    onSuccess: (instant) => {
      if (instant) {
        // Mock mode: thanh toán thành công ngay, làm mới cache và đóng dialog
        toast.success('🎉 Nâng cấp gói thành công!')
        qc.invalidateQueries({ queryKey: ['family'] })
        qc.invalidateQueries({ queryKey: ['payment-history'] })
        onOpenChange(false)
      }
      // Stripe mode: trình duyệt đã redirect, không cần làm gì thêm ở đây
    },
    onError: (e: { response?: { data?: { error?: string } } }) => {
      toast.error(e.response?.data?.error ?? 'Thanh toán thất bại')
    },
    // Reset pendingId dù thành công hay thất bại
    onSettled: () => setPendingId(null),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Nâng cấp gói thuê bao
          </DialogTitle>
          <DialogDescription>
            Chọn gói annual phù hợp để mở khóa tính năng cao cấp cho Family Workspace.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chỉ hiển thị các gói đang hoạt động */}
            {plans.filter((p) => p.isActive).map((p) => {
              const isCurrent = currentPlanId === p.id
              const isFree = isFreePlan(p)
              const nFeatures = featureCount(p)
              return (
                <div
                  key={p.id}
                  className={cn(
                    'border rounded-xl p-5 flex flex-col gap-3',
                    // Gói hiện tại được highlight bằng viền và nền xanh
                    isCurrent && 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      {isCurrent && <Badge>Gói hiện tại</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{formatPrice(p)}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">{p.planCode}</p>
                  </div>

                  <div className="text-sm space-y-1.5 flex-1">
                    {/* Hiển thị giới hạn; null nghĩa là không giới hạn (∞) */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>
                        {p.maxMembers == null ? '∞ thành viên' : `Tối đa ${p.maxMembers} thành viên`}
                      </div>
                      <div>
                        Dung lượng: {p.storageLimit >= 1024 ? `${(p.storageLimit / 1024).toFixed(0)} GB` : `${p.storageLimit} MB`}
                      </div>
                    </div>
                    {nFeatures > 0 && (
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{nFeatures} tính năng cao cấp</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => upgradeMut.mutate(p.id)}
                    // Vô hiệu hoá nếu: đang dùng gói này, đang xử lý thanh toán, hoặc là gói miễn phí
                    disabled={isCurrent || upgradeMut.isPending || isFree}
                    variant={isCurrent ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {pendingId === p.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang xử lý...</>
                    ) : isCurrent ? 'Đang dùng' : isFree ? 'Miễn phí' : 'Chọn gói này'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Thông báo chế độ mock cho môi trường phát triển */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Payment chỉ dùng cho subscription annual plan. Family Fund và reward settlement là ghi nhận nội bộ, không qua payment gateway.
        </p>
      </DialogContent>
    </Dialog>
  )
}
