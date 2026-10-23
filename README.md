# Web2-Block6-Restaurant

Ứng dụng thực đơn và quản lý nhà hàng, gồm giao diện React SPA và REST API Express dùng Prisma/PostgreSQL. Khách có thể xem, tìm món theo tên/mô tả và lọc phân loại; phần quản trị quản lý món ăn, đầu bếp và nguyên liệu, lọc trạng thái phục vụ và sắp xếp giá.

Form món ăn có tìm đầu bếp theo tên/chuyên môn, hỗ trợ tiếng Việt có/không dấu và đ/d. Giao diện có hero món Việt, icon Lucide, bộ chọn và menu điều hướng dùng được trên mobile.

**Cổng quản trị hiện chưa có đăng nhập/phân quyền.** Đây là dự án học tập, không phải cấu hình triển khai production đã được kiểm chứng.

## 1. Công nghệ và cấu trúc

| Thành phần | Công nghệ |
| --- | --- |
| `web/` | React 18, React Router 6, Vite 5, `lucide-react` 1.61.0 |
| `api/` | Express 4, Prisma Client/CLI 5, dotenv, Node test runner và Supertest |
| Database | PostgreSQL; có thể dùng Supabase PostgreSQL qua `DATABASE_URL` |

```text
api/
  src/                 # API, validation, kết nối Prisma
  prisma/              # schema.prisma và các script seed
  tests/               # Kiểm thử API với database thật
  .env.example
web/
  src/                 # Routes SPA, views, component, apiClient.js
  public/              # CSS, ảnh và font local
  tests/               # Unit test và browser suite dùng API mock
package.json           # Scripts chuyển tiếp vào api/ hoặc web/
```

Root **không khai báo npm workspaces**. `npm install` ở root không cài dependency cho hai ứng dụng; cần cài riêng như bên dưới.

## 2. Điều kiện môi trường

- Git, Node.js và npm; các lệnh dưới đây chạy trong PowerShell trên Windows, dùng `npm.cmd`/`npx.cmd` để tránh lỗi chặn `npm.ps1` bởi execution policy.
- Để tái hiện môi trường đã kiểm tra, dùng Node.js **24.x**; phiên kiểm tra dùng **24.18.0, npm 11.16.0**. Đây là môi trường đã thử, không phải phiên bản tối thiểu được khai báo của dự án.
- Ba `package.json` không có `engines` hoặc `packageManager`. Vite 5.4.21 trong lockfile khai báo Node `^18.0.0 || >=20.0.0`, Prisma 5.22.0 khai báo `>=16.13`; không suy ra rằng mọi script chạy được trên tất cả phiên bản đó. Playwright 1.64.1 dùng trong hướng dẫn browser test cần Node `>=20`.
- Một database PostgreSQL truy cập được, hoặc Supabase với chuỗi kết nối PostgreSQL hợp lệ và quyền phù hợp. Repo không ghim phiên bản PostgreSQL tối thiểu; schema dùng `provider = "postgresql"`.
- Internet để cài package và kết nối database từ xa. Browser test cần **Google Chrome đã cài**; không cần API/database thật cho các suite mock.

## 3. Clone và cài dependency

```powershell
git clone https://github.com/Triethoccode/Web2-Block6-Restaurant.git
Set-Location Web2-Block6-Restaurant
npm.cmd --prefix api ci
npm.cmd --prefix web ci
```

Các lệnh tiếp theo, trừ khi ghi khác, đều chạy tại **thư mục gốc repo**. Không chạy từ `api/` rồi lại thêm đường dẫn `api/`; không tạo các thư mục lồng `api/api/`, `api/web/`.

`npm ci` dùng lockfile hiện có. Nếu lỗi vì package.json/lockfile không khớp, kiểm tra checkout và diff trước; không xóa lockfile để bỏ qua lỗi. Không cần cài dependency toàn cục cho Vite hoặc Prisma.

## 4. Cấu hình backend

Tạo `api/.env` nếu chưa có, giữ nguyên file cấu hình hiện có:

```powershell
if (-not (Test-Path -LiteralPath 'api/.env'))
{
  Copy-Item -LiteralPath 'api/.env.example' -Destination 'api/.env'
}
```

Mở `api/.env`, thay các placeholder bằng cấu hình của bạn:

```dotenv
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://APP_USER:APP_PASSWORD@DB_HOST:5432/APP_DATABASE?schema=public"
```

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Bắt buộc để API truy vấn PostgreSQL; host, cổng DB, tên database và thông số SSL theo nhà cung cấp. Ví dụ trên chỉ là placeholder. |
| `PORT` | Cổng Express; mặc định 3000. Frontend hiện gọi cổng 3000 nên giữ mặc định cho luồng chạy local này. |
| `CLIENT_ORIGIN` | Origin frontend được ghi vào header CORS; mặc định `http://localhost:5173`. Chỉ cấu hình một origin, không điền danh sách hoặc đường dẫn trang. |

`dotenv.config()` đọc `.env` theo thư mục làm việc. Các script npm của API chạy trong `api/`, vì vậy dùng **`api/.env`**. Root cũng có `.env.example` cùng nội dung mẫu nhưng không cần tạo thêm `.env` ở root. Tránh chạy trực tiếp `node api/src/server.js` từ root vì sẽ đổi nơi dotenv tìm file. Biến đã đặt trong phiên PowerShell có thể được ưu tiên hơn file `.env`; khởi động lại API sau khi đổi cấu hình.

Với Supabase, dùng chuỗi kết nối **PostgreSQL**, không dùng URL REST của project hoặc khóa API. Giữ thông số cổng/SSL do nhà cung cấp yêu cầu; mã hóa ký tự đặc biệt trong mật khẩu theo quy tắc URL. Schema không khai báo `DIRECT_URL`. Không commit `.env`, mật khẩu hoặc chuỗi kết nối thật.

### Địa chỉ API và CORS

[`web/src/apiClient.js`](web/src/apiClient.js) cố định `API_BASE_URL = "http://localhost:3000/api"`; code **không đọc `VITE_API_URL`**. Chỉ thêm biến vào `.env` frontend sẽ không đổi địa chỉ API.

`http://localhost:5173`, `http://127.0.0.1:5173` và `http://localhost:5174` là các origin khác nhau. Với cấu hình mẫu, mở frontend bằng **localhost:5173**, không dùng URL Network hoặc 127.0.0.1 thay thế. Đổi origin/cổng có chủ đích cần đồng bộ `CLIENT_ORIGIN`, khởi động lại API và, nếu đổi cổng API, sửa `API_BASE_URL` trong code.

## 5. Prisma và database

**Dừng API/dev watcher và các API test trước khi generate client**, nhất là trên Windows để tránh khóa DLL Prisma. Sau khi cài dependency và cấu hình `.env`:

```powershell
npm.cmd --prefix api run db:generate
```

Lệnh này tạo Prisma Client, không cập nhật schema/dữ liệu trong database.

### Chạy nhanh với database đã có schema

Nếu database đã khớp [`schema.prisma`](api/prisma/schema.prisma), chỉ cần generate client rồi chuyển sang bước chạy hai server. **Không cần db:push hoặc seed mỗi lần chạy.** Database rỗng có thể hiển thị danh sách trống; đó không tự động là lỗi kết nối.

### Thiết lập database mới hoặc đồng bộ schema có chủ đích

Chuẩn bị database riêng và xác nhận `DATABASE_URL` trỏ đúng nơi trước khi chạy:

```powershell
npm.cmd --prefix api run db:push
```

`db:push` áp schema hiện tại vào database, có thể ảnh hưởng cấu trúc/dữ liệu. Không dùng để sửa lỗi kết nối một cách thử vận may; sao lưu và đọc cảnh báo Prisma nếu dùng database có dữ liệu. Repo hiện không có thư mục migrations; script dùng `prisma db push`, không phải luồng `migrate deploy`. Không thêm `--accept-data-loss` hoặc reset để bỏ qua cảnh báo.

### Dữ liệu mẫu — tùy chọn, chỉ cho database thử

**Cảnh báo: seed chính xóa toàn bộ món ăn, đầu bếp và nguyên liệu cũ bằng `deleteMany`, rồi tạo lại 3 đầu bếp, 58 nguyên liệu và 7 món mẫu. Chỉ chạy khi bạn chủ động cho phép thay dữ liệu trong database riêng dùng thử; sao lưu nếu cần.**

```powershell
npm.cmd run seed:api
```

Lệnh trên chuyển tiếp tới `api/prisma/seed.js`. Không chạy seed trên database đang dùng để giữ dữ liệu. File `api/prisma/seed_ingredients.js` là tiện ích riêng: thêm nguyên liệu thiếu và cập nhật phân loại hiện có; cũng ghi dữ liệu, không phải bước bắt buộc và không có npm script riêng trong package.json.

## 6. Chạy bằng hai terminal

Mở hai PowerShell tại thư mục gốc repo.

**Terminal 1 — API:**

```powershell
npm.cmd run dev:api
```

API tại `http://localhost:3000`. Có thể dùng `npm.cmd run start:api` để chạy không có watcher; đây không phải tuyên bố đã có cấu hình production.

**Terminal 2 — frontend:**

```powershell
npm.cmd run dev:web
```

Mở **http://localhost:5173**. Nếu Vite báo chuyển sang cổng 5174 vì 5173 bận, giải quyết tiến trình/cổng cũ thay vì dùng ngay địa chỉ khác và gặp lỗi CORS. Muốn fail sớm khi cổng bận:

```powershell
npm.cmd --prefix web run dev -- --strictPort
```

Chỉ chạy một frontend dev/preview trên cùng cổng. Dùng Ctrl+C trong terminal của server bạn mở để dừng; không dừng tiến trình không rõ chủ sở hữu.

### Đường dẫn chính

| URL frontend | Nội dung |
| --- | --- |
| `/`, `/dishes` | `/` chuyển sang thực đơn; hero, tìm món và lọc phân loại |
| `/dishes/:id` | Chi tiết món |
| `/admin`, `/admin/dishes` | `/admin` chuyển sang quản lý món; lọc trạng thái và sắp xếp giá |
| `/admin/dishes/new` | Tạo món, chọn đầu bếp/nguyên liệu |
| `/admin/dishes/:id/edit`, `/admin/dishes/:id/delete` | Sửa hoặc xác nhận xóa món |
| `/admin/chefs`, `/admin/ingredients` | Quản lý đầu bếp và kho nguyên liệu |
| `/admin/chefs/new`, `/admin/ingredients/new` | Tạo đầu bếp/nguyên liệu |
| `/admin/chefs/:id/edit`, `/admin/ingredients/:id/edit` | Sửa đầu bếp/nguyên liệu; thay `edit` bằng `delete` để mở xác nhận xóa |

Thay `:id` bằng ID thật trong danh sách, không giả định dữ liệu luôn bắt đầu ở ID 1. API tương ứng: `/api/dishes`, `/api/chefs`, `/api/ingredients`, hỗ trợ GET danh sách/chi tiết, POST, PATCH, DELETE theo các route hiện có. Nguyên liệu đang được món ăn sử dụng không thể xóa trực tiếp.

Kiểm tra API đọc danh sách mà không sửa dữ liệu:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/dishes' -Method Get
```

## 7. Build và preview

```powershell
npm.cmd run build:web
```

Output nằm trong `web/dist/`. Preview **chỉ phục vụ frontend đã build, không thay thế Express hoặc database**. Để thử với API thật theo CORS mặc định, dừng dev frontend trước rồi chạy:

```powershell
npm.cmd --prefix web run preview -- --host localhost --strictPort
```

Script preview mặc định dùng cổng 5173; API vẫn cần chạy tại localhost:3000. Không chạy preview và dev cùng cổng. Kiểm thử trình duyệt mock ở phần sau dùng một preview riêng cổng 5175, không chứng minh kết nối API thật từ origin đó.

## 8. Kiểm thử

### Unit frontend — không cần server/database

```powershell
npm.cmd --prefix web test
```

Chạy Node test runner cho logic tìm tiếng Việt và tính vị trí popup. Hiện có 5 test.

### API — cần database thật có schema

```powershell
npm.cmd run test:api
```

9 test dùng Supertest import Express app trực tiếp, không cần mở server cổng 3000 riêng. Cần dependency API, Prisma Client đã generate, `api/.env` hợp lệ và database truy cập được. Test CORS kỳ vọng `CLIENT_ORIGIN=http://localhost:5173`; dùng cấu hình đó khi chạy bộ test hiện có.

Bộ test đọc dữ liệu thật và gửi một POST cố ý không hợp lệ để kiểm tra validation; không seed/reset hoặc tạo bản ghi hợp lệ. Không dùng kết quả này thay cho kiểm tra tích hợp lưu thành công. Test không tự tạo schema/database.

### Browser — API mock, cần Chrome và Playwright

Ba suite đều chặn request API và trả fixture, gồm cả các thao tác ghi. **Không cần mở API hoặc kết nối DB cho các suite này.** Không chạy nhiều suite cùng lúc; chúng dùng chung thư mục ảnh minh chứng. Chạy từ root repo:

1. Cài công cụ thử nghiệm tạm nếu máy mới chưa có; không thêm vào dependency ứng dụng:

   ```powershell
   npm.cmd install --prefix .temp/browser-tools --no-package-lock --no-audit --no-fund playwright@1.64.1
   ```

   Cần Google Chrome đã cài vì các suite dùng `channel: "chrome"`. Cài browser Chromium của Playwright riêng không thay thế yêu cầu này cho hai suite cố định Chrome.

2. Build như phần 7, rồi mở một terminal phục vụ bản build:

   ```powershell
   npm.cmd --prefix web run preview -- --port 5175 --host 127.0.0.1 --strictPort
   ```

   Nếu cổng 5175 bận, dừng preview của bạn hoặc chọn một cổng trống và sửa `WEB_TEST_URL` cho khớp. Có thể giữ dev 5173 đang chạy, nhưng các test dưới đây chỉ nhắm preview 5175.

3. Trong terminal kiểm thử khác, vẫn ở root:

   ```powershell
   $env:PLAYWRIGHT_MODULE = (Resolve-Path '.temp/browser-tools/node_modules/playwright').Path
   $env:WEB_TEST_URL = 'http://127.0.0.1:5175'
   # NAVIGATION_ONLY=1 chỉ chạy menu; bỏ nó để nghiệm thu đầy đủ:
   if (Test-Path Env:NAVIGATION_ONLY)
   {
     Remove-Item Env:NAVIGATION_ONLY
   }
   npm.cmd --prefix web run test:browser
   npm.cmd --prefix web run test:dropdowns
   npm.cmd --prefix web run test:presentation
   ```

| Suite | Phạm vi |
| --- | --- |
| `test:browser` | Tạo/sửa món bằng mock, chefId, tìm đầu bếp, nguyên liệu, dấu Việt/NFD, validation, bàn phím/cảm ứng; 1440/375/390/440px |
| `test:dropdowns` | Popup đang mở, chọn giá trị, vị trí/scroll, URL/reset, thứ tự lọc/sắp xếp và form nguyên liệu bằng mock; 1440/375/440px |
| `test:presentation` | Hero, icon, tìm kiếm, điều hướng, lỗi/loading, bộ chọn; hồi quy menu khách/quản trị: toggle, bấm ngoài, Escape/focus, cùng/khác route, Back và breakpoint; 1440/375/440px, thêm chiều cao 180px |

Browser suite chạy Chrome headless, mobile/cảm ứng được mô phỏng; không phải Safari hay điện thoại thật. Chúng chặn CDN ngoài để kiểm tra tài nguyên local, nên typography từ Google Fonts có thể dùng font dự phòng trong ảnh test. Ảnh/data được ghi vào các thư mục tạm `.temp/part1-checks/`, `.temp/dropdown-checks/`, `.temp/part2-evidence/` và `.temp/presentation-checks/`, đã được Git bỏ qua.

Chỉ kiểm tra menu khi cần, không thay thế ba suite nghiệm thu đầy đủ:

```powershell
$env:NAVIGATION_ONLY = '1'
npm.cmd --prefix web run test:presentation
Remove-Item Env:NAVIGATION_ONLY
```

## 9. Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra/cách xử lý |
| --- | --- |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd` như các lệnh trên, không cần đổi execution policy toàn máy. |
| Không tìm thấy Prisma Client | Cài dependency tại `api/`, cấu hình `api/.env`, dừng API rồi chạy `db:generate`. |
| `EPERM ... query_engine-windows.dll.node` khi generate | Engine có thể đang bị Node/API/test giữ. Dừng các tiến trình API/test của bạn, đợi chúng thoát rồi generate lại; không xóa database hoặc seed để chữa lỗi khóa file. |
| Prisma không kết nối được DB, API trả 500 | Kiểm tra URL/credential, cổng DB, quyền, SSL và kết nối mạng tới nhà cung cấp; kiểm tra schema đúng database. Không chia sẻ `.env` hoặc log chứa thông tin nhạy cảm. |
| Báo thiếu bảng/cột | Xác nhận đúng database/schema trước. Chỉ dùng `db:push` khi có chủ đích đồng bộ schema; không reset/seed database đang dùng. |
| `EADDRINUSE` hoặc Vite tự đổi cổng | Đã có tiến trình dùng cổng đó. Không mở server trùng; dùng đúng terminal để dừng server của bạn. |
| Frontend mở được nhưng không có dữ liệu | API phải chạy tại localhost:3000, DB phải truy cập được; kiểm tra GET `/api/dishes`. Danh sách rỗng khác lỗi kết nối. |
| Lỗi CORS khi dùng 127.0.0.1/cổng khác | So khớp scheme + host + port với `CLIENT_ORIGIN`; dùng localhost:5173 theo cấu hình mẫu. Preview 5175 chỉ có API mock trong các browser test. |
| HTTP 200 nhưng hiện lỗi validation/không tìm thấy | API có lỗi nghiệp vụ dạng `{ ok: false, error: ... }`; đọc `code`/`fields`, không chỉ HTTP status. |
| Browser test không tìm thấy Playwright/Chrome | Cài công cụ tạm và Chrome, đặt `PLAYWRIGHT_MODULE` bằng Resolve-Path từ root; kiểm tra `WEB_TEST_URL` và preview đang chạy. |
| Điều hướng browser test timeout | Kiểm tra preview có hoạt động đúng cổng; chạy tuần tự trên bản build thay vì nhiều suite đồng thời với HMR. Không bỏ assertion để ép test đạt. |

## 10. Tài nguyên và giới hạn hiện tại

- Hero AI minh họa được lưu local, không phải ảnh thực tế của nhà hàng: [nguồn/prompt/điều kiện sử dụng](web/public/assets/img/menu-hero.SOURCE.txt).
- Icon chức năng là `lucide-react` 1.61.0 (ISC), import tĩnh; không cần Font Awesome CDN. Logo và ảnh minh họa khác được giữ riêng.
- Font form và bộ chọn dùng Noto Sans local: [nguồn](web/public/fonts/noto-sans/SOURCE.txt), [giấy phép SIL OFL 1.1](web/public/fonts/noto-sans/OFL.txt). Typography gốc còn dùng Lato/Cormorant Garamond từ Google Fonts và có fallback khi CDN không tải được.
- **Định lượng/đơn vị nguyên liệu riêng theo món chưa được backend lưu.** Frontend có ô nhập và gửi `ingredientQuantities`/`ingredientUnits`, nhưng schema hiện chỉ có quan hệ món–nguyên liệu; `Ingredient.quantity`/`unit` là dữ liệu kho dùng chung. Form sửa đang đọc lượng tồn kho, không phải định lượng công thức đã lưu.
- Ảnh món được nhập bằng URL/đường dẫn asset; chưa có luồng upload file. Không có đăng nhập, phân quyền, đặt hàng/thanh toán trong các route hiện tại.
- Để demo: xác nhận API/DB có dữ liệu phù hợp, mở đúng localhost:5173 và kiểm tra thêm trên thiết bị thật. Các thao tác ghi thành công trong browser suite là mock; chưa chứng minh lưu/xóa trên DB thật bằng các suite đó.

README này là hướng dẫn chạy chính. [Hướng dẫn cũ](HUONG_DAN_CHAY_PROJECT.md) và [Technical Stack](TECHNICAL_STACK.md) giữ bối cảnh tham khảo.
