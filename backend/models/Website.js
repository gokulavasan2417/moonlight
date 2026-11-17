import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'MOON LIGHT VILLA' },
  tagline: { type: String, default: 'Luxury Private Sanctuary & Panoramic Hilltop Estate' },
  contactEmail: { type: String, default: 'reservations@moonlightvilla.com' },
  contactPhone: { type: String, default: '+91 98200 12345' },
  whatsappNumber: { type: String, default: '+91 98200 12345' },
  address: { 
    type: String, 
    default: 'Moon Light Valley, Whispering Pines Hill, Old Khandala Road, Lonavala, Maharashtra 410401' 
  },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/moonlightvilla' },
    facebook: { type: String, default: 'https://facebook.com/moonlightvilla' },
    youtube: { type: String, default: 'https://youtube.com/@moonlightvilla' },
    tripadvisor: { type: String, default: 'https://tripadvisor.com' }
  },
  seo: {
    metaTitle: { type: String, default: 'Moon Light Villa | Luxury Private Sanctuary & Estate' },
    metaDescription: { 
      type: String, 
      default: 'Book your dream luxury stay at Moon Light Villa. Private infinity pool, 5-star bespoke hospitality, mountain views, and lavish master suites.' 
    },
    metaKeywords: { type: String, default: 'luxury villa, private pool villa, lonavala villa booking, estate rental, 5 star villa' }
  },
  policies: {
    checkInTime: { type: String, default: '2:00 PM' },
    checkOutTime: { type: String, default: '11:00 AM' },
    cancellationPolicy: { 
      type: String, 
      default: 'Free cancellation up to 7 days before check-in. 50% refund between 7 days and 48 hours. Non-refundable within 48 hours of check-in.' 
    },
    houseRules: [{ type: String }]
  },
  heroBanner: {
    headline: { type: String, default: 'Where Timeless Elegance Meets Serene Nature' },
    subheadline: { type: String, default: 'An exclusive private hilltop retreat offering panoramic valley horizons, an infinity glass pool, and bespoke luxury services.' },
    ctaText: { type: String, default: 'Reserve Your Sanctuary' },
    backgroundImage: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80' 
    }
  }
}, { timestamps: true });

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  imageUrl: { type: String, required: true },
  badge: { type: String, default: 'Featured' },
  ctaText: { type: String, default: 'Explore Now' },
  ctaLink: { type: String, default: '/villas' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Architecture & Exterior', 'Infinity Pool', 'Master Suites', 'Living & Lounge', 'Dining & Bar', 'Scenic Horizons', 'Events & Celebrations'],
    default: 'Architecture & Exterior'
  },
  imageUrl: { type: String, required: true },
  caption: String,
  isFeatured: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const testimonialSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  location: { type: String, default: 'Mumbai, India' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  stayDate: { type: String, default: 'October 2026' },
  reviewText: { type: String, required: true },
  avatarUrl: { type: String },
  isFeatured: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

const specialOfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: String,
  discountText: { type: String, required: true }, // e.g. "20% OFF" or "Complimentary Chef's Dinner"
  description: { type: String, required: true },
  imageUrl: String,
  couponCode: String,
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

export const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);
export const Banner = mongoose.model('Banner', bannerSchema);
export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export const SpecialOffer = mongoose.model('SpecialOffer', specialOfferSchema);
