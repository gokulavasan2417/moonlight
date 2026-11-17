import express from 'express';
import {
  checkAvailability,
  calculatePrice,
  createOnlineCheckout,
  verifyOnlinePayment,
  getReservations,
  getReservation,
  createManualReservation,
  updateReservationStatus,
  addReservationPayment,
  validateCoupon
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public booking workflows
router.post('/check-availability', checkAvailability);
router.post('/calculate-price', calculatePrice);
router.post('/validate-coupon', validateCoupon);
router.post('/online-checkout', createOnlineCheckout);
router.post('/verify-payment', verifyOnlinePayment);

// Admin / Staff ERP routes
router.get('/', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist', 'Accountant', 'Sales Executive'), getReservations);
router.get('/:idOrRef', getReservation);
router.post('/manual', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist', 'Sales Executive'), createManualReservation);
router.put('/:id/status', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist'), updateReservationStatus);
router.post('/:id/payments', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist', 'Accountant'), addReservationPayment);

export default router;
