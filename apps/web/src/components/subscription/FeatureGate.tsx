'use client'
/**
 * @module components/subscription/FeatureGate
 * @description Khoá một khối UI theo `featureAccess` của gói hiện tại. Tính năng
 * bị khoá vẫn hiện — kèm khoá + lý do + nút mở trang Gói đăng ký — thay vì ẩn hẳn
 * (người dùng không biết có gì để mua) hoặc gọi thẳng API rồi nhận lỗi 403 khô khan.
 */

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

export function FeatureGate({
  featureKey,
  label,
  children,
}: {
  /** Key trong `featureAccess`, ví dụ `calendar.enabled`. */
  featureKey: string
  /** Tên tính năng hiển thị trong câu giải thích, ví dụ "Trợ lý AI". */
  label: string
  children: React.ReactNode
}) {
  const { has, isLoading } = useFeatureAccess()

  if (isLoading) return null
  if (has(featureKey)) return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{label} chưa nằm trong gói hiện tại</p>
        <p className="text-sm text-muted-foreground">Nâng cấp gói để mở khoá tính năng này.</p>
      </div>
      <Link href="/settings" className="text-sm font-medium text-primary underline underline-offset-4">
        Xem các gói đăng ký
      </Link>
    </div>
  )
}
