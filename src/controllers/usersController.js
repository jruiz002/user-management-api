const db = require('../db');
const { validateCreateUser } = require('../validators/userValidator');

function createUser(req, res, next) {
  const { valid, errors } = validateCreateUser(req.body || {});
  if (!valid) {
    return res.status(400).json({ error: 'validation_error', details: errors });
  }

  const { name, email } = req.body;

  try {
    const result = db
      .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      .run(name.trim(), email.trim().toLowerCase());

    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'email_already_exists' });
    }
    return next(err);
  }
}

function listUsers(req, res, next) {
  try {
    const users = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY id').all();
    return res.status(200).json(users);
  } catch (err) {
    return next(err);
  }
}

function getUserById(req, res, next) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'invalid_id' });
  }

  try {
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(id);

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createUser, listUsers, getUserById };
