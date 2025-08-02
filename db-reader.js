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
        SELECT 
          message_id,
          channel_type,
          received_at,
          pair,
          base_amount,
          entry_time,
          end_time,
          martingale_times,
          martingale_amounts,
          direction,
          trade_duration,
          is_otc,
          is_status,
          trading_result as result,
          payout_percent,
          trade_level,
          total_profit,
          total_staked,
          raw_text,
          is_executed as executed
        FROM all_signals 
        ORDER BY received_at DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying all_signals table:', err);
          resolve([]);
        } else {
          // Transform the data to match expected format
          const transformedRows = rows.map(row => ({
            ...row,
            is_otc: Boolean(row.is_otc),
            executed: Boolean(row.executed),
            is_expired: row.is_status === 'expired',
            martingale_times: row.martingale_times ? JSON.parse(row.martingale_times) : [],
            trade_count: row.trade_level || 1
          }));
          console.log(`Retrieved ${rows.length} signals from database`);
          resolve(transformedRows);
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
        SELECT 
          message_id,
          channel_type,
          received_at,
          pair,
          base_amount,
          entry_time,
          end_time,
          martingale_times,
          martingale_amounts,
          direction,
          trade_duration,
          is_otc,
          is_status,
          trading_result as result,
          payout_percent,
          trade_level,
          total_profit,
          total_staked,
          raw_text,
          is_executed as executed
        FROM all_signals 
        WHERE is_status IN ('processing', 'pending') 
        ORDER BY received_at DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying active signals:', err);
          resolve([]);
        } else {
          // Transform the data to match expected format
          const transformedRows = rows.map(row => ({
            ...row,
            is_otc: Boolean(row.is_otc),
            executed: Boolean(row.executed),
            is_expired: row.is_status === 'expired',
            martingale_times: row.martingale_times ? JSON.parse(row.martingale_times) : [],
            trade_count: row.trade_level || 1
          }));
          console.log(`Retrieved ${rows.length} active signals from database`);
          resolve(transformedRows);
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
        SELECT 
          message_id,
          channel_type,
          received_at,
          pair,
          base_amount,
          entry_time,
          end_time,
          martingale_times,
          martingale_amounts,
          direction,
          trade_duration,
          is_otc,
          is_status,
          trading_result as result,
          payout_percent,
          trade_level,
          total_profit,
          total_staked,
          raw_text,
          is_executed as executed
        FROM all_signals 
        WHERE is_status = 'completed' AND trading_result IS NOT NULL
        ORDER BY received_at DESC 
        LIMIT 10
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying recent results:', err);
          resolve([]);
        } else {
          // Transform the data to match expected format
          const transformedRows = rows.map(row => ({
            ...row,
            is_otc: Boolean(row.is_otc),
            executed: Boolean(row.executed),
            is_expired: row.is_status === 'expired',
            martingale_times: row.martingale_times ? JSON.parse(row.martingale_times) : [],
            trade_count: row.trade_level || 1
          }));
          console.log(`Retrieved ${rows.length} recent results from database`);
          resolve(transformedRows);
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
          SUM(CASE WHEN trading_result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN trading_result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(COALESCE(total_profit, 0)) as totalProfit
        FROM all_signals 
        WHERE DATE(received_at) = DATE('now') AND is_status = 'completed' AND trading_result IS NOT NULL
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