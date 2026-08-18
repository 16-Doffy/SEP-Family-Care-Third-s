/**
 * Danh sách key `featureAccess` chính thức theo Swagger — nguồn sự thật DUY
 * NHẤT cho cả trang Admin (Gói dịch vụ) lẫn màn nâng cấp gói của người dùng
 * (`UpgradePlanDialog`). Trước đây danh mục này chỉ tồn tại trong
 * `app/admin/plans/page.tsx`; nơi khác muốn biết tên/nhãn/trạng thái một key
 * phải chép tay lại — đúng kiểu lệch dữ liệu đã gặp với `chat.announcements`
 * (BE khai key, chưa xây tính năng, nhưng UI công khai vẫn hiện badge).
 *
 * `group` chỉ để xếp nhóm trong giao diện. `tier` là gợi ý đóng gói:
 * `core` = vòng lặp lõi, gói miễn phí cũng phải có (tắt là người dùng không
 * tạo được sự kiện lịch, không nhắn tin được); `advanced` = tự động hoá và
 * lưu trữ nặng; `ai` = tốn chi phí gọi mô hình mỗi lần dùng.
 *
 * `available: false` = 26 key chính thức của BE nhưng KHÔNG nên đưa cho admin
 * tự bật/tắt, giữ lại trong mảng này chỉ để [isOfficialFeatureKey] nhận diện
 * đúng và không báo nhầm "legacy". Hai lý do khác nhau đứng sau `available:
 * false`, ghi rõ ở từng dòng để lần sau đổi lại không đoán mò:
 *
 * - **Chưa xây** (`finance.aiOcrSuggestion`, `chat.announcements`): đối chiếu
 *   Swagger `family-care-api.json` (237 path, 18/08/2026) không có endpoint
 *   nào đứng sau. Bật lên là bán thứ chưa tồn tại.
 * - **Không phải công tắc riêng** (`ai.financeSummary`, `ai.taskSummary`,
 *   `ai.savingSuggestions`): theo `API_DOCS.md` bản mobile (dòng 768-771),
 *   BE **không guard** ba key này — hành vi tóm tắt tài chính/công việc/gợi ý
 *   tiết kiệm đã chạy thật bên trong Trợ lý AI ngay khi `ai.assistant` bật,
 *   không phụ thuộc ba key con. Tick/bỏ tick chúng không đổi được gì, cho
 *   admin thấy là gây hiểu lầm có quyền kiểm soát mà thực ra không có.
 *
 * Cả hai loại đều ẩn khỏi ô chọn tương tác của admin (`configurable: false`)
 * — khác nhau ở chỗ loại "chưa xây" có thể quay lại thành công tắc thật khi
 * BE hoàn thiện, còn loại "không phải công tắc riêng" nhiều khả năng không
 * bao giờ trở thành toggle độc lập.
 */
export type FeatureTier = 'core' | 'advanced' | 'ai'

export interface FeatureCatalogEntry {
  key: string
  label: string
  description: string
  group: string
  tier: FeatureTier
  available?: boolean
  /** false = ẩn khỏi ô chọn tương tác của admin (xem giải thích `available` ở trên). Mặc định true. */
  configurable?: boolean
}

export const KNOWN_FEATURES: FeatureCatalogEntry[] = [
  { key: 'calendar.enabled', label: 'Lịch gia đình', description: 'Tạo, sửa và hủy sự kiện lịch', group: 'Lịch gia đình', tier: 'core' },
  { key: 'calendar.reminders', label: 'Nhắc lịch', description: 'Nhắc trước giờ diễn ra sự kiện', group: 'Lịch gia đình', tier: 'advanced' },
  { key: 'calendar.recurringEvents', label: 'Lịch lặp lại', description: 'Tạo sự kiện lịch định kỳ', group: 'Lịch gia đình', tier: 'advanced' },
  { key: 'finance.budgetPlanning', label: 'Lập kế hoạch ngân sách', description: 'Lập ngân sách chi tiêu', group: 'Tài chính', tier: 'advanced' },
  { key: 'finance.financialGoals', label: 'Mục tiêu tài chính', description: 'Theo dõi mục tiêu tiết kiệm', group: 'Tài chính', tier: 'advanced' },
  { key: 'finance.budgetAlerts', label: 'Cảnh báo ngân sách', description: 'Cảnh báo vượt ngân sách', group: 'Tài chính', tier: 'advanced' },
  { key: 'finance.supportRequests', label: 'Yêu cầu hỗ trợ chi tiêu', description: 'Quy trình xin hỗ trợ tài chính', group: 'Tài chính', tier: 'core' },
  { key: 'finance.reportExport', label: 'Xuất báo cáo tài chính', description: 'Báo cáo và xuất dữ liệu nâng cao', group: 'Tài chính', tier: 'advanced' },
  { key: 'finance.aiOcrSuggestion', label: 'Quét hoá đơn bằng AI', description: 'Đọc hoá đơn và gợi ý dữ liệu giao dịch', group: 'Tài chính', tier: 'ai', available: false, configurable: false },
  { key: 'tasks.recurringTasks', label: 'Công việc lặp lại', description: 'Thiết lập công việc định kỳ', group: 'Nhiệm vụ và phần thưởng', tier: 'advanced' },
  { key: 'tasks.proofUpload', label: 'Bằng chứng công việc', description: 'Tải bằng chứng hoàn thành', group: 'Nhiệm vụ và phần thưởng', tier: 'core' },
  { key: 'tasks.rewardSettlement', label: 'Quyết toán phần thưởng', description: 'Quyết toán và tranh chấp phần thưởng', group: 'Nhiệm vụ và phần thưởng', tier: 'core' },
  { key: 'tasks.rewardAllocation', label: 'Phân bổ phần thưởng', description: 'Phân bổ phần thưởng công việc', group: 'Nhiệm vụ và phần thưởng', tier: 'core' },
  { key: 'album.videoUpload', label: 'Tải video album', description: 'Cho phép lưu video album', group: 'Album', tier: 'advanced' },
  { key: 'album.faceSuggestions', label: 'Gợi ý khuôn mặt AI', description: 'AI gợi ý thành viên trong ảnh; người dùng xác nhận tag', group: 'Album', tier: 'ai' },
  { key: 'ai.assistant', label: 'Trợ lý AI', description: 'Trợ lý AI trong ứng dụng', group: 'Trợ lý AI', tier: 'ai' },
  { key: 'ai.financeSummary', label: 'Tóm tắt tài chính AI', description: 'Tóm tắt tình hình tài chính', group: 'Trợ lý AI', tier: 'ai', available: false, configurable: false },
  { key: 'ai.taskSummary', label: 'Tóm tắt công việc AI', description: 'Tóm tắt tiến độ công việc', group: 'Trợ lý AI', tier: 'ai', available: false, configurable: false },
  { key: 'ai.savingSuggestions', label: 'Gợi ý tiết kiệm AI', description: 'Gợi ý tối ưu chi tiêu', group: 'Trợ lý AI', tier: 'ai', available: false, configurable: false },
  { key: 'sos.wearablePairing', label: 'Kết nối thiết bị đeo', description: 'Ghép thiết bị đeo', group: 'SOS và an toàn', tier: 'advanced' },
  // BE xác nhận 2026-08-18: MVP gộp "Phát hiện té ngã" + "Tự động tạo SOS khi
  // té ngã" thành 1 cụm tính năng trả phí duy nhất, khoá/mở chung 1 key này -
  // không tách key riêng cho auto-SOS. FE có thể hiển thị 2 dòng mô tả nhưng
  // KHÔNG được tạo thêm featureAccess key mới cho auto-SOS.
  { key: 'sos.fallDetection', label: 'Phát hiện té ngã', description: 'Tự động cảnh báo và tạo SOS khi phát hiện té ngã', group: 'SOS và an toàn', tier: 'advanced' },
  // BE xác nhận 2026-08-18: chỉ gửi vị trí 1 LẦN lúc tạo cảnh báo là miễn phí
  // (không key nào khoá việc này — luôn chạy trong luồng tạo SOS). Key này là
  // THEO DÕI LIÊN TỤC trong lúc cảnh báo còn mở (`_startLocationStreaming`,
  // đẩy GPS định kỳ) — BE xếp vào nhóm tạo giá trị trả phí rõ nhất, không
  // phải cơ bản. Trước đó xếp `core` vì lý do an toàn; đổi lại theo đúng
  // quyết định kinh doanh đã xác nhận rõ của BE.
  { key: 'sos.liveLocation', label: 'SOS vị trí trực tiếp', description: 'Theo dõi vị trí liên tục trong lúc cảnh báo còn mở', group: 'SOS và an toàn', tier: 'advanced' },
  { key: 'sos.routeHistory', label: 'Lịch sử hành trình', description: 'Xem lại lịch sử vị trí nhiều ngày', group: 'SOS và an toàn', tier: 'advanced' },
  { key: 'chat.privateChat', label: 'Chat riêng tư', description: 'Nhắn tin riêng', group: 'Nhắn tin', tier: 'core' },
  { key: 'chat.attachments', label: 'Đính kèm chat', description: 'Gửi file và media', group: 'Nhắn tin', tier: 'core' },
  { key: 'chat.announcements', label: 'Thông báo gia đình', description: 'Đăng thông báo gia đình', group: 'Nhắn tin', tier: 'core', available: false, configurable: false },
]

/** Thứ tự nhóm hiện trên giao diện, lấy theo thứ tự key xuất hiện ở trên. */
export const FEATURE_GROUPS = Array.from(new Set(KNOWN_FEATURES.map((f) => f.group)))

export const TIER_META: Record<FeatureTier, { label: string; hint: string; className: string }> = {
  core: { label: 'Cơ bản', hint: 'nên bật cho mọi gói, kể cả gói miễn phí', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  advanced: { label: 'Nâng cao', hint: 'tự động hoá, lưu trữ nặng, thiết bị rời', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ai: { label: 'Dùng AI', hint: 'tốn chi phí gọi mô hình mỗi lần dùng', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

/**
 * Hai khả năng nền tảng KHÔNG nằm trong 26 key `featureAccess` — không gói
 * nào khoá được (đối chiếu `chat.service.ts` và `task.service.ts`: không có
 * `assertFeatureEnabled` nào chặn tạo việc/chat nhóm cơ bản, chỉ giới hạn
 * theo hạn mức `maxTasksPerMonth`). Mobile hiện cố định 2 dòng này trên MỌI
 * gói (`subscription_screen.dart`); Admin Web cần hiện lại ở đây để số đếm
 * hai bên khớp nhau — thiếu chúng, Admin đếm "8" trong khi mobile hiện "10"
 * cho cùng một gói, nhìn như sai lệch dù bản chất đúng cả hai.
 */
export const BASELINE_FEATURES = ['Nhiệm vụ & sổ thu chi cơ bản', 'Chat nhóm & Thông báo']

export const isFeatureAvailable = (f: FeatureCatalogEntry) => f.available !== false

/** Có nên vẽ ô tick tương tác cho admin không — xem giải thích `configurable` ở trên. */
export const isFeatureConfigurable = (f: FeatureCatalogEntry) => f.configurable !== false

export const AVAILABLE_FEATURE_KEYS = KNOWN_FEATURES.filter(isFeatureAvailable).map((f) => f.key)
export const CORE_FEATURE_KEYS = KNOWN_FEATURES.filter((f) => f.tier === 'core' && isFeatureAvailable(f)).map((f) => f.key)
/** Key admin thật sự cấu hình được — dùng để lọc danh sách tương tác VÀ để không gửi lại 5 key ẩn khi lưu (tự dọn dữ liệu ma còn sót). */
export const CONFIGURABLE_FEATURE_KEYS = KNOWN_FEATURES.filter(isFeatureConfigurable).map((f) => f.key)

export function featureLabel(key: string) {
  return KNOWN_FEATURES.find((f) => f.key === key)?.label ?? key
}

export const isOfficialFeatureKey = (key: string) => KNOWN_FEATURES.some((feature) => feature.key === key)

/**
 * Key chính thức VÀ đã có tính năng thật đứng sau — dùng để lọc danh sách
 * quyền lợi hiện ra NGOÀI (thẻ gói công khai, dialog nâng cấp). Khác
 * [isOfficialFeatureKey]: hộp thoại Sửa của admin vẫn cần thấy quyền "chưa có
 * trong app" để biết mà tắt, nhưng khách hàng thì không được thấy lời hứa cho
 * tính năng chưa tồn tại.
 */
export const isDisplayableFeatureKey = (key: string) =>
  KNOWN_FEATURES.some((feature) => feature.key === key && isFeatureAvailable(feature))
