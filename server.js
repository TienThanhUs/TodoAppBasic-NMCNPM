const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());
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
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
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
    id: Date.now().toString(),
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

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
