import express from 'express';
import { login, getMe, getUsers, createUser, updateUser, getAuditLogs, resetAllOperationalData } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

// Staff management (matches /api/staff as well as /api/auth/staff)
router.get('/', protect, authorize('Super Admin', 'Administrator', 'Manager'), getUsers);
router.get('/staff', protect, authorize('Super Admin', 'Administrator', 'Manager'), getUsers);
router.post('/', protect, authorize('Super Admin', 'Administrator'), createUser);
router.post('/staff', protect, authorize('Super Admin', 'Administrator'), createUser);
router.put('/:id', protect, authorize('Super Admin', 'Administrator'), updateUser);
router.put('/staff/:id', protect, authorize('Super Admin', 'Administrator'), updateUser);
router.get('/audit-logs', protect, authorize('Super Admin', 'Administrator'), getAuditLogs);

// System wipe utility: delete all operational data while preserving login credentials
router.post('/reset-all-data', protect, authorize('Super Admin'), resetAllOperationalData);

export default router;
