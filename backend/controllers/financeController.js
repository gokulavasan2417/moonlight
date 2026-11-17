import { Vendor, VendorBill, Payout, Expense, ExpenseCategory } from '../models/Finance.js';
import { createAuditLog } from '../middleware/auth.js';

// --- VENDORS ---
export const getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().sort({ companyName: 1 });
    res.json({ success: true, count: vendors.length, vendors });
  } catch (err) {
    next(err);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);
    await createAuditLog({
      req,
      action: 'CREATE_VENDOR',
      module: 'Vendors',
      targetId: vendor._id,
      details: { companyName: vendor.companyName, category: vendor.category }
    });
    res.status(201).json({ success: true, vendor });
  } catch (err) {
    next(err);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, vendor });
  } catch (err) {
    next(err);
  }
};

// --- VENDOR BILLS ---
export const getVendorBills = async (req, res, next) => {
  try {
    const bills = await VendorBill.find().populate('vendor', 'companyName category contactPerson phone').sort({ billDate: -1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (err) {
    next(err);
  }
};

export const createVendorBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.create(req.body);
    // Update vendor balance
    await Vendor.findByIdAndUpdate(bill.vendor, {
      $inc: { totalBilled: bill.totalAmount, outstandingBalance: bill.balanceDue }
    });
    res.status(201).json({ success: true, bill });
  } catch (err) {
    next(err);
  }
};

// --- PAYOUTS ---
export const getPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find()
      .populate('vendor', 'companyName category')
      .populate('employee', 'name email')
      .populate('approvedBy', 'name')
      .sort({ paymentDate: -1 });
    res.json({ success: true, count: payouts.length, payouts });
  } catch (err) {
    next(err);
  }
};

export const createPayout = async (req, res, next) => {
  try {
    const count = await Payout.countDocuments();
    const payoutReference = `PO-2026-${String(count + 101).padStart(4, '0')}`;

    const payout = await Payout.create({
      ...req.body,
      payoutReference,
      approvedBy: req.user?._id
    });

    // If vendor payout, update vendor stats
    if (payout.vendor) {
      await Vendor.findByIdAndUpdate(payout.vendor, {
        $inc: { totalPaid: payout.amount, outstandingBalance: -payout.amount }
      });
    }

    // If bill linked, update bill balance
    if (payout.vendorBill) {
      const bill = await VendorBill.findById(payout.vendorBill);
      if (bill) {
        bill.paidAmount += payout.amount;
        bill.balanceDue = Math.max(0, bill.totalAmount - bill.paidAmount);
        bill.status = bill.balanceDue <= 0 ? 'Paid' : 'Partially Paid';
        await bill.save();
      }
    }

    await createAuditLog({
      req,
      action: 'CREATE_PAYOUT',
      module: 'Payouts',
      targetId: payout._id,
      details: { payoutReference, amount: payout.amount, type: payout.payoutType }
    });

    res.status(201).json({ success: true, payout });
  } catch (err) {
    next(err);
  }
};

export const updatePayoutStatus = async (req, res, next) => {
  try {
    const { status, transactionReference } = req.body;
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status, transactionReference, approvedBy: req.user?._id },
      { new: true }
    );
    res.json({ success: true, payout });
  } catch (err) {
    next(err);
  }
};

// --- EXPENSES ---
export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.categoryName = category;
    if (startDate && endDate) {
      filter.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(filter)
      .populate('category', 'name')
      .populate('villa', 'name')
      .sort({ expenseDate: -1 });

    res.json({ success: true, count: expenses.length, expenses });
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const count = await Expense.countDocuments();
    const expenseNumber = `EXP-2026-${String(count + 101).padStart(4, '0')}`;

    const expense = await Expense.create({
      ...req.body,
      expenseNumber,
      recordedBy: req.user?._id
    });

    await createAuditLog({
      req,
      action: 'CREATE_EXPENSE',
      module: 'Expenses',
      targetId: expense._id,
      details: { title: expense.title, amount: expense.amount, category: expense.categoryName }
    });

    res.status(201).json({ success: true, expense });
  } catch (err) {
    next(err);
  }
};

// --- EXPENSE CATEGORIES ---
export const getExpenseCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.find({ isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};
