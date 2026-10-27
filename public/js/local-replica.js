/**
 * LocalReplica - Bản sao task cục bộ của mỗi peer (V4)
 * Lưu trong localStorage của trình duyệt. Mọi thay đổi ở chế độ P2P được áp dụng
 * dưới dạng "thao tác" (op) giống nhau ở cả 2 peer: create / update / delete.
 * Mỗi task có updatedAt để khi ghép 2 bản sao, bản sửa sau thắng (last-write-wins).
 */
(function () {
  const STORAGE_KEY = 'v4-local-replica';

  class LocalReplica {
    constructor() {
      this.tasks = this._load();
    }

    _load() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch (err) { return []; }
    }

    _save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks)); }
      catch (err) { /* trình duyệt chặn storage: vẫn chạy trong bộ nhớ */ }
    }

    getAll() {
      return this.tasks.map(t => ({ ...t }));
    }

    // Khi còn server: chụp lại dữ liệu server làm điểm xuất phát cho chế độ P2P
    replaceAll(tasks) {
      const known = new Map(this.tasks.map(t => [t.id, t]));
      this.tasks = tasks.map(t => ({
        id: t.id, name: t.name, done: !!t.done,
        updatedAt: (known.get(t.id) && known.get(t.id).updatedAt) || 0
      }));
      this._save();
    }

    // Áp dụng 1 thao tác (từ chính mình hoặc từ peer). Trả về true nếu dữ liệu đổi.
    apply(op) {
      if (op.type === 'create') {
        if (this.tasks.some(t => t.id === op.task.id)) return false;
        this.tasks.push({ ...op.task });
      } else if (op.type === 'update') {
        const task = this.tasks.find(t => t.id === op.id);
        if (!task || op.updatedAt < (task.updatedAt || 0)) return false;
        task.done = op.done;
        task.updatedAt = op.updatedAt;
      } else if (op.type === 'delete') {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter(t => t.id !== op.id);
        if (this.tasks.length === before) return false;
      } else {
        return false;
      }
      this._save();
      return true;
    }

    // Ghép bản sao của peer khi vừa kết nối: hợp theo id, trùng id thì bản sửa sau thắng.
    // Giới hạn: không có "tombstone" nên task đã xoá trước khi kết nối có thể quay lại.
    merge(remoteTasks) {
      const byId = new Map(this.tasks.map(t => [t.id, t]));
      for (const r of remoteTasks) {
        const mine = byId.get(r.id);
        if (!mine || (r.updatedAt || 0) > (mine.updatedAt || 0)) byId.set(r.id, { ...r });
      }
      this.tasks = Array.from(byId.values());
      this._save();
    }
  }

  window.LocalReplica = LocalReplica;
})();
