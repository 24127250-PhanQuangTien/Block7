# PROMPT CHO CODING AGENT: Block 7 "Tìm kiếm và phân trang"

Bạn là coding agent. Hãy **mở rộng ứng dụng nhà hàng đã có từ Block 6** (REST API + SPA) theo đúng yêu cầu dưới đây. Làm một mạch từ đầu đến cuối, **không hỏi lại**; chỗ nào chưa rõ thì chọn phương án hợp lý nhất, ghi giả định vào `tech-choice.md`. Thời gian rất hạn chế (khoảng 50-60 phút cho cả buổi), nên ưu tiên chạy đúng trước, đẹp sau.

---

## 0. Nguyên tắc bắt buộc

1. **Giữ nguyên** mọi chức năng đang chạy: CRUD món ăn, trang chi tiết, trang quản trị, API của chefs/ingredients. Không đổi tên route/field đang dùng nếu không cần.
2. **Giữ envelope response của Block 6:** `{ "ok": boolean, "data": ..., "error": ... }`.
3. **Credential/connection string chỉ nằm ở server** (`.env`, đã có trong `.gitignore`). Không đưa vào mã FE, log, README hay file nộp.
4. **Mọi câu SQL dùng parameter binding.** Tuyệt đối không nối chuỗi input vào SQL.
5. Sau khi sửa, **chạy thử thật** (seed, gọi API, mở UI) và báo kết quả; không khẳng định "xong" khi chưa chạy.

---

## 1. Bước 0: khảo sát dự án (làm trước khi code, báo cáo tối đa 8 dòng)

Đọc dự án hiện tại và xác định:
- Ngôn ngữ/framework BE, ORM/driver DB, cách chạy dự án
- FE đang dùng gì (framework, router, cách gọi API)
- Schema bảng món ăn (tên bảng, các cột: id, tên, mô tả, category, giá, trạng thái còn bán...)
- Endpoint danh sách món hiện tại và cách FE đang dùng nó

**Quy tắc stack:** *giữ nguyên stack hiện có của Block 6*, chỉ bổ sung những gì Block 7 cần (xem mục 2). Nếu bảng món chưa có cột `category`, `price` (numeric), `available` (boolean), `description` (nullable) thì thêm bằng migration, giữ dữ liệu cũ.

---

## 2. Tech stack

| Thành phần | Quyết định |
|---|---|
| Database | **Supabase (PostgreSQL thật)** |
| Truy cập DB | Giữ ORM/driver hiện có. Với search/phân trang dùng **parameterized raw SQL** (ví dụ Prisma `$queryRaw` với `Prisma.sql`, hoặc `pg` với `$1,$2`) vì cần `ILIKE ... ESCAPE`, full-text và `pg_trgm` |
| Extension | `pg_trgm` (bật bằng migration: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`) |
| Phân trang | **Server-side** bằng `LIMIT/OFFSET`, FE cập nhật bằng **fetch (AJAX)** |
| Filter/Sort | **Server-side**, đi qua query string |
| Giữ trạng thái | **URL query string** (Reload, Back/Forward, copy link) |
| Kết nối Supabase | Dùng connection string pooler cho ứng dụng; dùng direct connection cho migration/seed nếu pooler gây lỗi prepared statement |

Không thêm thư viện mới nếu không thật sự cần. Nếu thêm, ghi lý do trong `tech-choice.md`.

---

## 3. Database và script seed

- Bảng món ăn có tối thiểu: `id`, `name`, `description` (**cho phép NULL**), `category`, `price` (numeric), `available` (boolean).
- Viết **script seed chạy lại được** (idempotent: chạy lần hai không nhân đôi dữ liệu, ví dụ xóa dữ liệu seed cũ rồi chèn lại, hoặc dùng upsert theo khóa ổn định). Thêm lệnh chạy vào `package.json` / README (ví dụ `npm run seed`).
- Seed **ít nhất 1.000 món**, **dữ liệu xác định** (không dùng random không có seed, để kết quả kiểm thử lặp lại được).
- Dữ liệu phải đa dạng để kiểm thử:
  - Nhiều category (khoảng 6-8)
  - **Nhiều món trùng giá**, có món **giá 0**
  - Cả `available = true` và `false`
  - Mô tả nhiều từ; **một số món `description = NULL`**
  - Tên đa dạng, có tên tiếng Việt
- Chèn thêm **bộ fixture nhỏ cố định** (đặt tên dễ nhận biết) để nghiệm thu chắc chắn:
  - Tên chứa ký tự đặc biệt: `100% Beef Burger`, `Pho_Special`, `Bun!Bo Hue`
  - Cặp tên gần giống nhau để thử fuzzy: `Pho Bo Hue`, `Pho Bo Hanoi`
  - Món `price = 0` và `available = false`
  - Món có mô tả chứa hai từ **không liền nhau** để thử full-text
- Tạo index bằng migration:
  - GIN trigram trên `name`: `CREATE INDEX ... USING gin (name gin_trgm_ops);`
  - GIN full-text: `CREATE INDEX ... USING gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));`
  - Index phụ tùy ý trên `category`, `price`, `available` nếu hợp lý
- Sau khi seed, in ra `SELECT count(*)` để chứng minh số bản ghi.

---

## 4. API danh sách món (giữ một endpoint thống nhất)

```
GET /api/dishes
  ?mode=basic|advanced|fulltext|fuzzy      (mặc định: basic)
  &q=                                       (từ khóa)
  &category=&minPrice=&maxPrice=&available= (dùng cho mode advanced)
  &sort=id_asc|name_asc|name_desc|price_asc|price_desc   (mặc định: id_asc)
  &page=1&pageSize=10                       (page mặc định 1, pageSize mặc định 10, tối đa 100)
```

Nếu endpoint hiện tại đã có tên khác, giữ tên cũ và mở rộng tham số; vẫn đảm bảo FE cũ không vỡ.

### Response thành công
```json
{ "ok": true,
  "data": { "items": [ ... ], "total": 23, "page": 4, "pageSize": 10 },
  "error": null }
```

Quy tắc:
- `total` = tổng số bản ghi **thỏa đúng điều kiện đang áp dụng** (không phải số item của trang, không phải đếm toàn bảng).
- Truy vấn lấy `items` và truy vấn `COUNT` **dùng chung một hàm xây điều kiện WHERE**, để hai câu luôn cùng predicate và cùng tham số.
- `offset = (page - 1) * pageSize`.
- **Luôn có `ORDER BY` xác định**, và luôn có `id ASC` làm thứ tự phụ cuối cùng (kể cả khi sort theo tên/giá).
- **Trang vượt phạm vi** (ví dụ `page=4` khi chỉ có 3 trang): trả `ok: true`, `items: []`, giữ nguyên `page` đã yêu cầu và `total` thật. **Không** tự nhảy về trang cuối, **không** trả `NOT_FOUND`.
- **Không có kết quả:** `ok: true`, `items: []`, `total: 0`.

### Validate (tại API, không chỉ ở form)
- `page`, `pageSize`: số nguyên dương; `pageSize` tối đa 100.
- `mode`, `sort`, `category` phải thuộc tập cho phép.
- `minPrice`, `maxPrice`: số hữu hạn, không âm; `minPrice > maxPrice` là không hợp lệ.
- `available`: chỉ chấp nhận chuỗi `true` hoặc `false`.
- Không hợp lệ: HTTP status **200**, `ok: false`, `error.code = "VALIDATION_FAILED"` kèm thông báo rõ ràng (nếu Block 6 đã có quy ước status/mã lỗi khác thì theo quy ước Block 6 nhưng phải thống nhất cho toàn API).
- Route sai / lỗi hệ thống: `404` / `500` như thông thường. **"Không có dữ liệu" không bao giờ là `NOT_FOUND`.**

---

## 5. Bốn mode search (tại server, trên toàn bộ bảng)

Tìm trước, **sau đó mới** sort rồi phân trang. Browser không tự tìm lại.

### 5.1 `basic`
- Món có **tên chứa chuỗi `q`**, không phân biệt hoa/thường.
- `ILIKE $1 ESCAPE '!'` với pattern được dựng bằng hàm **escape literal**: thay `!` thành `!!`, rồi `%` thành `!%`, rồi `_` thành `!_`, sau đó mới thêm `%` ở hai đầu.
- Nhập `100%`, `Pho_`, `!` phải được hiểu là **ký tự thường**, không mở rộng thành wildcard. Chuỗi không khớp trả **rỗng**, không trả toàn bộ món.
- `q` rỗng/trắng: trả danh sách (không áp điều kiện tên).
- Hỗ trợ `sort` và phân trang.

### 5.2 `advanced`
- Gồm `q`, `category`, `minPrice`, `maxPrice`, `available`. Mỗi tiêu chí là một predicate, **các tiêu chí đang hoạt động nối bằng AND**.
- `q` là **literal contains trên tên** (dùng lại hàm escape ở 5.1).
- Có thể dùng mẫu: `($1 IS NULL OR name ILIKE $1 ESCAPE '!') AND ($2 IS NULL OR category = $2) AND ($3 IS NULL OR price >= $3) AND ($4 IS NULL OR price <= $4) AND ($5 IS NULL OR available = $5)`.
- `minPrice`/`maxPrice` **inclusive** (gồm cả hai cận).
- **Phân biệt "rỗng" với giá trị có nghĩa:**
  - Thiếu tham số hoặc chuỗi trắng: coi là **không có tiêu chí** (chuyển thành `NULL` tại server).
  - `available=false` là điều kiện **có nghĩa** (chỉ món hết hàng), **không được bỏ**.
  - `minPrice=0` là cận **hợp lệ**, không được bỏ.
  - **Cấm** kiểu `if (value)` sau khi parse và cấm `Boolean('false')` (cho kết quả `true`).
- Khi chỉ có `q`, kết quả phải **giống hệt** mode `basic`.
- Hỗ trợ `sort` và phân trang.

### 5.3 `fulltext`
- Dùng PostgreSQL full-text trên **tên + mô tả**.
- Document: `to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))` (**xử lý được `description` NULL**).
- Query: `plainto_tsquery('simple', $1)`. **Cùng cấu hình `simple`** cho document và query.
- Tìm được khi các từ trong `q` nằm **không liền nhau** trong tên/mô tả.
- Sắp xếp: **điểm (`ts_rank`) giảm dần, rồi `id` tăng dần**. Tham số `sort` bị bỏ qua ở mode này (UI vô hiệu hóa ô sort).
- `q` rỗng/trắng: `VALIDATION_FAILED`.
- Chỉ dùng `q` (các bộ lọc advanced không áp dụng ở mode này; UI vô hiệu hóa chúng).

### 5.4 `fuzzy`
- Dùng `pg_trgm` trên **tên**, tính **similarity cả tên** (dùng `similarity(name, $1)`, **không** dùng `word_similarity`).
- **Ngưỡng 0.3**: chỉ lấy món có `similarity(name, $1) >= 0.3`. Viết ngưỡng như hằng số có tên trong mã, và ghi rõ ngưỡng này trong `tech-choice.md` và trên UI.
  - Nếu dùng toán tử `%` thay vì so sánh tường minh, phải đặt ngưỡng bằng `SET LOCAL pg_trgm.similarity_threshold = 0.3` **trong cùng transaction** với truy vấn (vì connection pool).
- Sắp xếp: **similarity giảm dần, rồi `id` tăng dần**. Bỏ qua `sort` như `fulltext`.
- `q` rỗng/trắng: `VALIDATION_FAILED`.
- Gõ sai nhẹ (ví dụ `Pho Bo Hu`) vẫn ra `Pho Bo Hue` ở đầu danh sách.

---

## 6. Filter và Sort (đặt ở server)

- Lọc: **category**, **khoảng giá** (min/max), **trạng thái còn bán** (đi qua mode `advanced`).
- Sắp xếp: **tên**, **giá tăng/giảm** (tham số `sort`, áp dụng trong `ORDER BY` **trước** `LIMIT/OFFSET`, luôn kèm `id ASC` làm thứ tự phụ).
- Vì xử lý ở server nên tác động lên **toàn bộ tập kết quả**, không phải riêng 10 món đang hiển thị. Nêu rõ điều này trong `tech-choice.md`.
- UI **không được** tuyên bố "lọc/sắp xếp tất cả" nếu thao tác chỉ chạy trên một trang.
- Xóa điều kiện chỉ hiển thị lại kết quả, **không sửa dữ liệu**.

---

## 7. Giao diện (SPA)

### 7.1 Ba kiểu hiển thị phân trang: **làm đủ cả ba**
Trên trang danh sách món có **bộ chuyển kiểu hiển thị** (tab/toggle) gồm 3 chế độ, tại một thời điểm hiển thị một chế độ. Cả ba dùng **cùng một API** ở mục 4.

| Chế độ | Hành vi |
|---|---|
| **Số trang** | Hiện nút các trang; chọn trang thì **thay** danh sách. Có Trước/Sau, đánh dấu trang hiện tại, vô hiệu hóa nút khi ở biên |
| **Load More** | Nút "Tải thêm" ở cuối; bấm thì **nối** món vào danh sách đang có |
| **Infinite Scroll** | Không cần bấm; cuộn gần cuối thì tự **nối** phần tiếp theo |

### 7.2 Logic chung cho Load More và Infinite Scroll
- State: `nextPage` (bắt đầu 1), danh sách tích lũy, `pending` (false), `end` (false).
- Hàm dùng chung `loadNext()`:
  1. Nếu `pending` hoặc `end` đang đúng thì **return**.
  2. Đặt `pending = true` **đồng bộ trước khi** gửi request (chống gửi trùng).
  3. Thành công (HTTP ok và `ok: true` và response **còn thuộc bộ điều kiện hiện tại**): nối `data.items`, rồi mới tăng `nextPage`.
  4. `end = true` khi `page * pageSize >= total` hoặc `items` rỗng (tính từ metadata của response vừa nhận, không dùng `nextPage` đã tăng).
  5. **Lỗi:** giữ nguyên `nextPage` và danh sách, hiện nút "Thử lại". **Không tăng trang trong `finally`.**
  6. Luôn đặt lại `pending = false` khi xong (kể cả lỗi).
- **Chống response cũ ghi đè:** dùng `AbortController` hoặc request id; response của điều kiện cũ phải bị bỏ qua.
- Hiển thị trạng thái "Đang tải...", "Đã hết món", trạng thái rỗng khi `total = 0`.

### 7.3 Infinite Scroll
- Dùng `IntersectionObserver` với phần tử `sentinel` đặt **sau cuối danh sách** (không phải từng món), `rootMargin: "200px 0px"`.
- Callback chỉ gọi `loadNext()` (đã có chặn `pending/end`).
- Sau mỗi lần tải xong, **kiểm tra lại** sentinel (nếu danh sách chưa đủ cao để cuộn mà sentinel vẫn trong vùng nhìn thì tải tiếp).
- Có **nút "Tải thêm" dự phòng** nhỏ cho người dùng bàn phím.
- `unobserve` khi `end`, `disconnect` khi đổi chế độ hoặc rời trang, `observe` lại khi reset.

### 7.4 Form tìm kiếm
- Chọn `mode`: basic / advanced / fulltext / fuzzy.
- Basic/Fulltext/Fuzzy: một ô `q`. Advanced: `q`, chọn category, min/max giá, chọn còn bán (tất cả / còn bán / hết hàng; **"tất cả" khác "hết hàng"**).
- Ô chọn `sort` (vô hiệu hóa khi mode là fulltext/fuzzy kèm ghi chú "xếp theo độ phù hợp").
- Nút **Tìm kiếm** (chỉ áp dụng khi bấm, không tìm theo từng ký tự gõ) và nút **Xóa điều kiện**.
- Chọn `pageSize` (ví dụ 10/20/50).

### 7.5 Giữ trạng thái trên URL
Điều kiện đã áp dụng nằm trên URL, ví dụ:
```
/dishes?view=pages&mode=advanced&q=ga&category=main&minPrice=0&available=false&sort=price_asc&page=2&pageSize=10
```
- **Reload, Back/Forward, copy link sang tab khác** phải khôi phục đúng: chế độ hiển thị, mode, điều kiện tìm kiếm, sort, `pageSize` và (với chế độ Số trang) trang hiện tại.
- **Đổi bất kỳ điều kiện nào** (từ khóa, filter, sort, pageSize, mode, chế độ hiển thị) thì **về trang 1** và tạo lại danh sách.
- **Chuyển trang** chỉ đổi `page`, giữ nguyên điều kiện.
- **Xóa điều kiện:** hiện lại toàn bộ, bắt đầu từ trang 1.
- Với Load More/Infinite Scroll: mở lại link thì **tải lại từ đầu** theo điều kiện (không khôi phục phần đã nối). Ghi quyết định này trong `tech-choice.md`.
- Không ghi lên URL từng ký tự chưa bấm Tìm kiếm. URL không đóng băng dữ liệu (DB đổi thì kết quả đổi).

---

## 8. Các lỗi dễ mắc (phải tránh)

1. Lọc/sort chỉ trên 10 món của trang hiện tại nhưng gọi là "toàn bộ".
2. `total` đếm sai điều kiện (đếm cả bảng khi đang tìm).
3. Thiếu `ORDER BY` xác định, gây lặp/thiếu món giữa các trang.
4. Bỏ điều kiện khi `available=false` hoặc `minPrice=0`; dùng `Boolean('false')`.
5. Không escape `%`, `_`, `!` nên tìm `100%` ra toàn bộ món.
6. Tăng `nextPage` khi request lỗi; gửi trùng request; response cũ ghi đè kết quả mới.
7. Trả `NOT_FOUND` khi không có kết quả hoặc trang vượt phạm vi.
8. Quên xử lý `description = NULL` trong full-text.
9. Dùng hai cấu hình text search khác nhau cho document và query.
10. Nối chuỗi vào SQL; lộ credential.

---

## 9. Kiểm thử và nghiệm thu

Viết một **script kiểm thử** (ví dụ `npm run verify:block7`) gọi API thật (không mock), in kết quả đạt/không đạt cho các ca sau (dựa trên dữ liệu seed cố định, cập nhật kỳ vọng theo seed thực tế của bạn):

1. Đếm bản ghi >= 1.000.
2. Phân trang: duyệt toàn bộ các trang, **gộp lại không lặp, không thiếu id** và số phần tử bằng `total`.
3. Trang vượt phạm vi: `ok: true`, `items: []`, `total` thật.
4. Tham số sai (`page=0`, `pageSize=999`, `available=maybe`, `minPrice=-1`, `minPrice>maxPrice`, `mode=abc`) cho `VALIDATION_FAILED`.
5. `basic`: tìm `100%` chỉ ra đúng món chứa `100%`; tìm `_` hoặc `%` không trả toàn bộ; chuỗi không khớp trả rỗng.
6. `advanced`: `available=false` chỉ ra món hết hàng; `minPrice=0&maxPrice=0` ra món giá 0; kết hợp nhiều tiêu chí đúng AND; chỉ có `q` thì giống `basic`.
7. `sort`: `price_asc/desc`, `name_asc/desc` đúng thứ tự **trên toàn bộ tập** (kiểm tra bằng cách so sánh với truy vấn độc lập hoặc kiểm tra trang đầu chứa giá nhỏ nhất toàn bảng); các món trùng giá được xếp theo `id`.
8. `fulltext`: từ khóa gồm hai từ không liền nhau; món có `description` NULL không gây lỗi; thứ tự theo điểm giảm dần rồi `id`.
9. `fuzzy`: gõ sai nhẹ vẫn ra món đúng ở đầu; điểm giảm dần rồi `id`; kết quả đều có similarity >= 0.3.
10. Cùng điều kiện, `total` ở trang 1 và trang cuối bằng nhau.

Với UI, tự kiểm tra thủ công và mô tả kết quả trong `EVIDENCE.md`: ba chế độ hiển thị, Reload/Back/Forward/copy link, đổi điều kiện về trang 1, lỗi mạng khi Load More vẫn thử lại được.

---

## 10. Sản phẩm bàn giao

1. **Mã nguồn đã chạy được**, giữ chức năng cũ.
2. **Script seed** (>= 1.000 món) + migration (cột cần thiết, `pg_trgm`, các index).
3. **`tech-choice.md`**: giải thích **lý do cho từng lựa chọn**, tối thiểu gồm:
   - Vì sao chọn server-side paging (lượng dữ liệu tải, hành vi khi chuyển trang) và dùng AJAX/fetch hay tải HTML mới
   - Vì sao filter/sort đặt ở server và tác động lên tập dữ liệu nào
   - Vì sao raw SQL parameterized cho search; cách escape wildcard
   - Cấu hình full-text (`simple`, `coalesce`) và fuzzy (`pg_trgm`, ngưỡng 0.3, whole-title similarity)
   - Cách giữ trạng thái qua URL; hành vi Load More/Infinite Scroll khi mở lại link
   - Các giả định đã đưa ra khi gặp chỗ chưa rõ
4. **`EVIDENCE.md`**: gồm
   - Kết quả `count(*)` và lệnh seed
   - Với **mỗi mode** search: URL mẫu, SQL (hoặc mô tả truy vấn) thực thi, kết quả thực tế
   - Ghi chú cách xem Network (HTML hay JSON, tải toàn bộ hay từng phần)
   - Mục **"Lỗi đã phát hiện"**: ghi **lỗi thật** mà bạn gặp và sửa trong quá trình làm (mô tả, cách tái hiện, bằng chứng sau sửa). **Không bịa lỗi**; nếu chưa gặp lỗi nào thì ghi rõ để nhóm tự bổ sung
5. **README ngắn**: cách cài đặt, biến môi trường cần có (chỉ tên biến, không có giá trị), cách seed, cách chạy, cách chạy script kiểm thử.

---

## 11. Thứ tự thực hiện gợi ý (để kịp thời gian)

1. Khảo sát dự án và báo cáo ngắn
2. Migration (cột, `pg_trgm`, index) + script seed + chạy seed, kiểm tra `count(*)`
3. API danh sách: hàm xây WHERE dùng chung, phân trang, validate, sort
4. Bốn mode search
5. FE: chế độ Số trang, rồi Load More, rồi Infinite Scroll, form tìm kiếm, đồng bộ URL
6. Script kiểm thử và chạy
7. `tech-choice.md`, `EVIDENCE.md`, README

---

## 12. Tiêu chí hoàn thành (Definition of Done)

- [ ] >= 1.000 món trong Supabase, có script seed chạy lại được
- [ ] Ba chế độ hiển thị (Số trang, Load More, Infinite Scroll) hoạt động, **không lặp, không mất món**
- [ ] Filter/sort đúng điều kiện và đúng phạm vi (toàn bộ tập), có `id` làm thứ tự phụ
- [ ] Bốn mode search (`basic`, `advanced`, `fulltext`, `fuzzy`) đúng như mô tả; ngưỡng fuzzy 0.3; full-text cấu hình `simple`, xử lý NULL
- [ ] `total` đếm cùng predicate với `items`; trang vượt phạm vi trả `items: []`
- [ ] `available=false`, `minPrice=0`, `%`, `_`, `!` được xử lý đúng
- [ ] URL giữ trạng thái; Reload/Back/Forward/copy link khôi phục đúng; đổi điều kiện về trang 1
- [ ] Không mất chức năng CRUD, chi tiết, quản trị của Block 6
- [ ] Không lộ credential/connection string
- [ ] Có `tech-choice.md`, `EVIDENCE.md`, README; script kiểm thử đã chạy và báo kết quả
