'use client'
/**
 * @module components/subscription/FeatureLockedDialog
 * @description Lưới đỡ toàn cục cho lỗi 403 `FEATURE_LOCKED` — mount một lần
 * ở layout, subscribe bus trong `lib/api.ts` (interceptor axios không nằm
 * trong cây React nên không phát sự kiện qua Context/hook được).
 *
 * CHỦ ĐỘNG không điều hướng đi đâu — chỉ nổi dialog đè lên đúng trang đang
 * đứng, đóng dialog là quay lại y nguyên chỗ cũ. Các trang đã có
 * `<FeatureGate>` (Lịch, Trợ lý AI) tự chặn TRƯỚC khi gọi API nên hiếm khi
 * rơi vào đây; dialog này bắt phần còn lại chưa kịp có khoá UI riêng.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { onFeatureLocked, type FeatureLockedEvent } from '@/lib/api'
import { featureLabel } from '@/lib/feature-catalog'

export function FeatureLockedDialog() {
  const router = useRouter()
  const [event, setEvent] = useState<FeatureLockedEvent | null>(null)

  useEffect(() => onFeatureLocked(setEvent), [])

  const label = event?.featureKey ? featureLabel(event.featureKey) : null

  return (
    <Dialog open={!!event} onOpenChange={(open) => { if (!open) setEvent(null) }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <DialogTitle>{label ? `${label} chưa nằm trong gói hiện tại` : 'Tính năng chưa nằm trong gói hiện tại'}</DialogTitle>
          <DialogDescription>{event?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={() => setEvent(null)}>Để sau</Button>
          <Button onClick={() => { setEvent(null); router.push('/settings') }}>Xem các gói</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
