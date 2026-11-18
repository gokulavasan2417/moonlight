import { WebsiteSettings, Banner, GalleryItem, Testimonial, SpecialOffer } from '../models/Website.js';
import { Coupon } from '../models/Reservation.js';
import { createAuditLog } from '../middleware/auth.js';

// In-memory cache for ultra-fast CDN/Edge response
let cachedPublicData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export const invalidateWebsiteCache = () => {
  cachedPublicData = null;
  cacheTimestamp = 0;
};

// @desc Get public website content & settings
// @route GET /api/website/public-data
export const getPublicWebsiteData = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedPublicData && (now - cacheTimestamp < CACHE_TTL)) {
      res.set('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
      return res.json(cachedPublicData);
    }

    // Run queries concurrently in parallel with .lean() for maximum speed
    const [settingsDoc, banners, gallery, testimonials, specialOffers] = await Promise.all([
      WebsiteSettings.findOne().lean(),
      Banner.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      GalleryItem.find().sort({ displayOrder: 1 }).lean(),
      Testimonial.find({ isApproved: true }).sort({ createdAt: -1 }).lean(),
      SpecialOffer.find({ isActive: true }).sort({ displayOrder: 1 }).lean()
    ]);

    const settings = settingsDoc || await WebsiteSettings.create({});

    const responseData = {
      success: true,
      settings,
      banners,
      gallery,
      testimonials,
      specialOffers
    };

    cachedPublicData = responseData;
    cacheTimestamp = now;

    res.set('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
    res.json(responseData);
  } catch (err) {
    next(err);
  }
};

// @desc Update website settings (Admin)
// @route PUT /api/website/settings
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create(req.body);
    } else {
      settings = await WebsiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }

    await createAuditLog({
      req,
      action: 'UPDATE_WEBSITE_SETTINGS',
      module: 'Website Management',
      targetId: settings._id,
      details: { siteName: settings.siteName }
    });

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// --- BANNERS ---
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1 });
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner removed' });
  } catch (err) {
    next(err);
  }
};

// --- GALLERY ---
export const getGalleryItems = async (req, res, next) => {
  try {
    const gallery = await GalleryItem.find().sort({ displayOrder: 1 });
    res.json({ success: true, gallery });
  } catch (err) {
    next(err);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery item removed' });
  } catch (err) {
    next(err);
  }
};

// --- TESTIMONIALS ---
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    next(err);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial removed' });
  } catch (err) {
    next(err);
  }
};

// --- SPECIAL OFFERS ---
export const getSpecialOffers = async (req, res, next) => {
  try {
    const offers = await SpecialOffer.find().sort({ displayOrder: 1 });
    res.json({ success: true, offers });
  } catch (err) {
    next(err);
  }
};

export const createSpecialOffer = async (req, res, next) => {
  try {
    const offer = await SpecialOffer.create(req.body);
    res.status(201).json({ success: true, offer });
  } catch (err) {
    next(err);
  }
};

export const updateSpecialOffer = async (req, res, next) => {
  try {
    const offer = await SpecialOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, offer });
  } catch (err) {
    next(err);
  }
};

// --- COUPONS ---
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};
