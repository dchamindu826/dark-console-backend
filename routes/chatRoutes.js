const express = require('express');
const router = express.Router();
const { getChats } = require('../controllers/chatController');

router.get('/:room', getChats);

module.exports = router;