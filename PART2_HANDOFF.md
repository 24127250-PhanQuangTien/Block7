# Bàn giao phần 2 — hero và Lucide

## Kết quả

- Tiếp nhận trên `main`, HEAD `21dbb9d`; không reset/chuyển nhánh. Phần 1 đã commit; chỉ sửa phần trình bày icon trong ChefSelect/SelectField, không đổi lựa chọn, focus, ARIA, bàn phím, cảm ứng hay thuật toán popup.
- `/` vẫn chuyển tới `/dishes`. Hero thực đơn dùng ảnh phở bò/gỏi cuốn, overlay burgundy tối, chữ cream và nút gold dẫn tới `#thuc-don`. Không thêm trang chủ hoặc thay điều hướng.
- Hero cao khoảng 471px desktop và 394px mobile trong môi trường kiểm tra; ảnh trang trí có alt rỗng, tải ưu tiên cao, không lazy-load, bố cục được cấp kích thước trước.
- Asset tạo riêng bằng OpenAI Imagegen; đã xem các ảnh món có sẵn trước khi chọn tạo ảnh mới. Hai bản WebP local: `menu-hero-1600.webp` (1600×666, 130754 byte), `menu-hero-800.webp` (800×333, 40918 byte). Nguồn, điều kiện sử dụng và prompt đầy đủ ở `web/public/assets/img/menu-hero.SOURCE.txt`. Không hotlink, không gán giấy phép stock/CC cho ảnh AI.
- Icon chức năng dùng import tĩnh `lucide-react@1.61.0`: tìm/xóa tìm kiếm, thêm, xem/sửa/xóa, lưu/hủy/quay lại, lọc/tag/reset, điều hướng/menu mobile, mũi tên dropdown, dấu chọn, cảnh báo/thử lại/loading.
- CSS chỉ nhắm `.ui-icon` và các hành động chứa icon; 18px/stroke 2/currentColor, menu 24px, loading 48px. Icon trang trí có aria-hidden; nút chỉ icon có tên truy cập và vùng bấm 44px. Không thay logo/ảnh minh họa.
- Gỡ CDN Font Awesome sau khi rà soát không còn chỗ dùng trong frontend; giữ Google Fonts và font Việt local của phần 1.
- Dependency duy nhất thêm: `lucide-react` 1.61.0, ISC; không nâng package khác. Tên export đã kiểm tra trực tiếp trong package. Tham khảo chính thức: https://lucide.dev/guide/react/getting-started .

## Kiểm tra và bằng chứng

- Build frontend đạt; bundle JS khoảng 74.9 KB gzip.
- Unit test hiện có: 5/5 đạt.
- `test:browser`: đạt ở 1440/375/390/440px; tạo/sửa, chefId, validation/giữ dữ liệu, nguyên liệu, keyboard/touch, bộ lọc và URL. Chỉ đổi test nhãn `✓ Đã chọn` sang nhãn người dùng `Đã chọn`, vì SVG trang trí không thuộc accessible name.
- `test:presentation`: đạt ở 1440/375/440px; hero tải đúng ảnh responsive, độ cao, crop/chữ/navbar, CTA cuộn tới thực đơn, tìm/xóa tìm kiếm, menu mobile, icon hành động, quay lại, cảnh báo/thử lại/loading và bộ chọn đang mở. Có kiểm tra kích thước icon, aria-hidden và không tràn ngang.
- `test:dropdowns`: đạt ở 440×956, 375×956 và 1440×956. Cập nhật việc đợi bảng render đủ 4 hàng sau xóa lọc, giữ nguyên assertion 4 hàng. URL thay đổi trước khi React hoàn tất fetch/render nên assertion tức thời trước đây có thể đọc 2 hàng cũ.
- Môi trường: Google Chrome 156.0.8078.47 headless trên Windows; mobile/cảm ứng mô phỏng. Kiểm tra trên production preview `http://127.0.0.1:5175`, API mock; chặn CDN ngoài để xác nhận hero/icon local vẫn hoạt động. Hai lần chạy song song qua Vite dev ban đầu bị navigation timeout; các lần production chạy tuần tự đạt.
- Không ghi database thật, không sửa backend/schema, không chạy seed/reset. Chưa kiểm tra Safari/điện thoại thật, trình đọc màn hình hoặc luồng ghi DB thật trong phần này.
- `docs/part2-evidence/`: hero 1440/375/440px, SelectField mở ở 440px, ChefSelect mở ở 375px và cảnh báo ở 440px. Test lưu sáu ảnh JPEG đại diện này; các ảnh khác vào `.temp/part2-evidence/`.

Chạy lại kiểm tra (không cần thêm dependency ứng dụng):

```powershell
npm.cmd run build:web
npm.cmd --prefix web test
# Terminal riêng; tránh chạy nhiều suite browser đồng thời.
npm.cmd --prefix web run preview -- --port 5175 --host 127.0.0.1
# Terminal kiểm tra, dùng Playwright tạm như phần 1:
$env:PLAYWRIGHT_MODULE = (Resolve-Path .temp/browser-tools/node_modules/playwright).Path
$env:WEB_TEST_URL = 'http://127.0.0.1:5175'
npm.cmd --prefix web run test:presentation
npm.cmd --prefix web run test:browser
npm.cmd --prefix web run test:dropdowns
```

## Thông tin cho phần 3

- README chưa sửa. Mô tả SPA React/Vite, Express/Prisma và các lệnh root hiện có theo checkout; dependency frontend mới là Lucide, không phải Font Awesome.
- Hero là ảnh AI minh họa local, không phải ảnh thực tế của nhà hàng. Dẫn tới SOURCE.txt khi ghi nguồn; không bỏ source/giấy phép font local của phần 1.
- Google Fonts vẫn dùng cho typography gốc; local Noto Sans cho form/hero text và các bộ chọn. Lucide không cần font/CDN hoặc tải icon động.
- `API_BASE_URL` vẫn là `http://localhost:3000/api`; để xem API thật dùng frontend localhost:5173 theo CORS hiện tại. Các test preview cổng 5175 dùng mock, không chứng minh cấu hình deploy hay CORS cho cổng khác.
- Giới hạn định lượng nguyên liệu theo món của backend vẫn như PART1_HANDOFF.md; không thay trong phần này.

## Baseline và lockfile trộn thay đổi

Trước cài đã lưu baseline vào `.temp/part2-baseline/` (gitignored). Các thay đổi cũ ngoài phần 2 vẫn giữ nguyên:

- `api/package-lock.json`: hai metadata cũ bị xóa; đã đối chiếu byte-for-byte với baseline, không đổi.
- `api/api/package-lock.json`, `api/web/package-lock.json`: file untracked có sẵn; không stage.
- `web/package-lock.json`: năm dòng xóa `peer: true` có sẵn ở `@babel/core`, `browserslist`, `react`, `react-dom`, `vite`; tiếp tục giữ ngoài commit phần 2.

So với baseline trước cài, lockfile chỉ đổi `packages[""].dependencies.lucide-react` và thêm `packages["node_modules/lucide-react"]`. Không đổi version/nội dung của package có sẵn. Hai hunk thêm Lucide tách riêng khỏi năm hunk xóa metadata cũ.

## File và lệnh commit riêng phần 2

Không có file trộn khác ngoài web/package-lock.json. Danh sách dưới đây liệt kê toàn bộ file phần 2 được stage nguyên file, gồm cả file mới. Lockfile được stage riêng theo hunk. Agent chưa stage/commit/push.

```powershell
$part2Paths = @(
  'PART2_HANDOFF.md',
  'web/index.html',
  'web/package.json',
  'web/public/css/spa.css',
  'web/public/css/style.css',
  'web/public/assets/img/menu-hero-1600.webp',
  'web/public/assets/img/menu-hero-800.webp',
  'web/public/assets/img/menu-hero.SOURCE.txt',
  'web/src/components/ChefSelect.jsx',
  'web/src/components/Navbar.jsx',
  'web/src/components/SelectField.jsx',
  'web/src/components/StateViews.jsx',
  'web/src/views/NotFound.jsx',
  'web/src/views/admin/chefs/AdminChefList.jsx',
  'web/src/views/admin/chefs/ChefDelete.jsx',
  'web/src/views/admin/chefs/ChefForm.jsx',
  'web/src/views/admin/dishes/AdminDishDetail.jsx',
  'web/src/views/admin/dishes/AdminDishList.jsx',
  'web/src/views/admin/dishes/DishDelete.jsx',
  'web/src/views/admin/dishes/DishForm.jsx',
  'web/src/views/admin/ingredients/AdminIngredientList.jsx',
  'web/src/views/admin/ingredients/IngredientDelete.jsx',
  'web/src/views/admin/ingredients/IngredientForm.jsx',
  'web/src/views/dishes/DishDetail.jsx',
  'web/src/views/dishes/DishList.jsx',
  'web/tests/dish-form.browser.mjs',
  'web/tests/dropdowns.browser.mjs',
  'web/tests/presentation.browser.mjs',
  'docs/part2-evidence/menu-1440.jpg',
  'docs/part2-evidence/menu-375.jpg',
  'docs/part2-evidence/menu-440.jpg',
  'docs/part2-evidence/admin-select-440.jpg',
  'docs/part2-evidence/chef-select-375.jpg',
  'docs/part2-evidence/error-440.jpg'
)

git status --short
git diff --check
git diff -- $part2Paths
git diff -- web/package-lock.json

# Sau nghiệm thu, tự stage các file nguyên khối và cả file mới:
git add -- $part2Paths
# KHÔNG git add nguyên web/package-lock.json.
git add -p -- web/package-lock.json
```

Trong `git add -p` cho lockfile: chọn **y** cho dòng thêm `"lucide-react": "1.61.0"` và khối thêm `node_modules/lucide-react`; chọn **n** cho cả năm hunk chỉ xóa `"peer": true`. Theo diff hiện tại thứ tự là y/n/n/y/n/n/n; ưu tiên đọc nội dung hunk, không dựa vào thứ tự nếu bạn sửa thêm. Nếu hunk bị gộp sau chỉnh sửa, dùng `s` để tách hoặc `e` để chỉ giữ các dòng thêm Lucide; không restore/ghi đè cả lockfile.

```powershell
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached -- web/package-lock.json
git diff --cached
# Chỉ sau khi kiểm tra staged diff và mở xem asset/ảnh mới:
git commit -m "Refresh Vietnamese menu hero and unify icons with Lucide"
```

Staged lockfile đúng chỉ có hai phần thêm Lucide; không có năm dòng xóa peer cũ. Sau stage, `git diff -- web/package-lock.json` vẫn phải còn năm thay đổi metadata cũ. File mới cần `git add` cụ thể như mảng trên, không chỉ dùng add -p. Không dùng add . hoặc add -A.
