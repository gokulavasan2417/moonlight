import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Invoice, Payment, Refund } from '../models/Billing.js';
import { Reservation } from '../models/Reservation.js';
import { User } from '../models/User.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { createAuditLog } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'moon_light_villa_super_secret_jwt_key_2026';

// @desc Get all invoices
// @route GET /api/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.fullName': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate && endDate) {
      filter.issueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const invoices = await Invoice.find(filter)
      .populate('reservation', 'bookingReference checkIn checkOut')
      .populate('customer', 'fullName phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    next(err);
  }
};

// @desc Get single invoice
// @route GET /api/invoices/:id
export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('reservation')
      .populate('customer');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payments = await Payment.find({ invoice: invoice._id });
    res.json({ success: true, invoice, payments });
  } catch (err) {
    next(err);
  }
};

// @desc Download invoice PDF
// @route GET /api/invoices/:id/download-pdf or GET /api/billing/invoices/:id/download-pdf
export const downloadInvoicePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invoice not found. Invalid ID format.' });
    }

    // 2. Query Invoice with all populated associations
    const invoice = await Invoice.findById(id)
      .populate({
        path: 'reservation',
        populate: [
          { path: 'villa', select: 'name tagline location specs propertyLocation' },
          { path: 'propertyLocation', select: 'name code city state address pincode phone email' },
          { path: 'customer', select: 'fullName email phone address city state' }
        ]
      })
      .populate('customer');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // 3. Security & Data Integrity: Authentication & Authorization
    let user = req.user;
    if (!user) {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          user = await User.findById(decoded.id).select('-password');
          if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User account is inactive or not found.' });
          }
        } catch {
          return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
        }
      }
    }

    // Check if guest access via booking reference is provided
    const guestRef = req.query?.ref;
    const isGuestAuthorized = guestRef && invoice.reservation && invoice.reservation.bookingReference === guestRef;

    if (!user && !isGuestAuthorized) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this invoice. Please log in.'
      });
    }

    if (user) {
      // Role Authorization check
      const allowedRoles = ['Super Admin', 'Administrator', 'Manager', 'Accountant', 'Receptionist'];
      if (user.role !== 'Super Admin' && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Role '${user.role}' is not authorized to download invoices.`
        });
      }

      // Enforce Property / Tenant Data Isolation
      if (user.role !== 'Super Admin' && user.accessScope === 'Specific Location' && user.assignedLocation) {
        const userLocId = user.assignedLocation.toString();
        const resLocId = invoice.reservation?.propertyLocation?._id?.toString() ||
                         invoice.reservation?.propertyLocation?.toString() ||
                         invoice.reservation?.villa?.propertyLocation?._id?.toString() ||
                         invoice.reservation?.villa?.propertyLocation?.toString();

        if (resLocId && resLocId !== userLocId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to view or download invoices for this property location.'
          });
        }
      }

      if (user.role !== 'Super Admin' && user.accessScope === 'Specific Villa' && user.assignedVilla) {
        const userVillaId = user.assignedVilla.toString();
        const resVillaId = invoice.reservation?.villa?._id?.toString() ||
                           invoice.reservation?.villa?.toString();

        if (resVillaId && resVillaId !== userVillaId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to view or download invoices for this villa.'
          });
        }
      }
    }

    // 4. Retrieve associated payment records
    const payments = await Payment.find({
      $or: [
        { invoice: invoice._id },
        ...(invoice.reservation ? [{ reservation: invoice.reservation._id || invoice.reservation }] : [])
      ]
    }).sort({ paymentDate: 1 });

    // 5. Generate PDF
    const pdfBuffer = await generateInvoicePdf(invoice, invoice.reservation, payments);

    // 6. Return response with correct headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// @desc Create manual invoice
// @route POST /api/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-2026-${String(count + 1001).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      ...req.body,
      invoiceNumber,
      createdBy: req.user?._id
    });

    await createAuditLog({
      req,
      action: 'CREATE_MANUAL_INVOICE',
      module: 'Billing',
      targetId: invoice._id,
      details: { invoiceNumber: invoice.invoiceNumber, amount: invoice.grandTotal }
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// @desc Update invoice
// @route PUT /api/invoices/:id
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// --- PAYMENTS ---
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('reservation', 'bookingReference')
      .populate('customer', 'fullName phone')
      .sort({ paymentDate: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const count = await Payment.countDocuments();
    const paymentReference = `PAY-2026-${String(count + 1001).padStart(4, '0')}`;

    const payment = await Payment.create({
      ...req.body,
      paymentReference,
      recordedBy: req.user?._id
    });

    // Update reservation / invoice balance if linked
    if (payment.reservation) {
      const resv = await Reservation.findById(payment.reservation);
      if (resv) {
        resv.pricing.advancePaid = (resv.pricing.advancePaid || 0) + payment.amount;
        resv.pricing.balanceDue = Math.max(0, resv.pricing.totalAmount - resv.pricing.advancePaid);
        resv.paymentStatus = resv.pricing.balanceDue <= 0 ? 'Fully Paid' : 'Advance Paid';
        await resv.save();
      }
    }

    if (payment.invoice) {
      const inv = await Invoice.findById(payment.invoice);
      if (inv) {
        inv.paidAmount = (inv.paidAmount || 0) + payment.amount;
        inv.balanceDue = Math.max(0, inv.grandTotal - inv.paidAmount);
        inv.status = inv.balanceDue <= 0 ? 'Paid' : 'Partially Paid';
        await inv.save();
      }
    }

    res.status(201).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// --- REFUNDS ---
export const getRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find()
      .populate('reservation', 'bookingReference guestDetails')
      .populate('customer', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, refunds });
  } catch (err) {
    next(err);
  }
};

export const createRefund = async (req, res, next) => {
  try {
    const count = await Refund.countDocuments();
    const refundReference = `REF-2026-${String(count + 101).padStart(4, '0')}`;

    const refund = await Refund.create({
      ...req.body,
      refundReference,
      approvedBy: req.user?._id
    });

    if (refund.reservation) {
      await Reservation.findByIdAndUpdate(refund.reservation, {
        paymentStatus: 'Refunded',
        refundAmount: refund.amount
      });
    }

    await createAuditLog({
      req,
      action: 'PROCESS_REFUND',
      module: 'Billing',
      targetId: refund._id,
      details: { refundReference, amount: refund.amount }
    });

    res.status(201).json({ success: true, refund });
  } catch (err) {
    next(err);
  }
};
