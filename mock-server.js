import express from 'express';
import cors from 'cors';
import { getAllSignals, getActiveSignals, getRecentResults, getTodayStats } from './db-reader.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API endpoints using real database data
app.post('/api/signals/active', (req, res) => {
  console.log('Active signals request:', req.body);
  const results = getActiveSignals();
  res.json({ results });
});

app.post('/api/signals/recent', (req, res) => {
  console.log('Recent signals request:', req.body);
  const results = getRecentResults();
  res.json({ results });
});

app.post('/api/signals/all', (req, res) => {
  console.log('All signals request:', req.body);
  const results = getAllSignals();
  res.json({ results });
});

app.post('/api/signals/today-stats', (req, res) => {
  console.log('Today stats request:', req.body);
  const results = getTodayStats();
  res.json({ results });
});

// GET endpoints as well for easier testing
app.get('/api/signals/active', (req, res) => {
  const results = getActiveSignals();
  res.json({ results });
});

app.get('/api/signals/recent', (req, res) => {
  const results = getRecentResults();
  res.json({ results });
});

app.get('/api/signals/all', (req, res) => {
  const results = getAllSignals();
  res.json({ results });
});

app.get('/api/signals/today-stats', (req, res) => {
  const results = getTodayStats();
  res.json({ results });
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Using real SQLite database data from ForexSignals.db');
});