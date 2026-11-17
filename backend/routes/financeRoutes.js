import express from 'express';
import {
  getVendors,
  createVendor,
  updateVendor,
  getVendorBills,
  createVendorBill,
  getPayouts,
  createPayout,
  updatePayoutStatus,
  getExpenses,
  createExpense,
  getExpenseCategories
} from '../controllers/financeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Vendors
router.get('/vendors', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), getVendors);
router.post('/vendors', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createVendor);
router.put('/vendors/:id', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), updateVendor);

// Vendor Bills
router.get('/vendor-bills', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), getVendorBills);
router.post('/vendor-bills', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createVendorBill);

// Payouts
router.get('/payouts', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), getPayouts);
router.post('/payouts', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createPayout);
router.put('/payouts/:id/status', authorize('Super Admin', 'Administrator', 'Manager'), updatePayoutStatus);

// Expenses
router.get('/expenses', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), getExpenses);
router.post('/expenses', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createExpense);
router.get('/expense-categories', getExpenseCategories);

export default router;
