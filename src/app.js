const express = require('express');
const logger = require('./logger');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      },
      'request completed'
    );
  });
  next();
});

app.use('/health', healthRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use(errorHandler);

module.exports = app;
