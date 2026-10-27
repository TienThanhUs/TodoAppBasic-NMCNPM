# Quản Lý Công Việc (Pixel Task Manager)

Ứng dụng quản lý công việc đơn giản dùng **Node.js + Express** và giao diện **HTML + JavaScript thuần** theo phong cách Pixel UI.

## Chức năng
1. Tạo task có tên
2. Xem danh sách task
3. Đổi trạng thái task: chưa hoàn thành ↔ hoàn thành
4. Xoá task

Dữ liệu được lưu trực tiếp vào file `tasks.json` và giữ nguyên sau khi tắt/bật lại server.

## Cách cài đặt

Yêu cầu máy đã cài sẵn [Node.js](https://nodejs.org/). Mở terminal tại thư mục dự án và chạy:

```bash
npm install
```

## Cách chạy

```bash
npm start
```

Sau đó mở trình duyệt và truy cập:
**http://localhost:3000**

## Version 4 – Đồng bộ P2P khi mất server

Chế độ thường vẫn là V3 (Client–Server + SQLite). V4 thêm khung **KẾT NỐI P2P** ở cuối trang: hai trình duyệt nối thẳng với nhau bằng WebRTC DataChannel, signaling thủ công bằng copy-paste mã (không có server trung gian). Chi tiết: [`docs/V4-p2p.md`](docs/V4-p2p.md)

### Cách thử V4

1. `npm start`, mở `http://localhost:3000` ở **Chrome thường** (A) và **Chrome ẩn danh** (B). Chờ cả hai hiện `ĐỒNG BỘ`.
2. A bấm **1. TẠO MÃ MỜI** → **COPY MÃ** → dán vào ô *DÁN MÃ NGƯỜI KIA GỬI* của B.
3. B bấm **2. XỬ LÝ MÃ ĐÃ DÁN** → **COPY MÃ** → dán vào ô *DÁN MÃ NGƯỜI KIA GỬI* của A.
4. A bấm **2. XỬ LÝ MÃ ĐÃ DÁN**. Hai bên hiện `ĐÃ KẾT NỐI P2P` và `CHẾ ĐỘ P2P`.
5. Tắt server (Ctrl+C). **Không tải lại trang.**
6. A tạo task → B nhận; B bấm XONG → A thấy task sang cột Hoàn thành; khung log ghi `GỬI ... → peer` / `NHẬN ... ← peer`.
7. Bấm **VỀ CHẾ ĐỘ SERVER** (sau khi bật lại server) để quay về V3.

Hai máy khác nhau: máy B mở `http://<IP LAN máy A>:3000` lúc server còn chạy, các bước còn lại giống trên.
