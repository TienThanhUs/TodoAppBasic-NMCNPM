const express = require('express');

/**
 * TaskRoutes - Tầng Presentation (API Routes & Controller)
 * Nhận HTTP request, gọi TaskService và trả về JSON/Status code tương ứng.
 */
function createTaskRouter(taskService) {
  const router = express.Router();

  // 1. Xem danh sách task
  router.get('/tasks', (req, res) => {
    try {
      const tasks = taskService.getAllTasks();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Tạo task có tên
  router.post('/tasks', (req, res) => {
    try {
      const task = taskService.createTask(req.body.name);
      res.status(201).json(task);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  });

  // 3. Đổi trạng thái task (toggle)
  router.patch('/tasks/:id/toggle', (req, res) => {
    try {
      const task = taskService.toggleTaskStatus(req.params.id);
      res.json(task);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  });

  // 3b. Đặt trạng thái tường minh { done: boolean }
  router.patch('/tasks/:id', (req, res) => {
    try {
      const task = taskService.setTaskDone(req.params.id, req.body.done);
      res.json(task);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  });

  // 4. Xoá task
  router.delete('/tasks/:id', (req, res) => {
    try {
      const task = taskService.deleteTask(req.params.id);
      res.json(task);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createTaskRouter;
