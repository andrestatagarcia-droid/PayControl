const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

let db;

// Database Initialization
(async () => {
  db = await open({
    filename: 'paycontrol.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      empresa TEXT,
      servicio TEXT,
      contrato TEXT,
      categoria TEXT,
      link TEXT,
      comments TEXT
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      balance REAL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      serviceName TEXT,
      empresa TEXT,
      contrato TEXT,
      categoria TEXT,
      date TEXT,
      amount REAL,
      reference TEXT,
      sourceId TEXT,
      isDebt INTEGER
    );
  `);

  app.listen(port, () => {
    console.log(`PayControl server running at http://localhost:${port}`);
  });
})();

// API Endpoints: Services
app.get('/api/services', async (req, res) => {
  const rows = await db.all('SELECT * FROM services');
  res.json(rows);
});

app.post('/api/services', async (req, res) => {
  const { id, empresa, servicio, contrato, categoria, link, comments } = req.body;
  await db.run('INSERT OR REPLACE INTO services (id, empresa, servicio, contrato, categoria, link, comments) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [id, empresa, servicio, contrato, categoria, link, comments]);
  res.status(201).json({ success: true });
});

app.delete('/api/services/:id', async (req, res) => {
  await db.run('DELETE FROM services WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// API Endpoints: Sources
app.get('/api/sources', async (req, res) => {
  const rows = await db.all('SELECT * FROM sources');
  res.json(rows);
});

app.post('/api/sources', async (req, res) => {
  const { id, name, type, balance } = req.body;
  await db.run('INSERT OR REPLACE INTO sources (id, name, type, balance) VALUES (?, ?, ?, ?)', 
    [id, name, type, balance]);
  res.status(201).json({ success: true });
});

app.delete('/api/sources/:id', async (req, res) => {
  await db.run('DELETE FROM sources WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// API Endpoints: Transactions
app.get('/api/transactions', async (req, res) => {
  const rows = await db.all('SELECT * FROM transactions');
  res.json(rows.map(r => ({...r, isDebt: !!r.isDebt})));
});

app.post('/api/transactions', async (req, res) => {
  const { id, serviceName, empresa, contrato, categoria, date, amount, reference, sourceId, isDebt } = req.body;
  await db.run('INSERT OR REPLACE INTO transactions (id, serviceName, empresa, contrato, categoria, date, amount, reference, sourceId, isDebt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [id, serviceName, empresa, contrato, categoria, date, amount, reference, sourceId, isDebt ? 1 : 0]);
  res.status(201).json({ success: true });
});

app.delete('/api/transactions/:id', async (req, res) => {
  await db.run('DELETE FROM transactions WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});
