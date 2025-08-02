const Database = require('sqlite3').Database;
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'ForexSignals.db');

const db = new Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create the all_signals table with the correct schema
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS all_signals (
    message_id INTEGER PRIMARY KEY,
    channel_type TEXT,
    received_at TEXT,
    pair TEXT,
    base_amount REAL,
    entry_time TEXT,
    end_time TEXT,
    martingale_times TEXT,
    martingale_amounts REAL,
    is_available_martingale_level INTEGER DEFAULT 3,
    direction TEXT,
    trade_duration TEXT,
    is_otc INTEGER,
    is_status TEXT,
    trading_result TEXT,
    payout_percent REAL,
    trade_level INTEGER,
    total_profit REAL,
    total_staked REAL,
    raw_text TEXT,
    is_executed INTEGER
  )
`;

// Create tables
db.serialize(() => {
  // Create all_signals table
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating all_signals table:', err);
    } else {
      console.log('all_signals table created successfully');
    }
  });

  // Insert sample data
  const insertSQL = `INSERT INTO all_signals (
    message_id, channel_type, received_at, pair, base_amount, entry_time, end_time,
    martingale_times, martingale_amounts, direction, trade_duration, is_otc, is_status,
    trading_result, payout_percent, trade_level, total_profit, total_staked, raw_text, is_executed
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const sampleData = [
    [
      1001, 'whatsapp', '2025-01-08 10:30:00', 'EUR/USD OTC', 10.0, '10:32', '10:33',
      '["10:33", "10:34", "10:35"]', 21.74, 'BUY', '1 minute', 1, 'completed',
      'win', 85.0, 1, 8.5, 10.0, '🇪🇺 EUR/USD 🇺🇸 OTC\n🕘 תוקף 1M\n⏺️ כניסה בשעה 10:32\n🟩 קנייה', 1
    ],
    [
      1002, 'primary', '2025-01-08 11:15:00', 'GBP/JPY OTC', 15.0, '11:17', '11:18',
      '["11:18", "11:19", "11:20"]', 32.61, 'SELL', '1 minute', 1, 'completed',
      'loss', 85.0, 1, -15.0, 15.0, '🇬🇧 GBP/JPY 🇯🇵 OTC\n🕘 תוקף 1M\n⏺️ כניסה בשעה 11:17\n🟥 מכירה', 1
    ],
    [
      1003, 'whatsapp', '2025-01-08 12:00:00', 'USD/CAD OTC', 20.0, '12:02', '12:07',
      '["12:07", "12:12", "12:17"]', 43.48, 'BUY', '5 minutes', 1, 'completed',
      'win', 80.0, 1, 16.0, 20.0, '🇺🇸 USD/CAD 🇨🇦 OTC\n🕘 תוקף 5M\n⏺️ כניסה בשעה 12:02\n🟩 קנייה', 1
    ],
    [
      1004, 'primary', '2025-01-08 13:30:00', 'AUD/USD OTC', 12.0, '13:32', '',
      '["13:33", "13:34", "13:35"]', 26.09, 'SELL', '1 minute', 1, 'processing',
      null, 85.0, 1, 0, 0, '🇦🇺 AUD/USD 🇺🇸 OTC\n🕘 תוקף 1M\n⏺️ כניסה בשעה 13:32\n🟥 מכירה', 0
    ],
    [
      1005, 'whatsapp', '2025-01-08 14:45:00', 'NZD/USD OTC', 25.0, '14:47', '',
      '["14:48", "14:49", "14:50"]', 54.35, 'BUY', '1 minute', 1, 'pending',
      null, 85.0, 1, 0, 0, '🇳🇿 NZD/USD OTC\n🕘 תוקף 1M\n⏺️ כניסה בשעה 14:47\n🟩 קנייה', 0
    ]
  ];

  sampleData.forEach((data, index) => {
    db.run(insertSQL, data, (err) => {
      if (err) {
        console.error(`Error inserting sample data ${index + 1}:`, err);
      } else {
        console.log(`Sample data ${index + 1} inserted successfully`);
      }
    });
  });

  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
});