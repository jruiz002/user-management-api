const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'Esta bien', uptime: process.uptime() });
});

module.exports = router;
