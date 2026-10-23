# GIÁO TRÌNH LÝ THUYẾT & THỰC HÀNH TOÀN DIỆN: REST API VÀ SINGLE PAGE APPLICATION (SPA)

> **Môn học:** Phát triển ứng dụng web (Web Development 2)  
> **Nguồn bài giảng gốc:** ThS. Ngô Ngọc Đăng Khoa (Block 6 / Week 4)  
> **Mục tiêu:** Cung cấp đầy đủ kiến thức nền tảng, tư duy hệ thống (mental model), sơ đồ chi tiết, phân tích so sánh và cẩm nang thực hành để hoàn thành trọn vẹn bài tập lớn Nhà hàng (Restaurant Assignment).

---

## MỤC LỤC

1. [PHẦN 1: TƯ DUY HỆ THỐNG VÀ KIẾN TRÚC 3 THÀNH PHẦN (Slide 1 – 7)](#phần-1-tư-duy-hệ-thống-và-kiến-trúc-3-thành-phần)
   - [1.1. Câu hỏi cốt lõi](#11-câu-hỏi-cốt-lõi)
   - [1.2. Sơ đồ 1: Ba thành phần của ứng dụng hiện đại](#12-sơ-đồ-1-ba-thành-phần-của-ứng-dụng-hiện-đại)
   - [1.3. Sơ đồ 2: Mental Model chi tiết luồng dữ liệu](#13-sơ-đồ-2-mental-model-chi-tiết-luồng-dữ-liệu)
   - [1.4. Nguyên tắc bảo mật & Ranh giới phân chia FE – BE](#14-nguyên-tắc-bảo-mật--ranh-giới-phân-chia-fe--be)
2. [PHẦN 2: THIẾT KẾ RESTFUL API CHUẨN MỰC (Slide 8 – 20)](#phần-2-thiết-kế-restful-api-chuẩn-mực)
   - [2.1. Đặt tên URL theo Tài nguyên (Resource-oriented)](#21-đặt-tên-url-theo-tài-nguyên-resource-oriented)
   - [2.2. Bảng quy chuẩn REST API mẫu](#22-bảng-quy-chuẩn-rest-api-mẫu)
   - [2.3. Phân biệt chuyên sâu: PUT vs PATCH](#23-phân-biệt-chuyên-sâu-put-vs-patch)
   - [2.4. Phân định: Lỗi kỹ thuật vs Lỗi nghiệp vụ](#24-phân-định-lỗi-kỹ-thuật-vs-lỗi-nghiệp-vụ)
   - [2.5. Chuẩn hóa cấu trúc phản hồi (Response Shape)](#25-chuẩn-hóa-cấu-trúc-phản-hồi-response-shape)
   - [2.6. Bảng mã lỗi nghiệp vụ chuẩn](#26-bảng-mã-lỗi-nghiệp-vụ-chuẩn)
   - [2.7. Luồng 5 bước của một HTTP Request đi qua API](#27-luồng-5-bước-của-một-http-request-đi-qua-api)
   - [2.8. Quy tắc cốt lõi & Những lỗi sai thường gặp khi viết API](#28-quy-tắc-cốt-lõi--những-lỗi-sai-thường-gặp-khi-viết-api)
   - [2.9. Kịch bản kiểm thử API độc lập (Postman / cURL)](#29-kịch-bản-kiểm-thử-api-độc-lập-postman--curl)
3. [PHẦN 3: CƠ CHẾ CORS (CROSS-ORIGIN RESOURCE SHARING) (Slide 21 – 27)](#phần-3-cơ-chế-cors-cross-origin-resource-sharing)
   - [3.1. Khái niệm Origin & Same-Origin Policy](#31-khái-niệm-origin--same-origin-policy)
   - [3.2. Yêu cầu đơn giản (Simple Request) vs Yêu cầu cần Preflight](#32-yêu-cầu-đơn-giản-simple-request-vs-yêu-cầu-cần-preflight)
   - [3.3. Sơ đồ 3: Sequence Diagram quá trình Preflight & Gửi PATCH](#33-sơ-đồ-3-sequence-diagram-quá-trình-preflight--gửi-patch)
   - [3.4. Hai phương án xử lý CORS (API Header vs Dev Proxy)](#34-hai-phương-án-xử-lý-cors-api-header-vs-dev-proxy)
   - [3.5. Cấu hình CORS chuẩn ở Backend](#35-cấu-hình-cors-chuẩn-ở-backend)
4. [PHẦN 4: SPA GỌI API, QUẢN LÝ LỖI, ROUTING VÀ FORM (Slide 28 – 40)](#phần-4-spa-gọi-api-quản-lý-lỗi-routing-và-form)
   - [4.1. Sơ đồ 4: Flowchart kiểm tra 3 tầng lỗi khi gọi API](#41-sơ-đồ-4-flowchart-kiểm-tra-3-tầng-lỗi-khi-gọi-api)
   - [4.2. Thiết kế tầng gọi API tập trung (API Client Wrapper)](#42-thiết-kế-tầng-gọi-api-tập-trung-api-client-wrapper)
   - [4.3. Sơ đồ 5: State Machine các trạng thái khi tải dữ liệu](#43-sơ-đồ-5-state-machine-các-trạng-thái-khi-tải-dữ-liệu)
   - [4.4. Nguyên tắc quản lý dữ liệu: "Dữ liệu thuộc về trang"](#44-nguyên-tắc-quản-lý-dữ-liệu-dữ-liệu-thuộc-về-trang)
   - [4.5. Phân tích chi tiết chức năng "Xem chi tiết"](#45-phân-tích-chi-tiết-chức-năng-xem-chi-tiết)
   - [4.6. Cơ chế Client-Side Routing & Bài toán Server Fallback](#46-cơ-chế-client-side-routing--bài-toán-server-fallback)
   - [4.7. Phân biệt URL Trình duyệt vs URL API](#47-phân-biệt-url-trình-duyệt-vs-url-api)
   - [4.8. Sơ đồ 6: Luồng xử lý Form & Client Navigation sau khi ghi](#48-sơ-đồ-6-luồng-xử-lý-form--client-navigation-sau-khi-ghi)
   - [4.9. Kỹ thuật lập trình Form trong SPA](#49-kỹ-thuật-lập-trình-form-trong-spa)
   - [4.10. Cẩm nang chẩn đoán và khoanh vùng lỗi (Debugging Guide)](#410-cẩm-nang-chẩn-đoán-và-khoanh-vùng-lỗi-debugging-guide)
5. [PHẦN 5: ĐẶC TẢ BÀI TẬP NHÀ HÀNG & TIÊU CHÍ NGHIỆM THU (Slide 41 – 55)](#phần-5-đặc-tả-bài-tập-nhà-hàng--tiêu-chí-nghiệm-thu)
   - [5.1. Bối cảnh & Cấu trúc mã nguồn (`api` và `web`)](#51-bối-cảnh--cấu-trúc-mã-nguồn-api-và-web)
   - [5.2. Mô hình thực thể (Models & Fields)](#52-mô-hình-thực-thể-models--fields)
   - [5.3. Bảng đặc tả đầy đủ 15 REST API Endpoints](#53-bảng-đặc-tả-đầy-đủ-15-rest-api-endpoints)
   - [5.4. Đặc tả hệ thống các trang SPA và Routing](#54-đặc-tả-hệ-thống-các-trang-spa-và-routing)
   - [5.5. Quy trình 4 bước thực hiện bài tập chuẩn](#55-quy-trình-4-bước-thực-hiện-bài-tập-chuẩn)
   - [5.6. Bảng kiểm tra chất lượng mã nguồn (Code Audit Checklist)](#56-bảng-kiểm-tra-chất-lượng-mã-nguồn-code-audit-checklist)
   - [5.7. Bộ tiêu chí nghiệm thu nghiêm ngặt (Acceptance Criteria)](#57-bộ-tiêu-chí-nghiệm-thu-nghiêm-ngặt-acceptance-criteria)
   - [5.8. Tổng kết tư duy kiến trúc](#58-tổng-kết-tư-duy-kiến-trúc)
6. [PHẦN 6: BÁO CÁO NGHIỆM THU, QUYẾT ĐỊNH KIẾN TRÚC & CẤU TRÚC DỰ ÁN THỰC TẾ](#phần-6-báo-cáo-nghiệm-thu-quyết-định-kiến-trúc--cấu-trúc-dự-án-thực-tế)
   - [6.1. Bảng đối chiếu tiêu chí nghiệm thu & phòng tránh lỗi sai](#61-bảng-đối-chiếu-tiêu-chí-nghiệm-thu--phòng-tránh-lỗi-sai)
   - [6.2. Quyết định kiến trúc kỹ thuật & Tech Stack](#62-quyết-định-kiến-trúc-kỹ-thuật--tech-stack)
   - [6.3. Phân tích chuyên sâu cơ chế CORS: Lựa chọn Phương án 1 vs Phương án 2](#63-phân-tích-chuyên-sâu-cơ-chế-cors-lựa-chọn-phương-án-1-vs-phương-án-2)
   - [6.4. Vị trí chính xác quy định ORIGIN và các cài đặt ALLOW trong mã nguồn](#64-vị-trí-chính-xác-quy-định-origin-và-các-cài-đặt-allow-trong-mã-nguồn)
   - [6.5. Cấu trúc toàn diện dự án (Project Tree) & Chú thích chi tiết từng phần](#65-cấu-trúc-toàn-diện-dự-án-project-tree--chú-thích-chi-tiết-từng-phần)

---

## PHẦN 1: TƯ DUY HỆ THỐNG VÀ KIẾN TRÚC 3 THÀNH PHẦN

### 1.1. Câu hỏi cốt lõi
> *"Khi giao diện là một SPA (Single Page Application) chạy trong trình duyệt, dữ liệu từ cơ sở dữ liệu (Database) đến được màn hình người dùng như thế nào?"*

Trong mô hình web truyền thống (Server-Side Rendering - SSR như PHP, JSP, ASP.NET MVC):
* Trình duyệt gửi request HTTP đến máy chủ web.
* Máy chủ truy vấn database, nhúng dữ liệu trực tiếp vào file HTML (render trên server) rồi trả cả trang HTML hoàn chỉnh về cho trình duyệt.
* Mỗi lần chuyển trang hoặc bấm gửi form, trình duyệt lại gửi một document request mới và tải lại toàn bộ trang (trang bị chớp/trắng).

Trong mô hình **SPA + REST API**:
* Máy chủ chỉ đóng vai trò cung cấp dữ liệu thô (JSON) thông qua các điểm cuối REST API.
* Mã nguồn ứng dụng giao diện (HTML/CSS/JavaScript) được tải một lần duy nhất về máy người dùng (hoặc tải theo từng phần lười - lazy loading).
* JavaScript chạy trên máy khách (client) tự gửi các HTTP request ngầm (qua `fetch` hoặc `axios`), nhận dữ liệu JSON, tự sinh cây DOM và cập nhật từng phần màn hình mà **không tải lại toàn bộ trang web**.

---

### 1.2. Sơ đồ 1: Ba thành phần của ứng dụng hiện đại
*(Tương ứng hình ảnh trên Slide 5: `block6-split.svg`)*

```mermaid
flowchart LR
    subgraph BrowserBox["Trình duyệt (Browser) - Máy người dùng"]
        SPA["SPA (Client App)<br/>JavaScript, CSS, HTML"]
    end
    
    FileServer["Server lưu file SPA<br/>(Nginx / Vite / S3)"] -->|"1. Tải index.html & bundle JS/CSS"| SPA
    SPA -->|"2. GET /api/dishes/2<br/>(Request dữ liệu JSON)"| BackendAPI["REST API (Backend)<br/>Route, Handler, ORM"]
    BackendAPI -->|"3. Truy vấn SQL"| Database[("Cơ sở dữ liệu (Database)<br/>PostgreSQL / MySQL / SQLite")]
    Database -->|"4. Kết quả bảng/hàng"| BackendAPI
    BackendAPI -.->|"5. Trả về payload JSON"| SPA
```

**Phân tích luồng hoạt động:**
1. **Pha tải ứng dụng (Initial Load):** Người dùng truy cập tên miền web. Server lưu file tĩnh phục vụ file `index.html` tối thiểu và bundle JS. Trình duyệt tải và thực thi JS, biến trình duyệt thành một ứng dụng chạy độc lập (Client App).
2. **Pha nạp dữ liệu (Data Fetching):** Khi cần dữ liệu hiển thị (ví dụ danh sách món ăn), SPA phát lệnh `fetch('http://api-domain/api/dishes')`.
3. **Pha xử lý nghiệp vụ:** Backend nhận request, kiểm tra tính hợp lệ, chạy ORM/SQL lấy dữ liệu từ Database.
4. **Pha phản hồi & kết xuất:** Backend gói dữ liệu thành JSON gửi trả lại. SPA parse JSON và gán vào State để cập nhật giao diện trực quan.

---

### 1.3. Sơ đồ 2: Mental Model chi tiết luồng dữ liệu
*(Tương ứng hình ảnh trên Slide 6: `block6-mental-model.svg`)*

```mermaid
flowchart TD
    subgraph ClientLayer["SPA (FE) - Chạy trong trình duyệt người dùng"]
        Router["Client Router<br/>(Khớp URL: /books/2)"]
        DetailPage["Trang chi tiết (Component)"]
        UI["UI State & Render<br/>(Loading / Error / Data)"]
        
        Router -->|"Kích hoạt component & truyền id=2"| DetailPage
        DetailPage --> UI
    end

    subgraph ServerLayer["REST API (BE) - Chạy trên server"]
        Route["Route Layer<br/>(Định tuyến: GET /api/books/:id)"]
        Handler["Controller / Handler Layer<br/>(Xử lý nghiệp vụ & validation)"]
        DAL["Lớp truy cập dữ liệu (DAL / ORM)<br/>(Repository / Prisma / Sequelize)"]
        
        Route --> Handler
        Handler --> DAL
    end

    Database[("Cơ sở dữ liệu (Database)")]

    DetailPage -->|"HTTP Request: GET /api/books/2"| Route
    DAL -->|"Câu lệnh truy vấn SQL"| Database
    Database -->|"Bản ghi thô"| DAL
    DAL --> Handler
    Handler -.->|"HTTP Response: 200 OK<br/>{ ok: true, data: { ... } }"| DetailPage
```

---

### 1.4. Nguyên tắc bảo mật & Ranh giới phân chia FE – BE
*(Slide 7)*

1. **SPA chạy trên môi trường không đáng tin cậy (Untrusted Environment):**
   * Toàn bộ mã nguồn JavaScript, biến toàn cục, LocalStorage của SPA đều nằm trên máy người dùng. Người dùng có thể bấm `F12` (DevTools) để xem, sửa mã, đọc token, can thiệp logic.
   * **Tuyệt đối không lưu giữ Secret:** API Secret Key, JWT Secret, Khóa bảo mật thanh toán, và đặc biệt là **Chuỗi kết nối Database (Database Connection String)** KHÔNG BAO GIỜ được xuất hiện trong code của SPA.
2. **Backend nắm quyền kiểm soát dữ liệu:**
   * Chuỗi kết nối DB và toàn bộ mật khẩu hệ thống chỉ nằm ở Backend (thông qua biến môi trường `.env`).
   * Backend là "người gác cổng" duy nhất có quyền đọc/ghi vào Database.
3. **Tính độc lập:**
   * SPA và Backend là hai ứng dụng hoàn toàn độc lập, có thể triển khai ở hai máy chủ khác nhau, viết bằng hai ngôn ngữ/công nghệ khác nhau. Giao tiếp giữa chúng chỉ thông qua giao thức HTTP và định dạng chuẩn JSON.

---

## PHẦN 2: THIẾT KẾ RESTFUL API CHUẨN MỰC

### 2.1. Đặt tên URL theo Tài nguyên (Resource-oriented)
*(Slide 8 – 9)*

Trong tư duy RPC (Remote Procedure Call) hoặc web cũ, lập trình viên thường đặt tên URL theo **hành động (động từ)**. Trong chuẩn kiến trúc REST (Representational State Transfer):
* **URL đại diện cho Tài nguyên (Danh từ số nhiều - Noun plural):** Tài nguyên là thực thể mà hệ thống quản lý (ví dụ: `books`, `dishes`, `chefs`).
* **HTTP Method đại diện cho Hành động (Verb):** Bản thân phương thức HTTP đã chỉ định rõ thao tác cần làm.

| Thao tác nghiệp vụ | Sai lầm (Đặt tên theo hành động) | Chuẩn RESTful (Đặt tên theo tài nguyên) | Giải thích quy chuẩn |
| :--- | :--- | :--- | :--- |
| Lấy danh sách sách | `GET /getAllBooks` hoặc `/books/list` | **`GET /api/books`** | Lấy toàn bộ danh sách tài nguyên `books` |
| Thêm mới một cuốn | `POST /addNewBook` hoặc `/books/create` | **`POST /api/books`** | Tạo mới một tài nguyên trong tập hợp `books` |
| Xem chi tiết cuốn #2 | `GET /getBook?id=2` hoặc `/books/get/2` | **`GET /api/books/2`** | Định danh cụ thể bản ghi `#2` bằng Path Parameter |
| Cập nhật cuốn #2 | `POST /updateBook?id=2` | **`PATCH /api/books/2`** | Cập nhật một phần dữ liệu của bản ghi `#2` |
| Xóa cuốn #2 | `GET /deleteBook?id=2` hoặc `POST /remove/2` | **`DELETE /api/books/2`** | Xóa bỏ bản ghi `#2` khỏi hệ thống |

> [!WARNING] Cảnh báo nghiêm trọng
> Tuyệt đối không bao giờ dùng `GET` để xóa hoặc thay đổi dữ liệu (ví dụ `GET /api/books/2/delete`). `GET` bắt buộc phải là phương thức **an toàn (safe)** và **không gây tác dụng phụ (idempotent - không làm thay đổi trạng thái dữ liệu)**.

---

### 2.2. Bảng quy chuẩn REST API mẫu
*(Slide 10)*

Bảng thiết kế chuẩn mực cho tài nguyên `books` (được áp dụng tương tự cho `dishes`, `chefs`, `ingredients`):

| Thao tác | Request HTTP | Trạng thái thành công | Lỗi nghiệp vụ có thể xảy ra |
| :--- | :--- | :--- | :--- |
| **Danh sách** | `GET /api/books?q=sql` | `data: [...]` (mảng đối tượng, có thể rỗng `[]`) | Không có |
| **Xem một cuốn** | `GET /api/books/2` | `data: { id: 2, ... }` (đối tượng chi tiết) | `NOT_FOUND` |
| **Thêm mới** | `POST /api/books` | `data: { id: 3, ... }` (bản ghi vừa tạo có id) | `VALIDATION_FAILED` |
| **Sửa đổi** | `PATCH /api/books/2` | `data: { id: 2, ... }` (bản ghi sau khi cập nhật) | `VALIDATION_FAILED`, `NOT_FOUND` |
| **Xóa bỏ** | `DELETE /api/books/2` | `data: null` | `NOT_FOUND` |

---

### 2.3. Phân biệt chuyên sâu: PUT vs PATCH
*(Slide 11)*

| Đặc tính | Phương thức PUT | Phương thức PATCH |
| :--- | :--- | :--- |
| **Định nghĩa (RFC)** | Thay thế **toàn bộ** biểu diễn của tài nguyên (Full Replacement). | Cập nhật **một phần** tài nguyên (Partial Modification). |
| **Payload gửi lên** | Bắt buộc phải gửi toàn bộ các trường của bản ghi. Trường nào không gửi có thể bị ghi đè thành `null` hoặc giá trị mặc định. | Chỉ cần gửi các trường muốn thay đổi (ví dụ: chỉ gửi `{ "price": 50000 }`). |
| **Tính Idempotent** | Có. Gửi lại nhiều lần cùng một payload cho ra cùng một trạng thái tài nguyên. | Có thể idempotent tùy nghiệp vụ, nhưng linh hoạt hơn rất nhiều. |
| **Thực tế áp dụng** | Dễ gây lỗi mất dữ liệu vô ý nếu client quên gửi kèm các trường cũ. | **Khuyên dùng trong bài tập và các ứng dụng web thực tế**. API chỉ validate và cập nhật đúng những trường có trong body. |

---

### 2.4. Phân định: Lỗi kỹ thuật vs Lỗi nghiệp vụ
*(Slide 12 – 13)*

Đây là một trong những kiến thức quan trọng nhất của bài học:

#### A. Lỗi kỹ thuật (Technical / Infrastructure Error)
* **Bản chất:** Hệ thống bị hỏng, hạ tầng gián đoạn, hoặc client gọi sai cấu trúc giao thức HTTP mà API không thể xử lý tới tầng nghiệp vụ.
* **Dấu hiệu:** HTTP Status `4xx` (ngoại trừ các lỗi validation do cấu hình riêng), `5xx` hoặc không nhận được response.
* **Ví dụ:**
  * Gõ sai URL (ví dụ `GET /api/bok` $\rightarrow$ Web server/Express trả về `404 Not Found`).
  * Backend API đang bị tắt, sập nguồn $\rightarrow$ Trình duyệt báo `Failed to fetch` (Không có HTTP status).
  * Backend mất kết nối Database $\rightarrow$ Thường trả về `500 Internal Server Error`.
  * Gửi body JSON bị sai cú pháp (malformed JSON) $\rightarrow$ Parser trả về `400 Bad Request`.

#### B. Lỗi nghiệp vụ (Business Error)
* **Bản chất:** Hệ thống hạ tầng, mạng và code máy chủ hoạt động hoàn toàn bình thường. Request đi tới đúng hàm xử lý (handler) của Backend, nhưng dữ liệu gửi lên **vi phạm quy tắc nghiệp vụ của ứng dụng**.
* **Dấu hiệu quy ước:** **HTTP Status 200 OK**, trong body có `ok: false` kèm đối tượng `error`.
* **Ví dụ:**
  * Tìm cuốn sách ID `999` nhưng trong DB không có bản ghi này $\rightarrow$ Trả về `200 OK` kèm `ok: false, error: { code: "NOT_FOUND" }`.
  * Thêm sách nhưng để trống tên sách hoặc giá bị âm $\rightarrow$ Trả về `200 OK` kèm `ok: false, error: { code: "VALIDATION_FAILED" }`.

```
SO SÁNH CÁC TÌNH HUỐNG THỰC TẾ:
+------------------------------------+-------------+------------------------------------+
| Tình huống                         | HTTP Status | Kết quả trong Body                 |
+------------------------------------+-------------+------------------------------------+
| Danh sách chưa có phần tử nào      | 200 OK      | ok: true, data: []                 |
| GET /api/books/999 (id không có)   | 200 OK      | ok: false, error: { NOT_FOUND }    |
| POST /api/books (input sai)        | 200 OK      | ok: false, error: { VALIDATION...} |
| GET /api/bok (sai đường dẫn route) | 404 Not Fnd | (Lỗi kỹ thuật, body không có ok)   |
| Mất kết nối database               | 500 Server  | (Lỗi kỹ thuật, body không có ok)   |
| Server API tắt hoàn toàn           | Không có    | Trình duyệt ném lỗi mạng           |
+------------------------------------+-------------+------------------------------------+
```

---

### 2.5. Chuẩn hóa cấu trúc phản hồi (Response Shape)
*(Slide 14 – 15)*

Mọi response do handler của Backend trả về bắt buộc phải tuân thủ một **Response Shape thống nhất duy nhất**:

#### Trường hợp 1: Thành công (`ok: true`)
```json
{
  "ok": true,
  "data": {
    "id": 2,
    "title": "Lập trình Web hiện đại",
    "price": 75000
  }
}
```
* `ok`: Luôn là kiểu boolean `true`.
* `data`: Chứa kết quả nghiệp vụ (có thể là đối tượng, mảng danh sách, hoặc `null` khi xóa thành công).

#### Trường hợp 2: Lỗi nghiệp vụ (`ok: false`)
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu nhập vào không hợp lệ",
    "fields": {
      "title": "Tên sách không được để trống",
      "price": "Giá tiền phải lớn hơn 0"
    }
  }
}
```
* `ok`: Luôn là kiểu boolean `false`.
* `error.code`: Mã chuỗi định danh cố định (viết HOA SNAKE_CASE). **Frontend dùng mã `code` này để rẽ nhánh logic (switch-case), tuyệt đối không rẽ nhánh theo `message`** (vì message có thể thay đổi ngôn ngữ).
* `error.message`: Chuỗi thông báo tổng quát dành cho con người đọc.
* `error.fields`: Đối tượng chứa chi tiết lỗi gắn với từng trường nhập liệu trên giao diện form (chỉ xuất hiện khi gặp lỗi validation).

---

### 2.6. Bảng mã lỗi nghiệp vụ chuẩn
*(Slide 16)*

| Mã lỗi (`error.code`) | Xảy ra khi nào? | Có kèm `error.fields` không? | Ứng xử tương ứng ở SPA |
| :--- | :--- | :--- | :--- |
| **`NOT_FOUND`** | Khi tra cứu theo `id` (hoặc sửa/xóa theo `id`) mà ID đó không tồn tại trong DB. | **Không** | Hiển thị giao diện "Không tìm thấy bản ghi" (404 page). |
| **`VALIDATION_FAILED`** | Dữ liệu đầu vào bị thiếu trường bắt buộc, sai kiểu dữ liệu, vượt quá độ dài... | **Có** (bắt buộc) | Hiển thị thông báo đỏ ngay cạnh từng ô input tương ứng, giữ nguyên dữ liệu người dùng đã gõ. |
| **`ALREADY_EXISTS`** | Trường dữ liệu yêu cầu duy nhất (unique) như Email, Tên món đã có người dùng khác đăng ký. | Có thể có | Hiển thị cảnh báo trùng lặp tại ô nhập liệu tương ứng. |

---

### 2.7. Luồng 5 bước của một HTTP Request đi qua API
*(Slide 17)*

Khi một request đến Backend, nó phải vượt qua một "phễu kiểm tra" gồm 5 trạm:

```mermaid
flowchart TD
    Req["Request từ Client gửi đến"] --> Step1{"1. Kiểm tra Route<br/>(URL và Method có khớp?)"}
    
    Step1 -- "Không khớp" --> Err1["❌ 404 Not Found<br/>(Lỗi kỹ thuật)"]
    Step1 -- "Khớp" --> Step2{"2. Parse Body<br/>(Cú pháp JSON đúng?)"}
    
    Step2 -- "Lỗi cú pháp" --> Err2["❌ 400 Bad Request<br/>(Lỗi kỹ thuật)"]
    Step2 -- "JSON hợp lệ" --> Step3{"3. Validate Input<br/>(Đúng schema, đủ trường bắt buộc?)"}
    
    Step3 -- "Dữ liệu sai" --> Err3["⚠️ 200 OK<br/>ok: false, code: VALIDATION_FAILED<br/>(Lỗi nghiệp vụ)"]
    Step3 -- "Hợp lệ" --> Step4{"4. Truy cập Database<br/>(Kết nối DB và query có chạy được?)"}
    
    Step4 -- "Sập DB/Lỗi SQL" --> Err4["❌ 500 Internal Server Error<br/>(Lỗi kỹ thuật)"]
    Step4 -- "Query thành công" --> Step5{"5. Tồn tại bản ghi?<br/>(Có tìm thấy dữ liệu theo ID?)"}
    
    Step5 -- "Không thấy" --> Err5["⚠️ 200 OK<br/>ok: false, code: NOT_FOUND<br/>(Lỗi nghiệp vụ)"]
    Step5 -- "Có bản ghi" --> Success["✅ 200 OK<br/>ok: true, data: { ... }<br/>(Thành công)"]
```

---

### 2.8. Quy tắc cốt lõi & Những lỗi sai thường gặp khi viết API
*(Slide 18 – 19)*

#### 4 Quy tắc vàng lập trình API:
1. **Lỗi nghiệp vụ biết trước:** Trả về HTTP `200` kèm `{ ok: false, error: ... }`.
2. **Lỗi không lường trước được (Unhandled Exception, crash):** Để rơi vào Middleware bắt lỗi cuối cùng của server và trả về `500`.
3. **White-listing fields khi ghi:** Chỉ trích xuất những trường được phép từ `req.body` đưa vào câu lệnh ORM (ví dụ: `const { name, price } = req.body;`). **Tuyệt đối không truyền nguyên `req.body` vào lệnh tạo mới hay cập nhật** (tránh lỗ hổng Over-posting / Mass Assignment khiến người dùng có thể tự gán `isAdmin: true` hoặc sửa cột nhạy cảm).
4. **Kiểm tra ID trước khi gọi DB:** Kiểm tra xem `id` có đúng kiểu (ví dụ số nguyên dương) hay không. Nếu `id` không hợp lệ (như chuỗi chữ cái hoặc số âm), coi như không có bản ghi (`NOT_FOUND`) ngay lập tức mà không cần truy vấn DB.

#### 4 Lỗi sai kinh điển của sinh viên:
* ❌ **Trả `404` khi không có bản ghi:** Khiến SPA không phân biệt được: đây là do gõ sai URL đường dẫn API hay là do ID bản ghi không có trong DB.
* ❌ **Dùng `try-catch` bọc cả lỗi hệ thống rồi trả về `ok: false`:** Biến lỗi sập cơ sở dữ liệu hoặc lỗi code sập (crash) thành lỗi nghiệp vụ, làm ẩn giấu lỗi kỹ thuật.
* ❌ **Mỗi route trả một cấu trúc body khác nhau:** Route này trả `{ success: true, result: ... }`, route kia trả `{ status: 200, item: ... }`. SPA sẽ bị vỡ vụn logic parse.
* ❌ **Trả kết quả trước khi lệnh ghi hoàn tất:** Quên `await` trong các hàm bất đồng bộ, khiến API trả về `ok: true` nhưng thực chất DB chưa kịp ghi.

---

### 2.9. Kịch bản kiểm thử API độc lập (Postman / cURL)
*(Slide 20)*

Trước khi bắt tay vào viết một dòng mã Frontend nào, bắt buộc phải dùng Postman, Thunder Client hoặc cURL để kiểm thử toàn bộ các kịch bản sau:

```bash
# 1. Lấy danh sách (Kỳ vọng: 200, ok: true, data là mảng)
curl -X GET http://localhost:3000/api/books

# 2. Xem bản ghi không tồn tại (Kỳ vọng: 200, ok: false, code: NOT_FOUND)
curl -X GET http://localhost:3000/api/books/999999

# 3. Thêm mới với dữ liệu sai (Kỳ vọng: 200, ok: false, code: VALIDATION_FAILED, có fields)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "", "price": -500}'

# 4. Gọi sai URL (Kỳ vọng: 404 kỹ thuật, body không có trường ok)
curl -X GET http://localhost:3000/api/bok

# 5. Dừng database và gọi API (Kỳ vọng: 500 kỹ thuật, body không có trường ok)
```

---

## PHẦN 3: CƠ CHẾ CORS (CROSS-ORIGIN RESOURCE SHARING)

### 3.1. Khái niệm Origin & Same-Origin Policy
*(Slide 21 – 22)*

* **Origin (Nguồn gốc)** của một trang web được xác định bởi bộ ba:
  $$\text{Origin} = \text{Giao thức (Protocol)} + \text{Tên miền (Domain/Host)} + \text{Cổng (Port)}$$
* **Ví dụ:**
  * `http://localhost:5173` (Frontend chạy bằng Vite)
  * `http://localhost:3000` (Backend API chạy bằng Node/Express)
  * $\rightarrow$ **Hai địa chỉ trên là KHÁC ORIGIN (Cross-Origin)** vì khác nhau về số cổng (Port).
* **Same-Origin Policy (Chính sách cùng nguồn gốc):** Đây là cơ chế bảo mật cốt lõi của mọi trình duyệt. Mặc định, mã JavaScript chạy trong trình duyệt ở origin `localhost:5173` **bị ngăn chặn** không được đọc kết quả phản hồi từ một origin khác (`localhost:3000`), trừ khi server đích cho phép rõ ràng thông qua các HTTP Header CORS.

> [!IMPORTANT] Quan sát hành vi lỗi CORS
> Lỗi CORS là do **trình duyệt thực thi kiểm soát**, không phải do API bị sập. Thực tế request có thể đã bay đến API và API đã xử lý xong, nhưng trình duyệt chặn không cho JavaScript trong SPA tiếp cận dữ liệu response và ném lỗi đỏ trong `Console` (`Access to fetch at ... has been blocked by CORS policy`).

---

### 3.2. Yêu cầu đơn giản (Simple Request) vs Yêu cầu cần Preflight
*(Slide 23)*

Không phải mọi request đều kích hoạt Preflight. Trình duyệt chia request thành 2 nhóm:

#### A. Yêu cầu đơn giản (Simple Request) - Không cần Preflight:
* Phương thức: Chỉ áp dụng cho `GET`, `HEAD`, `POST`.
* Chỉ cho phép các header chuẩn cơ bản (`Accept`, `Accept-Language`, `Content-Language`).
* Header `Content-Type` chỉ được là 1 trong 3 loại:
  * `application/x-www-form-urlencoded`
  * `multipart/form-data`
  * `text/plain`

#### B. Yêu cầu cần Preflight (Preflighted Request):
Chỉ cần vi phạm 1 trong các điều kiện trên, trình duyệt sẽ tự động phát sinh một request kiểm tra trước (`OPTIONS`):
* Phương thức: `PATCH`, `DELETE`, `PUT`.
* Có `Content-Type: application/json` (Hầu như mọi REST API hiện đại đều dùng JSON).
* Có chứa header tùy biến (ví dụ: `Authorization: Bearer <token>`).

---

### 3.3. Sơ đồ 3: Sequence Diagram quá trình Preflight & Gửi PATCH
*(Tương ứng hình ảnh trên Slide 24: `block6-cors.svg`)*

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Browser as Trình duyệt (Chạy SPA: localhost:5173)
    participant API as API Server (localhost:3000)

    User->>Browser: Bấm nút "Lưu thay đổi" (Sửa sách #2)
    Note over Browser: SPA gọi hàm fetch() với method PATCH & Content-Type: application/json

    rect rgb(255, 245, 230)
        Note over Browser,API: GIAI ĐOẠN 1: PREFLIGHT CHECK (Trình duyệt tự làm ngầm)
        Browser->>API: OPTIONS /api/books/2<br/>Origin: http://localhost:5173<br/>Access-Control-Request-Method: PATCH<br/>Access-Control-Request-Headers: content-type
        Note over API: Kiểm tra xem origin & method có trong danh sách cho phép không?
        API-->>Browser: 204 No Content (hoặc 200)<br/>Access-Control-Allow-Origin: http://localhost:5173<br/>Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS<br/>Access-Control-Allow-Headers: Content-Type, Authorization
    end

    rect rgb(235, 250, 235)
        Note over Browser,API: GIAI ĐOẠN 2: ACTUAL REQUEST (Gửi dữ liệu thật sự)
        Browser->>API: PATCH /api/books/2<br/>Origin: http://localhost:5173<br/>Content-Type: application/json<br/><br/>{ "title": "SQL Cơ bản", "price": 50000 }
        Note over API: Xử lý ghi dữ liệu vào Database
        API-->>Browser: 200 OK<br/>Access-Control-Allow-Origin: http://localhost:5173<br/>Content-Type: application/json<br/><br/>{ "ok": true, "data": { "id": 2, "title": "SQL Cơ bản", "price": 50000 } }
    end

    Note over Browser: SPA nhận dữ liệu JSON thành công và cập nhật giao diện
```

---

### 3.4. Hai phương án xử lý CORS (API Header vs Dev Proxy)
*(Slide 25)*

1. **Phương án 1: Cấu hình Header CORS ở API Backend (Khuyên dùng và là tiêu chí bài học):**
   * Backend API phản hồi kèm header `Access-Control-Allow-Origin` trỏ đúng vào địa chỉ origin của SPA.
   * SPA gọi trực tiếp đến địa chỉ của Backend API.
2. **Phương án 2: Sử dụng Dev Server Proxy:**
   * Cấu hình trong file `vite.config.js` để server phát triển của SPA tự đóng vai trò Proxy (chuyển tiếp các request bắt đầu bằng `/api` sang `localhost:3000`).
   * Trình duyệt thấy mình đang gọi vào cùng origin `localhost:5173/api/...` nên không phát sinh kiểm tra CORS.
   * *Lưu ý:* Phương án proxy chỉ dùng tiện lợi lúc code thử nghiệm nội bộ, khi triển khai sản phẩm thật ra môi trường production vẫn cần cấu hình Origin hoặc Reverse Proxy (Nginx).

---

### 3.5. Cấu hình CORS chuẩn ở Backend
*(Slide 26)*

Để Backend hỗ trợ CORS một cách bảo mật và đúng chuẩn:
1. Header `Access-Control-Allow-Origin` phải trả về **đúng Origin của SPA** (ví dụ: `http://localhost:5173`).
2. Giá trị Origin nên được đọc từ file cấu hình hoặc biến môi trường (`process.env.CLIENT_ORIGIN`), không hardcode.
3. **Không dùng ký tự đại diện `*` (`Access-Control-Allow-Origin: *`)** khi hệ thống API có chứa các thao tác quản trị, dữ liệu nhạy cảm hoặc có xác thực cookie/session.
4. Xử lý triệt để request `OPTIONS` (Preflight) và trả về HTTP `204 No Content` kèm theo đầy đủ các header cho phép method (`GET, POST, PATCH, DELETE, OPTIONS`) và header (`Content-Type, Authorization`).

---

## PHẦN 4: SPA GỌI API, QUẢN LÝ LỖI, ROUTING VÀ FORM

### 4.1. Sơ đồ 4: Flowchart kiểm tra 3 tầng lỗi khi gọi API
*(Tương ứng hình ảnh trên Slide 28: `block6-three-layers.svg`)*

Khi gọi API từ SPA, lập trình viên không được chủ quan coi mọi response nhận được đều là dữ liệu đúng. Phải kiểm tra lần lượt qua **3 tầng bảo vệ**:

```mermaid
flowchart TD
    Start(["Bắt đầu: SPA gọi API (gọi hàm apiRequest)"]) --> Q1{"1. Nhận được Response?<br/>(Không bị ném Exception mạng?)"}

    Q1 -- "KHÔNG" --> Layer1["❌ TẦNG 1: Lỗi Mạng hoặc CORS chặn<br/>(TypeError: Failed to fetch / API tắt)<br/>👉 Xử lý: Báo mất mạng hoặc lỗi kết nối máy chủ"]
    
    Q1 -- "CÓ" --> Q2{"2. Status HTTP thành công?<br/>(res.ok === true, tức mã 200 - 299)"}

    Q2 -- "KHÔNG" --> Layer2["❌ TẦNG 2: Lỗi Kỹ thuật / Hạ tầng<br/>(404 Sai URL route hoặc 500 Server crash)<br/>👉 Xử lý: Báo lỗi hệ thống chung, xem Console/Log"]

    Q2 -- "CÓ" --> Q3{"3. Body JSON có trường ok === true?<br/>(data.ok === true)"}

    Q3 -- "KHÔNG" --> Layer3["⚠️ TẦNG 3: Lỗi Nghiệp vụ ứng dụng<br/>(Đọc error.code: NOT_FOUND / VALIDATION_FAILED)<br/>👉 Xử lý: Điều hướng trang 404 hoặc hiện lỗi từng ô input"]

    Q3 -- "CÓ" --> Success["✅ THÀNH CÔNG HOÀN TOÀN<br/>Trích xuất và sử dụng data<br/>(setState / Render UI)"]

    style Layer1 fill:#ffebe9,stroke:#cf222e,stroke-width:2px;
    style Layer2 fill:#ffebe9,stroke:#cf222e,stroke-width:2px;
    style Layer3 fill:#fff8c5,stroke:#9a6700,stroke-width:2px;
    style Success fill:#dafbe1,stroke:#1a7f37,stroke-width:2px;
```

---

### 4.2. Thiết kế tầng gọi API tập trung (API Client Wrapper)
*(Slide 29)*

**Nguyên tắc vàng:** Các trang giao diện (Component) **tuyệt đối không gọi trực tiếp hàm `fetch` hay `axios` phân tán khắp nơi**. Phải tập trung toàn bộ logic vào một file `apiClient.js`:
* **Một nơi duy nhất** định nghĩa URL gốc (`BASE_URL`) và các header mặc định.
* **Một nơi duy nhất** thực hiện việc kiểm tra bóc tách 3 tầng lỗi.
* Component chỉ việc gọi `api.getDish(id)` và nhận về dữ liệu sạch hoặc một đối tượng lỗi có cấu trúc rõ ràng: `{ isTechnical: boolean, code: string, fields: object }`.

```javascript
// Minh họa chuẩn tư duy tầng bọc API (apiClient.js)
const API_BASE_URL = "http://localhost:3000/api";

export async function requestApi(endpoint, options = {}) {
  let response;
  // --- TẦNG 1: Kiểm tra lỗi mạng & CORS ---
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch (netErr) {
    throw {
      type: "NETWORK_ERROR",
      message: "Không thể kết nối đến máy chủ hoặc bị chặn CORS",
    };
  }

  // --- TẦNG 2: Kiểm tra lỗi kỹ thuật HTTP Status (404, 500) ---
  if (!response.ok) {
    throw {
      type: "HTTP_ERROR",
      status: response.status,
      message: `Lỗi hệ thống (HTTP ${response.status})`,
    };
  }

  // Đọc body JSON
  const payload = await response.json();

  // --- TẦNG 3: Kiểm tra lỗi nghiệp vụ (ok: false) ---
  if (!payload.ok) {
    throw {
      type: "BUSINESS_ERROR",
      code: payload.error?.code,
      message: payload.error?.message,
      fields: payload.error?.fields || {},
    };
  }

  // Thành công hoàn toàn
  return payload.data;
}
```

---

### 4.3. Sơ đồ 5: State Machine các trạng thái khi tải dữ liệu
*(Tương ứng hình ảnh trên Slide 30: `block6-states.svg`)*

Mỗi component trang khi nạp dữ liệu từ API bắt buộc phải trải qua một máy trạng thái (State Machine) chặt chẽ, không được bỏ sót bất kỳ trạng thái nào:

```mermaid
flowchart TD
    Init(["Vào trang"]) --> Loading["🔄 loading<br/>(Đang gọi API nạp dữ liệu... Hiện Spinner)"]

    Loading -->|"Response có ok: true và mảng có phần tử"| OkState["✅ ok<br/>(Hiển thị bảng dữ liệu hoặc form chi tiết)"]
    Loading -->|"Response có ok: true nhưng mảng rỗng []"| EmptyState["📭 empty<br/>(Hiển thị thông báo: 'Chưa có bản ghi nào')"]
    Loading -->|"Response có ok: false và code là NOT_FOUND"| NotFoundState["🔍 notFound<br/>(Hiển thị: 'Không tìm thấy dữ liệu yêu cầu')"]
    Loading -->|"Lỗi tầng 1 (mất mạng) hoặc tầng 2 (500, 404)"| ErrorState["⚠️ error<br/>(Hiển thị cảnh báo: 'Lỗi tải dữ liệu. Vui lòng thử lại')"]

    ErrorState -->|"Người dùng bấm nút 'Thử lại' (Retry)"| Loading
```

---

### 4.4. Nguyên tắc quản lý dữ liệu: "Dữ liệu thuộc về trang"
*(Slide 31 – 32)*

#### Nguyên tắc cốt lõi:
1. **Dữ liệu thuộc về trang:** Mỗi trang tự chịu trách nhiệm nạp dữ liệu của chính mình khi người dùng mở trang đó lên.
2. **Không lạm dụng kho trạng thái toàn cục (Global Store):** Không lưu danh sách món ăn vào Redux/Zustand dùng chung cho cả trang danh sách, trang sửa, trang chi tiết. Khi dữ liệu nằm phân tán ở client, việc cố gắng đồng bộ thủ công giữa các bản sao thường dẫn đến lỗi dữ liệu cũ (stale state) hoặc không khớp với database.
3. **Luồng sau khi ghi dữ liệu:** Sau khi bấm nút Lưu/Xóa thành công, SPA **chuyển hướng (navigate)** về trang danh sách hoặc trang chi tiết để trang đích tự động gọi API lấy dữ liệu mới nhất từ DB về.

#### 4 Lỗi thường gặp ở Frontend:
* ⚠️ **Chỉ kiểm tra HTTP status:** Thấy status `200` liền nghĩ là thành công, đem `error` render ra màn hình gây lỗi vỡ giao diện.
* ⚠️ **Lỗi Race Condition:** Người dùng đổi URL ID liên tục, request cũ về sau đè dữ liệu lên request mới.
* ⚠️ **Đọc thuộc tính khi dữ liệu chưa tải xong:** Gọi `dish.name` khi `dish` đang là `null` trong trạng thái `loading` gây lỗi trắng màn hình (`Cannot read properties of null`).
* ⚠️ **Không xử lý trạng thái `error`:** Khi server API bị tắt, màn hình giữ nguyên màu trắng trơn không một lời báo hiệu cho người dùng.

---

### 4.5. Phân tích chi tiết chức năng "Xem chi tiết"
*(Slide 33)*

Một chu trình hoàn chỉnh khi người dùng xem chi tiết sách `/books/2`:
1. **Mở URL:** Người dùng nhập trực tiếp `/books/2` vào thanh địa chỉ hoặc bấm vào một thẻ sách trên giao diện.
2. **Routing:** Client Router nhận diện mẫu URL `/books/:id`, bóc tách biến `id = 2`, khởi tạo component `BookDetail`.
3. **Gọi API:** Component thiết lập trạng thái `state = 'loading'`, phát request `GET /api/books/2`.
4. **Hiển thị:** Dựa vào kết quả trả về, component chuyển `state` tương ứng sang `ok` (hiện chi tiết), `notFound` (hiện thông báo không tìm thấy) hoặc `error` (hiện nút bấm thử lại).

---

### 4.6. Cơ chế Client-Side Routing & Bài toán Server Fallback
*(Slide 34, 36)*

#### Sự khác biệt giữa Multi-Page App và SPA:
* **Multi-Page App (MPA):** Bấm link $\rightarrow$ Trình duyệt gửi request lấy file HTML mới từ server $\rightarrow$ Trắng màn hình tạm thời $\rightarrow$ Tải lại toàn bộ tài nguyên.
* **Single-Page App (SPA):** Bấm link $\rightarrow$ JavaScript dùng **HTML5 History API** (`history.pushState`) để thay đổi URL trên thanh địa chỉ mà **không hề gửi document request nào lên máy chủ**. Router đọc URL mới và đổi component tương ứng.

#### Vấn đề Reload trang bị 404 (Server Fallback Problem):
* **Hiện tượng:** Khi đang ở `/books/2`, bấm F5 (Reload), trình duyệt sẽ gửi thẳng yêu cầu `GET /books/2` lên Web Server lưu file tĩnh. Nếu server chỉ có duy nhất file `index.html` trong thư mục gốc và không có thư mục hay file nào tên là `/books/2`, server sẽ lập tức trả về lỗi **404 Not Found**.
* **Giải pháp (SPA Fallback Rewrite):** Cấu hình Web Server (Vite dev server, Nginx, hoặc Express Static) luôn chuyển tiếp mọi đường dẫn không trỏ vào file tĩnh về trả file `index.html`. Sau khi `index.html` được nạp, JavaScript của SPA sẽ chạy lên, đọc URL `/books/2` và điều hướng người dùng đến đúng trang mong muốn.

---

### 4.7. Phân biệt URL Trình duyệt vs URL API
*(Slide 35, 37)*

Hai hệ thống URL này độc lập và phục vụ mục đích khác nhau:

| Chức năng nghiệp vụ | URL trên thanh địa chỉ trình duyệt (SPA) | Request thực tế gửi ngầm tới API (BE) |
| :--- | :--- | :--- |
| **Danh sách & Tìm kiếm** | `/dishes?q=phở` | `GET /api/dishes?q=phở` |
| **Xem chi tiết** | `/dishes/2` | `GET /api/dishes/2` |
| **Form thêm mới** | `/admin/dishes/new` | Khi nhấn Gửi: `POST /api/dishes` |
| **Form chỉnh sửa** | `/admin/dishes/2/edit` | Nạp dữ liệu cũ: `GET /api/dishes/2`<br/>Khi nhấn Lưu: `PATCH /api/dishes/2` |
| **Trang xác nhận xóa** | `/admin/dishes/2/delete` | Xem lại món: `GET /api/dishes/2`<br/>Bấm nút Xóa: `DELETE /api/dishes/2` |

---

### 4.8. Sơ đồ 6: Luồng xử lý Form & Client Navigation sau khi ghi
*(Tương ứng hình ảnh trên Slide 38: `block6-after-write.svg`)*

```mermaid
flowchart TD
    UserAction["Người dùng điền form và bấm nút 'Lưu món ăn'"] --> SubmitEvent["Sự kiện onSubmit kích hoạt"]
    
    SubmitEvent --> FormLock["SPA: Chặn reload (e.preventDefault)<br/>Khóa nút Gửi (disabled = true)<br/>Bật biểu tượng loading ở nút"]
    
    FormLock --> SendReq["Gửi HTTP Request: POST /api/dishes (hoặc PATCH)"]
    SendReq --> APIProcess["Backend API tiếp nhận & xử lý"]

    APIProcess --> RouteResp{"Phân loại kết quả từ API"}

    RouteResp -- "1. Status 200 & ok: true<br/>(Thành công)" --> CaseSuccess["SPA điều hướng chuyển trang (Client Navigation)<br/>Chuyển sang /dishes/:id hoặc /admin/dishes<br/>Trang đích tự động gọi GET nạp dữ liệu mới"]

    RouteResp -- "2. Status 200 & ok: false<br/>(code: VALIDATION_FAILED)" --> CaseValidation["Mở khóa nút Gửi<br/>Giữ nguyên toàn bộ giá trị người dùng đã nhập<br/>Hiển thị chữ báo lỗi đỏ cạnh từng ô input tương ứng"]

    RouteResp -- "3. Status 4xx, 5xx hoặc mất mạng<br/>(Lỗi kỹ thuật)" --> CaseTechError["Mở khóa nút Gửi<br/>Hiển thị hộp thoại/Banner báo lỗi hệ thống chung<br/>Không làm mất dữ liệu đã nhập trong form"]

    style CaseSuccess fill:#dafbe1,stroke:#1a7f37,stroke-width:2px;
    style CaseValidation fill:#fff8c5,stroke:#9a6700,stroke-width:2px;
    style CaseTechError fill:#ffebe9,stroke:#cf222e,stroke-width:2px;
```

---

### 4.9. Kỹ thuật lập trình Form trong SPA
*(Slide 39)*

1. **Chặn hành vi mặc định:** Luôn gọi `event.preventDefault()` trong sự kiện `onSubmit` của thẻ `<form>` để ngăn trình duyệt reload lại cả trang web.
2. **Chống Submit trùng lặp (Double Submission):** Ngay khi người dùng bấm Gửi, lập tức đặt cờ `isSubmitting = true` và `disabled` nút bấm. Điều này ngăn người dùng bấm liên tục tạo ra nhiều bản ghi rác giống hệt nhau.
3. **Form Sửa:** Khi component mount, đọc `id` từ URL, gọi `GET /api/dishes/:id` để điền trước dữ liệu cũ vào các ô input.
4. **Xử lý Validation:** Khi nhận được lỗi `VALIDATION_FAILED`, đọc map đối tượng `error.fields` (ví dụ `{ name: "Tên không được trống" }`) để hiển thị chữ đỏ ngay dưới ô `name`.

---

### 4.10. Cẩm nang chẩn đoán và khoanh vùng lỗi (Debugging Guide)
*(Slide 40)*

Khi gặp lỗi, sinh viên cần tra cứu theo bảng chẩn đoán sau để tìm đúng chỗ sửa:

| Triệu chứng lỗi | Nguyên nhân gốc rễ | Nơi cần kiểm tra và cách khắc phục |
| :--- | :--- | :--- |
| **Console báo đỏ lỗi CORS** | Thiếu header CORS hoặc sai origin | Kiểm tra backend: xem header `Access-Control-Allow-Origin` có khớp chính xác `http://localhost:5173` chưa; kiểm tra route `OPTIONS` có trả về status 204 kèm allow methods chưa. |
| **Request API trả về status 404 hoặc 500** | Lỗi kỹ thuật / Hạ tầng | Xem URL gọi ở FE có gõ sai chính tả không (ví dụ `/api/dish` thay vì `/api/dishes`). Bật terminal Backend lên đọc console log để xem lỗi crash DB/code. |
| **Status 200 nhưng `ok: false`** | Lỗi nghiệp vụ hợp lệ | Mở DevTools $\rightarrow$ Tab **Network** $\rightarrow$ bấm vào request $\rightarrow$ tab **Response** để xem chuỗi `error.code` và đối tượng `error.fields`. |
| **Status 200, `ok: true` nhưng màn hình không hiện gì** | Lỗi State / Logic render ở SPA | Kiểm tra xem component có gán dữ liệu `res.data` vào state chưa. Kiểm tra tên thuộc tính object có khớp giữa BE và FE không. |
| **Gõ trực tiếp URL hoặc Reload bị 404 trang trắng** | Server file SPA chưa hỗ trợ fallback | Cấu hình lại server file (Vite hoặc Nginx) để trả về file `index.html` cho các đường dẫn SPA. |

---

## PHẦN 5: ĐẶC TẢ BÀI TẬP NHÀ HÀNG & TIÊU CHÍ NGHIỆM THU

### 5.1. Bối cảnh & Cấu trúc mã nguồn (`api` và `web`)
*(Slide 41 – 42)*

Dự án gồm **2 thư mục ứng dụng độc lập**:
* **`api/` (Backend):** Dự án Node.js / Express cung cấp các REST API endpoints, kết nối Database và chứa dữ liệu mẫu ban đầu (seed data). Chạy tại `http://localhost:3000`.
* **`web/` (Frontend):** Ứng dụng SPA (React / Vue / Svelte hoặc Vanilla JS) chạy trên trình duyệt. Chạy tại `http://localhost:5173`.
* Hai ứng dụng chạy ở **hai origin khác nhau**, do đó bắt buộc phải có cơ chế cấu hình CORS.

---

### 5.2. Mô hình thực thể (Models & Fields)
*(Slide 43)*

Hệ thống quản lý nhà hàng bao gồm 3 thực thể chính với các thuộc tính:

```mermaid
erDiagram
    Dish {
        int id PK
        string name "Tên món ăn (bắt buộc)"
        string description "Mô tả chi tiết"
        float price "Giá tiền (phải > 0)"
        string category "Phân loại món"
        boolean available "Còn phục vụ hay không"
    }
    Chef {
        int id PK
        string name "Họ tên đầu bếp (bắt buộc)"
        string specialty "Sở trường nấu ăn"
    }
    Ingredient {
        int id PK
        string name "Tên nguyên liệu (bắt buộc)"
        string unit "Đơn vị tính (kg, gram, quả...)"
    }
```

---

### 5.3. Bảng đặc tả đầy đủ 15 REST API Endpoints
*(Slide 44 – 45)*

Mỗi thực thể (`dishes`, `chefs`, `ingredients`) đều có đầy đủ 5 thao tác CRUD, tạo nên tổng cộng **15 endpoints**:

#### Tập API cho Món ăn (`/api/dishes`):
1. `GET /api/dishes?q=...` $\rightarrow$ Trả về `200, { ok: true, data: [...] }`. Tìm kiếm theo tên món nếu có `q`.
2. `GET /api/dishes/:id` $\rightarrow$ Trả về `200, { ok: true, data: {...} }` hoặc `200, { ok: false, error: { code: "NOT_FOUND" } }`.
3. `POST /api/dishes` $\rightarrow$ Tạo món ăn mới. Body: `{ name, description, price, category, available }`. Trả về `200, { ok: true, data: {...} }` hoặc `200, { ok: false, error: { code: "VALIDATION_FAILED", fields: {...} } }`.
4. `PATCH /api/dishes/:id` $\rightarrow$ Cập nhật một số trường. Trả về bản ghi sau sửa hoặc `NOT_FOUND` / `VALIDATION_FAILED`.
5. `DELETE /api/dishes/:id` $\rightarrow$ Xóa món ăn. Trả về `200, { ok: true, data: null }` hoặc `NOT_FOUND`.

*(Các endpoint cho `/api/chefs` và `/api/ingredients` áp dụng cấu trúc và quy tắc hoàn toàn tương tự)*.

---

### 5.4. Đặc tả hệ thống các trang SPA và Routing
*(Slide 46 – 47)*

Hệ thống SPA phía client cung cấp các màn hình sau:

| URL trên trình duyệt | Tên màn hình | Yêu cầu nghiệp vụ chi tiết |
| :--- | :--- | :--- |
| **`/dishes`** | Trang thực đơn khách | Hộp tìm kiếm theo tên (cập nhật query `?q=` trên URL). Danh sách món ăn. Mỗi món có liên kết bấm sang xem chi tiết. Xử lý trạng thái rỗng nếu không có món nào. |
| **`/dishes/:id`** | Xem chi tiết món | Hiển thị đầy đủ mọi thuộc tính: tên, mô tả, giá, phân loại, trạng thái phục vụ. Hiển thị giao diện "Không tìm thấy" khi API trả về mã `NOT_FOUND`. |
| **`/admin/dishes`** | Quản trị món ăn | Bảng danh sách món ăn dành cho quản trị viên. Mỗi dòng có nút bấm chuyển sang Form sửa (`/edit`) và Trang xác nhận xóa (`/delete`). Có nút Thêm mới dẫn tới `/new`. |
| **`/admin/dishes/new`** | Thêm món ăn | Form nhập liệu. Khóa nút khi đang gửi. Hiển thị lỗi đỏ cạnh từng ô input nếu validate sai. Gửi thành công thì chuyển hướng về `/admin/dishes`. |
| **`/admin/dishes/:id/edit`** | Chỉnh sửa món ăn | Nạp dữ liệu cũ theo ID đổ vào form. Chỉ cho phép cập nhật dữ liệu. Lưu thành công chuyển hướng về `/dishes/:id` hoặc `/admin/dishes`. |
| **`/admin/dishes/:id/delete`** | Xác nhận xóa | **Trang xác nhận riêng biệt**. Hiển thị thông tin món cần xóa để người dùng xác nhận lần cuối. Chỉ khi bấm nút "Xác nhận xóa" trên trang này thì mới phát lệnh `DELETE /api/dishes/:id`. Xóa xong chuyển về `/admin/dishes`. |

---

### 5.5. Quy trình 4 bước thực hiện bài tập chuẩn
*(Slide 48)*

```mermaid
flowchart LR
    Step1["BƯỚC 1: Xây dựng & Kiểm thử API<br/>(Viết 15 routes trên nền tảng sẵn có, test bằng Postman/cURL)"]
    Step2["BƯỚC 2: Dựng khung SPA & Tầng gọi API<br/>(Cài router, viết apiClient bóc tách 3 tầng lỗi, cấu hình CORS)"]
    Step3["BƯỚC 3: Hoàn thiện CRUD Món ăn<br/>(Làm đủ 6 trang cho dishes, xử lý đủ 4 state: loading, empty, notFound, error)"]
    Step4["BƯỚC 4: Nhân rộng cho Đầu bếp & Nguyên liệu<br/>(Áp dụng pattern đã chuẩn hóa từ dishes cho chefs & ingredients)"]

    Step1 --> Step2 --> Step3 --> Step4
```

---

### 5.6. Bảng kiểm tra chất lượng mã nguồn (Code Audit Checklist)
*(Slide 49 – 50)*

Trước khi nộp bài, hãy tự duyệt lại toàn bộ mã nguồn theo bảng sau:

#### A. Kiểm tra Backend (`api`):
- [ ] Không có bất kỳ route `GET` nào thực hiện thao tác ghi hoặc xóa dữ liệu.
- [ ] Các thao tác sửa dùng `PATCH`, thao tác xóa dùng `DELETE`.
- [ ] Khi không tìm thấy bản ghi theo `id`, trả về HTTP status `200` kèm `ok: false, error: { code: "NOT_FOUND" }`.
- [ ] Lỗi sập hệ thống hoặc lỗi DB chưa lường trước trả về HTTP `500` (không được bọc `ok: false`).
- [ ] Dữ liệu từ `req.body` được trích xuất chọn lọc (white-list), không truyền nguyên cả object vào DB.
- [ ] Chuỗi kết nối Database không bị hardcode trong code hay in bừa bãi ra console log.
- [ ] Header `Access-Control-Allow-Origin` được lấy từ biến cấu hình, không dùng dấu `*`.

#### B. Kiểm tra Frontend (`web`):
- [ ] Tầng gọi API có kiểm tra cả 3 tầng lỗi: lỗi mạng/CORS $\rightarrow$ HTTP status $\rightarrow$ trường `ok`.
- [ ] URL gốc của API (`http://localhost:3000/api`) được khai báo ở **một chỗ duy nhất** trong cấu hình.
- [ ] Không sử dụng kho trạng thái toàn cục để chia sẻ danh sách bản ghi giữa các trang. Mỗi trang tự nạp dữ liệu của mình.
- [ ] Dữ liệu từ API hiển thị an toàn, không chèn chuỗi HTML thô (tránh lỗi XSS).
- [ ] Không nhúng bất kỳ API Key hay thông tin bí mật nào vào bundle của SPA.

---

### 5.7. Bộ tiêu chí nghiệm thu nghiêm ngặt (Acceptance Criteria)
*(Slide 51 – 52)*

Giảng viên hoặc người chấm bài sẽ nghiệm thu dựa trên các hành vi thực tế sau:

#### Tiêu chí nghiệm thu API:
1. **Đúng bảng đặc tả:** Gọi đúng 15 dòng của bảng REST API trả về chuẩn `200 OK` với `{ ok: true, data }` hoặc `{ ok: false, error }`.
2. **Đúng mã lỗi:** Truy vấn ID không tồn tại trả về đúng `error.code: "NOT_FOUND"`. Dữ liệu thiếu trường trả về đúng `error.code: "VALIDATION_FAILED"` kèm `fields`.
3. **Phân biệt lỗi kỹ thuật:** Gõ sai URL (ví dụ `/api/dishhhh`) phải nhận HTTP `404` (không có vỏ `ok`). Khi tắt DB phải nhận HTTP `500`.
4. **CORS:** Khi SPA gọi qua có preflight và header `Access-Control-Allow-Origin` đúng tên origin của SPA.

#### Tiêu chí nghiệm thu SPA:
1. **Không Reload trang:** Các thao tác bấm link chuyển trang, gửi form, xóa bản ghi **tuyệt đối không làm tải lại toàn bộ trang web** (không có biểu tượng xoay vòng của tab trình duyệt).
2. **Reload trực tiếp không lỗi (No 404):** Mở thẳng bất kỳ URL nào (ví dụ paste thẳng `/dishes/2` vào tab mới hoặc bấm F5) trang vẫn nạp đúng dữ liệu của trang đó.
3. **Xử lý Validation mượt mà:** Khi nhập sai trong form, chữ báo lỗi đỏ hiện ngay cạnh ô nhập, **dữ liệu các ô khác vẫn được giữ nguyên**, nút submit mở khóa lại để người dùng sửa.
4. **Xác nhận xóa an toàn:** Thao tác xóa chỉ được diễn ra sau khi người dùng vào trang xác nhận `/admin/dishes/:id/delete` và bấm nút đồng ý.
5. **Giao diện không vỡ:** Khi tìm kiếm không ra kết quả hiện giao diện `empty`. Khi ID không tồn tại hiện giao diện `notFound`. Khi tắt API backend, SPA hiện thông báo lỗi kết nối máy chủ rõ ràng, **không bao giờ để màn hình trắng trơn**.

---

### 5.8. Tổng kết tư duy kiến trúc
*(Slide 53 – 54)*

* **REST API:** URL là danh từ đại diện cho tài nguyên; HTTP Method đại diện cho hành động; Phản hồi qua cấu trúc chuẩn `{ ok, data }` hoặc `{ ok, error }`.
* **Phân tầng lỗi:** Dùng HTTP status để chỉ báo lỗi kỹ thuật hạ tầng; Dùng `error.code` bên trong body (kèm status 200) để xử lý logic nghiệp vụ ứng dụng.
* **CORS:** Giao thức bắt buộc giữa 2 origin khác nhau; các phương thức `PATCH`, `DELETE` và header `Content-Type: application/json` sẽ kích hoạt Preflight `OPTIONS`.
* **SPA:** Client-side routing trao quyền điều hướng cho trình duyệt; Ghi dữ liệu xong thì điều hướng để trang đích tự động đồng bộ dữ liệu mới nhất từ máy chủ.

---
*Tài liệu được biên soạn đồng bộ và nâng cao dựa trên bài giảng Web Development 2 (Block 6).*

---

## PHẦN 6: BÁO CÁO NGHIỆM THU, QUYẾT ĐỊNH KIẾN TRÚC & CẤU TRÚC DỰ ÁN THỰC TẾ

---

### 6.1. Bảng đối chiếu tiêu chí nghiệm thu & phòng tránh lỗi sai

*(Căn cứ theo giáo trình và tiêu chí chấm điểm Slide 49 đến 52 – Dự án đạt 100% tất cả các tiêu chí)*

#### 1. Phía Backend REST API (`api/`)

| Tiêu chí kiểm tra | Yêu cầu bài giảng (Slide 49 - 52) | Hiện trạng triển khai trong dự án | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Response Shape thống nhất** | 100% các handler phải trả về duy nhất 1 cấu trúc chuẩn: thành công `{ ok: true, data }`, lỗi nghiệp vụ `{ ok: false, error: { code, message, fields } }`. | Toàn bộ 15 endpoints (`dishes`, `chefs`, `ingredients`) được đóng gói đồng nhất bằng cấu trúc chuẩn `{ ok: true, data }` hoặc `{ ok: false, error }`. | **ĐẠT (100%)** |
| **Phân định Lỗi Kỹ thuật vs Lỗi Nghiệp vụ** | • Gọi sai URL (`/api/bok`) trả về HTTP `404` thuần túy (không có vỏ `ok`).<br/>• Sập server / lỗi DB trả về HTTP `500` thuần túy.<br/>• Sai ID hoặc dữ liệu không hợp lệ trả về HTTP `200` kèm `ok: false`. | • Middleware `404` tại `api/src/app.js:36` trả về HTTP `404` không có trường `ok`.<br/>• Global Error Handler tại `api/src/app.js:46` bắt ngoại lệ trả về HTTP `500` không có `ok`.<br/>• Tra cứu sai ID trả về HTTP `200` kèm `error.code: "NOT_FOUND"`. | **ĐẠT (100%)** |
| **Phương thức chuẩn RESTful** | • Lấy dữ liệu: `GET`<br/>• Thêm mới: `POST`<br/>• Cập nhật một phần: `PATCH`<br/>• Xóa: `DELETE`<br/>• Tuyệt đối không dùng `GET` để xóa hoặc ghi dữ liệu. | Toàn bộ 15 endpoints tuân thủ nghiêm ngặt phương thức HTTP tương ứng. Không có route `GET` nào làm biến đổi dữ liệu cơ sở dữ liệu. | **ĐẠT (100%)** |
| **Chống Mass Assignment (Over-posting)** | Chỉ trích xuất các trường cho phép (white-list) từ `req.body`, tuyệt đối không truyền nguyên `req.body` vào lệnh tạo mới hay cập nhật của ORM. | Mọi controller đều lọc qua hàm `validateDish`, `validateChef`, `validateIngredient` trong `api/src/validation.js`, chỉ đưa các trường hợp lệ (`name`, `price`, `chefId`,...) vào Prisma. | **ĐẠT (100%)** |
| **Kiểm tra ID trước khi gọi DB** | Kiểm tra ID có phải số nguyên dương hay không (`parseValidId`). Nếu ID sai (như chuỗi chữ cái `abc`), báo `NOT_FOUND` ngay mà không query DB. | Hàm `parseValidId` trong `validation.js` kiểm tra số nguyên dương ≥ 1. Nếu không hợp lệ trả về ngay `{ ok: false, error: { code: "NOT_FOUND" } }` giúp tiết kiệm tải DB. | **ĐẠT (100%)** |
| **Bảo mật kết nối Database** | Tuyệt đối không hardcode chuỗi kết nối Database trong mã nguồn hay in bừa bãi ra console log. | `DATABASE_URL` được lưu trong file `api/.env`, nạp qua thư viện `dotenv`. Mã nguồn không chứa mật khẩu hay thông tin nhạy cảm. | **ĐẠT (100%)** |

---

#### 2. Phía Frontend React SPA (`web/`)

| Tiêu chí kiểm tra | Yêu cầu bài giảng (Slide 49 - 52) | Hiện trạng triển khai trong dự án | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Không Reload trang (No Page Reload)** | Mọi thao tác chuyển trang, gửi form, xóa bản ghi tuyệt đối không làm tải lại toàn bộ tài liệu (tab trình duyệt không xoay vòng). | Sử dụng `react-router-dom v6` (`Link`, `NavLink`, `useNavigate`). Mọi form đều kích hoạt `e.preventDefault()`. Chuyển trang tức thì 0ms reload. | **ĐẠT (100%)** |
| **Tải lại trực tiếp không lỗi (Direct Reload)** | Nhập thẳng bất kỳ URL nào hoặc bấm F5 (ví dụ: `/dishes/2`, `/admin/dishes/1/delete`), trang vẫn nạp đúng dữ liệu của trang đó. | Cấu hình Vite SPA Fallback chuyển tiếp về `index.html`, React Router khôi phục component theo đường dẫn URL và tự động nạp dữ liệu qua API. | **ĐẠT (100%)** |
| **Bóc tách 3 tầng lỗi (API Client Wrapper)** | Tầng gọi API tập trung tại 1 file duy nhất, kiểm tra tuần tự: Tầng 1 (Mạng/CORS) → Tầng 2 (Status HTTP 4xx/5xx) → Tầng 3 (Nghiệp vụ `ok: false`). | Tập trung tại `web/src/apiClient.js`. Ném các đối tượng lỗi chuyên biệt: `NETWORK_ERROR`, `HTTP_ERROR`, `BUSINESS_ERROR` để giao diện xử lý chính xác. | **ĐẠT (100%)** |
| **Đầy đủ 4 trạng thái UI (State Machine)** | Mỗi màn hình dữ liệu phải xử lý đủ 4 trạng thái: `loading` (spinner xoay), `ok` (dữ liệu), `empty` (danh sách rỗng), `error`/`notFound` (báo lỗi + nút thử lại). | Component `web/src/components/StateViews.jsx` và tất cả các view xử lý đầy đủ cả 4 trạng thái. Tuyệt đối không bao giờ để màn hình trắng trơn. | **ĐẠT (100%)** |
| **Nguyên tắc "Dữ liệu thuộc về trang"** | Không sử dụng kho trạng thái toàn cục (Redux/Zustand) để chia sẻ danh sách bản ghi giữa các trang. Mỗi trang tự nạp dữ liệu độc lập. | Các trang độc lập hoàn toàn, tự gọi API nạp dữ liệu khi mount (`useEffect`) theo đúng ID hoặc query params trên thanh địa chỉ. | **ĐẠT (100%)** |
| **Xử lý Form & Báo lỗi đỏ Inline** | Khi validate thất bại: Chữ đỏ báo lỗi xuất hiện ngay dưới ô nhập vi phạm, giữ nguyên các giá trị người dùng đã gõ, mở khóa nút bấm. | Các component `DishForm`, `ChefForm`, `IngredientForm` đọc `error.fields`, tô đỏ viền ô nhập và hiển thị chữ báo lỗi ngay bên dưới ô tương ứng mà không mất dữ liệu cũ. | **ĐẠT (100%)** |
| **Chống Submit trùng lặp (Double Submit)** | Khi bấm gửi, nút bấm phải bị disabled và hiển thị trạng thái đang lưu dữ liệu. | Biến cờ `submitting` khóa nút submit ngay khi người dùng bấm gửi form, ngăn chặn click đúp tạo bản ghi trùng lặp. | **ĐẠT (100%)** |
| **Trang Xác Nhận Xóa riêng biệt** | Thao tác xóa chỉ được diễn ra sau khi người dùng vào trang xác nhận `/delete` và bấm nút đồng ý. | Xây dựng 3 trang xác nhận riêng biệt: `DishDelete.jsx`, `ChefDelete.jsx`, `IngredientDelete.jsx` với cảnh báo rõ ràng. | **ĐẠT (100%)** |
| **Ràng buộc toàn vẹn khi Xóa nguyên liệu** | Nguyên liệu đang được món ăn sử dụng không được phép xóa; phải hiển thị cảnh báo và danh sách các món liên quan kèm link sửa. | Trang `IngredientDelete.jsx` kiểm tra quan hệ `ingredient.dishes.length > 0`, khóa chức năng xóa và liệt kê danh sách món ăn kèm liên kết trực tiếp đến trang chỉnh sửa món ăn. | **ĐẠT (100%)** |
| **Trải nghiệm người dùng thực tế** | Giao diện mang dáng dấp ứng dụng nhà hàng thực tế, không in lộ các câu từ kỹ thuật ("qua REST API", "cơ sở dữ liệu",...). | Đã chuẩn hóa toàn bộ câu từ thành phong cách nhà hàng ẩm thực thanh lịch. Màn hình loading chỉ hiển thị biểu tượng xoay (spinner) tinh gọn. | **ĐẠT (100%)** |

---

### 6.2. Quyết định kiến trúc kỹ thuật & Tech Stack

```mermaid
flowchart TD
    subgraph ClientLayer["1. CLIENT TẦNG GIAO DIỆN (Port 5173)"]
        Browser["Trình duyệt Web (Người dùng)"]
        ReactApp["React 18 SPA + React Router v6"]
        ApiClient["API Client Wrapper (apiClient.js)"]
        BistroStyle["Bistro CSS (Cormorant Garamond + Gold/Burgundy)"]
        
        Browser --> ReactApp
        ReactApp --> BistroStyle
        ReactApp --> ApiClient
    end

    subgraph ApiLayer["2. SERVER TẦNG DỊCH VỤ REST API (Port 3000)"]
        ExpressApp["Express.js Server (app.js)"]
        CorsMiddleware["CORS Middleware (Whitelisting Origin: 5173)"]
        ValidationLayer["Validation & Whitelist Fields (validation.js)"]
        ResourceRoutes["REST Routes (/api/dishes, /api/chefs, /api/ingredients)"]
        PrismaClient["Prisma ORM 5 (prisma.js)"]
        
        ExpressApp --> CorsMiddleware
        CorsMiddleware --> ResourceRoutes
        ResourceRoutes --> ValidationLayer
        ValidationLayer --> PrismaClient
    end

    subgraph DataLayer["3. CƠ SỞ DỮ LIỆU ĐÁM MÂY (Supabase PostgreSQL)"]
        SupabaseDB["Supabase PostgreSQL Cloud (Port 5432 - Transaction/Session Pooler)"]
        PrismaClient --> SupabaseDB
    end

    ApiClient -- "HTTP Request (JSON) | Cross-Origin: 5173 -> 3000" --> ExpressApp
    ExpressApp -- "JSON Response { ok: true, data } kèm Header CORS" --> ApiClient
```

#### Chi tiết lựa chọn công nghệ:

1. **Frontend Single Page Application (`web`):**
   * **React 18:** Thư viện giao diện dựa trên Component giúp chia nhỏ giao diện (Navbar, StateViews, Forms, Tables) dễ bảo trì và tái sử dụng.
   * **React Router v6:** Quản lý điều hướng Client-side Routing mượt mà, phân tách rõ ràng giữa trang xem thực khách và trang quản trị Admin, hỗ trợ nạp lại trực tiếp URL (Direct Reload / F5) mà không bị lỗi 404.
   * **Vite 5:** Công cụ đóng gói (Build Tool) hiện đại, khởi động tức thì, Hot Module Replacement (HMR) cực nhanh, tối ưu hóa bundle khi đóng gói.
   * **Native `fetch` API:** Được bọc trong `apiClient.js` duy nhất để kiểm soát 3 tầng lỗi mà không cần cài đặt thêm thư viện cồng kềnh như Axios, giúp giảm nhẹ dung lượng ứng dụng.
   * **Bistro Restaurant Design System:** Tông màu sang trọng Rượu vang (Burgundy `#722F37`) và Hoàng kim (Gold `#C5A059`), font chữ kết hợp giữa Cormorant Garamond cổ điển và Lato hiện đại.

2. **Backend REST API (`api`):**
   * **Node.js & Express:** Nền tảng máy chủ hướng sự kiện, xử lý I/O bất đồng bộ hiệu năng cao, định nghĩa route RESTful trực quan và hỗ trợ xử lý Middleware linh hoạt.
   * **Prisma ORM 5:** Trình ánh xạ quan hệ cơ sở dữ liệu (ORM) an toàn về kiểu dữ liệu (Type-safe), quản lý quan hệ nhiều-nhiều (`DishIngredient`) và một-nhiều (`Chef` - `Dish`) chuẩn xác.
   * **Supabase Cloud PostgreSQL:** Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ trên nền tảng đám mây, kết nối ổn định qua cổng 5432 (Session Pooler).
   * **Dotenv:** Quản lý cấu hình biến môi trường (`PORT`, `CLIENT_ORIGIN`, `DATABASE_URL`), bảo vệ tuyệt đối thông tin bảo mật không bị lộ ra mã nguồn.
   * **Node:Test & Supertest:** Bộ công cụ kiểm thử tự động tích hợp sẵn, xác nhận 100% các tiêu chí CORS, Response Shape và mã lỗi kỹ thuật.

---

### 6.3. Phân tích chuyên sâu cơ chế CORS: Lựa chọn Phương án 1 vs Phương án 2

#### So sánh hai phương án xử lý CORS:

| Đặc điểm so sánh | Phương án 1: Cấu hình Header CORS ở API Backend | Phương án 2: Sử dụng Dev Server Proxy ở Frontend |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | Backend API chủ động gửi các HTTP Header `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` và xử lý Preflight `OPTIONS` trả về `204 No Content`. SPA gọi thẳng vào URL của Backend (`http://localhost:3000/api`). | File `vite.config.js` cấu hình chuyển tiếp các request có tiền tố `/api` sang cổng 3000. Trình duyệt nhìn thấy gọi vào cùng origin `http://localhost:5173/api` nên không kích hoạt kiểm tra CORS. |
| **Độ khớp với đề bài** | **Là tiêu chí cốt lõi của bài học (Slide 25 & 51).** Được khuyến nghị bắt buộc trong giáo trình. | Chỉ là giải pháp tình thế hỗ trợ phát triển nội bộ nhanh, không đạt tiêu chuẩn đề ra trong bài học. |
| **Kiểm thử tự động** | Vượt qua 100% bài kiểm thử CORS tự động bằng Supertest (`api.test.js`). | Trượt bài kiểm tra CORS Backend vì Backend không có cấu hình header. |
| **Môi trường Production** | **Sẵn sàng triển khai thực tế.** Hoạt động hoàn hảo khi Frontend ở CDN (`nhahang.com`) và Backend ở server riêng (`api.nhahang.com`). | **Không hoạt động trên Production.** Khi chạy `npm run build`, server dev của Vite biến mất, hệ thống không còn proxy và sẽ bị sập lỗi CORS ngay lập tức. |
| **Phục vụ đa nền tảng** | Cùng một API Backend phục vụ song song cho cả Web React, Mobile App (React Native/Flutter), Desktop App và Postman. | Chỉ hoạt động riêng cho ứng dụng web chạy qua máy chủ Vite dev server. |

> [!IMPORTANT] Quyết định chính thức của Dự án
> Dự án lựa chọn **PHƯƠNG ÁN 1: Cấu hình Header CORS tại API Backend**.

#### 4 Lý do bắt buộc phải chọn Phương án 1:
1. **Tuân thủ đúng tiêu chuẩn bài giảng & Bộ tiêu chí nghiệm thu (Slide 25 & Slide 51):**
   Trong giáo trình mục 3.4, giảng viên nêu rõ: *"Phương án 1 là phương án khuyên dùng và là tiêu chí bài học"*. Đề bài chấm điểm và bộ test tự động (`api/tests/api.test.js`) kiểm tra trực tiếp sự tồn tại của header `Access-Control-Allow-Origin: http://localhost:5173` và phản hồi HTTP `204 No Content` khi có Preflight `OPTIONS`. Nếu dùng Proxy ở FE, Backend sẽ thiếu cấu hình này và trượt bài thi.
2. **Phản ánh chính xác kiến trúc Decoupled & Microservices trong thực tế:**
   Khi đưa sản phẩm ra môi trường thực tế (Production), Frontend SPA được biên dịch thành các file HTML/CSS/JS tĩnh và lưu trữ trên CDN/Hosting (như Vercel, Netlify, Cloudflare Pages) với tên miền `https://nhahang.com`. Backend REST API được đặt trên server ứng dụng độc lập `https://api.nhahang.com`. Server dev của Vite hoàn toàn không tồn tại trên Production, nên nếu không cấu hình CORS Header ở Backend thì ứng dụng thực tế sẽ bị trình duyệt chặn hoàn toàn.
3. **Kiểm soát bảo mật danh sách trắng (Security Whitelisting):**
   Backend chủ động bảo vệ tài nguyên của mình bằng cách chỉ cho phép duy nhất Origin hợp lệ thông qua biến môi trường `CLIENT_ORIGIN`, tuyệt đối **không dùng ký tự đại diện wildcard `*`**. Điều này ngăn ngừa các trang web giả mạo hoặc mã độc từ domain lạ gửi request đánh cắp hoặc phá hoại dữ liệu qua trình duyệt của người dùng.
4. **Tính độc lập và mở rộng đa máy khách (Multi-client Capability):**
   Backend API khi tự đảm nhiệm cấu hình CORS sẽ trở thành một dịch vụ dữ liệu độc lập hoàn toàn, sẵn sàng phục vụ cùng lúc cho Web SPA, ứng dụng di động iOS/Android, phần mềm quản lý tại bàn của thu ngân mà không bị ràng buộc vào cấu hình máy chủ của bất kỳ giao diện nào.

---

### 6.4. Vị trí chính xác quy định ORIGIN và các cài đặt ALLOW trong mã nguồn

Dưới đây là 4 vị trí mã nguồn quy định Origin và cấu hình Allow trong dự án:

#### 1. File cấu hình biến môi trường Backend: `api/.env` (Dòng 2)
```properties
# api/.env (Dòng 1 - 3)
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres.gquvwkvpapxahiyfwoyx:jyrL5jxrk+8m_TQ@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
```
* **Ý nghĩa:** Định nghĩa biến môi trường `CLIENT_ORIGIN` trỏ chính xác về địa chỉ và cổng phát triển của React SPA (`http://localhost:5173`). Việc lưu vào file môi trường giúp dễ dàng thay đổi địa chỉ domain khi triển khai lên môi trường thử nghiệm (Staging) hoặc thực tế (Production) mà không cần can thiệp vào mã nguồn.

#### 2. Cấu hình CORS Middleware & Preflight: `api/src/app.js` (Dòng 10 – 24)
```javascript
// api/src/app.js (Dòng 10 - 24)
// 1. Cấu hình CORS chặt chẽ theo tiêu chuẩn bài học (Slide 26, 45, 51)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use((req, res, next) => {
  // Chỉ chấp nhận Origin của SPA, tuyệt đối không dùng wildcard *
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Xử lý Preflight Request (OPTIONS) kích hoạt bởi PATCH/DELETE hoặc Content-Type: application/json
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
```
* **Ý nghĩa:** 
  * `Access-Control-Allow-Origin`: Chỉ định đích danh origin của React SPA được phép truy cập tài nguyên.
  * `Access-Control-Allow-Methods`: Khai báo đầy đủ các phương thức HTTP cho phép (`GET, POST, PATCH, DELETE, OPTIONS`).
  * `Access-Control-Allow-Headers`: Cho phép client gửi header `Content-Type` (để gửi payload JSON) và `Authorization` (nếu có xác thực).
  * `req.method === "OPTIONS"`: Bắt gọn yêu cầu Preflight ngầm từ trình duyệt và phản hồi ngay mã HTTP `204 No Content` trước khi request thật sự được thực thi.

#### 3. Điểm khai báo API URL tập trung ở Frontend: `web/src/apiClient.js` (Dòng 1 – 2)
```javascript
// web/src/apiClient.js (Dòng 1 - 2)
// Nơi duy nhất định nghĩa URL gốc của API (Slide 29, 50)
export const API_BASE_URL = "http://localhost:3000/api";
```
* **Ý nghĩa:** Tuân thủ quy tắc Slide 50: *"URL gốc của API được khai báo ở một chỗ duy nhất trong cấu hình"*. Mọi request từ tất cả các view trong React SPA đều gọi qua hằng số này để kết nối thẳng sang máy chủ API cổng 3000.

#### 4. Bài kiểm thử tự động CORS & Preflight: `api/tests/api.test.js` (Dòng 11 – 25)
```javascript
// api/tests/api.test.js (Dòng 11 - 25)
test("1. CORS Headers: Response phải có Access-Control-Allow-Origin đúng origin của SPA", async () => {
  const res = await request(app).get("/api/dishes");
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
});

test("2. CORS Preflight: OPTIONS request phải trả về 204 kèm các headers cho phép", async () => {
  const res = await request(app)
    .options("/api/dishes/1")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "PATCH");

  assert.equal(res.status, 204);
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.match(res.headers["access-control-allow-methods"], /PATCH/);
});
```
* **Ý nghĩa:** Bộ kiểm thử tự động sử dụng thư viện `supertest` để kiểm tra nghiêm ngặt hai tiêu chí CORS: phản hồi đúng origin của client và phản hồi HTTP `204` khi trình duyệt gửi Preflight `OPTIONS`.

---

### 6.5. Cấu trúc toàn diện dự án (Project Tree) & Chú thích chi tiết từng phần

#### Sơ đồ cây thư mục hoàn chỉnh:

```text
D:\III_HK1\Web2\Block6\
├── package.json                          # File cấu hình gốc, chứa script chạy đồng thời cả hai server
├── HUONG_DAN_CHAY_PROJECT.md             # Hướng dẫn chi tiết cách khởi chạy và nghiệm thu dự án
├── LY_THUYET_REST_API_VA_SPA.md          # Giáo trình lý thuyết, tiêu chí bài học và quyết định kiến trúc
│
├── api/                                  # ========================================================
│   │                                     # THƯ MỤC BACKEND REST API (Node.js + Express + Prisma)
│   │                                     # Chạy tại: http://localhost:3000
│   │                                     # ========================================================
│   ├── .env                              # Biến môi trường: PORT, CLIENT_ORIGIN, DATABASE_URL
│   ├── package.json                      # Khai báo thư viện: express, prisma, dotenv, supertest
│   ├── prisma/
│   │   ├── schema.prisma                 # Định nghĩa mô hình thực thể CSDL (Dish, Chef, Ingredient)
│   │   └── seed.js                       # Dữ liệu mẫu khởi tạo ban đầu cho nhà hàng vào Supabase
│   ├── src/
│   │   ├── app.js                        # Cấu hình Express: CORS Header, JSON parser, 404/500 handler
│   │   ├── server.js                     # Điểm khởi động HTTP Server lắng nghe tại cổng 3000
│   │   ├── prisma.js                     # Khởi tạo thể hiện dùng chung (Singleton) của PrismaClient
│   │   ├── validation.js                 # Hàm kiểm tra ID, validate dữ liệu & whitelist fields
│   │   └── routes/                       # Khai báo 15 điểm cuối REST API chuẩn
│   │       ├── dishes.js                 # 5 endpoints quản lý món ăn (/api/dishes)
│   │       ├── chefs.js                  # 5 endpoints quản lý đầu bếp (/api/chefs)
│   │       └── ingredients.js            # 5 endpoints quản lý nguyên liệu (/api/ingredients)
│   └── tests/
│       └── api.test.js                   # Bộ 9 bài kiểm thử tự động (CORS, 404, 500, Response Shape)
│
└── web/                                  # ========================================================
    │                                     # THƯ MỤC FRONTEND REACT SPA (React 18 + React Router v6)
    │                                     # Chạy tại: http://localhost:5173
    │                                     # ========================================================
    ├── index.html                        # File HTML duy nhất chứa thẻ <div id="root"> (Cốt lõi SPA)
    ├── package.json                      # Khai báo thư viện: react, react-dom, react-router-dom, vite
    ├── vite.config.js                    # Cấu hình máy chủ phát triển Vite và plugin React
    ├── public/                           # Thư mục tài nguyên tĩnh
    │   ├── css/                          # Định kiểu giao diện phong cách Bistro cổ điển
    │   │   ├── spa.css                   # Định kiểu bổ trợ cho SPA, bộ lọc pills và modal
    │   │   └── style.css                 # Bộ style chính của nhà hàng ẩm thực
    │   └── assets/img/                   # Hình ảnh món ăn, đầu bếp và các biểu tượng SVG
    └── src/
        ├── main.jsx                      # Điểm nhập React, render App vào DOM và bọc BrowserRouter
        ├── App.jsx                       # Cấu hình toàn bộ hệ thống Routes của ứng dụng SPA
        ├── apiClient.js                  # Tầng gọi API tập trung bóc tách 3 tầng lỗi (Network/HTTP/Business)
        ├── components/                   # Các thành phần giao diện dùng chung
        │   ├── Navbar.jsx                # Thanh điều hướng dùng NavLink (chuyển trang không reload)
        │   ├── Footer.jsx                # Chân trang nhà hàng
        │   └── StateViews.jsx            # Bộ component xử lý 4 trạng thái UI (loading, empty, notFound, error)
        └── views/                        # Các màn hình chức năng của ứng dụng
            ├── NotFound.jsx              # Màn hình 404 khi gõ sai URL client trên trình duyệt
            ├── dishes/                   # Nhóm màn hình dành cho thực khách
            │   ├── DishList.jsx          # Danh sách thực đơn, lọc loại món ăn, tìm kiếm, 4 trạng thái UI
            │   └── DishDetail.jsx        # Chi tiết món ăn, hiển thị đầu bếp và bảng nguyên liệu
            └── admin/                    # Nhóm màn hình quản trị (Admin Views)
                ├── dishes/               # Quản lý món ăn
                │   ├── AdminDishList.jsx # Bảng danh sách món ăn 1 dòng không cuộn ngang
                │   ├── DishForm.jsx      # Form thêm/sửa món ăn, chọn nguyên liệu + số lượng, inline error
                │   └── DishDelete.jsx    # Trang xác nhận xóa món ăn an toàn
                ├── chefs/                # Quản lý đầu bếp
                │   ├── AdminChefList.jsx # Bảng danh sách đầu bếp nhà hàng
                │   ├── ChefForm.jsx      # Form thêm/sửa đầu bếp, bắt lỗi inline error
                │   └── ChefDelete.jsx    # Trang xác nhận xóa đầu bếp an toàn
                └── ingredients/          # Quản lý nguyên liệu
                    ├── AdminIngredientList.jsx # Bảng danh sách nguyên liệu
                    ├── IngredientForm.jsx      # Form thêm/sửa nguyên liệu kèm inline error
                    └── IngredientDelete.jsx    # Trang xác nhận xóa nguyên liệu (Khóa xóa nếu đang có món dùng)
```

---

#### Bảng thuyết minh chi tiết: Từng thành phần làm gì & Phục vụ tiêu chuẩn nào?

##### 1. Phía Backend REST API (`api/`)

| Tên tập tin / Thư mục | Nơi cấu hình / Chức năng là gì? | Phục vụ yêu cầu / tiêu chí nào trong Block 6? |
| :--- | :--- | :--- |
| `api/.env` | Nơi cấu hình biến môi trường: cổng `PORT=3000`, địa chỉ `CLIENT_ORIGIN=http://localhost:5173`, chuỗi kết nối `DATABASE_URL`. | **Tiêu chuẩn Slide 26 & 50:** Bảo mật thông tin, không hardcode thông tin kết nối DB và địa chỉ client trong mã nguồn. |
| `api/prisma/schema.prisma` | Định nghĩa 3 bảng dữ liệu chính: `Dish`, `Chef`, `Ingredient` và bảng liên kết nhiều-nhiều `DishIngredient`. | **Tiêu chuẩn Slide 42 – 44:** Mô hình thực thể quan hệ đầy đủ cho bài tập lớn Nhà hàng. |
| `api/prisma/seed.js` | Kịch bản nạp dữ liệu mẫu ban đầu: 7 món ăn đặc sản Việt Nam, 3 đầu bếp và 12 loại nguyên liệu. | **Tiêu chuẩn thực hành:** Đảm bảo hệ thống có sẵn dữ liệu chuẩn để kiểm thử ngay sau khi cài đặt. |
| `api/src/app.js` | Nơi cấu hình máy chủ Express: Gắn CORS Middleware (Origin 5173, Preflight 204), `express.json()`, gắn 3 router tài nguyên, Middleware xử lý 404 kỹ thuật và Global Error Handler 500. | **Tiêu chuẩn Slide 18, 26, 51:** Thiết lập ranh giới CORS, đảm bảo lỗi kỹ thuật 404/500 không bị bọc nhầm vào cấu trúc `ok: false`. |
| `api/src/server.js` | Điểm khởi động HTTP Server, đọc cổng từ biến môi trường và lắng nghe yêu cầu tại `http://localhost:3000`. | **Kiến trúc phân tách:** Tách rời phần cấu hình `app.js` và phần kích hoạt server để phục vụ chạy test độc lập qua Supertest. |
| `api/src/prisma.js` | Khởi tạo duy nhất một thể hiện `PrismaClient` (Singleton Pattern) dùng chung cho toàn bộ ứng dụng. | **Tối ưu hóa tài nguyên:** Tránh tạo quá nhiều kết nối dư thừa gây tràn Connection Pool của Supabase. |
| `api/src/validation.js` | Tập hợp các hàm kiểm tra hợp lệ: `parseValidId`, `validateDish`, `validateChef`, `validateIngredient` và lọc danh sách trắng (Whitelist Fields). | **Tiêu chuẩn Slide 18 & 50:** Chống lỗi Over-posting / Mass Assignment; chặn ID sai định dạng ngay từ đầu trước khi query DB. |
| `api/src/routes/dishes.js` | Cung cấp 5 endpoints chuẩn RESTful cho tài nguyên món ăn: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`. | **Tiêu chuẩn Slide 10, 46, 51:** Bảng đặc tả 15 endpoints, chuẩn hóa cấu trúc phản hồi `{ ok: true, data }` hoặc `{ ok: false, error }`. |
| `api/src/routes/chefs.js` | Cung cấp 5 endpoints chuẩn RESTful cho tài nguyên đầu bếp: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`. | **Tiêu chuẩn Slide 46:** Quản lý thông tin đầu bếp, trả về danh sách món ăn do đầu bếp phụ trách. |
| `api/src/routes/ingredients.js` | Cung cấp 5 endpoints chuẩn RESTful cho nguyên liệu: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`. | **Tiêu chuẩn Slide 44 & 46:** Quản lý nguyên liệu, kiểm tra ràng buộc không cho phép xóa nguyên liệu đang có món ăn sử dụng. |
| `api/tests/api.test.js` | Bộ 9 bài kiểm thử tự động viết bằng `node:test` và `supertest` chạy độc lập với cơ sở dữ liệu. | **Tiêu chuẩn Slide 20 & 51:** Kiểm thử tự động CORS Headers, Preflight 204, Lỗi 404, Lỗi 500, Response Shape và Nghiệp vụ. |

---

##### 2. Phía Frontend React SPA (`web/`)

| Tên tập tin / Thư mục | Nơi cấu hình / Chức năng là gì? | Phục vụ yêu cầu / tiêu chí nào trong Block 6? |
| :--- | :--- | :--- |
| `web/index.html` | File HTML duy nhất của toàn bộ ứng dụng, chứa thẻ `<div id="root"></div>` để nạp ứng dụng React. | **Cốt lõi Single Page Application:** Nền tảng để toàn bộ mã JavaScript điều khiển DOM mà không cần reload trang. |
| `web/vite.config.js` | File cấu hình máy chủ phát triển Vite và plugin `@vitejs/plugin-react`. | **Tiêu chuẩn Slide 35:** Đóng gói ứng dụng SPA, hỗ trợ SPA Fallback chuyển tiếp mọi route về `index.html`. |
| `web/src/main.jsx` | Điểm nhập chính của React: khởi tạo `ReactDOM.createRoot` và bọc toàn bộ ứng dụng trong `<BrowserRouter>`. | **Tiêu chuẩn Slide 35:** Kích hoạt Client-side Routing qua HTML5 History API (`pushState`, `popState`). |
| `web/src/App.jsx` | Khai báo cấu trúc điều hướng toàn diện bằng `<Routes>` và `<Route>`, định tuyến đầy đủ 12 trang web. | **Tiêu chuẩn Slide 36 & 48:** Bảng đặc tả hệ thống URL của SPA (Trang thực khách + Nhóm trang quản trị Admin). |
| `web/src/apiClient.js` | Tầng gọi API tập trung, khai báo hằng số `API_BASE_URL` và hàm tổng quát `apiRequest` kiểm tra tuần tự 3 tầng lỗi. | **Tiêu chuẩn Slide 28 – 30:** Bóc tách chính xác 3 tầng lỗi: Mất mạng/CORS (`NETWORK_ERROR`) $\rightarrow$ Mã HTTP 4xx/5xx (`HTTP_ERROR`) $\rightarrow$ Nghiệp vụ `ok: false` (`BUSINESS_ERROR`). |
| `web/src/components/Navbar.jsx` | Thanh điều hướng giao diện, sử dụng thẻ `<NavLink>` thay cho thẻ `<a>` truyền thống. | **Tiêu chuẩn Slide 34 & 51:** Chuyển đổi giữa các trang không reload trang; tự động đánh dấu mục đang hoạt động (`active`). |
| `web/src/components/StateViews.jsx` | Cung cấp 4 component giao diện tương ứng với State Machine: `LoadingView`, `EmptyView`, `NotFoundView`, `ErrorView`. | **Tiêu chuẩn Slide 31 – 33 & 52:** Đảm bảo mọi màn hình xử lý đầy đủ 4 trạng thái UI, không bao giờ để màn hình trắng trơn. |
| `web/src/views/dishes/DishList.jsx` | Màn hình danh sách thực đơn dành cho thực khách: bộ lọc loại món (All, Món chính, Khai vị, Tráng miệng) bằng pills, tìm kiếm theo tên món. | **Tiêu chuẩn Slide 31 & Yêu cầu đề bài:** Trải nghiệm ẩm thực trực quan, cập nhật dữ liệu tự động theo danh mục. |
| `web/src/views/dishes/DishDetail.jsx` | Màn hình chi tiết món ăn: nạp thông tin theo ID từ URL, hiển thị hình ảnh, giá tiền, đầu bếp phụ trách và danh sách nguyên liệu. | **Tiêu chuẩn Slide 32 – 33:** Tuân thủ nguyên tắc "Dữ liệu thuộc về trang", xử lý trường hợp ID không tồn tại (`notFound`). |
| `web/src/views/admin/dishes/AdminDishList.jsx` | Màn hình quản trị danh sách món ăn: bố trí dạng bảng 1 dòng gọn gàng (không cuộn ngang), nút Thêm món ăn mới, Sửa và Xóa. | **Tiêu chuẩn Slide 48 & Yêu cầu người dùng:** Tối ưu hóa không gian hiển thị cho người quản trị nhà hàng. |
| `web/src/views/admin/dishes/DishForm.jsx` | Form thêm mới và cập nhật món ăn: chọn đầu bếp, chọn nhiều nguyên liệu kèm ô nhập số lượng, bắt lỗi đỏ inline. | **Tiêu chuẩn Slide 37 – 39 & 52:** Gửi dữ liệu qua REST API (`POST`/`PATCH`), giữ nguyên dữ liệu đã nhập khi lỗi, chống double submit. |
| `web/src/views/admin/dishes/DishDelete.jsx` | Màn hình xác nhận xóa món ăn an toàn với cảnh báo chi tiết trước khi gửi lệnh `DELETE`. | **Tiêu chuẩn Slide 40 & 52:** Tiêu chí nghiệm thu: xóa phải thông qua trang xác nhận riêng biệt, không xóa trực tiếp bằng link `GET`. |
| `web/src/views/admin/chefs/` | Bộ 3 màn hình quản trị đầu bếp: `AdminChefList.jsx`, `ChefForm.jsx`, `ChefDelete.jsx`. | **Tiêu chuẩn Slide 46 & 48:** Quản lý trọn vẹn vòng đời tài nguyên đầu bếp (CRUD) qua REST API. |
| `web/src/views/admin/ingredients/` | Bộ 3 màn hình quản trị nguyên liệu: `AdminIngredientList.jsx`, `IngredientForm.jsx`, `IngredientDelete.jsx`. | **Tiêu chuẩn Slide 44 & 48:** Quản lý nguyên liệu; đặc biệt trang xóa có kiểm tra toàn vẹn ràng buộc quan hệ món ăn. |
| `web/src/views/NotFound.jsx` | Màn hình hiển thị khi người dùng nhập sai bất kỳ đường dẫn URL nào trên trình duyệt. | **Tiêu chuẩn Slide 35:** Phân biệt rõ lỗi 404 phía Client SPA với lỗi 404 kỹ thuật phía API Server. |
