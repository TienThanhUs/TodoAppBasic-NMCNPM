const crypto = require('crypto');

/**
 * TaskService - Tầng nghiệp vụ (Business Logic)
 * Chứa toàn bộ quy tắc nghiệp vụ: kiểm tra tên, khởi tạo id/done, đổi trạng thái, xoá task.
 * HOÀN TOÀN ĐỘC LẬP: Không biết gì về Express, HTTP, giao diện Kanban hay SQLite.
 */
class TaskService {
  constructor(taskRepository) {
    if (!taskRepository) {
      throw new Error('TaskService yêu cầu một taskRepository');
    }
    this.taskRepository = taskRepository;
  }

  // Lấy tất cả task
  getAllTasks() {
    return this.taskRepository.getAll();
  }

  // Tạo task mới có tên
  createTask(name) {
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      const error = new Error('Tên công việc không được để trống!');
      error.statusCode = 400;
      throw error;
    }

    const newTask = {
      id: crypto.randomUUID(),
      name: trimmedName,
      done: false
    };

    return this.taskRepository.create(newTask);
  }

  // Đổi trạng thái task (đảo ngược trạng thái)
  toggleTaskStatus(id) {
    const existing = this.taskRepository.getById(id);
    if (!existing) {
      const error = new Error('Không tìm thấy công việc!');
      error.statusCode = 404;
      throw error;
    }

    return this.taskRepository.update(id, { done: !existing.done });
  }

  // Đặt trạng thái tường minh (idempotent, an toàn cho nhiều client)
  setTaskDone(id, done) {
    if (typeof done !== 'boolean') {
      const error = new Error('Trường done phải là true hoặc false!');
      error.statusCode = 400;
      throw error;
    }

    const existing = this.taskRepository.getById(id);
    if (!existing) {
      const error = new Error('Không tìm thấy công việc!');
      error.statusCode = 404;
      throw error;
    }

    return this.taskRepository.update(id, { done });
  }

  // Xoá task
  deleteTask(id) {
    const deleted = this.taskRepository.delete(id);
    if (!deleted) {
      const error = new Error('Không tìm thấy công việc!');
      error.statusCode = 404;
      throw error;
    }
    return deleted;
  }
}

module.exports = TaskService;
