const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. Admin Login
const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create New Admin (Super Admin Only)
const registerUser = async (req, res) => {
    const { username, password, role, telegramChatId } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if(userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            username,
            email: `${username}@darkconsole.local`, // Dummy email
            password,
            role: role || 'admin',
            telegramChatId
        });

        if(user) {
            res.status(201).json({ message: "Admin Created Successfully" });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get All Admins (For Assign Pool) <--- MEKA THAMA MISSED WELA THIBBE
const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Get All Users (For User Management)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Delete User
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User Removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Update User
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            user.username = req.body.username || user.username;
            user.role = req.body.role || user.role;
            user.telegramChatId = req.body.telegramChatId || user.telegramChatId;
            if(req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// IMPORTANT: Export ALL functions
module.exports = { 
    adminLogin, 
    registerUser, 
    getAllAdmins, // Make sure this is included
    getUsers, 
    deleteUser, 
    updateUser 
};