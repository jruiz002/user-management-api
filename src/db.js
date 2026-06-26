const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');
const logger = require('./logger');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');

if (dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

if (dbPath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

logger.info({ dbPath }, 'database ready');

module.exports = db;
