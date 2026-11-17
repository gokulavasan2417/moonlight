import express from 'express';
import {
  getPublicWebsiteData,
  updateSettings,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSpecialOffers,
  createSpecialOffer,
  updateSpecialOffer,
  getCoupons,
  createCoupon,
  updateCoupon
} from '../controllers/websiteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public data
router.get('/public-data', getPublicWebsiteData);
router.get('/banners', getBanners);
router.get('/gallery', getGalleryItems);
router.get('/testimonials', getTestimonials);
router.get('/offers', getSpecialOffers);
router.get('/coupons', getCoupons);

// Admin CMS endpoints
router.put('/settings', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateSettings);

router.post('/banners', protect, authorize('Super Admin', 'Administrator', 'Manager'), createBanner);
router.put('/banners/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateBanner);
router.delete('/banners/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), deleteBanner);

router.post('/gallery', protect, authorize('Super Admin', 'Administrator', 'Manager'), createGalleryItem);
router.delete('/gallery/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), deleteGalleryItem);

router.post('/testimonials', createTestimonial); // Can be submitted by guests
router.put('/testimonials/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateTestimonial);
router.delete('/testimonials/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), deleteTestimonial);

router.post('/offers', protect, authorize('Super Admin', 'Administrator', 'Manager'), createSpecialOffer);
router.put('/offers/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateSpecialOffer);

router.post('/coupons', protect, authorize('Super Admin', 'Administrator', 'Manager'), createCoupon);
router.put('/coupons/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateCoupon);

export default router;
