// mobile/services/offline-sync.js
class OfflineSyncManager {
    constructor() {
      this.syncQueue = new Map();
      this.db = null;
      this.initializeDB();
    }
  
    async initializeDB() {
      this.db = await window.openDatabase({
        name: 'spa_offline_db',
        version: '1.0',
        description: 'Offline data storage for spa app'
      });
      
      await this.createTables();
    }
  
    async createTables() {
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          action TEXT,
          data TEXT,
          timestamp INTEGER
        )
      `);
    }
  
    async queueSync(action, data) {
      const syncId = Date.now().toString();
      await this.db.executeSql(`
        INSERT INTO sync_queue (id, action, data, timestamp)
        VALUES (?, ?, ?, ?)
      `, [syncId, action, JSON.stringify(data), Date.now()]);
    }
  
    async processSyncQueue() {
      const queue = await this.db.executeSql('SELECT * FROM sync_queue ORDER BY timestamp');
      
      for (const item of queue) {
        try {
          await this.syncItem(item);
          await this.db.executeSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        } catch (error) {
          console.error('Sync failed for item:', item, error);
        }
      }
    }
  }