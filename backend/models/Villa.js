import mongoose from 'mongoose';

const propertyLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Moon Light Resort & Estate - Lonavala"
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. "LNV", "GOA", "ABG"
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  address: { type: String, required: true },
  pincode: { type: String },
  phone: { type: String },
  email: { type: String },
  managerName: { type: String },
  managerPhone: { type: String },
  description: { type: String },
  images: [{ url: String, caption: String }],
  amenities: [{ type: String }],
  totalRooms: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const PropertyLocation = mongoose.model('PropertyLocation', propertyLocationSchema);

const villaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  propertyLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyLocation' },
  tagline: { type: String, default: 'Exclusive Private Luxury Estate' },
  description: { type: String, required: true },
  shortDescription: { type: String },
  location: {
    address: { type: String, default: 'Moon Light Valley, Hill Crest Estate, Lonavala' },
    city: { type: String, default: 'Lonavala' },
    state: { type: String, default: 'Maharashtra' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '410401' },
    mapUrl: { type: String }
  },
  amenities: [{ type: String }],
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  images: [{
    url: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  specs: {
    bedrooms: { type: Number, default: 5 },
    bathrooms: { type: Number, default: 6 },
    privatePool: { type: Boolean, default: true },
    maxGuests: { type: Number, default: 16 },
    squareFeet: { type: Number, default: 8500 }
  },
  pricing: {
    basePricePerNight: { type: Number, required: true },
    weekendPricePerNight: { type: Number, required: true },
    cleaningFee: { type: Number, default: 2500 },
    securityDeposit: { type: Number, default: 10000 },
    taxPercentage: { type: Number, default: 18 } // GST
  },
  rules: [{ type: String }],
  accessCode: { type: String, default: 'MLV-8829' }, // Smart digital keypad / gate access code
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isFeatured: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const roomCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Presidential Master Suite', 'Infinity Pool Villa Room'
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: true },
  description: { type: String },
  maxAdults: { type: Number, default: 2 },
  maxChildren: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  weekendPrice: { type: Number, required: true },
  extraGuestCharge: { type: Number, default: 1500 },
  amenities: [{ type: String }],
  images: [{
    url: String,
    caption: String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true },
  name: { type: String, required: true },
  propertyLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyLocation' },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomCategory', required: true },
  wing: { type: String, default: 'Wing A' }, // e.g., 'Wing A', 'Wing B', 'Ocean Wing', 'Heritage Block'
  floor: { type: String, default: 'Ground Floor' },
  bedType: { type: String, default: 'King Size Bed' },
  smartLockCode: { type: String, default: '' }, // Electronic door lock PIN (e.g. *8391#)
  rfidCardId: { type: String, default: '' }, // Keycard RFID ID
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved'], 
    default: 'Available' 
  },
  basePrice: { type: Number, required: true },
  weekendPrice: { type: Number, required: true },
  extraGuestCharge: { type: Number, default: 1500 },
  maxAdults: { type: Number, default: 2 },
  maxChildren: { type: Number, default: 1 },
  amenities: [{ type: String }],
  images: [{ url: String, caption: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const pricingRuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  roomCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomCategory' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  multiplier: { type: Number, default: 1.0 }, // e.g. 1.25 for peak season
  customPricePerNight: { type: Number },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const availabilityBlockSchema = new mongoose.Schema({
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { 
    type: String, 
    enum: ['Maintenance', 'Owner Stay', 'Renovation', 'Sanitization', 'Deep Cleaning', 'Other'], 
    default: 'Maintenance' 
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Villa = mongoose.model('Villa', villaSchema);
export const RoomCategory = mongoose.model('RoomCategory', roomCategorySchema);
export const Room = mongoose.model('Room', roomSchema);
export const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
export const AvailabilityBlock = mongoose.model('AvailabilityBlock', availabilityBlockSchema);
