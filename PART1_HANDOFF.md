# Bàn giao phần 1

## Phạm vi đã hoàn thành

- Sửa font tiếng Việt trong các form quản trị bằng Noto Sans cục bộ, weight 400–700, khoảng 87 KB. Giữ font tiêu đề và các vùng khác. Không sửa font icon.
- Thêm `ChefSelect` cho form tạo/sửa món: tìm tên/chuyên môn không phân biệt hoa thường, có/không dấu và đ/d; chuỗi tìm kiếm độc lập với `chefId`; hỗ trợ bàn phím, chuột, cảm ứng, tải/lỗi/thử lại và danh sách rỗng.
- Sửa CSS nhãn/checkbox/thẻ nguyên liệu, tên dài, lưới và ô nhập; giữ số lượng/đơn vị khi lọc và khi validation thất bại.
- Giới hạn kích thước thực của control/flex/grid và cho nội dung bộ lọc dài xuống dòng. Gỡ `body { overflow-x: hidden; }` để không che lỗi bố cục.
- Thay ba native select còn lại bằng `SelectField` dùng chung: trạng thái bếp, sắp xếp giá và phân loại nguyên liệu trong cả tạo/sửa. Không có ô tìm kiếm; giữ nguyên value/API/URL và mô tả phân loại.
- Popup của `SelectField` dùng portal vào body, tọa độ fixed được giới hạn theo visual viewport và navbar; tự mở lên trên khi thiếu chỗ dưới, giới hạn chiều cao và cuộn nội dung. Không thay `ChefSelect`.
- Danh sách đầu bếp nằm trong luồng trang; ô tìm kiếm được đưa xuống dưới navbar khi mở trên mobile và khi visual viewport thay đổi.

## Nguyên nhân và bằng chứng

- CSS Google Fonts dành cho Chrome của Lato không khai báo dải U+1EA0–1EF1. Không kết luận dựa trên tên font.
- Nhãn nguyên liệu kế thừa weight 700, `strong` mặc định tăng thành 900. Chrome 156 trên Windows dùng lẫn Lato Black/Arial Black/Times New Roman khi font tải được; khi CDN lỗi dùng lẫn Arial Black/Times New Roman.
- CSS `.form-group label` trước đây áp cả chữ hoa, letter-spacing và `display: block` lên nhãn nguyên liệu; tên còn bị ép một dòng và ellipsis.
- Font mới được subset từ nguồn đầy đủ thành một face để tránh fallback với dấu kết hợp NFD. Nguồn, SHA-256, phạm vi glyph và giấy phép nằm trong `web/public/fonts/noto-sans/`.
- CDP `CSS.getPlatformFontsForNode` xác nhận label, input, tên, tag và chuỗi NFD dùng Noto Sans. Kiểm tra chạy cả khi chặn CDN ngoài.
- Đính chính kiểm tra mobile lần đầu: việc rút ngắn option và kiểm tra control đóng/selectOption chưa đủ chứng minh popup native mở đúng. Hai ảnh người dùng cung cấp cho thấy popup trạng thái/sắp xếp vượt vùng iPhone 16 Pro Max 440×956 khi DevTools dùng Fit to window.
- Đo trước sửa tại 440×956: control native nằm trong x=41..399, rộng 358px; document rộng đúng 440px; option có DOM rect rộng 0. Popup là UI native của Chrome, không phải phần tử DOM chịu width/overflow của container. Ảnh người dùng cho thấy tỉ lệ popup không khớp vùng trang được thu nhỏ. Không thể khắc phục chắc chắn popup đó chỉ bằng CSS cho select.
- Giới hạn tái hiện: Chrome headless ở tỷ lệ 100% hiển thị native popup vừa control; không tái hiện chính xác độ phóng đại của cửa sổ DevTools Fit to window. Không khẳng định đã kiểm tra trực tiếp cửa sổ DevTools hoặc điện thoại/Safari thật.
- Bản sửa dùng popup DOM thay native UI tại toàn bộ ba select còn lại. Đã thực sự mở, quan sát ảnh, đo biên và chọn bằng click/tap/phím; không dùng selectOption làm bằng chứng.

Ảnh font và kiểm tra cũ cục bộ, được gitignore: `.temp/baseline.json`, `.temp/font-proof.json`, `.temp/part1-checks/`. Bằng chứng dropdown mới được lưu cùng commit trong `docs/part1-evidence/`; ảnh có viền xanh 2px do bộ kiểm thử thêm để chỉ đúng ranh giới viewport, không phải CSS sản phẩm.

## Rà soát dropdown sau sửa bổ sung

| Vị trí | Kết quả |
| --- | --- |
| `/admin/dishes` — Trạng thái bếp | Đổi sang SelectField; popup mở/chọn, mặc định, Escape/Tab, giữ lựa chọn, URL và xóa lọc đạt ở 440×956, 375×956, 1440×956. |
| `/admin/dishes` — Sắp xếp theo giá | Cùng SelectField; mở/chọn, phím mũi tên/Home/End/Enter, thứ tự kết quả và URL đạt tại ba kích thước trên. |
| `/admin/ingredients/new` — Phân loại | Cùng SelectField; mở/chọn, helper, payload và giữ giá trị khi validation lỗi đạt tại ba kích thước trên. |
| `/admin/ingredients/:id/edit` — Phân loại | Cùng SelectField; hiển thị giá trị đã lưu, đổi giá trị, validation, PATCH mock đạt tại ba kích thước trên. |
| Form tạo/sửa món — Đầu bếp | Giữ nguyên ChefSelect; kiểm tra nhanh tìm không dấu/chọn đúng chefId đạt tại ba kích thước trên. Bộ kiểm tra chi tiết từ lần đầu vẫn được giữ. |
| Trang khách, phân loại món, tag nguyên liệu và các trang quản lý khác | Không có native select hoặc popup chọn khác trong `web/src`; các bộ lọc này dùng button/pill/tag. Không thay đổi. |

Toàn bộ native select đã được thay ở đúng các vị trí gặp cùng giới hạn. Không thấy vị trí select khác còn tái hiện lỗi trong phạm vi đã rà soát.

Bằng chứng đang mở:

- [Trạng thái — 440×956](docs/part1-evidence/status-open-440.png)
- [Sắp xếp — 440×956](docs/part1-evidence/sort-open-440.png)
- [Phân loại nguyên liệu — 440×956](docs/part1-evidence/category-new-open-440.png)
- [Trạng thái — 375×956](docs/part1-evidence/status-open-375.png)
- [Phân loại cuộn trong viewport 375×360](docs/part1-evidence/category-small-height-open-375.png)
- [Sắp xếp — desktop 1440×956](docs/part1-evidence/sort-open-1440.png)
- [Số đo từng popup đã chụp](docs/part1-evidence/popup-bounds.json)

Ảnh đầy đủ cả tạo/sửa và các kích thước được sinh lại vào `.temp/dropdown-checks/` khi chạy test.

## Kiểm tra

- `npm.cmd run build:web`: đạt.
- `npm.cmd --prefix web test`: 5/5 đạt, gồm tìm tiếng Việt và hình học popup (mở trên/dưới, visual viewport lệch, navbar, biên màn hình).
- `npm.cmd run test:api`: 9/9 đạt ở lần triển khai đầu khi có quyền mạng tới Supabase. Không chạy lại trong lượt chỉ sửa dropdown vì backend không đổi.
- `web/tests/dish-form.browser.mjs`: lần triển khai đầu đạt trên Google Chrome 156.0.8078.47, headless Windows, desktop 1440px và mobile mô phỏng 375/390/440px. Lượt bổ sung chỉ cập nhật các thao tác select sang click popup; không chạy lại toàn bộ những phần không liên quan.
- Browser test ban đầu dùng 70 đầu bếp mock với chuyên môn dài; kiểm tra tìm kiếm, Escape/Tab/Enter/phím mũi tên, lựa chọn bắt buộc, giữ dữ liệu, POST/PATCH và payload, tải chậm/lỗi/thử lại/rỗng, chọn nguyên liệu, số lượng/đơn vị và bố cục. Phần popup native ban đầu chưa đủ và được thay bằng kiểm tra bổ sung dưới đây.
- `npm.cmd --prefix web run test:dropdowns`: đạt trên Chrome 156.0.8078.47/Windows headless, viewport 440×956, 375×956, 1440×956; có click thật, phím mũi tên/Enter/Escape/Tab/Home/End, bấm ngoài, mặc định/lựa chọn, đồng bộ URL sau submit, giữ dữ liệu khi validation lỗi, payload và thứ tự hàng kết quả từ API mock.
- Cảm ứng mô phỏng: tap mở/chọn cả trạng thái và giá; tap chọn nguyên liệu; CDP touch events vuốt cuộn popup trong viewport cao 360px. Đã đo popup nằm dưới navbar và bên trong cả bốn mép viewport, kiểm tra font Noto Sans thực tế bằng CDP.
- API thật chỉ đọc sau sửa bổ sung: chọn bằng tap trạng thái đang phục vụ + giá tăng (9 hàng), tạm hết + giá giảm (1 hàng); nhãn, URL và thứ tự hàng giao diện khớp response API thật. Không ghi DB thật.
- Cảm ứng mô phỏng bằng CDP touch events: chạm chọn, vuốt cuộn kết quả; thêm kiểm tra viewport 390×420. Đây không phải bàn phím hay điện thoại thật.
- Đọc API thật tại localhost:3000 và form tại localhost:5173: tạo/sửa hiển thị đúng đầu bếp và nguyên liệu được gán, kiểm tra ở 1440/390px. Không lưu dữ liệu thử vào DB thật.
- Chưa kiểm tra Safari thật, điện thoại thật, trình đọc màn hình hoặc ghi thành công vào DB thật.

Chạy lại browser test với Vite đang chạy:

```powershell
# Playwright chỉ là công cụ thử nghiệm trong thư mục bị gitignore.
npm.cmd install --prefix .temp/browser-tools --no-package-lock --no-audit --no-fund playwright
$env:PLAYWRIGHT_MODULE = (Resolve-Path .temp/browser-tools/node_modules/playwright).Path
$env:WEB_TEST_URL = 'http://localhost:5173'
npm.cmd --prefix web run test:browser
npm.cmd --prefix web run test:dropdowns
```

Không thêm dependency vào ứng dụng hoặc sửa dependency lock. Trong phiên này đã dùng server Vite bổ sung tại :5174 cho mock; server :5173 và API :3000 đã có sẵn.

## Giới hạn có sẵn và việc kiểm tra thủ công

- Backend/schema dùng quan hệ Dish–Ingredient trực tiếp; chưa có trường số lượng/đơn vị riêng theo món. API hiện bỏ qua `ingredientQuantities` và `ingredientUnits`. Form sửa hiện đọc `ingredient.quantity` là lượng tồn kho. Đây là hành vi có sẵn, không sửa schema/backend trong phần này. Đã xác minh giữ dữ liệu và gửi payload phía frontend, không khẳng định lưu được định lượng theo món vào DB.
- Trên điện thoại và Safari thật: thử mở/đóng, cuộn danh sách/trang, mở bàn phím, tìm có/không dấu, chọn chuyên môn dài, chuyển tag và xem dấu kết hợp.
- Dùng bản ghi thử phù hợp để kiểm tra tích hợp lưu/tải lại món ăn; các thao tác ghi thành công trong bộ test trình duyệt đã được mock.

## Giữ nguyên cho phần tiếp theo

- Không chuyển nhánh, commit, push, deploy, seed, reset hoặc đổi schema.
- Thay đổi có sẵn của người dùng được giữ nguyên: `api/package-lock.json`, `web/package-lock.json`, thư mục untracked `api/api/`, `api/web/`.
- File phần này gồm cả lần đầu và lần sửa dropdown; danh sách đầy đủ để stage nằm ở phần tiếp theo.
- Hero, rà soát icon tổng thể và README chưa làm, thuộc phần sau. Không chạy formatter toàn repo hoặc ghi đè các file CSS/form đã sửa.

## Chuẩn bị commit toàn bộ phần 1

Đã rà soát diff và file mới. Hiện không có staged changes. Toàn bộ hunk trong các file liệt kê dưới đây thuộc phần 1; không có file chứa hunk ngoài phạm vi cần tách riêng trong checkout hiện tại.

Không stage các thay đổi có sẵn ngoài phạm vi:

- `api/package-lock.json`: xóa metadata `dev` của fsevents và `peer` của Prisma.
- `web/package-lock.json`: xóa một số metadata `peer`.
- `api/api/package-lock.json`, `api/web/package-lock.json`: file untracked đã có trước nhiệm vụ.
- `.temp/`: công cụ Playwright/Brotli, font nguồn và ảnh test cục bộ, được gitignore.

Không thêm dependency ứng dụng, không cần stage lockfile cho thay đổi script test. Font, giấy phép và ảnh minh chứng đều có trong danh sách cụ thể này:

```powershell
$part1Paths = @(
  'PART1_HANDOFF.md',
  'web/package.json',
  'web/public/css/style.css',
  'web/public/css/spa.css',
  'web/public/fonts/noto-sans/form-latin-vietnamese.woff2',
  'web/public/fonts/noto-sans/OFL.txt',
  'web/public/fonts/noto-sans/SOURCE.txt',
  'web/src/components/ChefSelect.jsx',
  'web/src/components/SelectField.jsx',
  'web/src/utils/search.js',
  'web/src/utils/selectPosition.js',
  'web/src/views/admin/dishes/DishForm.jsx',
  'web/src/views/admin/dishes/AdminDishList.jsx',
  'web/src/views/admin/ingredients/IngredientForm.jsx',
  'web/tests/search.test.js',
  'web/tests/selectPosition.test.js',
  'web/tests/dish-form.browser.mjs',
  'web/tests/dropdowns.browser.mjs',
  'docs/part1-evidence/status-open-440.png',
  'docs/part1-evidence/sort-open-440.png',
  'docs/part1-evidence/category-new-open-440.png',
  'docs/part1-evidence/status-open-375.png',
  'docs/part1-evidence/category-small-height-open-375.png',
  'docs/part1-evidence/sort-open-1440.png',
  'docs/part1-evidence/popup-bounds.json'
)

git status --short
git diff --stat
git diff -- $part1Paths
git diff -- api/package-lock.json web/package-lock.json

# Chạy các lệnh sau chỉ sau khi nghiệm thu.
# git add liệt kê cụ thể cả file mới; không dùng add . hoặc add -A.
git add -- $part1Paths
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached

# Chỉ commit sau khi kiểm tra staged diff, gồm cả nội dung file mới.
git commit -m "Fix Vietnamese form text, chef search and mobile dropdowns"
```

`git diff` trước stage không hiển thị nội dung file untracked; `git diff --cached` sau stage có hiển thị. Ảnh/font binary cần mở xem riêng trước khi commit.

Nếu bạn sửa thêm và phát sinh hunk trộn trong file tracked, bỏ file đó khỏi `$part1Paths` trước khi chạy `git add`, rồi chọn hunk riêng, ví dụ:

```powershell
git add -p -- web/public/css/spa.css
git diff --cached -- web/public/css/spa.css
```

File mới vẫn phải dùng `git add -- <đường-dẫn-cụ-thể>` như danh sách trên; không dùng `git add -p` làm cách duy nhất để stage file mới. Các lệnh stage/commit ở đây chỉ để người dùng tự chạy; agent chưa thực hiện.
