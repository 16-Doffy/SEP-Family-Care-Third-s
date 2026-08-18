/**
 * Nhãn tiếng Việt cho các enum trạng thái BE trả về.
 *
 * Trước đây mỗi trang tự in thẳng `{x.status}` nên giao diện lẫn tiếng Anh
 * (`ACTIVE`, `IN_PROGRESS`, `PAID`…). Gom về một chỗ để thêm trạng thái mới chỉ
 * phải sửa một file, và để cùng một enum không bị dịch hai kiểu ở hai trang.
 *
 * Giá trị lạ (BE thêm enum mới mà FE chưa biết) trả về nguyên văn thay vì chuỗi
 * rỗng — thà hiện tiếng Anh còn hơn hiện ô trống không ai hiểu.
 */

/** Nhãn dùng chung khi không có ngữ cảnh nào đặc biệt hơn. */
const BASE_LABELS: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  PENDING: 'Chờ xử lý',
  SUSPENDED: 'Tạm khoá',
  EXPIRED: 'Hết hạn',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  CANCELED: 'Đã huỷ',
  CANCELLED: 'Đã huỷ',
  COMPLETED: 'Hoàn tất',
  IN_PROGRESS: 'Đang chạy',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  REFUNDED: 'Đã hoàn tiền',
  DISABLED: 'Đã tắt',
}

/**
 * Cùng một enum nhưng đọc khác nhau tuỳ ngữ cảnh: thiết bị `ACTIVE` là "đang
 * dùng", còn gia đình `ACTIVE` là "đang hoạt động".
 */
const DOMAIN_LABELS: Record<string, Record<string, string>> = {
  device: {
    PAIRED: 'Đã ghép nối',
    ACTIVE: 'Đang dùng',
    LOST: 'Báo mất',
    DISABLED: 'Đã tắt',
  },
  invitation: {
    PENDING: 'Chờ duyệt',
  },
  payment: {
    PENDING: 'Chờ thanh toán',
  },
  backup: {
    PENDING: 'Chờ chạy',
    IN_PROGRESS: 'Đang chạy',
  },
  task: {
    PENDING: 'Chờ',
    IN_PROGRESS: 'Đang làm',
    SUBMITTED: 'Chờ duyệt',
    APPROVED: 'Xong',
    REJECTED: 'Bị từ chối',
  },
  financeModel: {
    ACTIVE: 'Đang dùng',
  },
}

export type StatusDomain = keyof typeof DOMAIN_LABELS

export function statusLabel(value?: string | null, domain?: StatusDomain): string {
  if (!value) return '—'
  const key = value.toUpperCase()
  return (domain && DOMAIN_LABELS[domain]?.[key]) || BASE_LABELS[key] || value
}
