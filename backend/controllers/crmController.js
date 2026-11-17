import { Lead, FollowUp, Quotation } from '../models/CRM.js';
import { Customer } from '../models/Customer.js';
import { Reservation } from '../models/Reservation.js';
import { Villa } from '../models/Villa.js';
import { Notification } from '../models/System.js';
import { createAuditLog } from '../middleware/auth.js';

// @desc Capture lead / enquiry (Public website form or ERP manual)
// @route POST /api/leads
export const createLead = async (req, res, next) => {
  try {
    const { fullName, email, phone, city, source, interestedDates, guestsCount, estimatedBudget, message } = req.body;

    const lead = await Lead.create({
      fullName,
      email,
      phone,
      city,
      source: source || 'Website Direct',
      interestedDates,
      guestsCount,
      estimatedBudget,
      notes: message ? [{ text: message }] : []
    });

    // Notify ERP dashboard
    await Notification.create({
      title: 'New Enquiry / Lead Received',
      message: `${fullName} submitted an enquiry for Moon Light Villa via ${lead.source}`,
      type: 'lead',
      link: '/erp/crm'
    });

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', lead });
  } catch (err) {
    next(err);
  }
};

// @desc Get all leads with status, source, and search filters
// @route GET /api/leads
export const getLeads = async (req, res, next) => {
  try {
    const { status, source, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (source && source !== 'All') filter.source = source;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('interestedVilla', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

// @desc Update lead status, notes, or assigned staff
// @route PUT /api/leads/:id
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

// @desc Add note to lead
// @route POST /api/leads/:id/notes
export const addLeadNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.unshift({
      text,
      author: req.user?._id
    });
    await lead.save();

    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

// @desc Convert lead into customer and booking
// @route POST /api/leads/:id/convert
export const convertLeadToBooking = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // 1. Create or link customer
    let customer = await Customer.findOne({ phone: lead.phone });
    if (!customer) {
      customer = await Customer.create({
        fullName: lead.fullName,
        email: lead.email || `${lead.phone}@guest.moonlightvilla.com`,
        phone: lead.phone,
        address: { city: lead.city }
      });
    }

    lead.status = 'Converted';
    lead.convertedCustomer = customer._id;
    await lead.save();

    await createAuditLog({
      req,
      action: 'CONVERT_LEAD',
      module: 'CRM / Leads',
      targetId: lead._id,
      details: { leadName: lead.fullName, customerId: customer._id }
    });

    res.json({
      success: true,
      message: 'Lead converted successfully',
      customer,
      lead
    });
  } catch (err) {
    next(err);
  }
};

// --- FOLLOW UPS ---
export const getFollowUps = async (req, res, next) => {
  try {
    const followUps = await FollowUp.find()
      .populate('lead', 'fullName phone email status')
      .populate('conductedBy', 'name')
      .sort({ scheduledDate: 1 });
    res.json({ success: true, followUps });
  } catch (err) {
    next(err);
  }
};

export const createFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.create({
      ...req.body,
      conductedBy: req.user?._id
    });

    // Update lead status to Follow-up if currently New
    await Lead.findByIdAndUpdate(req.body.lead, { status: 'Follow-up' });

    res.status(201).json({ success: true, followUp });
  } catch (err) {
    next(err);
  }
};

export const updateFollowUpStatus = async (req, res, next) => {
  try {
    const { status, outcome } = req.body;
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { status, outcome, completedAt: status === 'Completed' ? new Date() : null },
      { new: true }
    );
    res.json({ success: true, followUp });
  } catch (err) {
    next(err);
  }
};

// --- QUOTATIONS ---
export const getQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find()
      .populate('lead', 'fullName phone email')
      .populate('villa', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, quotations });
  } catch (err) {
    next(err);
  }
};

export const createQuotation = async (req, res, next) => {
  try {
    const count = await Quotation.countDocuments();
    const quotationNumber = `QTN-2026-${String(count + 101).padStart(4, '0')}`;

    const quotation = await Quotation.create({
      ...req.body,
      quotationNumber,
      createdBy: req.user?._id
    });

    if (req.body.lead) {
      await Lead.findByIdAndUpdate(req.body.lead, { status: 'Quotation Sent' });
    }

    res.status(201).json({ success: true, quotation });
  } catch (err) {
    next(err);
  }
};
