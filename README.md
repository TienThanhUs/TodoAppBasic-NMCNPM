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

## Version 2 – Client–Server nhiều client

- Server nghe trên `0.0.0.0`; khi khởi động sẽ in địa chỉ LAN (vd. `http://192.168.1.5:3000`) để thiết bị khác mở.
- Client polling `GET /api/tasks` mỗi 2 giây, chỉ vẽ lại khi dữ liệu đổi; góc danh sách hiện `ĐỒNG BỘ hh:mm:ss` hoặc `MẤT KẾT NỐI SERVER`.
- Đổi trạng thái dùng `PATCH /api/tasks/:id` với body `{ "done": true|false }` (route `/toggle` cũ vẫn giữ).
- Server log mỗi request kèm IP client để minh chứng nhiều client.

Chi tiết sơ đồ và nhật ký: [`docs/V2-client-server.md`](docs/V2-client-server.md)

### Cách thử V2

1. `npm start`
2. Mở `http://localhost:3000` ở **hai trình duyệt khác nhau** (hoặc Chrome thường + cửa sổ ẩn danh / máy khác dùng địa chỉ LAN).
3. A thêm task → B thấy task trong ≤ 2 giây, không cần reload.
4. B bấm HOÀN THÀNH → A thấy trạng thái ĐÃ XONG.
5. Tắt server (Ctrl+C) → cả hai hiện MẤT KẾT NỐI SERVER.
