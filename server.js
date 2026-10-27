const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // V2: nghe trên mọi card mạng để máy khác trong LAN truy cập được
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());

// V2: ghi log mỗi request API kèm IP client -> minh chứng nhiều client cùng gọi 1 server
app.use('/api', (req, res, next) => {
  const ip = (req.ip || '').replace('::ffff:', '');
  console.log(`[${new Date().toLocaleTimeString()}] ${ip} ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Đọc danh sách task từ file tasks.json
function readTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Lỗi đọc file tasks.json:', err);
    return [];
  }
}

// Ghi danh sách task vào file tasks.json
// V2: ghi ra file tạm rồi rename (atomic) để client khác không bao giờ đọc phải file ghi dở
function writeTasks(tasks) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

// 1. Xem danh sách task
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// 2. Tạo task có tên
app.post('/api/tasks', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Tên công việc không được để trống!' });
  }

  const tasks = readTasks();
  const newTask = {
    id: crypto.randomUUID(), // V2: 2 client tạo cùng 1 ms sẽ không bị trùng id như Date.now()
    name,
    done: false
  };

  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// 3. Đổi trạng thái task: chưa hoàn thành <-> hoàn thành
app.patch('/api/tasks/:id/toggle', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => String(t.id) === String(req.params.id));

  if (!task) {
    return res.status(404).json({ error: 'Không tìm thấy công việc!' });
  }

  task.done = !task.done;
  writeTasks(tasks);
  res.json(task);
});

// 3b. V2: đặt trạng thái tường minh { done: true|false } (idempotent)
// Toggle không an toàn khi nhiều client: nếu B vừa đánh dấu xong mà A chưa kịp thấy,
// A bấm "Hoàn thành" sẽ lật ngược lại thành chưa xong. Đặt giá trị cụ thể thì bấm mấy lần cũng ra cùng kết quả.
app.patch('/api/tasks/:id', (req, res) => {
  if (typeof req.body.done !== 'boolean') {
    return res.status(400).json({ error: 'Trường done phải là true hoặc false!' });
  }
  const tasks = readTasks();
  const task = tasks.find(t => String(t.id) === String(req.params.id));

  if (!task) {
    return res.status(404).json({ error: 'Không tìm thấy công việc!' });
  }

  task.done = req.body.done;
  writeTasks(tasks);
  res.json(task);
});

// 4. Xoá task
app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => String(t.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy công việc!' });
  }

  const [deleted] = tasks.splice(index, 1);
  writeTasks(tasks);
  res.json(deleted);
});

app.listen(PORT, HOST, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  // In địa chỉ LAN để thiết bị khác (điện thoại, laptop khác) mở cùng ứng dụng
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`Truy cập từ thiết bị khác trong LAN: http://${net.address}:${PORT}`);
      }
    }
  }
});
