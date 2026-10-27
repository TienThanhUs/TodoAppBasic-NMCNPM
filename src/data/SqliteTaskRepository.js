const Database = require('better-sqlite3');
const path = require('path');
const ITaskRepository = require('./ITaskRepository');

class SqliteTaskRepository extends ITaskRepository {
  constructor(dbPath) {
    super();
    const resolvedPath = dbPath || path.join(__dirname, '../../tasks.db');
    this.db = new Database(resolvedPath);
    this._initSchema();
  }

  _initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  getAll() {
    const rows = this.db.prepare('SELECT id, name, done FROM tasks ORDER BY created_at ASC').all();
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      done: Boolean(r.done)
    }));
  }

  getById(id) {
    const row = this.db.prepare('SELECT id, name, done FROM tasks WHERE id = ?').get(String(id));
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      done: Boolean(row.done)
    };
  }

  create(task) {
    const stmt = this.db.prepare('INSERT INTO tasks (id, name, done) VALUES (?, ?, ?)');
    stmt.run(String(task.id), String(task.name), task.done ? 1 : 0);
    return {
      id: String(task.id),
      name: String(task.name),
      done: Boolean(task.done)
    };
  }

  update(id, updates) {
    const existing = this.getById(id);
    if (!existing) return null;

    const newName = updates.name !== undefined ? updates.name : existing.name;
    const newDone = updates.done !== undefined ? updates.done : existing.done;

    const stmt = this.db.prepare('UPDATE tasks SET name = ?, done = ? WHERE id = ?');
    stmt.run(String(newName), newDone ? 1 : 0, String(id));

    return {
      id: String(id),
      name: newName,
      done: Boolean(newDone)
    };
  }

  delete(id) {
    const existing = this.getById(id);
    if (!existing) return null;

    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(String(id));
    return existing;
  }
}

module.exports = SqliteTaskRepository;
