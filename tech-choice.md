# Block 7 — Tech choices

## Stack and database

- Giữ Node.js/Express, Prisma, React, React Router và PostgreSQL/Supabase của Block 6; không thêm runtime dependency.
- Giữ `GET /api/dishes` làm endpoint thống nhất. Danh sách mới trả envelope `ok/data/error` với `data.items`, `total`, `page`, `pageSize`. Trang quản trị cũ tiếp tục dùng cùng endpoint và API client tải nối các trang 100 món để giữ danh sách hiện có.
- Các query `category`/`status` cũ không kèm `mode` tiếp tục được hiểu là lọc nâng cao; client quản trị hiện tại dịch `status` sang tham số mới `available=true|false`.
- Schema Block 6 đã có `description String?`, `category`, `available` và `price Int`. Giữ nguyên cột giá nguyên (đơn vị tiền nguyên/VND) để tương thích; cho phép giá 0 ở validation. Dữ liệu category/null description có thể tiếp tục tồn tại.
- Không reset/baseline lại database Supabase đang có dữ liệu. `migrate:block7` chạy các câu DDL cố định từ migration có `IF NOT EXISTS`; không đưa input/request vào câu lệnh. Cách này tránh Prisma `migrate deploy` từ chối schema không rỗng (`P3005`) khi dự án trước đó dùng `db:push`.

## Query and paging

- Server-side `LIMIT/OFFSET` chỉ trả tối đa số món của trang; chuyển trang tải JSON tiếp theo thay vì HTML mới hay toàn bộ bảng. Frontend dùng `fetch`/AJAX để giữ SPA.
- Cả filter và sort nằm ở PostgreSQL, trước `LIMIT/OFFSET`, nên áp dụng lên toàn tập kết quả khớp điều kiện chứ không chỉ trang đang xem. Sort được whitelist, luôn có `id ASC` làm tie-breaker.
- Một hàm predicate duy nhất tạo `WHERE` cho cả truy vấn lấy ID và `COUNT(*)`; các phần động trong truy vấn tìm kiếm dùng `Prisma.sql` parameter binding. Tên cột/hướng sort là các fragment cố định từ whitelist.
- `basic` và `advanced.q` dùng `ILIKE ... ESCAPE '!'`. Escape lần lượt `!` thành `!!`, `%` thành `!%`, `_` thành `!_`, rồi bọc pattern trong `%`; ký tự người dùng không trở thành wildcard.
- `fulltext` tạo document bằng `to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))`, query bằng `plainto_tsquery('simple', q)`. Cùng cấu hình `simple` và `coalesce` bảo đảm từ ở các vị trí khác nhau vẫn khớp và description NULL không lỗi.
- `fuzzy` dùng `similarity(name, q)` cho toàn tên, ngưỡng `FUZZY_SIMILARITY_THRESHOLD = 0.3`; sắp theo điểm giảm dần rồi ID tăng dần. Full-text cũng sắp theo `ts_rank` giảm dần rồi ID; hai mode bỏ qua sort do người dùng chọn.

## URL and display modes

- Query string giữ `view`, mode, từ khóa, filter, sort, `pageSize` và `page`. Reload, history Back/Forward và URL được sao chép có thể khôi phục cùng điều kiện.
- Số trang khôi phục trang đang yêu cầu. Load More/Infinite Scroll luôn mở lại từ trang 1; URL không lưu các trang đã tải nối.
- Thay đổi điều kiện đã áp dụng, page size hoặc kiểu hiển thị quay về trang 1. Ô nhập là draft, chỉ nút Tìm kiếm áp dụng từ khóa/filter/sort; Xóa điều kiện giữ kiểu hiển thị/page size và bỏ filter.
- Load More và Infinite Scroll dùng chung `loadNext`, `pending` đồng bộ, `AbortController` và generation key để không gửi trùng hoặc để response cũ ghi đè. Lỗi giữ nguyên trang để nút Thử lại tải lại đúng trang.
- Infinite Scroll quan sát sentinel sau danh sách bằng `IntersectionObserver` với `rootMargin: "200px 0px"`; có nút tải dự phòng cho bàn phím và ngừng quan sát khi kết thúc/đổi view/rời trang.

## Seed assumptions

- Giữ nguyên seed Block 6; thêm `seed:block7` riêng. Script xóa chỉ các món do chính script nhận diện (`B7 Seed ` hoặc marker mô tả fixture), sau đó thêm 1.000 món xác định và 6 fixture. Mô tả NULL được đặt trên các tên `B7 Seed ` nên lượt seed sau vẫn nhận diện để xóa và không nhân đôi. Trường `createdAt` cũng dùng một mốc cố định.
- Danh mục cho API/UI là tám giá trị tiếng Việt cố định, gồm các danh mục hiện có và `Món Nướng`, `Đồ Uống`; bộ seed sinh đủ tám nhóm.
- `price` vẫn là số nguyên vì Block 6 lưu tiền theo đơn vị nguyên; không có yêu cầu tiền lẻ trong form/schema hiện tại.
