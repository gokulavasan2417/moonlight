import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  idProof: {
    idType: { type: String, enum: ['Aadhaar', 'Passport', 'Driving License', 'Voter ID', 'Other'], default: 'Aadhaar' },
    idNumber: { type: String, trim: true },
    documentUrl: { type: String }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  isRepeatGuest: { type: Boolean, default: false },
  vipStatus: { type: Boolean, default: false },
  totalBookingsCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  preferences: {
    dietary: String,
    roomPreferences: String,
    specialOccasions: String
  },
  tags: [{ type: String }],
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

customerSchema.index({ email: 1, phone: 1 });

export const Customer = mongoose.model('Customer', customerSchema);
