import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the SQLite database
const dbPath = join(__dirname, 'public', 'ForexSignals.db');

let db;

try {
  db = new Database(dbPath, { readonly: true });
  console.log('Connected to SQLite database:', dbPath);
} catch (error) {
  console.error('Error connecting to database:', error);
  db = null;
}

export function getAllSignals() {
  if (!db) {
    console.log('Database not available, returning empty array');
    return [];
  }

  try {
    const stmt = db.prepare(`
      SELECT * FROM all_signals 
      ORDER BY received_at DESC
    `);
    const results = stmt.all();
    console.log(`Retrieved ${results.length} signals from database`);
    return results;
  } catch (error) {
    console.error('Error querying all_signals table:', error);
    return [];
  }
}

export function getActiveSignals() {
  if (!db) {
    console.log('Database not available, returning empty array');
    return [];
  }

  try {
    const stmt = db.prepare(`
      SELECT * FROM all_signals 
      WHERE is_status = 'processing' 
      ORDER BY received_at DESC
    `);
    const results = stmt.all();
    console.log(`Retrieved ${results.length} active signals from database`);
    return results;
  } catch (error) {
    console.error('Error querying active signals:', error);
    return [];
  }
}

export function getRecentResults() {
  if (!db) {
    console.log('Database not available, returning empty array');
    return [];
  }

  try {
    const stmt = db.prepare(`
      SELECT * FROM all_signals 
      WHERE is_status = 'completed' 
      ORDER BY received_at DESC 
      LIMIT 10
    `);
    const results = stmt.all();
    console.log(`Retrieved ${results.length} recent results from database`);
    return results;
  } catch (error) {
    console.error('Error querying recent results:', error);
    return [];
  }
}

export function getTodayStats() {
  if (!db) {
    console.log('Database not available, returning default stats');
    return [{ totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 }];
  }

  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as totalTrades,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
        SUM(COALESCE(total_profit, 0)) as totalProfit
      FROM all_signals 
      WHERE DATE(received_at) = DATE('now') AND is_status = 'completed'
    `);
    const result = stmt.get();
    console.log('Retrieved today stats from database:', result);
    return [result];
  } catch (error) {
    console.error('Error querying today stats:', error);
    return [{ totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 }];
  }
}

// Close database connection on process exit
process.on('exit', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
  process.exit(0);
});