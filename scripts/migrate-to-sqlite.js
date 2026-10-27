const fs = require('fs');
const path = require('path');
const SqliteTaskRepository = require('../src/data/SqliteTaskRepository');

function migrateTasksJsonToSqlite(jsonFilePath, dbFilePath) {
  const jsonPath = jsonFilePath || path.join(__dirname, '../tasks.json');
  const repo = new SqliteTaskRepository(dbFilePath);

  if (!fs.existsSync(jsonPath)) {
    console.log(`[Migration] Không tìm thấy file "${jsonPath}". Không có dữ liệu để chuyển.`);
    return { migrated: 0, skipped: 0, total: 0 };
  }

  let tasks = [];
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    tasks = JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[Migration] Lỗi đọc tasks.json:', err.message);
    return { migrated: 0, skipped: 0, total: 0, error: err.message };
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.log('[Migration] tasks.json rỗng hoặc không có task nào.');
    return { migrated: 0, skipped: 0, total: 0 };
  }

  let migratedCount = 0;
  let skippedCount = 0;

  // Sử dụng transaction để insert nhanh và an toàn
  const insertStmt = repo.db.prepare(`
    INSERT OR IGNORE INTO tasks (id, name, done)
    VALUES (?, ?, ?)
  `);

  const runMigration = repo.db.transaction((items) => {
    for (const t of items) {
      if (!t.id || !t.name) continue;
      const result = insertStmt.run(String(t.id), String(t.name), t.done ? 1 : 0);
      if (result.changes > 0) {
        migratedCount++;
      } else {
        skippedCount++;
      }
    }
  });

  runMigration(tasks);

  console.log(`[Migration] Hoàn tất: Chuyển mới ${migratedCount} task, bỏ qua ${skippedCount} task đã tồn tại. Tổng số trong file: ${tasks.length}`);
  return { migrated: migratedCount, skipped: skippedCount, total: tasks.length };
}

// Nếu chạy trực tiếp từ dòng lệnh: node scripts/migrate-to-sqlite.js
if (require.main === module) {
  migrateTasksJsonToSqlite();
}

module.exports = migrateTasksJsonToSqlite;
