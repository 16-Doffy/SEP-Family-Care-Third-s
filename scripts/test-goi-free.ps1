# Huong dan tu kiem tra trai nghiem GOI MIEN PHI (Free) - ca web lan mobile.
# Day la hanh vi giao dien can bam tay, KHONG tu dong hoa duoc - script nay
# chi in ra danh sach buoc theo dung thu tu, ban tu lam va doi chieu ket qua.
#
# Cach chay: mo PowerShell tai d:\Desktop\sep, go:
#   .\scripts\test-goi-free.ps1

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " KIEM TRA TRAI NGHIEM GOI MIEN PHI (FREE)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Can 1 tai khoan gia dinh dang o goi FREE de test (khong phai" -ForegroundColor Yellow
Write-Host "MONTHLY/YEARLY). Kiem tra o Admin Web truoc neu chua chac." -ForegroundColor Yellow
Write-Host ""

Write-Host "=== BUOC 0: Xac nhan cau hinh goi Free tren Admin ===" -ForegroundColor Cyan
Write-Host "Mo family-care-admin.vercel.app/admin/plans -> Sua goi Free."
Write-Host "Ky vong dung 7 quyen duoc tick (+ 2 dong nen tang luon hien co dinh,"
Write-Host "khong nam trong o tick):"
Write-Host "  - Lich gia dinh (calendar.enabled)"
Write-Host "  - Yeu cau ho tro chi tieu (finance.supportRequests)"
Write-Host "  - Bang chung cong viec (tasks.proofUpload)"
Write-Host "  - Quyet toan phan thuong (tasks.rewardSettlement)"
Write-Host "  - Phan bo phan thuong (tasks.rewardAllocation)"
Write-Host "  - Chat rieng tu (chat.privateChat)"
Write-Host "  - Dinh kem chat (chat.attachments)"
Write-Host "Neu thay 'SOS vi tri truc tiep' con duoc tick -> tat di, day la" -ForegroundColor Yellow
Write-Host "quyen vua chuyen sang tra phi theo xac nhan cua BE." -ForegroundColor Yellow
Write-Host ""

Write-Host "=== BUOC 1: Web app - tinh nang DA co khoa UI that ===" -ForegroundColor Cyan
Write-Host "Dang nhap bang tai khoan Free tai family-care-admin.vercel.app"
Write-Host ""
Write-Host "  1. Vao /calendar" -ForegroundColor White
Write-Host "     Ky vong: dung duoc binh thuong (calendar.enabled dang bat o Free)."
Write-Host ""
Write-Host "  2. Vao /ai-chat" -ForegroundColor White
Write-Host "     Ky vong: THAY MAN KHOA (icon o khoa + nut Xem cac goi dang ky)."
Write-Host "     BE khuyen nghi mac dinh KHONG mo AI cho Free - neu van dung"
Write-Host "     duoc, kiem lai cau hinh o Buoc 0 (ai.assistant phai la false)."
Write-Host ""
Write-Host "  3. Vao /settings -> the 'Goi dang ky' -> bam 'Xem cac goi dang ky'" -ForegroundColor White
Write-Host "     Ky vong: mo dialog liet ke ca 3 goi, gia dung (200.000d/thang,"
Write-Host "     2.000.000d/nam, ribbon Tiet kiem 17%), nut 'Chon goi nay' bam"
Write-Host "     duoc cho Monthly/Yearly."
Write-Host ""

Write-Host "=== BUOC 2: Web app - tinh nang CHUA co khoa UI (19 muc con lai) ===" -ForegroundColor Cyan
Write-Host "Day KHONG PHAI loi khi test - Backend chua enforce nen van dung" -ForegroundColor Yellow
Write-Host "duoc binh thuong du dang o goi Free. Chi ghi nhan de biet ranh gioi" -ForegroundColor Yellow
Write-Host "hien tai, dung bao la bug:" -ForegroundColor Yellow
Write-Host "  - /wallet (tai chinh nang cao), /tasks (nhiem vu lap lai),"
Write-Host "    /chat (dinh kem, thong bao), /devices (thiet bi deo)..."
Write-Host "  - Tat ca deu dung duoc day du, khong hien canh bao gi."
Write-Host ""

Write-Host "=== BUOC 3: Mobile - 4 man DA co khoa UI that ===" -ForegroundColor Cyan
Write-Host "Dang nhap bang tai khoan Free tren app that/may ao."
Write-Host ""
Write-Host "  1. Man Lich -> dung duoc binh thuong." -ForegroundColor White
Write-Host "  2. Man Tro ly AI -> THAY MAN KHOA (giong web, ai.assistant=false)." -ForegroundColor White
Write-Host "  3. Man Album -> bam tai VIDEO len -> THAY THONG BAO CHAN" -ForegroundColor White
Write-Host "     ('Goi hien tai chua ho tro tai video len album')."
Write-Host "     Tai ANH van duoc binh thuong (khong bi chan)."
Write-Host "  4. Mo chi tiet 1 anh -> phan 'Goi y khuon mat AI' AN/KHOA" -ForegroundColor White
Write-Host "     (album.faceSuggestions=false o Free)."
Write-Host "  5. Man Gói dang ky (vao tu Cai dat) -> kiem:" -ForegroundColor White
Write-Host "     - The Gia (Free) mau xam, The Thang mau xanh, The Nam mau"
Write-Host "       tim-hong khac han (ribbon Tiet kiem % noi len)."
Write-Host "     - Gia Goi thang dung nhan '/thang' (KHONG phai '/nam')."
Write-Host "     - Danh sach tinh nang chia theo nhom co tieu de, khong con"
Write-Host "       liet ke phang."
Write-Host ""

Write-Host "=== BUOC 4: Mobile - tinh nang nen tang LUON mien phi ===" -ForegroundColor Cyan
Write-Host "Khong bi khoa boi bat ky goi nao, phai hoat dong binh thuong:"
Write-Host "  - Bam nut SOS (giu 3s) -> gui duoc canh bao that."
Write-Host "  - Nhan thong bao SOS tu thanh vien khac."
Write-Host "  - Chat co ban voi thanh vien gia dinh."
Write-Host ""

Write-Host "=== BUOC 5: Dialog 'can nang cap goi' cho 19 tinh nang con lai ===" -ForegroundColor Cyan
Write-Host "DUNG mong doi thay dialog nay xuat hien luc nay." -ForegroundColor Yellow
Write-Host "Da xay xong ca web lan mobile (onFeatureLocked) nhung chi kich hoat" -ForegroundColor Yellow
Write-Host "khi Backend that su tra ma loi 'FEATURE_LOCKED' - hien BE van tra" -ForegroundColor Yellow
Write-Host "chu 'Forbidden' tran, chua co ma nay. Neu thay dialog xuat hien," -ForegroundColor Yellow
Write-Host "nghia la BE da len code that - bao lai de ghi nhan." -ForegroundColor Yellow
Write-Host ""

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Test xong: bao lai ket qua tung buoc, dac biet Buoc 0 va 1.2/3.2" -ForegroundColor Cyan
Write-Host " (2 cho de sai cau hinh nhat neu ai.assistant lo bi bat lai)." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
