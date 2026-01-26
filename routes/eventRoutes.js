const express = require('express');
const router = express.Router();

// ERROR FIX: 'deleteEvent' eka methana import karanna ona!
const { createEvent, getEvents, joinCrew, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.post('/join-crew', protect, joinCrew);
router.delete('/:id', protect, admin, deleteEvent); // Dan meka wada karai

module.exports = router;