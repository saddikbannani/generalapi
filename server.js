const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(':memory:'); // Use ':memory:' for in-memory database or provide a file path

// Create some tables and insert sample data for demonstration
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  db.run('CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT)');
  db.run('INSERT INTO users (name) VALUES (?)', ['Alice']);
  db.run('INSERT INTO products (name) VALUES (?)', ['Laptop']);
});

// General GET route for all tables
app.get('/api/:table', (req, res) => {
  const tableName = req.params.table;
  db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// General POST route for all tables
app.post('/api/:table', (req, res) => {
  const tableName = req.params.table;
  const columns = Object.keys(req.body).join(', ');
  const placeholders = Object.keys(req.body).map(() => '?').join(', ');
  const values = Object.values(req.body);

  db.run(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID });
    }
  });
});

// General GET by ID route for all tables
app.get('/api/:table/:id', (req, res) => {
  const tableName = req.params.table;
  const id = req.params.id;

  db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  });
});

// General PUT route for all tables
app.put('/api/:table/:id', (req, res) => {
  const tableName = req.params.table;
  const id = req.params.id;
  const columns = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(req.body), id];

  db.run(`UPDATE ${tableName} SET ${columns} WHERE id = ?`, values, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes > 0) {
      res.json({ message: 'Record updated successfully' });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  });
});

// General DELETE route for all tables
app.delete('/api/:table/:id', (req, res) => {
  const tableName = req.params.table;
  const id = req.params.id;

  db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes > 0) {
      res.json({ message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Record not found' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
