const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminStats,
} = require('../controllers/adminController');

// Protect all admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all users
router.get('/users', getAllUsers);

// Update user role
router.patch('/users/:userId/role', updateUserRole);

// Delete user
router.delete('/users/:userId', deleteUser);

// Get user statistics
router.get('/stats', getAdminStats);

module.exports = router;
