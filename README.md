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

### Cách 1: Chạy bằng Terminal trong VS Code (Khuyên dùng)
1. Mở thư mục dự án trong VS Code.
2. Mở Terminal tích hợp bằng phím tắt **`Ctrl + \``** (hoặc trên Mac: **`Control + \``** / Menu: **Terminal -> New Terminal**).
3. Gõ lệnh:
   ```bash
   npm start
   ```
4. Mở trình duyệt và truy cập: **http://localhost:3000**

### Cách 2: Bấm 1 nút (F5) trong VS Code
Dự án đã được tạo sẵn file cấu hình `.vscode/launch.json`:
1. Mở VS Code, nhấn phím **F5** (hoặc vào tab **Run and Debug** ở thanh bên trái -> bấm nút Play màu xanh **"Chạy Server (F5)"**).
2. Server sẽ tự động chạy trong cửa sổ terminal của VS Code.
3. Mở trình duyệt vào **http://localhost:3000**.
