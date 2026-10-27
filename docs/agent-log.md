# Nhật ký dùng coding agent (V2, V3, V4)

Agent: Claude / Coding Agent. Người thực hiện: Võ Trúc Quỳnh.

## V2 – Client–Server nhiều client

**Ràng buộc mới:** hai người trên hai thiết bị/trình duyệt phải thấy thay đổi của nhau.
**Hạn chế của thiết kế hiện tại (V1):** client chỉ tải dữ liệu một lần khi mở trang; nút toggle "lật" trạng thái nên có thể đè thao tác của người khác.

**Prompt chính:**
- Gửi link đề bài + link repo V1: "version 1 đang như này, chỉ mình pull về máy rồi viết version 2"
- "đưa file đó lại cho mình, khỏi chỉnh từng dòng" → agent trả về `server.js`, `index.html`, `README.md`, `docs/V2-client-server.md` dựa trên commit mới nhất (`doi phong chu`)

**Lỗi phát sinh và cách xử lý:**

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `git push` → 403 Permission denied | Tài khoản chưa là collaborator của repo | Chủ repo thêm collaborator, push lại thành công |
| PowerShell báo hàng loạt lỗi đỏ | Dán nhầm cả output cũ vào terminal | Chỉ gõ lệnh, kiểm tra lại bằng `git log` → commit không bị ảnh hưởng |

**Kiểm chứng (tự thao tác):** Chrome thường + ẩn danh; A tạo task → B thấy không reload; B đánh dấu xong → A thấy; tắt server → cả hai báo MẤT KẾT NỐI SERVER. Ảnh: `docs/screenshots/v2-*.png`.

## V3 – Đổi giao diện và nguồn lưu trữ (N-Layer)

**Ràng buộc mới:** Giao diện danh sách cũ phải thay bằng bảng Kanban 2 cột (Chưa hoàn thành và Hoàn thành); đổi nơi lưu trữ từ `tasks.json` sang SQLite (`better-sqlite3`); không mất task cũ và không nhân đôi dữ liệu khi migrate lại.
**Hạn chế của thiết kế hiện tại (V2):** `server.js` trộn lẫn cả định tuyến HTTP, xử lý nghiệp vụ và đọc/ghi file JSON; nếu đổi UI hoặc đổi nơi lưu trữ thì phải sửa đan xen, vi phạm Modifiability.

**Prompt chính:**
- Phân tích code hiện tại V2: chỉ ra chỗ trộn lẫn Presentation / Business Logic / Data Access; đề xuất cách tách thành 3 phần rõ ràng.
- Yêu cầu agent sửa code hiện có: tách 3 lớp (UI + Controller router, TaskService, Repository interface + SqliteTaskRepository); chuyển UI sang Kanban 2 cột; chuyển persistence sang SQLite; viết script migrate idempotent `INSERT OR IGNORE`; giữ nguyên API và hành vi CRUD.

**Lỗi phát sinh và cách xử lý:**

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `Cannot find module 'better-sqlite3'` khi chạy worktree mới | Thư viện native C++ của better-sqlite3 chưa được build cho môi trường Node hiện tại trong worktree | Chạy `npm install` ngay tại thư mục worktree để build native binary |
| Tranh chấp cổng 3000 khi kiểm thử | Cổng 3000 bị chiếm nếu không tắt server phiên bản trước | Luôn kiểm tra và tắt tiến trình trước khi chuyển sang chạy phiên bản tiếp theo |

**Kiểm chứng (tự thao tác):** Chạy server V3 tự động migrate 2 task cũ từ `tasks.json` vào SQLite (`tasks.db`); giao diện Kanban 2 cột hiển thị đầy đủ; gọi API tạo task mới và chuyển trạng thái; tắt server bật lại vẫn giữ nguyên 3 task; chạy script migrate lần 2 kết quả 3 task trước = 3 task sau không bị nhân đôi; lệnh grep kiểm tra `TaskService.js` chứng minh tầng nghiệp vụ độc lập, chỉ require module `crypto` chuẩn của Node.js. Ảnh: `docs/screenshots/v3-*.png`.

## V4 – Đồng bộ P2P khi mất server

**Ràng buộc mới:** server không truy cập được, hai thành viên cùng LAN vẫn phải chia sẻ và đổi trạng thái task trực tiếp với nhau.
**Hạn chế của thiết kế hiện tại (V3):** mọi thao tác đều đi qua API server, client không giữ dữ liệu nên tắt server là không làm được gì.

**Prompt chính:**
- "có v3 xong rồi, làm v4 nha" → agent pull bản V3, thêm `public/js/peer-link.js`, `public/js/local-replica.js`, sửa `public/index.html`, viết `docs/V4-p2p.md`; không sửa `server.js` và `src/`

**Lỗi phát sinh và cách xử lý:**

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `Cannot find module 'better-sqlite3'` trong môi trường của agent | Môi trường agent không tải được package từ npm | Agent test phần P2P với server V3 dùng kho dữ liệu trong RAM; phần P2P chạy trên trình duyệt nên không phụ thuộc DB. Nhóm tự test lại với SQLite thật |
| `crypto.randomUUID` không có khi mở bằng `http://<IP LAN>` | API này chỉ có trong secure context (localhost/HTTPS) | Thêm hàm `makeId()` dự phòng |
| Đã kết nối nhưng một bên vẫn hiện "ĐANG KẾT NỐI (connected)" | Sự kiện `connected` của trình duyệt đến sau sự kiện `open` nên ghi đè trạng thái | Kênh đã mở thì luôn hiện ĐÃ KẾT NỐI P2P |

**Kiểm chứng (tự thao tác):** Chrome thường + ẩn danh kết nối P2P bằng mã mời/trả lời → cả hai hiện ĐÃ KẾT NỐI P2P; tắt server (Ctrl+C, terminal quay về dấu nhắc); A tạo task "thêm tast p2p" → B nhận; bấm XONG → cả hai chuyển task sang cột Hoàn thành. Ảnh: `docs/screenshots/v4-*.png`.
