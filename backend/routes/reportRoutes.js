import express from 'express';
import { getDashboardStats, exportReportExcel } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard-stats', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist', 'Sales Executive'), getDashboardStats);
router.get('/export-excel', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), exportReportExcel);

export default router;
