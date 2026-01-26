const express = require('express');
const router = express.Router();
const { 
    adminLogin, 
    registerUser, 
    getAllAdmins, 
    getUsers, 
    deleteUser, 
    updateUser 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/admin-login', adminLogin);
router.post('/register', protect, admin, registerUser);
router.get('/admins', protect, getAllAdmins); // For Assign Pool
router.get('/users', protect, admin, getUsers); // For User Mgmt
router.route('/:id').delete(protect, admin, deleteUser).put(protect, admin, updateUser);

module.exports = router;