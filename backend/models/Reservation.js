import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bookingReference: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  bookingType: { 
    type: String, 
    enum: ['Full Villa', 'Individual Room'], 
    default: 'Full Villa' 
  },
  villa: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Villa', 
    required: true 
  },
  propertyLocation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PropertyLocation' 
  },
  rooms: [{
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    roomNumber: String,
    categoryName: String,
    pricePerNight: Number
  }],
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer' 
  },
  guestDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: String,
    idProofType: { type: String, enum: ['Aadhaar', 'Passport', 'Driving License', 'Voter ID', 'Other'], default: 'Aadhaar' },
    idProofNumber: String,
    address: String,
    city: String,
    state: String,
    specialRequests: String
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalNights: { type: Number, required: true, default: 1 },
  guests: {
    adults: { type: Number, required: true, default: 2 },
    children: { type: Number, default: 0 }
  },
  pricing: {
    roomCharges: { type: Number, required: true },
    extraGuestCharges: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true },
    taxableAmount: { type: Number, required: true },
    gstPercentage: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    securityDeposit: { type: Number, default: 10000 },
    totalAmount: { type: Number, required: true },
    advanceRequired: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: [
      'Enquiry',
      'Pending',
      'Confirmed',
      'Checked-in',
      'Checked-out',
      'Cancelled',
      'No-show',
      'Refunded'
    ],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Advance Paid', 'Fully Paid', 'Partially Refunded', 'Refunded'],
    default: 'Advance Paid'
  },
  bookingSource: {
    type: String,
    enum: ['Website Direct', 'Call / WhatsApp', 'Walk-in', 'OTA Partner', 'Corporate', 'Referral'],
    default: 'Website Direct'
  },
  checkInTime: Date,
  checkOutTime: Date,
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: { type: Number, default: 0 },
  internalNotes: String,
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leadReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }
}, { timestamps: true });

// Index for efficient overlap checking
reservationSchema.index({ villa: 1, checkIn: 1, checkOut: 1, status: 1 });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  discountValue: { type: Number, required: true }, // e.g. 10 for 10% or 2000 for ₹2000
  minBookingAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 10000 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Reservation = mongoose.model('Reservation', reservationSchema);
export const Coupon = mongoose.model('Coupon', couponSchema);
