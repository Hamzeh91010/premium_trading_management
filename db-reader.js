import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the SQLite database
const dbPath = join(__dirname, 'public', 'ForexSignals.db');

let db;

try {
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      db = null;
    } else {
      console.log('Connected to SQLite database:', dbPath);
    }
  });
} catch (error) {
  console.error('Error connecting to database:', error);
  db = null;
}

export function getAllSignals() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.log('Database not available, returning empty array');
      resolve([]);
      return;
    }

    try {
      const query = `
        SELECT * FROM all_signals 
        ORDER BY received_at DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying all_signals table:', err);
          resolve([]);
        } else {
          console.log(`Retrieved ${rows.length} signals from database`);
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error querying all_signals table:', error);
      resolve([]);
    }
  });
}

export function getActiveSignals() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.log('Database not available, returning empty array');
      resolve([]);
      return;
    }

    try {
      const query = `
        SELECT * FROM all_signals 
        WHERE is_status = 'processing' 
        ORDER BY received_at DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying active signals:', err);
          resolve([]);
        } else {
          console.log(`Retrieved ${rows.length} active signals from database`);
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error querying active signals:', error);
      resolve([]);
    }
  });
}

export function getRecentResults() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.log('Database not available, returning empty array');
      resolve([]);
      return;
    }

    try {
      const query = `
        SELECT * FROM all_signals 
        WHERE is_status = 'completed' 
        ORDER BY received_at DESC 
        LIMIT 10
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying recent results:', err);
          resolve([]);
        } else {
          console.log(`Retrieved ${rows.length} recent results from database`);
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error querying recent results:', error);
      resolve([]);
    }
  });
}

export function getTodayStats() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.log('Database not available, returning default stats');
      resolve([{ totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 }]);
      return;
    }

    try {
      const query = `
        SELECT 
          COUNT(*) as totalTrades,
          SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(COALESCE(total_profit, 0)) as totalProfit
        FROM all_signals 
        WHERE DATE(received_at) = DATE('now') AND is_status = 'completed'
      `;
      db.get(query, [], (err, row) => {
        if (err) {
          console.error('Error querying today stats:', err);
          resolve([{ totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 }]);
        } else {
          console.log('Retrieved today stats from database:', row);
          resolve([row]);
        }
      });
    } catch (error) {
      console.error('Error querying today stats:', error);
      resolve([{ totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 }]);
    }
  });
}

// Close database connection on process exit
process.on('exit', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
  process.exit(0);
});