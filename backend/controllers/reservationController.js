import { Reservation, Coupon } from '../models/Reservation.js';
import { Villa, Room, AvailabilityBlock } from '../models/Villa.js';
import { Customer } from '../models/Customer.js';
import { Invoice, Payment } from '../models/Billing.js';
import { Notification } from '../models/System.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/paymentService.js';
import { sendBookingConfirmationEmail, sendWhatsAppNotification } from '../services/notificationService.js';
import { createAuditLog } from '../middleware/auth.js';

// Helper to generate unique booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'MLV-';
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// Helper to generate invoice number
const generateInvoiceNum = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `INV-2026-${num}`;
};

// Helper: Check if dates overlap
const checkOverlap = async ({ villaId, checkIn, checkOut, roomId = null, excludeReservationId = null }) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  // Check Maintenance / Owner blocks
  const blockFilter = {
    isActive: true,
    $or: [
      { startDate: { $lt: end }, endDate: { $gt: start } }
    ]
  };
  if (roomId) {
    blockFilter.$or = [
      { room: roomId, startDate: { $lt: end }, endDate: { $gt: start } },
      { villa: villaId, room: null, startDate: { $lt: end }, endDate: { $gt: start } }
    ];
  } else {
    blockFilter.villa = villaId;
  }
  const conflictingBlocks = await AvailabilityBlock.find(blockFilter);
  if (conflictingBlocks.length > 0) return true;

  // Check existing active reservations
  const resFilter = {
    villa: villaId,
    status: { $in: ['Confirmed', 'Checked-in', 'Pending'] },
    $or: [
      { checkIn: { $lt: end }, checkOut: { $gt: start } }
    ]
  };
  if (excludeReservationId) {
    resFilter._id = { $ne: excludeReservationId };
  }
  if (roomId) {
    resFilter.$or = [
      { bookingType: 'Full Villa', checkIn: { $lt: end }, checkOut: { $gt: start } },
      { 'rooms.room': roomId, checkIn: { $lt: end }, checkOut: { $gt: start } }
    ];
  }

  const conflictingReservations = await Reservation.find(resFilter);
  return conflictingReservations.length > 0;
};

// @desc Check real-time availability
// @route POST /api/reservations/check-availability
export const checkAvailability = async (req, res, next) => {
  try {
    const { villaId, checkIn, checkOut, roomId } = req.body;

    if (!villaId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Villa, check-in, and check-out dates are required' });
    }

    const isOverlapping = await checkOverlap({ villaId, checkIn, checkOut, roomId });

    res.json({
      success: true,
      isAvailable: !isOverlapping,
      message: isOverlapping 
        ? 'Selected dates are unavailable for this inventory' 
        : 'Dates are available for reservation'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Calculate pricing with GST, cleaning, discount coupons
// @route POST /api/reservations/calculate-price
export const calculatePrice = async (req, res, next) => {
  try {
    const { villaId, checkIn, checkOut, couponCode, adults = 2, children = 0 } = req.body;

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

    // Count weekend vs weekday nights
    let roomCharges = 0;
    const cur = new Date(startDate);
    for (let i = 0; i < totalNights; i++) {
      const day = cur.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      const isWeekend = (day === 5 || day === 6 || day === 0);
      roomCharges += isWeekend ? villa.pricing.weekendPricePerNight : villa.pricing.basePricePerNight;
      cur.setDate(cur.getDate() + 1);
    }

    const cleaningFee = villa.pricing.cleaningFee || 2500;
    const securityDeposit = villa.pricing.securityDeposit || 10000;

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase().trim(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon && roomCharges >= (coupon.minBookingAmount || 0)) {
        if (coupon.discountType === 'Percentage') {
          discountAmount = Math.min((roomCharges * coupon.discountValue) / 100, coupon.maxDiscountAmount || 10000);
        } else {
          discountAmount = Math.min(coupon.discountValue, roomCharges);
        }
        appliedCoupon = coupon.code;
      }
    }

    const taxableAmount = Math.max(0, roomCharges + cleaningFee - discountAmount);
    const gstAmount = Math.round((taxableAmount * (villa.pricing.taxPercentage || 18)) / 100);
    const totalAmount = taxableAmount + gstAmount + securityDeposit;
    const advanceRequired = Math.round(totalAmount * 0.5); // 50% advance to confirm

    res.json({
      success: true,
      pricing: {
        totalNights,
        roomCharges,
        cleaningFee,
        discountAmount,
        couponCode: appliedCoupon,
        taxableAmount,
        gstPercentage: villa.pricing.taxPercentage || 18,
        gstAmount,
        securityDeposit,
        totalAmount,
        advanceRequired,
        balanceDue: totalAmount - advanceRequired
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create online booking & Razorpay order
// @route POST /api/reservations/online-checkout
export const createOnlineCheckout = async (req, res, next) => {
  try {
    const {
      villaId,
      checkIn,
      checkOut,
      guestDetails,
      guests,
      couponCode,
      bookingType = 'Full Villa'
    } = req.body;

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    // Double check availability
    const isOverlapping = await checkOverlap({ villaId, checkIn, checkOut });
    if (isOverlapping) {
      return res.status(400).json({ success: false, message: 'Inventory is no longer available for these dates' });
    }

    // Calculate nights & price
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

    let roomCharges = 0;
    const cur = new Date(startDate);
    for (let i = 0; i < totalNights; i++) {
      const day = cur.getDay();
      const isWeekend = (day === 5 || day === 6 || day === 0);
      roomCharges += isWeekend ? villa.pricing.weekendPricePerNight : villa.pricing.basePricePerNight;
      cur.setDate(cur.getDate() + 1);
    }

    const cleaningFee = villa.pricing.cleaningFee || 2500;
    const securityDeposit = villa.pricing.securityDeposit || 10000;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        discountAmount = coupon.discountType === 'Percentage'
          ? Math.min((roomCharges * coupon.discountValue) / 100, coupon.maxDiscountAmount || 10000)
          : Math.min(coupon.discountValue, roomCharges);
      }
    }

    const taxableAmount = Math.max(0, roomCharges + cleaningFee - discountAmount);
    const gstAmount = Math.round((taxableAmount * 18) / 100);
    const totalAmount = taxableAmount + gstAmount + securityDeposit;
    const advanceRequired = Math.round(totalAmount * 0.5);

    // Create or find customer profile
    let customer = await Customer.findOne({ email: guestDetails.email.toLowerCase().trim() });
    if (!customer) {
      customer = await Customer.create({
        fullName: guestDetails.fullName,
        email: guestDetails.email.toLowerCase().trim(),
        phone: guestDetails.phone,
        address: {
          city: guestDetails.city || '',
          state: guestDetails.state || ''
        }
      });
    }

    const bookingReference = generateBookingRef();

    // Create Razorpay or Mock Order for the 50% advance
    const orderData = await createRazorpayOrder({
      amount: advanceRequired,
      currency: 'INR',
      receipt: bookingReference,
      notes: { bookingReference, guestName: guestDetails.fullName }
    });

    // Create reservation record
    const reservation = await Reservation.create({
      bookingReference,
      bookingType,
      villa: villa._id,
      customer: customer._id,
      guestDetails,
      checkIn: startDate,
      checkOut: endDate,
      totalNights,
      guests: {
        adults: guests?.adults || 2,
        children: guests?.children || 0
      },
      pricing: {
        roomCharges,
        cleaningFee,
        discountAmount,
        couponCode: couponCode || '',
        taxableAmount,
        gstPercentage: 18,
        gstAmount,
        securityDeposit,
        totalAmount,
        advanceRequired,
        advancePaid: 0,
        balanceDue: totalAmount
      },
      status: 'Pending',
      paymentStatus: 'Unpaid',
      bookingSource: 'Website Direct'
    });

    res.status(201).json({
      success: true,
      reservationId: reservation._id,
      bookingReference: reservation.bookingReference,
      order: orderData,
      advanceRequired,
      totalAmount
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify payment & confirm online booking
// @route POST /api/reservations/verify-payment
export const verifyOnlinePayment = async (req, res, next) => {
  try {
    const {
      reservationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const reservation = await Reservation.findById(reservationId).populate('villa');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update reservation
    reservation.status = 'Confirmed';
    reservation.paymentStatus = 'Advance Paid';
    reservation.pricing.advancePaid = reservation.pricing.advanceRequired;
    reservation.pricing.balanceDue = reservation.pricing.totalAmount - reservation.pricing.advanceRequired;
    await reservation.save();

    // Create Payment Record
    const payment = await Payment.create({
      paymentReference: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reservation: reservation._id,
      customer: reservation.customer,
      amount: reservation.pricing.advanceRequired,
      paymentType: 'Advance',
      paymentMethod: 'Razorpay Online',
      transactionId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      status: 'Completed'
    });

    // Create Invoice Record
    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNum(),
      invoiceType: 'Advance Invoice',
      reservation: reservation._id,
      customer: reservation.customer,
      customerDetails: {
        fullName: reservation.guestDetails.fullName,
        email: reservation.guestDetails.email,
        phone: reservation.guestDetails.phone,
        address: reservation.guestDetails.address || ''
      },
      items: [
        {
          description: `Luxury Stay: ${reservation.villa.name} (${reservation.totalNights} Nights)`,
          quantity: reservation.totalNights,
          unitPrice: reservation.pricing.roomCharges / reservation.totalNights,
          taxableAmount: reservation.pricing.roomCharges,
          gstRate: 18,
          gstAmount: reservation.pricing.gstAmount,
          total: reservation.pricing.roomCharges + reservation.pricing.gstAmount
        }
      ],
      subTotal: reservation.pricing.taxableAmount,
      discount: reservation.pricing.discountAmount,
      gstDetails: {
        cgst: reservation.pricing.gstAmount / 2,
        sgst: reservation.pricing.gstAmount / 2,
        totalGst: reservation.pricing.gstAmount
      },
      grandTotal: reservation.pricing.totalAmount,
      paidAmount: reservation.pricing.advancePaid,
      balanceDue: reservation.pricing.balanceDue,
      status: 'Partially Paid'
    });

    // Update customer stats
    if (reservation.customer) {
      await Customer.findByIdAndUpdate(reservation.customer, {
        $inc: { totalBookingsCount: 1, totalSpent: reservation.pricing.advancePaid }
      });
    }

    // System Notification for ERP dashboard
    await Notification.create({
      title: 'New Online Reservation Confirmed',
      message: `${reservation.guestDetails.fullName} confirmed booking ${reservation.bookingReference} for ${reservation.villa.name}`,
      type: 'reservation',
      priority: 'high',
      link: `/erp/reservations`
    });

    // Send confirmation email & WhatsApp
    sendBookingConfirmationEmail({
      reservation,
      villaName: reservation.villa.name
    });
    sendWhatsAppNotification({
      phone: reservation.guestDetails.phone,
      template: 'booking_confirmation',
      params: {
        guestName: reservation.guestDetails.fullName,
        ref: reservation.bookingReference,
        checkIn: new Date(reservation.checkIn).toLocaleDateString()
      }
    });

    await createAuditLog({
      req,
      action: 'CONFIRM_ONLINE_RESERVATION',
      module: 'Reservations',
      targetId: reservation._id,
      details: { bookingReference: reservation.bookingReference, amount: reservation.pricing.totalAmount }
    });

    res.json({
      success: true,
      message: 'Reservation confirmed successfully',
      reservation,
      invoiceNumber: invoice.invoiceNumber
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all reservations (ERP Admin)
// @route GET /api/reservations
export const getReservations = async (req, res, next) => {
  try {
    const { status, search, source, startDate, endDate } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (source && source !== 'All') {
      filter.bookingSource = source;
    }
    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.fullName': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
        { 'guestDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate && endDate) {
      filter.checkIn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reservations = await Reservation.find(filter)
      .populate('villa', 'name slug')
      .populate('customer', 'fullName email isRepeatGuest')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (err) {
    next(err);
  }
};

// @desc Get single reservation by ID or Reference
// @route GET /api/reservations/:idOrRef
export const getReservation = async (req, res, next) => {
  try {
    const { idOrRef } = req.params;
    const isId = idOrRef.match(/^[0-9a-fA-F]{24}$/);

    const reservation = isId
      ? await Reservation.findById(idOrRef).populate('villa').populate('customer')
      : await Reservation.findOne({ bookingReference: idOrRef.toUpperCase() }).populate('villa').populate('customer');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const invoice = await Invoice.findOne({ reservation: reservation._id });
    const payments = await Payment.find({ reservation: reservation._id });

    res.json({ success: true, reservation, invoice, payments });
  } catch (err) {
    next(err);
  }
};

// @desc Create manual reservation (ERP Admin)
// @route POST /api/reservations/manual
export const createManualReservation = async (req, res, next) => {
  try {
    const {
      villaId,
      checkIn,
      checkOut,
      guestDetails,
      guests,
      pricing,
      status = 'Confirmed',
      bookingSource = 'Call / WhatsApp',
      internalNotes
    } = req.body;

    const isOverlapping = await checkOverlap({ villaId, checkIn, checkOut });
    if (isOverlapping) {
      return res.status(400).json({ success: false, message: 'Selected dates overlap with an existing booking or maintenance block' });
    }

    let customer = await Customer.findOne({ email: guestDetails.email.toLowerCase().trim() });
    if (!customer) {
      customer = await Customer.create({
        fullName: guestDetails.fullName,
        email: guestDetails.email.toLowerCase().trim(),
        phone: guestDetails.phone
      });
    }

    const bookingReference = generateBookingRef();
    const reservation = await Reservation.create({
      bookingReference,
      villa: villaId,
      customer: customer._id,
      guestDetails,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalNights: Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))),
      guests: guests || { adults: 2, children: 0 },
      pricing,
      status,
      paymentStatus: pricing.advancePaid >= pricing.totalAmount ? 'Fully Paid' : pricing.advancePaid > 0 ? 'Advance Paid' : 'Unpaid',
      bookingSource,
      internalNotes,
      assignedStaff: req.user?._id
    });

    // Create Invoice
    await Invoice.create({
      invoiceNumber: generateInvoiceNum(),
      invoiceType: 'Advance Invoice',
      reservation: reservation._id,
      customer: customer._id,
      customerDetails: {
        fullName: guestDetails.fullName,
        email: guestDetails.email,
        phone: guestDetails.phone
      },
      items: [{
        description: `Moon Light Villa Reservation (${reservation.totalNights} Nights)`,
        quantity: reservation.totalNights,
        unitPrice: pricing.roomCharges / reservation.totalNights,
        taxableAmount: pricing.taxableAmount,
        gstRate: 18,
        gstAmount: pricing.gstAmount,
        total: pricing.totalAmount
      }],
      subTotal: pricing.taxableAmount,
      discount: pricing.discountAmount || 0,
      gstDetails: { totalGst: pricing.gstAmount },
      grandTotal: pricing.totalAmount,
      paidAmount: pricing.advancePaid || 0,
      balanceDue: pricing.balanceDue || 0,
      status: pricing.advancePaid >= pricing.totalAmount ? 'Paid' : 'Partially Paid'
    });

    await createAuditLog({
      req,
      action: 'CREATE_MANUAL_RESERVATION',
      module: 'Reservations',
      targetId: reservation._id,
      details: { bookingReference, guestName: guestDetails.fullName, totalAmount: pricing.totalAmount }
    });

    res.status(201).json({ success: true, reservation });
  } catch (err) {
    next(err);
  }
};

// @desc Update reservation status (Check-in, Check-out, Cancel)
// @route PUT /api/reservations/:id/status
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, checkInTime, checkOutTime } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = status;
    if (status === 'Checked-in') {
      reservation.checkInTime = checkInTime || new Date();
    }
    if (status === 'Checked-out') {
      reservation.checkOutTime = checkOutTime || new Date();
    }
    if (status === 'Cancelled') {
      reservation.cancellationReason = cancellationReason || 'Guest cancellation request';
      reservation.cancelledAt = new Date();
    }

    await reservation.save();

    await createAuditLog({
      req,
      action: `RESERVATION_${status.toUpperCase()}`,
      module: 'Reservations',
      targetId: reservation._id,
      details: { bookingReference: reservation.bookingReference, status }
    });

    res.json({ success: true, reservation });
  } catch (err) {
    next(err);
  }
};

// @desc Add payment to reservation
// @route POST /api/reservations/:id/payments
export const addReservationPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentType = 'Final Settlement', transactionId, notes } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const payment = await Payment.create({
      paymentReference: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reservation: reservation._id,
      customer: reservation.customer,
      amount: Number(amount),
      paymentType,
      paymentMethod,
      transactionId,
      notes,
      recordedBy: req.user?._id,
      status: 'Completed'
    });

    // Update reservation balance
    reservation.pricing.advancePaid = (reservation.pricing.advancePaid || 0) + Number(amount);
    reservation.pricing.balanceDue = Math.max(0, reservation.pricing.totalAmount - reservation.pricing.advancePaid);

    if (reservation.pricing.balanceDue <= 0) {
      reservation.paymentStatus = 'Fully Paid';
    } else {
      reservation.paymentStatus = 'Advance Paid';
    }
    await reservation.save();

    // Update invoice balance
    const invoice = await Invoice.findOne({ reservation: reservation._id });
    if (invoice) {
      invoice.paidAmount = reservation.pricing.advancePaid;
      invoice.balanceDue = reservation.pricing.balanceDue;
      invoice.status = invoice.balanceDue <= 0 ? 'Paid' : 'Partially Paid';
      await invoice.save();
    }

    res.status(201).json({ success: true, payment, reservation });
  } catch (err) {
    next(err);
  }
};

// @desc Validate coupon
// @route POST /api/reservations/validate-coupon
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, bookingAmount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (bookingAmount < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of ₹${coupon.minBookingAmount.toLocaleString('en-IN')} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = Math.min((bookingAmount * coupon.discountValue) / 100, coupon.maxDiscountAmount || 10000);
    } else {
      discount = Math.min(coupon.discountValue, bookingAmount);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount
      }
    });
  } catch (err) {
    next(err);
  }
};
