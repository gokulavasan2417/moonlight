import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String },
  source: {
    type: String,
    enum: ['Website Direct', 'Call / WhatsApp', 'Social Media', 'Walk-in', 'Referral', 'Corporate', 'Google Search'],
    default: 'Website Direct'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Follow-up', 'Interested', 'Quotation Sent', 'Converted', 'Lost'],
    default: 'New'
  },
  interestedDates: {
    checkIn: Date,
    checkOut: Date,
    nights: Number
  },
  guestsCount: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 }
  },
  interestedLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyLocation' },
  interestedVilla: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  estimatedBudget: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  convertedReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  lostReason: { type: String },
  notes: [{
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const followUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  scheduledDate: { type: Date, required: true },
  channel: { type: String, enum: ['Call', 'WhatsApp', 'Email', 'Meeting'], default: 'Call' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Completed', 'Rescheduled', 'Cancelled'], default: 'Pending' },
  notes: { type: String },
  outcome: { type: String },
  conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date }
}, { timestamps: true });

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true, uppercase: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 }
  },
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    rate: Number,
    amount: Number
  }],
  subTotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  validUntil: { type: Date, required: true },
  terms: { type: String, default: '50% advance to confirm reservation. Balance payable at check-in.' },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Accepted', 'Expired', 'Rejected'], 
    default: 'Sent' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', leadSchema);
export const FollowUp = mongoose.model('FollowUp', followUpSchema);
export const Quotation = mongoose.model('Quotation', quotationSchema);
