import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, Role } from '../models/User.js';
import { Villa, RoomCategory, Room, AvailabilityBlock, PropertyLocation } from '../models/Villa.js';
import { Reservation, Coupon } from '../models/Reservation.js';
import { Customer } from '../models/Customer.js';
import { Lead, FollowUp, Quotation } from '../models/CRM.js';
import { Invoice, Payment } from '../models/Billing.js';
import { Vendor, VendorBill, Payout, Expense, ExpenseCategory } from '../models/Finance.js';
import { WebsiteSettings, Banner, GalleryItem, Testimonial, SpecialOffer } from '../models/Website.js';
import { Notification } from '../models/System.js';

export const ensureMultiLocationsAnd120Rooms = async () => {
  try {
    // 1. Check or create Locations
    let locLonavala = await PropertyLocation.findOne({ code: 'LNV' });
    if (!locLonavala) {
      locLonavala = await PropertyLocation.create({
        name: 'Moon Light Resort & Private Estate - Lonavala',
        code: 'LNV',
        city: 'Lonavala',
        state: 'Maharashtra',
        country: 'India',
        address: 'Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road',
        pincode: '410401',
        phone: '+91 98200 12345',
        email: 'lonavala@moonlightvilla.com',
        managerName: 'Rohan Deshmukh',
        managerPhone: '+91 98200 22222',
        description: 'Our flagship 60-room hilltop luxury sanctuary featuring panoramic valley horizons, heated infinity glass pool, and bespoke butler service.',
        amenities: ['Heated Infinity Pool', 'Valley Views', 'Spa & Wellness', 'Private Dining', 'Helipad', 'EV Charging'],
        totalRooms: 60,
        isActive: true
      });
    }

    let locGoa = await PropertyLocation.findOne({ code: 'GOA' });
    if (!locGoa) {
      locGoa = await PropertyLocation.create({
        name: 'Moon Light Beachfront Resort & Ocean Villas - North Goa',
        code: 'GOA',
        city: 'Candolim',
        state: 'Goa',
        country: 'India',
        address: 'Beachside Enclave, Sinquerim Coastal Road, Candolim',
        pincode: '403515',
        phone: '+91 98200 23456',
        email: 'goa@moonlightvilla.com',
        managerName: 'Vikram Salgaonkar',
        managerPhone: '+91 98200 77777',
        description: 'An idyllic 30-room beachside paradise with direct golden sand access, private plunge pools, and open-air cabana dining.',
        amenities: ['Direct Beach Access', 'Beachside Bar', 'Plunge Pools', 'Water Sports', 'Sunset Deck'],
        totalRooms: 30,
        isActive: true
      });
    }

    let locAlibaug = await PropertyLocation.findOne({ code: 'ABG' });
    if (!locAlibaug) {
      locAlibaug = await PropertyLocation.create({
        name: 'Moon Light Coastal Palms & Spa - Alibaug',
        code: 'ABG',
        city: 'Alibaug',
        state: 'Maharashtra',
        country: 'India',
        address: 'Awas Beach Road, Mandwa Jetty Enclave, Alibaug',
        pincode: '402201',
        phone: '+91 98200 34567',
        email: 'alibaug@moonlightvilla.com',
        managerName: 'Ananya Patil',
        managerPhone: '+91 98200 88888',
        description: 'A 30-room tranquil sanctuary surrounded by coconut groves, private courtyard gardens, and holistic Ayurvedic therapy pavilions.',
        amenities: ['Ayurvedic Spa', 'Coconut Grove Gardens', 'Speedboat Transfer', 'Organic Dining', 'Yoga Pavilion'],
        totalRooms: 30,
        isActive: true
      });
    }

    // 2. Ensure Villas for each location
    let mainVilla = await Villa.findOne({ slug: 'moon-light-villa-estate' });
    if (!mainVilla) {
      mainVilla = await Villa.create({
        name: 'Moon Light Villa Estate',
        slug: 'moon-light-villa-estate',
        propertyLocation: locLonavala._id,
        tagline: 'Panoramic 5-Bedroom Hilltop Private Sanctuary',
        description: 'Perched atop an exclusive hill in Lonavala, Moon Light Villa Estate is an architectural masterpiece featuring 5 lavish master suites, heated infinity pool, and dedicated butler service.',
        shortDescription: 'Ultra-luxury 5-bedroom private estate with infinity pool and valley vistas.',
        location: {
          address: 'Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road',
          city: 'Lonavala',
          state: 'Maharashtra',
          pincode: '410401'
        },
        amenities: ['Heated Infinity Pool', 'Private Chef', 'Valley Views', 'Jacuzzi in Suites', 'High-Speed Wi-Fi'],
        specs: { bedrooms: 5, bathrooms: 6, privatePool: true, maxGuests: 16, squareFeet: 9200 },
        pricing: { basePricePerNight: 45000, weekendPricePerNight: 55000, cleaningFee: 3000, securityDeposit: 15000, taxPercentage: 18 },
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', caption: 'Villa Grand Exterior', isPrimary: true }
        ],
        isFeatured: true,
        isActive: true,
        displayOrder: 1
      });
    } else if (!mainVilla.propertyLocation) {
      mainVilla.propertyLocation = locLonavala._id;
      await mainVilla.save();
    }

    let chaletVilla = await Villa.findOne({ slug: 'moon-light-celestial-chalet' });
    if (!chaletVilla) {
      chaletVilla = await Villa.create({
        name: 'Moon Light Celestial Chalet',
        slug: 'moon-light-celestial-chalet',
        propertyLocation: locLonavala._id,
        tagline: '3-Bedroom Scandinavian Wood & Glass Villa',
        description: 'A cozy yet grand sanctuary nestled amidst pine groves with plunge pool and bonfire deck.',
        shortDescription: 'Intimate 3-bedroom luxury retreat with private plunge pool.',
        location: {
          address: 'Upper Pine Ridge, Moon Light Valley, Lonavala',
          city: 'Lonavala',
          state: 'Maharashtra',
          pincode: '410401'
        },
        amenities: ['Private Plunge Pool', 'Fireplace', 'Mountain Views', 'Wi-Fi'],
        specs: { bedrooms: 3, bathrooms: 4, privatePool: true, maxGuests: 10, squareFeet: 5400 },
        pricing: { basePricePerNight: 28000, weekendPricePerNight: 35000, cleaningFee: 2000, securityDeposit: 10000, taxPercentage: 18 },
        images: [
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80', caption: 'Chalet Pine Ridge Facade', isPrimary: true }
        ],
        isFeatured: true,
        isActive: true,
        displayOrder: 2
      });
    } else if (!chaletVilla.propertyLocation) {
      chaletVilla.propertyLocation = locLonavala._id;
      await chaletVilla.save();
    }

    let goaVilla = await Villa.findOne({ slug: 'moon-light-goa-beachfront' });
    if (!goaVilla) {
      goaVilla = await Villa.create({
        name: 'Moon Light Oceanfront Beach Villa',
        slug: 'moon-light-goa-beachfront',
        propertyLocation: locGoa._id,
        tagline: 'Direct Oceanfront Private Pool Luxury Villa in North Goa',
        description: 'Unobstructed Arabian Sea panoramas with direct private access to Candolim sands, sunset plunge pools, and open-air cocktail pavilions.',
        shortDescription: 'Exquisite beachfront villa with private pool, tropical gardens, and ocean horizons.',
        location: {
          address: 'Beachside Enclave, Sinquerim Coastal Road, Candolim',
          city: 'Candolim',
          state: 'Goa',
          pincode: '403515'
        },
        amenities: ['Direct Beach Access', 'Private Plunge Pool', 'Sunset Cocktail Bar', 'Butler Service', 'High-Speed Wi-Fi'],
        specs: { bedrooms: 4, bathrooms: 5, privatePool: true, maxGuests: 12, squareFeet: 7500 },
        pricing: { basePricePerNight: 38000, weekendPricePerNight: 46000, cleaningFee: 2500, securityDeposit: 15000, taxPercentage: 18 },
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', caption: 'Goa Beachfront Pool Deck', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80', caption: 'Ocean Breeze Living Lounge', isPrimary: false }
        ],
        isFeatured: true,
        isActive: true,
        displayOrder: 3
      });
    }

    let alibaugVilla = await Villa.findOne({ slug: 'moon-light-alibaug-palms' });
    if (!alibaugVilla) {
      alibaugVilla = await Villa.create({
        name: 'Moon Light Coastal Palms Villa',
        slug: 'moon-light-alibaug-palms',
        propertyLocation: locAlibaug._id,
        tagline: 'Secluded Palm Grove Sanctuary with Courtyard Pool',
        description: 'Nestled amidst whispering coastal palms, this Mediterranean-inspired villa features tranquil stone waterbodies, private lap pool, and alfresco dining pavilions.',
        shortDescription: 'Tropical coastal villa with courtyard pool and lush coconut groves.',
        location: {
          address: 'Awas Beach Road, Mandwa Jetty Enclave, Alibaug',
          city: 'Alibaug',
          state: 'Maharashtra',
          pincode: '402201'
        },
        amenities: ['Courtyard Lap Pool', 'Ayurvedic Pavilion', 'Private Chef', 'Bespoke Barbecue', 'EV Charging'],
        specs: { bedrooms: 4, bathrooms: 5, privatePool: true, maxGuests: 12, squareFeet: 6800 },
        pricing: { basePricePerNight: 32000, weekendPricePerNight: 40000, cleaningFee: 2000, securityDeposit: 12000, taxPercentage: 18 },
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', caption: 'Alibaug Palms Courtyard', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80', caption: 'Lush Garden Lounge', isPrimary: false }
        ],
        isFeatured: true,
        isActive: true,
        displayOrder: 4
      });
    }

    // 3. Ensure Room Categories
    let catPresidential = await RoomCategory.findOne({ name: 'Presidential Royal Suite' });
    if (!catPresidential) {
      catPresidential = await RoomCategory.create({
        name: 'Presidential Royal Suite',
        villa: mainVilla?._id || chaletVilla._id,
        description: 'Ultra-luxurious suite with private jacuzzi, panoramic horizons, and custom timber canopy bed.',
        maxAdults: 2,
        maxChildren: 2,
        basePrice: 18000,
        weekendPrice: 22000,
        extraGuestCharge: 2500,
        amenities: ['Private Jacuzzi', 'Panoramic Balcony', 'King Bed', 'Espresso Machine', 'Mini Bar']
      });
    }

    let catPool = await RoomCategory.findOne({ name: 'Infinity Pool View Suite' });
    if (!catPool) {
      catPool = await RoomCategory.create({
        name: 'Infinity Pool View Suite',
        villa: mainVilla?._id || chaletVilla._id,
        description: 'Direct step-out access to poolside sundeck with floor-to-ceiling glass panoramic views.',
        maxAdults: 2,
        maxChildren: 1,
        basePrice: 14000,
        weekendPrice: 17000,
        extraGuestCharge: 1500,
        amenities: ['Pool Access', 'Italian Marble Bath', 'Smart TV', 'Lounge Seating']
      });
    }

    let catDeluxe = await RoomCategory.findOne({ name: 'Executive Deluxe Chamber' });
    if (!catDeluxe) {
      catDeluxe = await RoomCategory.create({
        name: 'Executive Deluxe Chamber',
        villa: mainVilla?._id || chaletVilla._id,
        description: 'Sophisticated modern suite with ergonomic workspace, plush pillow-top king bed, and private veranda.',
        maxAdults: 2,
        maxChildren: 1,
        basePrice: 11000,
        weekendPrice: 13500,
        extraGuestCharge: 1500,
        amenities: ['Private Veranda', 'High-Speed Wi-Fi', 'Rain Shower', 'Coffee Maker']
      });
    }

    let catOcean = await RoomCategory.findOne({ name: 'Ocean Breeze Beachfront Suite' });
    if (!catOcean) {
      catOcean = await RoomCategory.create({
        name: 'Ocean Breeze Beachfront Suite',
        villa: goaVilla._id,
        description: 'Direct step-out beach views, teak balconies, sea-spray breezes, and private plunge pool access.',
        maxAdults: 2,
        maxChildren: 2,
        basePrice: 16500,
        weekendPrice: 20000,
        extraGuestCharge: 2000,
        amenities: ['Direct Sea View', 'Private Plunge Pool', 'Outdoor Daybed', 'Mini Bar']
      });
    }

    let catPalm = await RoomCategory.findOne({ name: 'Palm Grove Heritage Villa Room' });
    if (!catPalm) {
      catPalm = await RoomCategory.create({
        name: 'Palm Grove Heritage Villa Room',
        villa: alibaugVilla._id,
        description: 'Open-to-sky shower, private courtyard garden, handcrafted terracotta accents, and king posturepedic bed.',
        maxAdults: 2,
        maxChildren: 1,
        basePrice: 13500,
        weekendPrice: 16000,
        extraGuestCharge: 1500,
        amenities: ['Courtyard Garden', 'Open Sky Shower', 'Organic Toiletries', 'Wi-Fi']
      });
    }

    // 4. Ensure Exactly 120 Operational Rooms
    const currentRoomCount = await Room.countDocuments();
    if (currentRoomCount < 120) {
      console.log(` Provisioning full 120-room luxury inventory across 3 locations (current: ${currentRoomCount})...`);
      // Clear legacy small test rooms to ensure clean 120 room matrix
      await Room.deleteMany({});

      const roomsToInsert = [];

      // Helper for realistic room status distribution
      const getStatusForIndex = (num) => {
        if ([101, 107, 114, 122, 201, 205, 212, 225, 301, 308, 317, 325, 401, 409, 418, 426].includes(num)) return 'Occupied';
        if ([103, 118, 204, 219, 305, 320, 404, 422].includes(num)) return 'Cleaning';
        if ([105, 208, 310, 412].includes(num)) return 'Maintenance';
        if ([109, 215, 302, 406].includes(num)) return 'Reserved';
        return 'Available';
      };

      // --- LOCATION 1: LONAVALA (60 ROOMS) ---
      // Wing A - Floor 1: Rooms 101 to 130 (30 Rooms)
      for (let i = 101; i <= 130; i++) {
        let cat = catPresidential._id;
        let namePrefix = 'Presidential Royal Suite';
        let baseP = 18000;
        let wkndP = 22000;
        if (i > 110 && i <= 120) {
          cat = catPool._id;
          namePrefix = 'Infinity Pool Suite';
          baseP = 14000;
          wkndP = 17000;
        } else if (i > 120) {
          cat = catDeluxe._id;
          namePrefix = 'Valley Deluxe Chamber';
          baseP = 11000;
          wkndP = 13500;
        }

        roomsToInsert.push({
          roomNumber: `LNV-${i}`,
          name: `${namePrefix} ${i}`,
          propertyLocation: locLonavala._id,
          villa: mainVilla?._id || chaletVilla._id,
          category: cat,
          wing: 'Wing A (Valley Wing)',
          floor: 'Floor 1',
          bedType: 'King Size Bed',
          status: getStatusForIndex(i),
          basePrice: baseP,
          weekendPrice: wkndP,
          extraGuestCharge: 1500,
          maxAdults: 2,
          maxChildren: 1,
          amenities: ['Panoramic Valley View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar', 'Climate Control'],
          isActive: true
        });
      }

      // Wing B - Floor 2: Rooms 201 to 230 (30 Rooms)
      for (let i = 201; i <= 230; i++) {
        let cat = catPresidential._id;
        let namePrefix = 'Royal Penthouse Suite';
        let baseP = 18000;
        let wkndP = 22000;
        if (i > 210 && i <= 220) {
          cat = catPool._id;
          namePrefix = 'Poolside Sunset Suite';
          baseP = 14000;
          wkndP = 17000;
        } else if (i > 220) {
          cat = catDeluxe._id;
          namePrefix = 'Hillcrest Deluxe Room';
          baseP = 11000;
          wkndP = 13500;
        }

        roomsToInsert.push({
          roomNumber: `LNV-${i}`,
          name: `${namePrefix} ${i}`,
          propertyLocation: locLonavala._id,
          villa: mainVilla?._id || chaletVilla._id,
          category: cat,
          wing: 'Wing B (Skyline Wing)',
          floor: 'Floor 2',
          bedType: 'King Size Bed',
          status: getStatusForIndex(i),
          basePrice: baseP,
          weekendPrice: wkndP,
          extraGuestCharge: 1500,
          maxAdults: 2,
          maxChildren: 1,
          amenities: ['Panoramic Valley View', 'High-Speed Wi-Fi', 'Smart TV', 'Mini Bar', 'Climate Control'],
          isActive: true
        });
      }

      // --- LOCATION 2: GOA BEACHFRONT (30 ROOMS) ---
      // Ocean Wing: Rooms 301 to 330 (30 Rooms)
      for (let i = 301; i <= 330; i++) {
        let cat = i <= 315 ? catOcean._id : catPool._id;
        let namePrefix = i <= 315 ? 'Ocean Breeze Beach Suite' : 'Goa Sunset Pool Villa Room';
        let baseP = i <= 315 ? 16500 : 14000;
        let wkndP = i <= 315 ? 20000 : 17000;

        roomsToInsert.push({
          roomNumber: `GOA-${i}`,
          name: `${namePrefix} ${i}`,
          propertyLocation: locGoa._id,
          villa: goaVilla._id,
          category: cat,
          wing: 'Oceanfront Wing',
          floor: i <= 315 ? 'Ground Floor Beachfront' : 'First Floor Sea Deck',
          bedType: 'King Size Four-Poster Bed',
          status: getStatusForIndex(i),
          basePrice: baseP,
          weekendPrice: wkndP,
          extraGuestCharge: 2000,
          maxAdults: 2,
          maxChildren: 1,
          amenities: ['Direct Sea View', 'Private Plunge Pool Access', 'Mini Bar', 'Outdoor Sun Lounger'],
          isActive: true
        });
      }

      // --- LOCATION 3: ALIBAUG PALMS (30 ROOMS) ---
      // Palms Wing: Rooms 401 to 430 (30 Rooms)
      for (let i = 401; i <= 430; i++) {
        let cat = i <= 415 ? catPalm._id : catDeluxe._id;
        let namePrefix = i <= 415 ? 'Palm Grove Heritage Cottage' : 'Zen Courtyard Chamber';
        let baseP = i <= 415 ? 13500 : 11500;
        let wkndP = i <= 415 ? 16000 : 14000;

        roomsToInsert.push({
          roomNumber: `ABG-${i}`,
          name: `${namePrefix} ${i}`,
          propertyLocation: locAlibaug._id,
          villa: alibaugVilla._id,
          category: cat,
          wing: 'Palms & Courtyard Wing',
          floor: i <= 415 ? 'Cottage Level' : 'Upper Veranda',
          bedType: 'Handcrafted Teak King Bed',
          status: getStatusForIndex(i),
          basePrice: baseP,
          weekendPrice: wkndP,
          extraGuestCharge: 1500,
          maxAdults: 2,
          maxChildren: 1,
          amenities: ['Private Courtyard Garden', 'Open-Air Rain Shower', 'Organic Toiletries', 'Wi-Fi'],
          isActive: true
        });
      }

      await Room.insertMany(roomsToInsert);
      console.log(` Successfully seeded all 120 operational rooms across 3 luxury resort locations!`);
    }

    // Update location room counts
    await PropertyLocation.findByIdAndUpdate(locLonavala._id, { totalRooms: 60 });
    await PropertyLocation.findByIdAndUpdate(locGoa._id, { totalRooms: 30 });
    await PropertyLocation.findByIdAndUpdate(locAlibaug._id, { totalRooms: 30 });

  } catch (err) {
    console.error('Error ensuring locations and rooms:', err);
  }
};

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(' Database already initialized with existing users.');
      // Do not auto-recreate inventory if users exist, allowing custom villa/location setup
      return;
    }

    console.log(' Initializing MOON LIGHT VILLA seed data...');

    // 1. Roles
    const rolesData = [
      { name: 'Super Admin', description: 'Full root access to all system modules and settings', isSystem: true },
      { name: 'Administrator', description: 'Administrative control over reservations, finance, and staff', isSystem: true },
      { name: 'Manager', description: 'Daily operations, inventory, and staff oversight', isSystem: true },
      { name: 'Receptionist', description: 'Front desk, check-in, check-out, and guest bookings', isSystem: true },
      { name: 'Sales Executive', description: 'CRM leads, enquiries, quotations, and conversions', isSystem: true },
      { name: 'Accountant', description: 'Billing, invoices, payouts, expenses, and GST reporting', isSystem: true },
      { name: 'Housekeeping Staff', description: 'Room cleaning and maintenance tracking', isSystem: true },
    ];
    await Role.insertMany(rolesData);

    // 2. Staff Users
    const users = await User.create([
      {
        name: 'Aarav Singhania',
        email: 'admin@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 11111',
        role: 'Super Admin',
        isActive: true
      },
      {
        name: 'Rohan Deshmukh',
        email: 'manager@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 22222',
        role: 'Manager',
        isActive: true
      },
      {
        name: 'Priya Sharma',
        email: 'reception@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 33333',
        role: 'Receptionist',
        isActive: true
      },
      {
        name: 'Sameer Verma',
        email: 'sales@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 44444',
        role: 'Sales Executive',
        isActive: true
      },
      {
        name: 'Meera Iyer',
        email: 'accounts@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 55555',
        role: 'Accountant',
        isActive: true
      }
    ]);

    console.log(' Staff login credentials and roles verified.');
    console.log(' Admin credentials: admin@moonlightvilla.com / password123');

    // Populate demo inventory/transactions by default unless explicitly disabled with SEED_DEMO_DATA=false
    if (process.env.SEED_DEMO_DATA !== 'false') {
      console.log(' Populating demo inventory and transactions...');
      // 3. Villas
      const mainVilla = await Villa.create({
      name: 'Moon Light Villa Estate',
      slug: 'moon-light-villa-estate',
      tagline: 'Panoramic 5-Bedroom Hilltop Private Sanctuary',
      description: 'Perched atop an exclusive hill in Lonavala, Moon Light Villa Estate is an architectural masterpiece designed for discerning travelers. Featuring 5 lavish master suites, a temperature-controlled infinity glass pool overlooking whispering pine valleys, expansive sun decks, private cinema lounge, and dedicated butler service.',
      shortDescription: 'Ultra-luxury 5-bedroom private estate with infinity pool, panoramic valley vistas, and bespoke culinary concierge.',
      location: {
        address: 'Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road',
        city: 'Lonavala',
        state: 'Maharashtra',
        pincode: '410401'
      },
      amenities: [
        'Heated Infinity Glass Pool',
        'Private Dedicated Chef & Butler',
        'Panoramic Valley Horizon Views',
        'Private Jacuzzi in Master Suites',
        'High-Speed Wi-Fi (1 Gbps Fiber)',
        'Dolby Atmos Home Cinema Lounge',
        'Landscaped Sunset Lawn & Gazebo',
        'BBQ & Bonfire Firepit Lounge',
        '24/7 Gated Security & Valet Parking',
        'Full Power Backup & EV Charging'
      ],
      features: [
        { title: 'Panoramic Infinity Pool', description: 'Overlooking mist-covered valleys with ambient mood lighting.', icon: 'pool' },
        { title: 'Bespoke Private Chef', description: 'Tailored 5-course gourmet dining with organic fresh ingredients.', icon: 'chef' },
        { title: '5 Master Suites', description: 'Italian marble en-suite bathrooms, private balconies, king posturepedic beds.', icon: 'bed' },
        { title: 'Sunset Gazebo & Firepit', description: 'Ideal for stargazing, acoustic music, and intimate gatherings.', icon: 'sun' }
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', caption: 'Villa Grand Exterior & Infinity Pool', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', caption: 'Twilight Sunset Deck', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80', caption: 'Living Lounge with Floor-to-Ceiling Glass', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80', caption: 'Presidential Master Suite', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80', caption: 'Royal En-Suite Marble Bath with Mountain View', isPrimary: false }
      ],
      specs: {
        bedrooms: 5,
        bathrooms: 6,
        privatePool: true,
        maxGuests: 16,
        squareFeet: 9200
      },
      pricing: {
        basePricePerNight: 45000,
        weekendPricePerNight: 55000,
        cleaningFee: 3000,
        securityDeposit: 15000,
        taxPercentage: 18
      },
      rules: [
        'Check-in at 2:00 PM, Check-out at 11:00 AM',
        'Valid Government photo ID mandatory for all guests at check-in',
        'Smoking permitted only in designated outdoor balconies & garden',
        'Loud music outdoors restricted after 10:00 PM as per local council guidelines',
        'Refundable security deposit collected at check-in'
      ],
      isFeatured: true,
      isActive: true,
      displayOrder: 1
    });

    const chaletVilla = await Villa.create({
      name: 'Moon Light Celestial Chalet',
      slug: 'moon-light-celestial-chalet',
      tagline: '3-Bedroom Scandinavian Wood & Glass Villa',
      description: 'A cozy yet grand sanctuary nestled amidst pine groves. Featuring vaulted timber ceilings, floor-to-ceiling glass walls, plunge pool, and private bonfire deck.',
      shortDescription: 'Intimate 3-bedroom luxury retreat with private plunge pool and mountain views.',
      location: {
        address: 'Upper Pine Ridge, Moon Light Valley, Lonavala',
        city: 'Lonavala',
        state: 'Maharashtra',
        pincode: '410401'
      },
      amenities: [
        'Private Temperature Plunge Pool',
        'Timber Deck & Fireplace',
        'Mountain View Balconies',
        'Gourmet Breakfast Included',
        'High-Speed Wi-Fi',
        'Smart Entertainment System'
      ],
      specs: {
        bedrooms: 3,
        bathrooms: 4,
        privatePool: true,
        maxGuests: 10,
        squareFeet: 5400
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80', caption: 'Chalet Pine Ridge Facade', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80', caption: 'Plunge Pool & Timber Sunbed', isPrimary: false }
      ],
      pricing: {
        basePricePerNight: 28000,
        weekendPricePerNight: 35000,
        cleaningFee: 2000,
        securityDeposit: 10000,
        taxPercentage: 18
      },
      isFeatured: true,
      isActive: true,
      displayOrder: 2
    });

    // 4. Room Categories for Main Villa
    const catMaster = await RoomCategory.create({
      name: 'Presidential Master Suite',
      villa: mainVilla._id,
      description: 'Expansive penthouse suite with private wrap-around terrace, jacuzzi, and king canopy bed.',
      maxAdults: 2,
      maxChildren: 2,
      basePrice: 16000,
      weekendPrice: 19000,
      extraGuestCharge: 2000,
      amenities: ['Private Jacuzzi', 'Valley View Terrace', 'King Bed', 'Espresso Machine', 'Walk-in Wardrobe']
    });

    const catPool = await RoomCategory.create({
      name: 'Infinity Pool View Suite',
      villa: mainVilla._id,
      description: 'Direct step-out access to the heated pool terrace with floor-to-ceiling glass views.',
      maxAdults: 2,
      maxChildren: 1,
      basePrice: 12000,
      weekendPrice: 15000,
      extraGuestCharge: 1500,
      amenities: ['Pool Access', 'Italian Marble Shower', 'Lounge Seating', 'Smart TV']
    });

    const catGarden = await RoomCategory.create({
      name: 'Royal Garden Chamber',
      villa: mainVilla._id,
      description: 'Serene bedroom overlooking the manicured Japanese Zen garden and exotic flora.',
      maxAdults: 2,
      maxChildren: 1,
      basePrice: 10000,
      weekendPrice: 12500,
      extraGuestCharge: 1500,
      amenities: ['Garden Patio', 'Plush Bedding', 'Rain Shower', 'Work Desk']
    });

    // 5. Multi-Location & 120 Rooms Inventory Setup
    await ensureMultiLocationsAnd120Rooms();

    // 6. Website Settings
    await WebsiteSettings.create({
      siteName: 'MOON LIGHT VILLA',
      tagline: 'Luxury Private Sanctuary & Panoramic Hilltop Estate',
      contactEmail: 'concierge@moonlightvilla.com',
      contactPhone: '+91 98200 12345',
      whatsappNumber: '+91 98200 12345',
      address: 'Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road, Lonavala, MH 410401',
      socialLinks: {
        instagram: 'https://instagram.com/moonlightvilla',
        facebook: 'https://facebook.com/moonlightvilla',
        youtube: 'https://youtube.com/@moonlightvilla'
      },
      heroBanner: {
        headline: 'Where Timeless Elegance Meets Serene Horizons',
        subheadline: 'An exclusive private hilltop retreat offering panoramic valley vistas, an infinity glass pool, and bespoke luxury hospitality.',
        ctaText: 'Reserve Your Sanctuary',
        backgroundImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80'
      }
    });

    // 7. Banners
    await Banner.create([
      {
        title: 'Heated Infinity Glass Pool',
        subtitle: 'Swim above the clouds with panoramic horizon vistas.',
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
        badge: 'Signature Amenity',
        ctaText: 'Explore Estate',
        ctaLink: '/villas',
        displayOrder: 1
      },
      {
        title: 'Bespoke Gourmet Culinary Art',
        subtitle: 'Handcrafted menus by our executive private chefs.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
        badge: 'Private Dining',
        ctaText: 'View Menus',
        ctaLink: '/about',
        displayOrder: 2
      }
    ]);

    // 8. Gallery Items
    await GalleryItem.create([
      { title: 'Estate Exterior at Dusk', category: 'Architecture & Exterior', imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', displayOrder: 1 },
      { title: 'Valley Infinity Glass Pool', category: 'Infinity Pool', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', displayOrder: 2 },
      { title: 'The Penthouse Master Suite', category: 'Master Suites', imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', displayOrder: 3 },
      { title: 'Grand Architectural Living Salon', category: 'Living & Lounge', imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', displayOrder: 4 },
      { title: 'Candlelight Deck Dining', category: 'Dining & Bar', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', displayOrder: 5 },
      { title: 'Panoramic Hill Sunset Horizon', category: 'Scenic Horizons', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', displayOrder: 6 }
    ]);

    // 9. Testimonials
    await Testimonial.create([
      {
        guestName: 'Vikram & Radhika Oberoi',
        location: 'South Mumbai',
        rating: 5,
        stayDate: 'October 2026',
        reviewText: 'Moon Light Villa exceeded every expectation. The infinity pool overlooking the foggy valley at sunrise was heavenly. The chef prepared an exquisite 5-course coastal dinner. Flawless hospitality!',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      {
        guestName: 'Kabir Singhal',
        location: 'Pune',
        rating: 5,
        stayDate: 'September 2026',
        reviewText: 'We celebrated our 10th anniversary with family here. The privacy, Dolby Atmos cinema lounge, and breathtaking grounds made it unforgettable. Looking forward to our next visit!',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      {
        guestName: 'Ananya Deshpande',
        location: 'Bangalore',
        rating: 5,
        stayDate: 'August 2026',
        reviewText: 'The attention to detail is world-class. From the scented towels on arrival to the personalized breakfast by the pool, Moon Light Villa stands in a league of its own.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
      }
    ]);

    // 10. Special Offers & Coupons
    await SpecialOffer.create([
      {
        title: 'Winter Luxury Retreat',
        tagline: 'Complimentary Chef BBQ & Bonfire Experience',
        discountText: '20% OFF',
        description: 'Book 3 or more nights this winter and receive a 20% privilege discount plus an evening private poolside barbecue.',
        couponCode: 'WINTER20',
        validUntil: new Date('2026-12-31')
      },
      {
        title: 'Midweek Rejuvenation',
        tagline: 'Escape Monday through Thursday',
        discountText: 'FLAT ₹10,000 OFF',
        description: 'Unwind amidst tranquil hilltop nature. Valid for full villa bookings from Monday to Thursday.',
        couponCode: 'MIDWEEK10K',
        validUntil: new Date('2026-11-30')
      }
    ]);

    await Coupon.create([
      {
        code: 'WELCOME10',
        title: 'Welcome Privilege Discount',
        description: '10% off on first direct reservation',
        discountType: 'Percentage',
        discountValue: 10,
        minBookingAmount: 30000,
        maxDiscountAmount: 8000,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2027-12-31')
      },
      {
        code: 'LUXURY2026',
        title: 'VIP Estate Privilege',
        description: 'Flat ₹5,000 deduction on full villa booking',
        discountType: 'Fixed',
        discountValue: 5000,
        minBookingAmount: 50000,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2027-12-31')
      }
    ]);

    // 11. Customers
    const customer1 = await Customer.create({
      fullName: 'Vikram Oberoi',
      email: 'vikram.oberoi@example.com',
      phone: '+91 98201 99991',
      address: {
        street: 'Altamount Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400026'
      },
      isRepeatGuest: true,
      vipStatus: true,
      totalBookingsCount: 3,
      totalSpent: 285000
    });

    const customer2 = await Customer.create({
      fullName: 'Natasha Poonawalla',
      email: 'natasha.p@example.com',
      phone: '+91 98202 88882',
      address: {
        street: 'Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      isRepeatGuest: false,
      vipStatus: true,
      totalBookingsCount: 1,
      totalSpent: 110000
    });

    // 12. Reservations with Invoices and Payments
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 2);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 2);

    const res1 = await Reservation.create({
      bookingReference: 'MLV-2026-X89K2',
      bookingType: 'Full Villa',
      villa: mainVilla._id,
      customer: customer1._id,
      guestDetails: {
        fullName: 'Vikram Oberoi',
        email: 'vikram.oberoi@example.com',
        phone: '+91 98201 99991',
        city: 'Mumbai',
        specialRequests: 'Vegan dinner menu preference for 2 guests. Setup heated pool upon arrival.'
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalNights: 2,
      guests: { adults: 6, children: 2 },
      pricing: {
        roomCharges: 90000,
        cleaningFee: 3000,
        discountAmount: 5000,
        couponCode: 'LUXURY2026',
        taxableAmount: 88000,
        gstPercentage: 18,
        gstAmount: 15840,
        securityDeposit: 15000,
        totalAmount: 118840,
        advanceRequired: 59420,
        advancePaid: 59420,
        balanceDue: 59420
      },
      status: 'Confirmed',
      paymentStatus: 'Advance Paid',
      bookingSource: 'Website Direct'
    });

    const inv1 = await Invoice.create({
      invoiceNumber: 'INV-2026-1001',
      invoiceType: 'Advance Invoice',
      reservation: res1._id,
      customer: customer1._id,
      customerDetails: {
        fullName: customer1.fullName,
        email: customer1.email,
        phone: customer1.phone,
        address: 'Altamount Road, Mumbai, MH'
      },
      items: [{
        description: 'Moon Light Villa Estate - Full Villa Stay (2 Nights)',
        quantity: 2,
        unitPrice: 45000,
        taxableAmount: 88000,
        gstRate: 18,
        gstAmount: 15840,
        total: 118840
      }],
      subTotal: 88000,
      discount: 5000,
      gstDetails: { cgst: 7920, sgst: 7920, totalGst: 15840 },
      grandTotal: 118840,
      paidAmount: 59420,
      balanceDue: 59420,
      status: 'Partially Paid'
    });

    await Payment.create({
      paymentReference: 'PAY-2026-1001',
      invoice: inv1._id,
      reservation: res1._id,
      customer: customer1._id,
      amount: 59420,
      paymentType: 'Advance',
      paymentMethod: 'Razorpay Online',
      transactionId: 'pay_mock_992147129',
      status: 'Completed'
    });

    // Seed Goa reservation, fully paid zero-balance invoice, and scoped user for isolation testing
    const locGoa = await PropertyLocation.findOne({ code: 'GOA' });
    const goaVilla = await Villa.findOne({ slug: 'moon-light-goa-beachfront' });

    if (locGoa) {
      await User.create({
        name: 'Vikram Salgaonkar (Goa Manager)',
        email: 'goamanager@moonlightvilla.com',
        password: 'password123',
        phone: '+91 98200 77777',
        role: 'Manager',
        accessScope: 'Specific Location',
        assignedLocation: locGoa._id,
        isActive: true
      });
    }

    if (goaVilla && locGoa) {
      const goaCheckIn = new Date();
      goaCheckIn.setDate(goaCheckIn.getDate() + 5);
      const goaCheckOut = new Date(goaCheckIn);
      goaCheckOut.setDate(goaCheckOut.getDate() + 2);

      const res2 = await Reservation.create({
        bookingReference: 'MLV-2026-GOA01',
        bookingType: 'Full Villa',
        villa: goaVilla._id,
        propertyLocation: locGoa._id,
        customer: customer2._id,
        guestDetails: {
          fullName: 'Natasha Poonawalla',
          email: 'natasha.p@example.com',
          phone: '+91 98202 88882',
          city: 'Pune',
          specialRequests: 'Beachfront barbecue setup on second evening.'
        },
        checkIn: goaCheckIn,
        checkOut: goaCheckOut,
        totalNights: 2,
        guests: { adults: 4, children: 1 },
        pricing: {
          roomCharges: 76000,
          cleaningFee: 2500,
          discountAmount: 3500,
          taxableAmount: 75000,
          gstPercentage: 18,
          gstAmount: 13500,
          securityDeposit: 15000,
          totalAmount: 88500,
          advanceRequired: 88500,
          advancePaid: 88500,
          balanceDue: 0
        },
        status: 'Confirmed',
        paymentStatus: 'Fully Paid',
        bookingSource: 'Website Direct'
      });

      const inv2 = await Invoice.create({
        invoiceNumber: 'INV-2026-1002',
        invoiceType: 'Final Invoice',
        reservation: res2._id,
        customer: customer2._id,
        customerDetails: {
          fullName: customer2.fullName,
          email: customer2.email,
          phone: customer2.phone,
          address: 'Koregaon Park, Pune, MH'
        },
        items: [{
          description: 'Moon Light Oceanfront Beach Villa - Full Stay (2 Nights)',
          quantity: 2,
          unitPrice: 38000,
          taxableAmount: 75000,
          gstRate: 18,
          gstAmount: 13500,
          total: 88500
        }],
        subTotal: 75000,
        discount: 3500,
        gstDetails: { cgst: 6750, sgst: 6750, totalGst: 13500 },
        grandTotal: 88500,
        paidAmount: 88500,
        balanceDue: 0,
        status: 'Paid'
      });

      await Payment.create({
        paymentReference: 'PAY-2026-1002',
        invoice: inv2._id,
        reservation: res2._id,
        customer: customer2._id,
        amount: 88500,
        paymentType: 'Final Settlement',
        paymentMethod: 'UPI',
        transactionId: 'upi_mock_881923011',
        status: 'Completed'
      });
    }

    // 13. CRM Leads
    await Lead.create([
      {
        fullName: 'Sameer Merchant',
        email: 'sameer.m@corporatesolutions.com',
        phone: '+91 98111 22334',
        city: 'Mumbai',
        source: 'Corporate',
        status: 'Interested',
        guestsCount: { adults: 12, children: 0 },
        estimatedBudget: 250000,
        notes: [{ text: 'Looking to book entire estate for corporate leadership summit in December.' }]
      },
      {
        fullName: 'Kavita Chawla',
        email: 'kavita.c@gmail.com',
        phone: '+91 98222 33445',
        city: 'Pune',
        source: 'Call / WhatsApp',
        status: 'Quotation Sent',
        guestsCount: { adults: 8, children: 2 },
        estimatedBudget: 150000,
        notes: [{ text: 'Followed up via WhatsApp. Sent customized PDF quotation with private barbecue add-on.' }]
      },
      {
        fullName: 'Arjun Kapoor',
        email: 'arjun.k@techgrowth.io',
        phone: '+91 98333 44556',
        city: 'Bangalore',
        source: 'Website Direct',
        status: 'New',
        guestsCount: { adults: 4, children: 0 },
        notes: [{ text: 'Inquired for weekend getaway in mid November.' }]
      }
    ]);

    // 14. Vendors & Bills
    const vendor1 = await Vendor.create({
      companyName: 'Aquaclear Pool Services & Chem',
      contactPerson: 'Mahesh Jadhav',
      email: 'mahesh@aquaclearpools.com',
      phone: '+91 97654 32100',
      category: 'Pool Maintenance',
      gstNumber: '27AABCQ1234D1Z5',
      address: { city: 'Lonavala', state: 'Maharashtra' },
      outstandingBalance: 12500,
      totalBilled: 45000,
      totalPaid: 32500
    });

    const vendor2 = await Vendor.create({
      companyName: 'Highland Organic Greens & Gourmet',
      contactPerson: 'Sunil Rao',
      email: 'orders@highlandgreens.in',
      phone: '+91 98220 98765',
      category: 'Food & Provisions',
      address: { city: 'Pune', state: 'Maharashtra' },
      outstandingBalance: 18000,
      totalBilled: 85000,
      totalPaid: 67000
    });

    await VendorBill.create({
      billNumber: 'BILL-OCT-092',
      vendor: vendor1._id,
      description: 'Monthly filtration maintenance, ozone testing, and pool heating maintenance',
      subTotal: 12500,
      gstAmount: 2250,
      totalAmount: 14750,
      paidAmount: 0,
      balanceDue: 14750,
      status: 'Pending'
    });

    // 15. Expense Categories & Expenses
    const catElect = await ExpenseCategory.create({ name: 'Electricity & Utilities', monthlyBudget: 60000 });
    const catMaint = await ExpenseCategory.create({ name: 'Maintenance & Pool Chemicals', monthlyBudget: 40000 });
    const catSalary = await ExpenseCategory.create({ name: 'Staff Salaries & Butler Team', monthlyBudget: 150000 });
    const catProv = await ExpenseCategory.create({ name: 'Kitchen & Gourmet Provisions', monthlyBudget: 80000 });

    await Expense.create([
      {
        expenseNumber: 'EXP-2026-101',
        title: 'MSEDCL Commercial Electricity Bill - October',
        category: catElect._id,
        categoryName: 'Electricity & Utilities',
        villa: mainVilla._id,
        amount: 38400,
        paymentMethod: 'Bank Transfer',
        paidTo: 'Maharashtra State Electricity Distribution',
        approvalStatus: 'Approved'
      },
      {
        expenseNumber: 'EXP-2026-102',
        title: 'Organic Food Provisions for Guest Stays',
        category: catProv._id,
        categoryName: 'Kitchen & Gourmet Provisions',
        villa: mainVilla._id,
        amount: 24500,
        paymentMethod: 'UPI',
        paidTo: 'Highland Organic Greens',
        approvalStatus: 'Approved'
      }
    ]);

    // 16. Payout
    await Payout.create({
      payoutReference: 'PO-2026-101',
      payoutType: 'Vendor Payout',
      recipientName: 'Aquaclear Pool Services & Chem',
      vendor: vendor1._id,
      amount: 15000,
      paymentMethod: 'Bank Transfer (NEFT/IMPS)',
      transactionReference: 'HDFC_NEFT_9824101',
      status: 'Paid',
      notes: 'Cleared September bi-weekly maintenance invoice'
    });

    // 17. Initial system notification
    await Notification.create({
      title: 'Moon Light Villa ERP Online',
      message: 'System loaded successfully with complete luxury villa inventory, CRM leads, and reservation workflows.',
      type: 'system',
      priority: 'normal'
    });

      console.log(' MOON LIGHT VILLA demo data created successfully!');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Failed to run seed standalone:', err);
      process.exit(1);
    }
  })();
}
