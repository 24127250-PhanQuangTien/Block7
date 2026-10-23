# Bàn giao phần 3 — README và nghiệm thu cuối

## Tài liệu và thay đổi

- Tạo [README.md](README.md) tiếng Việt: kiến trúc, điều kiện phiên bản, clone/cài riêng api/web, api/.env, Prisma/database có sẵn hoặc mới, seed có cảnh báo xóa dữ liệu, chạy hai terminal, routes, build/preview, kiểm thử, CORS, lỗi thường gặp, nguồn ảnh/font/Lucide và giới hạn chức năng.
- Thêm liên kết ưu tiên README vào `HUONG_DAN_CHAY_PROJECT.md` và `TECHNICAL_STACK.md`; chỉnh tối thiểu thông tin Node/PostgreSQL không được repo ghim và số lượng/tính phá hủy của seed trong Technical Stack. Không viết lại tài liệu lý thuyết.
- Sửa race nhỏ của **test** `web/tests/dropdowns.browser.mjs`: chờ đúng tên/thứ tự hàng sau fetch/render rồi giữ nguyên các assertion so sánh. Lần đầu test có thể đọc bảng rỗng ngay sau khi URL đổi. Không bỏ test hoặc hạ kỳ vọng; không sửa logic ứng dụng, API/schema hay dependency.

## Đối chiếu và kết quả thực tế

- Tiếp nhận đúng `main`, HEAD `794f349`, sau `a9592cb` và `21dbb9d`; không đổi nhánh/lịch sử.
- Đối chiếu package/scripts/lockfiles, hai env.example, dotenv theo cwd, CORS, API_BASE_URL, schema, cả hai seed, routes và test. Root chỉ có scripts chuyển tiếp, không phải npm workspace; backend dùng api/.env khi chạy npm prefix đúng thư mục.
- Môi trường: Windows, Node 24.18.0, npm 11.16.0, Chrome 156.0.8078.47 headless; Playwright tạm 1.64.1 đã có sẵn. Không cài lại dependency.

| Kiểm tra/lệnh | Kết quả |
| --- | --- |
| `npm.cmd run build:web` | Đạt; bản build được dùng cho preview kiểm thử. |
| `npm.cmd --prefix web test` | 5/5 đạt; không cần API/DB. |
| `npm.cmd run test:api` | 9/9 đạt với PostgreSQL/Supabase hiện có và quyền mạng; Supertest import app, đọc DB và POST cố ý không hợp lệ, không tạo bản ghi hợp lệ. |
| `npm.cmd --prefix api run db:generate` | Đã thử nhưng **không hoàn tất**: EPERM khi rename query_engine-windows.dll.node. Không dừng server Node có sẵn của người dùng. README hướng dẫn dừng API/test trước khi generate; không tuyên bố lệnh này đã đạt. |
| `npm.cmd --prefix web run preview -- --port 5175 --host 127.0.0.1 --strictPort` | Khởi chạy thành công; preview riêng cho API mock, không thay backend. Đã đối chiếu cờ CLI bằng preview --help. |
| `test:browser` | Đạt ở 1440/375/390/440px: tạo/sửa bằng mock, chefId, tìm tiếng Việt/NFD, nguyên liệu, validation/giữ dữ liệu, bàn phím/cảm ứng và các form/bộ lọc liên quan. |
| `test:dropdowns` | Lần đầu lộ race kiểm thử nêu trên; sau sửa đạt ở 440/375/1440px, kiểm tra popup mở, chọn, URL/reset và thứ tự hàng từ fixture. |
| `test:presentation` | Đạt ở 1440/375/440px: hero/CTA/icon, tìm kiếm, trang quản trị/đầu bếp/nguyên liệu, lỗi/loading, bộ chọn; cả menu khách/quản trị: toggle/X, bấm ngoài, Escape/focus/Tab, cùng/khác route, Back, breakpoint 769px và chiều cao 180px. |
| API thật qua giao diện localhost:5173, chỉ đọc | Chọn bằng tap tại 440×956; đang phục vụ + giá tăng (9 hàng), tạm hết + giá giảm (1 hàng), thứ tự UI khớp response. Không ghi DB. |

Ba browser suite đã chạy **tuần tự** trên `http://127.0.0.1:5175`, tất cả request API được mock. Mobile/cảm ứng là mô phỏng; không phải điện thoại/Safari thật. Chế độ NAVIGATION_ONLY được bỏ khi chạy presentation đầy đủ. Preview do agent mở đã dừng sau kiểm tra; không dừng server sẵn có.

Đã xem lại ảnh hero desktop/mobile và menu quản trị đang mở từ lần nghiệm thu này, cùng các kiểm tra DOM/hành vi của suite. Ảnh test tái sinh có khác byte được giữ ở `.temp/part3-final-evidence/`, không thay minh chứng phần 2 đã nghiệm thu. Các output khác theo vị trí ghi trong README.

## Chưa xác minh và việc cần trước demo/nộp

- Không thử clone/cài sạch bằng npm ci, không ghi đè env thật, không cập nhật schema hoặc seed trên database đang dùng. Không khẳng định đã nghiệm thu từ database trắng; hướng dẫn setup mới được đối chiếu script/schema.
- Người dùng dừng API/test của mình rồi chạy lại `npm.cmd --prefix api run db:generate` để kiểm tra hết khóa DLL; không cần xóa/seed DB. Môi trường hiện tại vẫn chạy được API test nhờ client đã có.
- Để demo dữ liệu thật: API/DB đang hoạt động, schema và dữ liệu đúng; mở frontend bằng localhost:5173 theo CORS mặc định. Preview 5175 của test không chứng minh CORS cho API thật ở origin đó.
- Nghiệm thu thêm trên điện thoại/Safari thật và tự chọn database thử riêng nếu muốn kiểm tra lưu/xóa thực tế. Các luồng ghi thành công trong browser suite là mock, không phải ghi DB thật.
- Giữ giới hạn đã công bố: quản trị chưa xác thực/phân quyền; định lượng/đơn vị nguyên liệu theo món chưa được backend lưu; hero là ảnh AI minh họa local. Không bổ sung các chức năng này trong phần 3.

## Git và commit riêng phần 3

Giữ nguyên ngoài phạm vi: `api/package-lock.json`, `web/package-lock.json`, `api/api/package-lock.json`, `api/web/package-lock.json`. Hai lockfile được đối chiếu với baseline, không có thay đổi dependency mới. Không có file trộn hunk ngoài phần 3 trong năm file dưới đây. Không stage/commit/push; staged diff hiện rỗng và đã kiểm tra whitespace.

Commit đề xuất: `Document setup and stabilize dropdown checks`

```powershell
$part3Paths = @(
  'README.md',
  'PART3_HANDOFF.md',
  'HUONG_DAN_CHAY_PROJECT.md',
  'TECHNICAL_STACK.md',
  'web/tests/dropdowns.browser.mjs'
)
git status --short
git --no-pager diff --check
git --no-pager diff -- $part3Paths
# Sau khi nghiệm thu; gồm cả hai tài liệu mới:
git add -- $part3Paths
git --no-pager diff --cached --check
git --no-pager diff --cached --stat
git --no-pager diff --cached --name-only
git --no-pager diff --cached
# Chỉ chạy sau khi kiểm tra staged diff:
git commit -m "Document setup and stabilize dropdown checks"
```
