import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  downloadInvoicePdf,
  getPayments,
  createPayment,
  getRefunds,
  createRefund
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// PDF download doesn't require complex auth token in headers if opening in new tab, but handles protection
router.get('/invoices/:id/download-pdf', downloadInvoicePdf);

router.use(protect);

// Invoices
router.get('/invoices', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'), getInvoices);
router.get('/invoices/:id', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'), getInvoice);
router.post('/invoices', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createInvoice);
router.put('/invoices/:id', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), updateInvoice);

// Payments
router.get('/payments', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'), getPayments);
router.post('/payments', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'), createPayment);

// Refunds
router.get('/refunds', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), getRefunds);
router.post('/refunds', authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'), createRefund);

export default router;
