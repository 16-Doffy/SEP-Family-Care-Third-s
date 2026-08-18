# AI Handoff — Trạng thái hiện tại (2026-08-18)

Đây là file bàn giao ngắn để phiên Claude sau (hoặc bạn) nắm nhanh việc đang dở, không cần đọc lại toàn bộ git log.

## Đang làm: đồng bộ featureAccess theo gói (Free/Plus/Premium)

Chuỗi 3 commit gần nhất trên `main`, theo thứ tự thời gian:

1. **`25692b0`** — tách 26-key `feature-catalog.ts` dùng chung giữa Admin (trang Gói dịch vụ), `UpgradePlanDialog` và web app người dùng. Thêm `FeatureGate` + `useFeatureAccess`, gate `/calendar` và `/ai-chat` cho user thường (trước đó web app không đọc `featureAccess` ở đâu cả).
2. **`04984f1`** — dựng cơ chế dialog "khoá tính năng" toàn cục: `lib/api.ts` bắt 403 kèm `code: "FEATURE_LOCKED"` qua bus module-level (axios interceptor ngoài cây React), `FeatureLockedDialog` mount ở `(app)/layout.tsx`. **Lớp sẵn, chưa có tác dụng** — BE hiện chỉ throw `Errors.Forbidden()` → "Forbidden" trơn, chưa trả `code`/`featureKey`. Đề xuất format đã gửi BE nằm ở `DE_XUAT_BE_FEATUREACCESS_ENFORCEMENT_2026-08-18.md` (tìm trong `apps/web/src/hooks/useFeatureAccess.ts` hoặc hỏi lại nếu file đã di chuyển).
3. **`f2cb4ac`** (mới nhất) — theo xác nhận của BE ngày 2026-08-18: `sos.liveLocation` (theo dõi vị trí liên tục khi cảnh báo còn mở) chuyển từ tier `core` sang `advanced` (trả phí). Vị trí 1 lần lúc tạo SOS vẫn luôn miễn phí, không key nào khoá. **Chỉ đổi tier trong catalog** — chưa tự động sửa dữ liệu gói Free đã lưu trong DB, cần vào Admin Web tắt tay "SOS vị trí trực tiếp" ở gói Free rồi bấm Cập nhật.

## BE đã đồng ý (2026-08-18) — chốt hợp đồng lỗi 403

BE phản hồi đồng ý đề xuất `DE_XUAT_BE_FEATUREACCESS_ENFORCEMENT_2026-08-18.md`:
- 403 khi tính năng bị khoá theo gói → `code: "FEATURE_LOCKED"` + `featureKey` (đúng field `lib/api.ts` đang bắt sẵn ở `emitFeatureLocked`).
- Sau này nếu có giới hạn quota (vd. `maxTasksPerMonth`) → dùng `code: "QUOTA_EXCEEDED"` riêng, **không dùng chung** `FEATURE_LOCKED`. FE hiện **chưa** xử lý code này — cần thêm khi BE triển khai quota thật.
- `sos.fallDetection` (Phát hiện té ngã) và tự động tạo SOS khi té ngã: MVP coi là **1 cụm tính năng, khoá/mở chung 1 key** `sos.fallDetection` — không có key riêng cho auto-SOS. FE có thể hiển thị 2 dòng mô tả nhưng chỉ gate bằng 1 key. Đã cập nhật comment trong `feature-catalog.ts:68` để không ai tạo nhầm key thứ hai sau này.

## Đã verify trực tiếp (2026-08-18) — BE enforce rồi nhưng SAI tên field

Login thật bằng tài khoản Free (`duynpnse161783@fpt.edu.vn`, gia đình "Gia Đình Của Duy", `calendar.recurringEvents: false` xác nhận qua `GET /families/{familyId}/subscription`), gọi thật `POST /families/{familyId}/calendar/events` với `isRecurring:true` → nhận **403 thật**:

```json
{
  "success": false,
  "message": "Tính năng yêu cầu nâng cấp gói.",
  "statusCode": 403,
  "code": "FEATURE_NOT_AVAILABLE",
  "errorCode": "FEATURE_NOT_AVAILABLE",
  "feature": "calendar.recurringEvents"
}
```

BE **đã enforce đúng logic** (403 chuẩn theo featureAccess) nhưng **field tên sai** so với thoả thuận đã chốt ở trên:
- `code` đang là `"FEATURE_NOT_AVAILABLE"`, cần đổi thành `"FEATURE_LOCKED"`.
- Tên field key tính năng đang là `feature`, cần đổi thành `featureKey`.
- Field `errorCode` bị thừa, không nằm trong thoả thuận (trùng giá trị với `code`).

**Hậu quả hiện tại:** `lib/api.ts:120` đang check chính xác `code === 'FEATURE_LOCKED'` + đọc `featureKey` — cả hai đều không khớp response thật ở trên, nên `FeatureLockedDialog` **không kích hoạt** dù BE tưởng đã xong. Cần báo lại BE đổi tên field, KHÔNG cần FE sửa gì (trừ khi quyết định đổi field FE để khớp BE thay vì ngược lại — nên giữ nguyên theo thoả thuận đã chốt, yêu cầu BE sửa).

Cách test lại nhanh (curl, cần login lấy token mới vì access token hết hạn sau 15 phút):
```bash
curl -sk -X POST https://103.110.84.66/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"<free-account-email>","password":"<password>"}'
curl -sk -X POST "https://103.110.84.66/api/v1/families/<familyId>/calendar/events" \
  -H "Authorization: Bearer <accessToken>" -H "Content-Type: application/json" \
  -d '{"title":"test","startTime":"2026-08-20T09:00:00.000Z","isRecurring":true}'
```
Lưu ý: API thật nằm ở **HTTPS** (`https://103.110.84.66`, cần `-k` vì cert tự ký) — gọi qua **HTTP port 80 trả 404 tĩnh của nginx** (không phải lỗi thật, dễ nhầm là API chết). Swagger JSON đầy đủ ở `https://103.110.84.66/api/docs-json` (bản HTTP cũ 404 vì lý do tương tự).

## Việc cần làm tiếp / chưa xong

- **Vào Admin Web sửa gói Free**: tắt tick `sos.liveLocation` (nếu còn bật) để catalog và dữ liệu thật khớp nhau. Đây là bước thủ công, không script hoá được.
- **Chờ BE trả `code: "FEATURE_LOCKED"`** đúng theo đề xuất — khi đó `FeatureLockedDialog` mới thực sự kích hoạt. Hiện tại nếu bấm vào tính năng bị khoá mà BE chưa update, sẽ thấy lỗi "Forbidden" trơn thay vì dialog đẹp.
- **19/26 key còn lại chưa có khoá UI thật** ở web (chỉ có `calendar.enabled` và `ai.assistant` được `FeatureGate` chặn trước khi gọi API). Các trang như `/wallet`, `/tasks`, `/chat`, `/devices` vẫn dùng được đầy đủ dù đang ở gói Free — đây là giới hạn đã biết, không phải bug khi test.
- Xem thêm gap giữa FE/BE ở [[project-admin-api-gaps]] (memory) — endpoint `admin/system/health`, `admin/system/docker`, `admin/revenue` vẫn 404.

## Cách test nhanh (gói Free)

Đã có sẵn `scripts/test-goi-free.ps1` — in ra checklist các bước bấm tay (không tự động hoá được vì là hành vi UI), gồm:
- Bước 0: xác nhận cấu hình 7 quyền đúng ở Admin (đặc biệt `sos.liveLocation` phải tắt).
- Bước 1: web app — `/calendar` (vào được), `/ai-chat` (phải bị khoá UI), `/settings` → dialog nâng cấp gói.
- Bước 2: 19 tính năng còn lại chưa khoá — ghi nhận không phải bug.
- Bước 3–4: mobile (album video/face suggestions, màn Gói đăng ký, SOS luôn miễn phí).
- Bước 5: dialog FEATURE_LOCKED — chưa nên thấy, nếu thấy nghĩa là BE đã lên code.

Chạy: `.\scripts\test-goi-free.ps1` tại `d:\Desktop\sep`.

Build/dev trước khi test UI thật: `.\scripts\self-test.ps1` (build sạch `.next`, chạy `pnpm dev`, in sẵn URL cần bấm).

## Ghi chú môi trường

- Backend dùng chung của team: `http://103.110.84.66`, prefix `/api/v1`, envelope response — xem [[team-deployed-api]].
- Không có npm/npx trên PATH, dùng `pnpm` tại `C:\Users\N DUY\AppData\Roaming\npm`.
