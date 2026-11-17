import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  invoiceType: { 
    type: String, 
    enum: ['Advance Invoice', 'Final Invoice', 'Addon Services', 'General Bill'], 
    default: 'Advance Invoice' 
  },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: String,
    gstNumber: String,
    companyName: String
  },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  items: [{
    description: { type: String, required: true },
    hsnCode: { type: String, default: '996311' }, // Hotel/Villa accommodation HSN
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    taxableAmount: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gstDetails: {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalGst: { type: Number, required: true }
  },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Issued'
  },
  notes: { type: String, default: 'Thank you for choosing Moon Light Villa.' },
  termsAndConditions: { type: String, default: 'All payments are subject to Moon Light Villa reservation terms. Check-in: 2:00 PM, Check-out: 11:00 AM.' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  paymentReference: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true },
  paymentType: { 
    type: String, 
    enum: ['Advance', 'Final Settlement', 'Security Deposit', 'Add-on Services', 'Refund Settlement'], 
    default: 'Advance' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Razorpay Online', 'UPI', 'Bank Transfer (NEFT/RTGS)', 'Credit Card', 'Debit Card', 'Cash'], 
    default: 'Razorpay Online' 
  },
  transactionId: { type: String },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  paymentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
    default: 'Completed' 
  },
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const refundSchema = new mongoose.Schema({
  refundReference: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  refundMethod: { 
    type: String, 
    enum: ['Bank Transfer', 'UPI', 'Original Payment Method', 'Cash'], 
    default: 'Original Payment Method' 
  },
  transactionReference: String,
  status: { 
    type: String, 
    enum: ['Requested', 'Approved', 'Processed', 'Rejected'], 
    default: 'Approved' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Refund = mongoose.model('Refund', refundSchema);
