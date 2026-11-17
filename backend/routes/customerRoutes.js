import express from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, addCustomerNote } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist', 'Sales Executive'), getCustomers);
router.get('/:id', authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist', 'Sales Executive'), getCustomer);
router.post('/', authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist'), createCustomer);
router.put('/:id', authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist'), updateCustomer);
router.post('/:id/notes', authorize('Super Admin', 'Administrator', 'Manager', 'Receptionist'), addCustomerNote);

export default router;
