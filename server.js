const express = require('express');
const path = require('path');
const os = require('os');

// Khởi tạo các lớp theo kiến trúc 3 tầng:
// 1. Data Access Layer
const SqliteTaskRepository = require('./src/data/SqliteTaskRepository');
// 2. Business Logic Layer
const TaskService = require('./src/business/TaskService');
// 3. Presentation Layer (Router)
const createTaskRouter = require('./src/routes/taskRoutes');
// Tự động kiểm tra migrate dữ liệu cũ nếu có
const migrateTasksJsonToSqlite = require('./scripts/migrate-to-sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Chạy migration tự động khi server khởi động (đảm bảo không mất dữ liệu cũ và idempotent)
migrateTasksJsonToSqlite();

// Khởi tạo Dependency Injection: Repo -> Service -> Router
const taskRepository = new SqliteTaskRepository();
const taskService = new TaskService(taskRepository);
const taskRouter = createTaskRouter(taskService);

app.use(express.json());

// Ghi log mỗi request API kèm IP client
app.use('/api', (req, res, next) => {
  const ip = (req.ip || '').replace('::ffff:', '');
  console.log(`[${new Date().toLocaleTimeString()}] ${ip} ${req.method} ${req.originalUrl}`);
  next();
});

// Gắn Presentation Router cho /api
app.use('/api', taskRouter);

// Phục vụ file tĩnh (Presentation View: HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, HOST, () => {
  console.log(`Server V3 đang chạy tại http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`Truy cập từ thiết bị khác trong LAN: http://${net.address}:${PORT}`);
      }
    }
  }
});
