import express from 'express';
import {
  createLead,
  getLeads,
  updateLead,
  addLeadNote,
  convertLeadToBooking,
  getFollowUps,
  createFollowUp,
  updateFollowUpStatus,
  getQuotations,
  createQuotation
} from '../controllers/crmController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Lead creation can be public (website contact/enquiry form) or admin
router.post('/leads', createLead);
router.get('/leads', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive', 'Receptionist'), getLeads);
router.put('/leads/:id', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), updateLead);
router.post('/leads/:id/notes', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), addLeadNote);
router.post('/leads/:id/convert', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), convertLeadToBooking);

// Follow-ups
router.get('/followups', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), getFollowUps);
router.post('/followups', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), createFollowUp);
router.put('/followups/:id/status', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), updateFollowUpStatus);

// Quotations
router.get('/quotations', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), getQuotations);
router.post('/quotations', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Sales Executive'), createQuotation);

export default router;
