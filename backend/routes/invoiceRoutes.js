import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  downloadInvoicePdf
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// PDF Download endpoint
router.get('/:id/download-pdf', downloadInvoicePdf);

// Protected CRUD invoice endpoints
router.use(protect);

router.get(
  '/',
  authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'),
  getInvoices
);

router.get(
  '/:id',
  authorize('Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'),
  getInvoice
);

router.post(
  '/',
  authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'),
  createInvoice
);

router.put(
  '/:id',
  authorize('Super Admin', 'Administrator', 'Manager', 'Accountant'),
  updateInvoice
);

export default router;
