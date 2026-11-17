import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['reservation', 'payment', 'lead', 'invoice', 'maintenance', 'system', 'payout'],
    default: 'system'
  },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  recipientRole: { type: String }, // e.g. 'Manager' or empty for all admin staff
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'System' },
  action: { type: String, required: true }, // e.g., 'CREATE_RESERVATION', 'PROCESS_PAYMENT', 'UPDATE_PRICE'
  module: { type: String, required: true }, // e.g., 'Reservations', 'Billing', 'Villas'
  targetId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String }
}, { timestamps: true });

auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
