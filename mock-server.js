import express from 'express';
import cors from 'cors';
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock data that matches your database schema
const mockActiveSignals = [
  {
    id: 1,
    pair: 'AED/CNY OTC',
    direction: 'BUY',
    entry_time: '16:41',
    trade_duration: '1 minutes',
    is_status: 'processing',
    received_at: new Date().toISOString(),
    trade_count: 1
  },
  {
    id: 2,
    pair: 'AUD/CAD',
    direction: 'SELL',
    entry_time: '16:57',
    trade_duration: '1 minutes',
    is_status: 'processing',
    received_at: new Date().toISOString(),
    trade_count: 1
  }
];

const mockCompletedSignals = [
  {
    id: 3,
    pair: 'EUR/JPY OTC',
    direction: 'BUY',
    entry_time: '17:50',
    trade_duration: '1 minutes',
    is_status: 'completed',
    result: 'win',
    total_profit: 9.19,
    payout_percent: '+72%',
    received_at: new Date(Date.now() - 300000).toISOString(),
    executed: true,
    trade_count: 1
  },
  {
    id: 4,
    pair: 'AUD/JPY OTC',
    direction: 'BUY',
    entry_time: '17:36',
    trade_duration: '1 minutes',
    is_status: 'completed',
    result: 'win',
    total_profit: 10.00,
    payout_percent: '+90%',
    received_at: new Date(Date.now() - 600000).toISOString(),
    executed: true,
    trade_count: 1
  },
  {
    id: 5,
    pair: 'USD/CAD OTC',
    direction: 'SELL',
    entry_time: '17:24',
    trade_duration: '1 minutes',
    is_status: 'completed',
    result: 'loss',
    total_profit: -173.89,
    payout_percent: '+92%',
    received_at: new Date(Date.now() - 900000).toISOString(),
    executed: true,
    trade_count: 1
  }
];

// API endpoints
app.post('/api/signals/active', (req, res) => {
  console.log('Active signals request:', req.body);
  res.json({ results: mockActiveSignals });
});

app.post('/api/signals/recent', (req, res) => {
  console.log('Recent signals request:', req.body);
  res.json({ results: mockCompletedSignals.slice(0, 10) });
});

app.post('/api/signals/all', (req, res) => {
  console.log('All signals request:', req.body);
  res.json({ results: mockCompletedSignals });
});

app.post('/api/signals/today-stats', (req, res) => {
  console.log('Today stats request:', req.body);
  const wins = mockCompletedSignals.filter(s => s.result === 'win').length;
  const losses = mockCompletedSignals.filter(s => s.result === 'loss').length;
  const totalTrades = wins + losses;
  const totalProfit = mockCompletedSignals.reduce((sum, s) => sum + (s.total_profit || 0), 0);
  
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