import { AdminDockerContainer } from '@/hooks/useAdmin'

export function formatVND(value?: number | null): string {
  if (!value) return '0 ₫'
  if (value >= 1_000_000_000) return `₫${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `₫${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₫${(value / 1_000).toFixed(0)}K`
  return `₫${value}`
}

export function makeTickFormatter(maxVal: number) {
  if (maxVal >= 1_000_000_000) return (v: number) => `₫${(v / 1_000_000_000).toFixed(1)}B`
  if (maxVal >= 1_000_000) return (v: number) => `₫${(v / 1_000_000).toFixed(0)}M`
  if (maxVal >= 1_000) return (v: number) => `₫${(v / 1_000).toFixed(0)}K`
  if (maxVal > 0) return (v: number) => `₫${v}`
  return (v: number) => String(v)
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  return `${Math.floor(h / 24)} ngày trước`
}

/** Normalize container: API trả về array trực tiếp với field viết hoa hoặc viết thường */
export function getContainerName(c: AdminDockerContainer): string {
  const raw = (c.name ?? c.Names ?? '') as string
  return raw.replace(/^\//, '').split(',')[0].trim()
}

export function getContainerState(c: AdminDockerContainer): string {
  return ((c.state ?? c.State ?? '') as string).toLowerCase()
}

export function getContainerStatus(c: AdminDockerContainer): string {
  return (c.status ?? c.Status ?? '') as string
}

export function getContainerImage(c: AdminDockerContainer): string {
  return (c.image ?? c.Image ?? '') as string
}
