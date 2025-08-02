import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the SQLite database
const dbPath = join(__dirname, 'public', 'ForexSignals.db');

let db;

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  console.log('Please ensure ForexSignals.db is in the public folder');
  db = null;
} else {
  console.log('Database file found at:', dbPath);
}
try {
  if (fs.existsSync(dbPath)) {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        db = null;
      } else {
        console.log('Connected to SQLite database:', dbPath);
        
        // Check what tables exist in the database
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
          if (err) {
            console.error('Error checking tables:', err);
          } else {
            console.log('Available tables:', tables.map(t => t.name));
          }
        });
      }
    });
  } else {
    if (err) {
      console.error('Error connecting to database:', err);
      db = null;
    } else {
      console.log('Connected to SQLite database:', dbPath);
    }
  }
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
      // First, let's check what tables and columns exist
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error('Error checking tables:', err);
          resolve([]);
          return;
        }
        
        console.log('Available tables:', tables.map(t => t.name));
        
        // Check if all_signals table exists, if not try other common table names
        const tableNames = tables.map(t => t.name);
        let tableName = 'all_signals';
        
        if (!tableNames.includes('all_signals')) {
          // Try common alternative table names
          const alternatives = ['signals', 'trading_signals', 'forex_signals', 'today_signals'];
          const foundTable = alternatives.find(name => tableNames.includes(name));
          if (foundTable) {
            tableName = foundTable;
            console.log(`Using table: ${tableName}`);
          } else {
            console.log('No suitable table found. Available tables:', tableNames);
            resolve([]);
            return;
          }
        }
        
        // Get column information for the table
        db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
          if (err) {
            console.error(`Error getting column info for ${tableName}:`, err);
            resolve([]);
            return;
          }
          
          console.log(`Columns in ${tableName}:`, columns.map(c => c.name));
          
          // Build query based on available columns
          const availableColumns = columns.map(c => c.name);
          const columnMapping = {
            'message_id': 'message_id',
            'channel_type': 'channel_type',
            'received_at': 'received_at',
            'pair': 'pair',
            'base_amount': 'base_amount',
            'entry_time': 'entry_time',
            'end_time': 'end_time',
            'martingale_times': 'martingale_times',
            'martingale_amounts': 'martingale_amounts',
            'direction': 'direction',
            'trade_duration': 'trade_duration',
            'is_otc': 'is_otc',
            'is_status': 'is_status',
            'result': 'trading_result',
            'payout_percent': 'payout_percent',
            'trade_level': 'trade_level',
            'total_profit': 'total_profit',
            'total_staked': 'total_staked',
            'raw_text': 'raw_text',
            'executed': 'is_executed'
          };
          
          // Build SELECT clause with available columns
          const selectColumns = Object.entries(columnMapping)
            .filter(([alias, column]) => availableColumns.includes(column))
            .map(([alias, column]) => `${column} as ${alias}`)
            .join(', ');
          
          if (!selectColumns) {
            console.log('No matching columns found');
            resolve([]);
            return;
          }
          
          const query = `SELECT ${selectColumns} FROM ${tableName} ORDER BY received_at DESC`;
          console.log('Executing query:', query);
          
          db.all(query, [], (err, rows) => {
            if (err) {
              console.error(`Error querying ${tableName} table:`, err);
              resolve([]);
            } else {
              // Transform the data to match expected format
              const transformedRows = rows.map(row => ({
                ...row,
                is_otc: Boolean(row.is_otc),
                executed: Boolean(row.executed),
                is_expired: row.is_status === 'expired',
                martingale_times: row.martingale_times ? 
                  (typeof row.martingale_times === 'string' ? 
                    JSON.parse(row.martingale_times) : row.martingale_times) : [],
                trade_count: row.trade_level || 1
              }));
              console.log(`Retrieved ${rows.length} signals from database`);
              resolve(transformedRows);
            }
          });
        });
      });
    } catch (error) {
      console.error('Error querying database:', error);
      resolve([]);
    }
  });
}
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