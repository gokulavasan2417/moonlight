import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'Maintenance',
      'Laundry & Linen',
      'Food & Provisions',
      'Electricity & Utilities',
      'Pool Maintenance',
      'Housekeeping Supplies',
      'IT & Security',
      'Landscaping & Garden',
      'Contractor & Repairs',
      'Other'
    ],
    default: 'Maintenance'
  },
  gstNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  outstandingBalance: { type: Number, default: 0 },
  totalBilled: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const vendorBillSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, trim: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  description: { type: String, required: true },
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number,
    amount: Number
  }],
  subTotal: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Partially Paid', 'Paid', 'Cancelled'], 
    default: 'Pending' 
  },
  attachmentUrl: String,
  notes: String
}, { timestamps: true });

const payoutSchema = new mongoose.Schema({
  payoutReference: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  payoutType: { 
    type: String, 
    enum: ['Owner Payout', 'Vendor Payout', 'Employee Salary', 'Commission', 'Maintenance Contract'], 
    required: true 
  },
  recipientName: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorBill: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBill' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Bank Transfer (NEFT/IMPS)', 'UPI', 'Cheque', 'Cash'], 
    default: 'Bank Transfer (NEFT/IMPS)' 
  },
  transactionReference: String,
  paymentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending Approval', 'Approved', 'Paid', 'Rejected'], 
    default: 'Paid' 
  },
  proofDocumentUrl: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

const expenseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  monthlyBudget: { type: Number, default: 50000 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  expenseNumber: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
  categoryName: { type: String, required: true },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Corporate Card'], 
    default: 'UPI' 
  },
  expenseDate: { type: Date, default: Date.now },
  paidTo: { type: String, required: true },
  receiptUrl: String,
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Approved' 
  },
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Vendor = mongoose.model('Vendor', vendorSchema);
export const VendorBill = mongoose.model('VendorBill', vendorBillSchema);
export const Payout = mongoose.model('Payout', payoutSchema);
export const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema);
export const Expense = mongoose.model('Expense', expenseSchema);
