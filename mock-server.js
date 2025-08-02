import express from 'express';
import cors from 'cors';
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock data that matches the all_signals table structure
const mockAllSignals = [
  {
    pair: 'EUR/USD OTC',
    entry_time: '09:15',
    direction: 'BUY',
    trade_duration: '1 minutes',
    is_otc: true,
    is_expired: true,
    received_at: '2024-01-26 09:14:30',
    result: 'win',
    message_id: 1001,
    raw_text: 'EUR/USD OTC\n⏰ 09:15\n🔴 PUT\n⏱ 1 minutes',
    martingale_times: ['09:15', '09:16'],
    executed: true,
    end_time: '09:16',
    payout_percent: '+85%',
    total_profit: 17.50,
    total_staked: 20.00,
    base_amount: 10.00,
    trade_count: 2
  },
  {
    pair: 'GBP/JPY',
    entry_time: '10:30',
    direction: 'SELL',
    trade_duration: '1 minutes',
    is_otc: false,
    is_expired: true,
    received_at: '2024-01-26 10:29:45',
    result: 'loss',
    message_id: 1002,
    raw_text: 'GBP/JPY\n⏰ 10:30\n🟢 CALL\n⏱ 1 minutes',
    martingale_times: ['10:30'],
    executed: true,
    end_time: '10:31',
    payout_percent: '+82%',
    total_profit: -10.00,
    total_staked: 10.00,
    base_amount: 10.00,
    trade_count: 1
  },
  {
    pair: 'USD/CAD OTC',
    entry_time: '11:45',
    direction: 'BUY',
    trade_duration: '3 minutes',
    is_otc: true,
    is_expired: true,
    received_at: '2024-01-26 11:44:20',
    result: 'win',
    message_id: 1003,
    raw_text: 'USD/CAD OTC\n⏰ 11:45\n🟢 CALL\n⏱ 3 minutes',
    martingale_times: ['11:45'],
    executed: true,
    end_time: '11:48',
    payout_percent: '+90%',
    total_profit: 27.00,
    total_staked: 30.00,
    base_amount: 30.00,
    trade_count: 1
  },
  {
    pair: 'AUD/USD',
    entry_time: '12:20',
    direction: 'SELL',
    trade_duration: '1 minutes',
    is_otc: false,
    is_expired: true,
    received_at: '2024-01-26 12:19:15',
    result: 'loss',
    message_id: 1004,
    raw_text: 'AUD/USD\n⏰ 12:20\n🔴 PUT\n⏱ 1 minutes',
    martingale_times: ['12:20', '12:21', '12:22'],
    executed: true,
    end_time: '12:23',
    payout_percent: '+88%',
    total_profit: -70.00,
    total_staked: 70.00,
    base_amount: 10.00,
    trade_count: 3
  },
  {
    pair: 'EUR/GBP OTC',
    entry_time: '13:10',
    direction: 'BUY',
    trade_duration: '5 minutes',
    is_otc: true,
    is_expired: false,
    received_at: '2024-01-26 13:09:30',
    result: null,
    message_id: 1005,
    raw_text: 'EUR/GBP OTC\n⏰ 13:10\n🟢 CALL\n⏱ 5 minutes',
    martingale_times: ['13:10'],
    executed: false,
    end_time: null,
    payout_percent: null,
    total_profit: null,
    total_staked: null,
    base_amount: 15.00,
    trade_count: 1
  },
  {
    pair: 'CHF/JPY',
    entry_time: '14:05',
    direction: 'SELL',
    trade_duration: '1 minutes',
    is_otc: false,
    is_expired: true,
    received_at: '2024-01-26 14:04:45',
    result: 'win',
    message_id: 1006,
    raw_text: 'CHF/JPY\n⏰ 14:05\n🔴 PUT\n⏱ 1 minutes',
    martingale_times: ['14:05', '14:06'],
    executed: true,
    end_time: '14:07',
    payout_percent: '+87%',
    total_profit: 34.80,
    total_staked: 30.00,
    base_amount: 10.00,
    trade_count: 2
  },
  {
    pair: 'NZD/USD OTC',
    entry_time: '15:30',
    direction: 'BUY',
    trade_duration: '1 minutes',
    is_otc: true,
    is_expired: true,
    received_at: '2024-01-26 15:29:20',
    result: 'win',
    message_id: 1007,
    raw_text: 'NZD/USD OTC\n⏰ 15:30\n🟢 CALL\n⏱ 1 minutes',
    martingale_times: ['15:30'],
    executed: true,
    end_time: '15:31',
    payout_percent: '+83%',
    total_profit: 12.45,
    total_staked: 15.00,
    base_amount: 15.00,
    trade_count: 1
  },
  {
    pair: 'USD/JPY',
    entry_time: '16:15',
    direction: 'SELL',
    trade_duration: '3 minutes',
    is_otc: false,
    is_expired: true,
    received_at: '2024-01-26 16:14:10',
    result: 'loss',
    message_id: 1008,
    raw_text: 'USD/JPY\n⏰ 16:15\n🔴 PUT\n⏱ 3 minutes',
    martingale_times: ['16:15', '16:18'],
    executed: true,
    end_time: '16:21',
    payout_percent: '+91%',
    total_profit: -30.00,
    total_staked: 30.00,
    base_amount: 10.00,
    trade_count: 2
  }
];

// Filter functions
const getActiveSignals = () => mockAllSignals.filter(s => !s.is_expired && !s.executed);
const getCompletedSignals = () => mockAllSignals.filter(s => s.executed && s.result !== null);

// API endpoints
app.post('/api/signals/active', (req, res) => {
  console.log('Active signals request:', req.body);
  res.json({ results: getActiveSignals() });
});

app.post('/api/signals/recent', (req, res) => {
  console.log('Recent signals request:', req.body);
  res.json({ results: getCompletedSignals().slice(0, 10) });
});

app.post('/api/signals/all', (req, res) => {
  console.log('All signals request:', req.body);
  res.json({ results: mockAllSignals });
});

app.post('/api/signals/today-stats', (req, res) => {
  console.log('Today stats request:', req.body);
  const completedSignals = getCompletedSignals();
  const wins = completedSignals.filter(s => s.result === 'win').length;
  const losses = completedSignals.filter(s => s.result === 'loss').length;
  const totalTrades = wins + losses;
  const totalProfit = completedSignals.reduce((sum, s) => sum + (s.total_profit || 0), 0);
  
  res.json({ 
    results: [{
      totalTrades,
      wins,
      losses,
      totalProfit
    }]
  });
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});