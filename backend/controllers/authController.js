import { User, Role, Permission } from '../models/User.js';
import { AuditLog, Notification } from '../models/System.js';
import { Villa, RoomCategory, Room, PropertyLocation, AvailabilityBlock, PricingRule } from '../models/Villa.js';
import { Reservation, Coupon } from '../models/Reservation.js';
import { Customer } from '../models/Customer.js';
import { Lead, FollowUp, Quotation } from '../models/CRM.js';
import { Invoice, Payment } from '../models/Billing.js';
import { Vendor, VendorBill, Payout, Expense, ExpenseCategory } from '../models/Finance.js';
import { WebsiteSettings, Banner, GalleryItem, Testimonial, SpecialOffer } from '../models/Website.js';
import { generateToken, createAuditLog } from '../middleware/auth.js';

// @desc Auth user & get token
// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact Super Admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      device: req.headers['user-agent'] || 'Browser'
    });
    await user.save();

    await createAuditLog({
      req: { ...req, user },
      action: 'USER_LOGIN',
      module: 'Staff & Roles',
      targetId: user._id,
      details: { email: user.email, role: user.role }
    });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedLocation', 'name code city')
      .populate('assignedVilla', 'name slug');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc Get all staff users
// @route GET /api/staff
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('assignedLocation', 'name code city')
      .populate('assignedVilla', 'name slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @desc Create new staff user
// @route POST /api/staff
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, accessScope, assignedLocation, assignedVilla, smartAccessPin } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone,
      role: role || 'Receptionist',
      accessScope: accessScope || 'All Properties',
      assignedLocation: assignedLocation || null,
      assignedVilla: assignedVilla || null,
      smartAccessPin: smartAccessPin || `PIN-${Math.floor(1000 + Math.random() * 9000)}`
    });

    await createAuditLog({
      req,
      action: 'CREATE_STAFF_USER',
      module: 'Staff & Roles',
      targetId: user._id,
      details: { email: user.email, role: user.role, accessScope: user.accessScope }
    });

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedLocation', 'name code city')
      .populate('assignedVilla', 'name slug');

    res.status(201).json({
      success: true,
      user: populatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update staff user
// @route PUT /api/staff/:id
export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, isActive, password, accessScope, assignedLocation, assignedVilla, smartAccessPin } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password; // Will be hashed in pre-save hook
    if (accessScope) user.accessScope = accessScope;
    if (assignedLocation !== undefined) user.assignedLocation = assignedLocation || null;
    if (assignedVilla !== undefined) user.assignedVilla = assignedVilla || null;
    if (smartAccessPin !== undefined) user.smartAccessPin = smartAccessPin;

    await user.save();

    await createAuditLog({
      req,
      action: 'UPDATE_STAFF_USER',
      module: 'Staff & Roles',
      targetId: user._id,
      details: { email: user.email, role: user.role, isActive: user.isActive, accessScope: user.accessScope }
    });

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedLocation', 'name code city')
      .populate('assignedVilla', 'name slug');

    res.json({ success: true, user: populatedUser });
  } catch (err) {
    next(err);
  }
};

// @desc Get audit logs
// @route GET /api/staff/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

// @desc Reset all operational data except user login credentials and roles
// @route POST /api/auth/reset-all-data
export const resetAllOperationalData = async (req, res, next) => {
  try {
    // 1. Wipe inventory & property structure
    const deletedVillas = await Villa.deleteMany({});
    const deletedRooms = await Room.deleteMany({});
    const deletedRoomCategories = await RoomCategory.deleteMany({});
    const deletedLocations = await PropertyLocation.deleteMany({});
    const deletedAvailabilityBlocks = await AvailabilityBlock.deleteMany({});
    const deletedPricingRules = await PricingRule.deleteMany({});

    // 2. Wipe reservations & bookings
    const deletedReservations = await Reservation.deleteMany({});
    const deletedCoupons = await Coupon.deleteMany({});

    // 3. Wipe customers & CRM
    const deletedCustomers = await Customer.deleteMany({});
    const deletedLeads = await Lead.deleteMany({});
    const deletedFollowUps = await FollowUp.deleteMany({});
    const deletedQuotations = await Quotation.deleteMany({});

    // 4. Wipe billing & finance
    const deletedInvoices = await Invoice.deleteMany({});
    const deletedPayments = await Payment.deleteMany({});
    const deletedVendors = await Vendor.deleteMany({});
    const deletedVendorBills = await VendorBill.deleteMany({});
    const deletedPayouts = await Payout.deleteMany({});
    const deletedExpenses = await Expense.deleteMany({});
    const deletedExpenseCategories = await ExpenseCategory.deleteMany({});

    // 5. Wipe system logs & notifications
    const deletedAuditLogs = await AuditLog.deleteMany({});
    const deletedNotifications = await Notification.deleteMany({});

    // 6. Wipe website content
    const deletedSettings = await WebsiteSettings.deleteMany({});
    const deletedBanners = await Banner.deleteMany({});
    const deletedGallery = await GalleryItem.deleteMany({});
    const deletedTestimonials = await Testimonial.deleteMany({});
    const deletedOffers = await SpecialOffer.deleteMany({});

    // 7. Update User credentials so no user points to wiped locations or villas
    await User.updateMany({}, {
      $set: {
        assignedLocation: null,
        assignedVilla: null,
        accessScope: 'All Properties'
      }
    });

    // 8. Fetch preserved users
    const preservedUsers = await User.find({}).select('name email role isActive');

    res.json({
      success: true,
      message: 'All operational, inventory, reservation, billing, CRM, and website data successfully deleted. All staff login credentials and roles remain preserved.',
      deletedCounts: {
        villas: deletedVillas.deletedCount,
        rooms: deletedRooms.deletedCount,
        roomCategories: deletedRoomCategories.deletedCount,
        locations: deletedLocations.deletedCount,
        availabilityBlocks: deletedAvailabilityBlocks.deletedCount,
        pricingRules: deletedPricingRules.deletedCount,
        reservations: deletedReservations.deletedCount,
        coupons: deletedCoupons.deletedCount,
        customers: deletedCustomers.deletedCount,
        leads: deletedLeads.deletedCount,
        followUps: deletedFollowUps.deletedCount,
        quotations: deletedQuotations.deletedCount,
        invoices: deletedInvoices.deletedCount,
        payments: deletedPayments.deletedCount,
        vendors: deletedVendors.deletedCount,
        vendorBills: deletedVendorBills.deletedCount,
        payouts: deletedPayouts.deletedCount,
        expenses: deletedExpenses.deletedCount,
        expenseCategories: deletedExpenseCategories.deletedCount,
        auditLogs: deletedAuditLogs.deletedCount,
        notifications: deletedNotifications.deletedCount,
        websiteSettings: deletedSettings.deletedCount,
        banners: deletedBanners.deletedCount,
        galleryItems: deletedGallery.deletedCount,
        testimonials: deletedTestimonials.deletedCount,
        specialOffers: deletedOffers.deletedCount,
      },
      preservedCredentials: preservedUsers
    });
  } catch (err) {
    next(err);
  }
};

