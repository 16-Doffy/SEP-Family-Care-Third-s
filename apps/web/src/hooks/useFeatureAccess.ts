/**
 * @module hooks/useFeatureAccess
 * @description Đọc `featureAccess` của gia đình đang hoạt động, dùng để khoá UI
 * theo gói subscription — song song với mobile (`FeatureAccess` trong
 * `lib/models/feature_access.dart`).
 *
 * BE từng trả `featureAccess` rỗng khi chưa gán gói xong (quan sát thật trên
 * mobile 2026-07-20). Coi rỗng là "chưa biết" và fail-open (cho phép), không
 * fail-closed — nếu không sẽ khoá nhầm cả người dùng gói trả phí trong lúc BE
 * chưa kịp trả dữ liệu. Cùng quy tắc `isUnknown` như mobile.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useActiveFamily } from './useFamily'

export interface SubscriptionInfo {
  planCode?: string
  planName?: string
  featureAccess?: Record<string, unknown> | null
}

function readFeatureAccess(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  return {}
}

/** Đọc một key dạng chấm (`calendar.enabled`) từ map phẳng hoặc lồng nhau. */
function readFlag(access: Record<string, unknown>, key: string): boolean {
  if (key in access) return access[key] === true
  let current: unknown = access
  for (const part of key.split('.')) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return false
    current = (current as Record<string, unknown>)[part]
  }
  return current === true
}

export function useFeatureAccess() {
  const { familyId } = useActiveFamily()
  const query = useQuery<SubscriptionInfo>({
    queryKey: ['families', familyId, 'subscription'],
    queryFn: () => api.get(`/families/${familyId}/subscription`).then((r) => r.data),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  })

  const access = readFeatureAccess(query.data?.featureAccess)
  const isUnknown = query.isLoading || Object.keys(access).length === 0

  return {
    isLoading: query.isLoading,
    isUnknown,
    planName: query.data?.planName,
    /** true nếu đã biết chắc là bật; fail-open khi chưa biết. */
    has: (key: string) => isUnknown || readFlag(access, key),
  }
}
