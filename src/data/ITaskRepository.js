/**
 * ITaskRepository interface (hợp đồng quy định các thao tác dữ liệu)
 * Mọi nguồn lưu trữ (JSON, SQLite, MongoDB...) đều phải tuân theo giao ước này.
 *
 * @interface ITaskRepository
 * - getAll(): Task[]
 * - getById(id: string): Task | null
 * - create(task: { id: string, name: string, done: boolean }): Task
 * - update(id: string, updates: { name?: string, done?: boolean }): Task | null
 * - delete(id: string): Task | null
 */

class ITaskRepository {
  getAll() {
    throw new Error('Chưa cài đặt phương thức getAll()');
  }
  getById(id) {
    throw new Error('Chưa cài đặt phương thức getById()');
  }
  create(task) {
    throw new Error('Chưa cài đặt phương thức create()');
  }
  update(id, updates) {
    throw new Error('Chưa cài đặt phương thức update()');
  }
  delete(id) {
    throw new Error('Chưa cài đặt phương thức delete()');
  }
}

module.exports = ITaskRepository;
