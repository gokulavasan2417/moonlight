import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'reservations.create'
  module: { type: String, required: true }, // e.g., 'reservations'
  description: { type: String },
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: [
      'Super Admin',
      'Administrator',
      'Manager',
      'Receptionist',
      'Sales Executive',
      'Accountant',
      'Housekeeping Staff'
    ]
  },
  description: { type: String },
  permissions: [{ type: String }], // Array of permission strings or modules
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { 
    type: String, 
    required: true, 
    default: 'Receptionist',
    enum: [
      'Super Admin',
      'Administrator',
      'Manager',
      'Receptionist',
      'Sales Executive',
      'Accountant',
      'Housekeeping Staff'
    ]
  },
  accessScope: {
    type: String,
    enum: ['All Properties', 'Specific Location', 'Specific Villa'],
    default: 'All Properties'
  },
  assignedLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyLocation' },
  assignedVilla: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  smartAccessPin: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Permission = mongoose.model('Permission', permissionSchema);
export const Role = mongoose.model('Role', roleSchema);
export const User = mongoose.model('User', userSchema);
