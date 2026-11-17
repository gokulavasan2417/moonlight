import { Customer } from '../models/Customer.js';
import { Reservation } from '../models/Reservation.js';
import { Invoice, Payment } from '../models/Billing.js';
import { createAuditLog } from '../middleware/auth.js';

// @desc Get all customers
// @route GET /api/customers
export const getCustomers = async (req, res, next) => {
  try {
    const { search, vipOnly, repeatOnly } = req.query;
    const filter = {};

    if (vipOnly === 'true') filter.vipStatus = true;
    if (repeatOnly === 'true') filter.isRepeatGuest = true;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    next(err);
  }
};

// @desc Get customer by ID with history
// @route GET /api/customers/:id
export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const reservations = await Reservation.find({ customer: customer._id })
      .populate('villa', 'name')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ customer: customer._id }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ customer: customer._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      customer,
      reservations,
      payments,
      invoices
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create customer manually
// @route POST /api/customers
export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    await createAuditLog({
      req,
      action: 'CREATE_CUSTOMER',
      module: 'Customers',
      targetId: customer._id,
      details: { name: customer.fullName, phone: customer.phone }
    });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};

// @desc Update customer profile
// @route PUT /api/customers/:id
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};

// @desc Add note to customer
// @route POST /api/customers/:id/notes
export const addCustomerNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.notes.unshift({
      text,
      addedBy: req.user?._id
    });
    await customer.save();
    res.json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};
