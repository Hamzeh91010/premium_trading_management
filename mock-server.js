import express from 'express';
import cors from 'cors';
import { getAllSignals, getActiveSignals, getRecentResults, getTodayStats } from './db-reader.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API endpoints using real database data
app.post('/api/signals/active', async (req, res) => {
  try {
    console.log('Active signals request:', req.body);
    const results = await getActiveSignals();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching active signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signals/recent', async (req, res) => {
  try {
    console.log('Recent signals request:', req.body);
    const results = await getRecentResults();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching recent results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signals/all', async (req, res) => {
  try {
    console.log('All signals request:', req.body);
    const results = await getAllSignals();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching all signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signals/today-stats', async (req, res) => {
  try {
    console.log('Today stats request:', req.body);
    const results = await getTodayStats();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching today stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoints as well for easier testing
app.get('/api/signals/active', async (req, res) => {
  try {
    const results = await getActiveSignals();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching active signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/signals/recent', async (req, res) => {
  try {
    const results = await getRecentResults();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching recent results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/signals/all', async (req, res) => {
  try {
    const results = await getAllSignals();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching all signals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/signals/today-stats', async (req, res) => {
  try {
    const results = await getTodayStats();
    res.json({ results });
  } catch (error) {
    console.error('Error fetching today stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Using real SQLite database data from ForexSignals.db');
});