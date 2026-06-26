const express = require('express');
const { createUser, listUsers, getUserById } = require('../controllers/usersController');

const router = express.Router();

router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUserById);

module.exports = router;
