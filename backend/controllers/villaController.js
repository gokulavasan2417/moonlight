import mongoose from 'mongoose';
import { Villa, RoomCategory, Room, PricingRule, AvailabilityBlock, PropertyLocation } from '../models/Villa.js';
import { Reservation } from '../models/Reservation.js';
import { createAuditLog } from '../middleware/auth.js';

// --- LOCATIONS (MULTI-PROPERTY) ---
export const getLocations = async (req, res, next) => {
  try {
    const locations = await PropertyLocation.find().sort({ name: 1 });
    // Compute real-time room count and occupied rooms per location
    const locationsWithStats = await Promise.all(locations.map(async (loc) => {
      const totalRooms = await Room.countDocuments({ propertyLocation: loc._id });
      const occupiedRooms = await Room.countDocuments({ propertyLocation: loc._id, status: 'Occupied' });
      const availableRooms = await Room.countDocuments({ propertyLocation: loc._id, status: 'Available' });
      const cleaningRooms = await Room.countDocuments({ propertyLocation: loc._id, status: 'Cleaning' });
      const maintenanceRooms = await Room.countDocuments({ propertyLocation: loc._id, status: 'Maintenance' });
      return {
        ...loc.toObject(),
        totalRooms,
        occupiedRooms,
        availableRooms,
        cleaningRooms,
        maintenanceRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      };
    }));
    res.json({ success: true, count: locationsWithStats.length, locations: locationsWithStats });
  } catch (err) {
    next(err);
  }
};

export const getLocation = async (req, res, next) => {
  try {
    const location = await PropertyLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    const villas = await Villa.find({ propertyLocation: location._id });
    const rooms = await Room.find({ propertyLocation: location._id }).populate('category');
    res.json({ success: true, location, villas, rooms });
  } catch (err) {
    next(err);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const location = await PropertyLocation.create(req.body);
    await createAuditLog({
      req,
      action: 'CREATE_LOCATION',
      module: 'Villas & Rooms',
      targetId: location._id,
      details: { name: location.name, code: location.code }
    });
    res.status(201).json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const location = await PropertyLocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    await createAuditLog({
      req,
      action: 'UPDATE_LOCATION',
      module: 'Villas & Rooms',
      targetId: location._id,
      details: { name: location.name }
    });
    res.json({ success: true, location });
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    await PropertyLocation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Location removed' });
  } catch (err) {
    next(err);
  }
};

// @desc Get all villas
// @route GET /api/villas
export const getVillas = async (req, res, next) => {
  try {
    const { locationId } = req.query;
    const filter = { isActive: true };
    if (locationId) {
      filter.propertyLocation = locationId;
    }
    const villas = await Villa.find(filter)
      .populate('propertyLocation', 'name code city state')
      .populate('manager', 'name email phone role smartAccessPin')
      .sort({ displayOrder: 1 });
    res.json({ success: true, count: villas.length, villas });
  } catch (err) {
    next(err);
  }
};

// @desc Get single villa by slug or ID
// @route GET /api/villas/:idOrSlug
export const getVilla = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const villa = isId 
      ? await Villa.findById(idOrSlug).populate('propertyLocation').populate('manager') 
      : await Villa.findOne({ slug: idOrSlug }).populate('propertyLocation').populate('manager');

    if (!villa) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }

    const categories = await RoomCategory.find({ villa: villa._id, isActive: true });
    const rooms = await Room.find({ villa: villa._id, isActive: true }).populate('category');

    res.json({ success: true, villa, categories, rooms });
  } catch (err) {
    next(err);
  }
};

// @desc Create villa (Admin)
// @route POST /api/villas
export const createVilla = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }
    if (!data.accessCode) {
      data.accessCode = `VLA-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Normalize pricing if passed flat or nested
    if (!data.pricing) {
      data.pricing = {
        basePricePerNight: Number(data.basePricePerNight) || 45000,
        weekendPricePerNight: Number(data.weekendPricePerNight) || 60000
      };
    } else {
      data.pricing.basePricePerNight = Number(data.pricing.basePricePerNight || data.basePricePerNight) || 45000;
      data.pricing.weekendPricePerNight = Number(data.pricing.weekendPricePerNight || data.weekendPricePerNight) || 60000;
    }

    // Handle new destination creation on-the-fly
    if (data.isNewLocation && data.newLocationName) {
      const code = (data.newLocationCode || data.newLocationName.slice(0, 3)).toUpperCase();
      const newLoc = await PropertyLocation.create({
        name: data.newLocationName,
        code,
        city: data.city || 'Lonavala',
        state: data.state || 'Maharashtra',
        address: data.address || data.newLocationName,
        phone: data.locationPhone || '+91 98200 00000',
        email: data.locationEmail || 'concierge@moonlightvilla.com',
        managerName: data.locationManager || ''
      });
      data.propertyLocation = newLoc._id;
    }

    // Populate embedded location object if not fully provided
    if (data.propertyLocation) {
      const locObj = await PropertyLocation.findById(data.propertyLocation);
      if (locObj) {
        data.location = {
          city: data.city || locObj.city,
          state: data.state || locObj.state,
          address: data.address || locObj.address,
          country: locObj.country || 'India',
          pincode: data.pincode || locObj.pincode || '410401',
          mapUrl: data.mapUrl || ''
        };
      }
    } else if (data.city || data.state || data.address) {
      data.location = {
        city: data.city || 'Lonavala',
        state: data.state || 'Maharashtra',
        address: data.address || 'Moon Light Valley, Hill Crest Estate',
        country: 'India',
        pincode: data.pincode || '410401',
        mapUrl: data.mapUrl || ''
      };
    }

    // Handle image string vs array
    if (typeof data.images === 'string') {
      data.images = [{ url: data.images, isPrimary: true, caption: data.name }];
    } else if (Array.isArray(data.images) && typeof data.images[0] === 'string') {
      data.images = data.images.map((url, i) => ({ url, isPrimary: i === 0, caption: data.name }));
    }

    const villa = await Villa.create(data);
    await createAuditLog({
      req,
      action: 'CREATE_VILLA',
      module: 'Villas & Rooms',
      targetId: villa._id,
      details: { name: villa.name, slug: villa.slug, accessCode: villa.accessCode }
    });

    // Auto-create Category and Bulk Generate Rooms for this Villa if requested
    let createdCategory = null;
    let generatedRooms = [];
    if (data.enableBulkRooms || data.categoryName || data.newCategoryName || data.categoryId) {
      if (data.categoryId && mongoose.Types.ObjectId.isValid(data.categoryId)) {
        createdCategory = await RoomCategory.findById(data.categoryId);
      }
      if (!createdCategory && (data.categoryName || data.newCategoryName || data.enableBulkRooms)) {
        const catName = data.categoryName || data.newCategoryName || 'Deluxe Villa Suite';
        createdCategory = await RoomCategory.create({
          name: catName,
          villa: villa._id,
          basePrice: Number(data.categoryBasePrice) || Number(data.pricing?.basePricePerNight) || 15000,
          weekendPrice: Number(data.categoryWeekendPrice) || Number(data.pricing?.weekendPricePerNight) || 18000,
          maxAdults: Number(data.categoryMaxAdults) || 2,
          maxChildren: Number(data.categoryMaxChildren) || 1,
          description: data.categoryDescription || `${catName} at ${villa.name}`
        });
      }

      if (data.enableBulkRooms && createdCategory) {
        const prefix = data.roomPrefix !== undefined ? data.roomPrefix : 'RM-';
        const start = parseInt(data.roomStartNumber, 10) || 101;
        const end = parseInt(data.roomEndNumber, 10) || 110;
        const wing = data.roomWing || 'Wing A';
        const floor = data.roomFloor || 'Ground Floor';
        const bedType = data.roomBedType || 'King Size Bed';
        const bPrice = Number(data.categoryBasePrice) || Number(data.pricing?.basePricePerNight) || 15000;
        const wPrice = Number(data.categoryWeekendPrice) || Number(data.pricing?.weekendPricePerNight) || 18000;

        for (let num = start; num <= end; num++) {
          const roomNumStr = `${prefix}${num}`;
          const existing = await Room.findOne({ roomNumber: roomNumStr, villa: villa._id });
          if (!existing) {
            const roomDoc = await Room.create({
              roomNumber: roomNumStr,
              name: `${createdCategory.name} ${roomNumStr}`,
              propertyLocation: villa.propertyLocation || undefined,
              villa: villa._id,
              category: createdCategory._id,
              wing,
              floor,
              bedType,
              status: 'Available',
              basePrice: bPrice,
              weekendPrice: wPrice,
              smartLockCode: `*${Math.floor(1000 + Math.random() * 9000)}#`
            });
            generatedRooms.push(roomDoc);
          }
        }
      }
    }

    const populatedVilla = await Villa.findById(villa._id)
      .populate('propertyLocation', 'name code city state address phone')
      .populate('manager', 'name email phone role');

    res.status(201).json({
      success: true,
      villa: populatedVilla,
      category: createdCategory,
      createdRoomsCount: generatedRooms.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update villa (Admin)
// @route PUT /api/villas/:id
export const updateVilla = async (req, res, next) => {
  try {
    const villa = await Villa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('propertyLocation', 'name code city state')
      .populate('manager', 'name email phone role');

    if (!villa) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }
    await createAuditLog({
      req,
      action: 'UPDATE_VILLA',
      module: 'Villas & Rooms',
      targetId: villa._id,
      details: { name: villa.name, accessCode: villa.accessCode }
    });
    res.json({ success: true, villa });
  } catch (err) {
    next(err);
  }
};

// @desc Delete villa (Admin)
// @route DELETE /api/villas/:id
export const deleteVilla = async (req, res, next) => {
  try {
    const villa = await Villa.findByIdAndDelete(req.params.id);
    if (!villa) {
      return res.status(404).json({ success: false, message: 'Villa not found' });
    }
    await createAuditLog({
      req,
      action: 'DELETE_VILLA',
      module: 'Villas & Rooms',
      targetId: villa._id,
      details: { name: villa.name }
    });
    res.json({ success: true, message: 'Villa deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// --- ROOM CATEGORIES ---
export const getRoomCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().populate('villa', 'name slug');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

export const createRoomCategory = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.villa) {
      let villa = await Villa.findOne();
      if (!villa) {
        villa = await Villa.create({
          name: 'Moon Light Villa Estate',
          slug: 'moon-light-villa-estate-' + Date.now(),
          description: 'Luxury Villa Sanctuary',
          pricing: {
            basePricePerNight: Number(data.basePrice) || 12000,
            weekendPricePerNight: Number(data.weekendPrice) || 15000,
          }
        });
      }
      data.villa = villa._id;
    }
    const category = await RoomCategory.create(data);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

export const updateRoomCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

export const deleteRoomCategory = async (req, res, next) => {
  try {
    await RoomCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room category removed' });
  } catch (err) {
    next(err);
  }
};

// --- ROOMS ---
// --- ROOMS (SUPPORTS 120+ ROOMS & MULTI-LOCATION) ---
export const getRooms = async (req, res, next) => {
  try {
    const { villaId, locationId, status, wing, floor, search } = req.query;
    const filter = {};
    if (villaId) filter.villa = villaId;
    if (locationId) filter.propertyLocation = locationId;
    if (status) filter.status = status;
    if (wing) filter.wing = wing;
    if (floor) filter.floor = floor;
    if (search) {
      filter.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(filter)
      .populate('villa', 'name')
      .populate('propertyLocation', 'name code city')
      .populate('category', 'name basePrice weekendPrice')
      .sort({ roomNumber: 1 });

    // Compute status counts for rapid KPI rendering
    const allMatching = await Room.find(locationId ? { propertyLocation: locationId } : {});
    const stats = {
      total: allMatching.length,
      available: allMatching.filter(r => r.status === 'Available').length,
      occupied: allMatching.filter(r => r.status === 'Occupied').length,
      cleaning: allMatching.filter(r => r.status === 'Cleaning').length,
      maintenance: allMatching.filter(r => r.status === 'Maintenance').length,
      reserved: allMatching.filter(r => r.status === 'Reserved').length
    };

    res.json({ success: true, count: rooms.length, stats, rooms });
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // 1. Auto-resolve or create Villa container if missing
    if (!data.villa) {
      let villa = null;
      if (data.propertyLocation) {
        villa = await Villa.findOne({ propertyLocation: data.propertyLocation });
      }
      if (!villa) {
        villa = await Villa.findOne();
      }
      if (!villa) {
        let loc = null;
        if (data.propertyLocation) {
          loc = await PropertyLocation.findById(data.propertyLocation);
        }
        const estateName = loc ? `${loc.name} Estate` : 'Moon Light Luxury Sanctuary';
        villa = await Villa.create({
          name: estateName,
          slug: estateName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          propertyLocation: data.propertyLocation || undefined,
          description: `Premier luxury estate at ${loc?.city || 'Lonavala'}.`,
          pricing: {
            basePricePerNight: Number(data.basePrice) || 12000,
            weekendPricePerNight: Number(data.weekendPrice) || 15000,
            cleaningFee: 2500,
            securityDeposit: 10000,
            taxPercentage: 18
          }
        });
      }
      data.villa = villa._id;
    }

    // 2. Auto-resolve or create Category if newCategoryName or if category is not an ObjectId
    if (data.newCategoryName || !data.category || !mongoose.Types.ObjectId.isValid(data.category)) {
      const catName = data.newCategoryName || data.categoryName || (typeof data.category === 'string' && data.category.trim() && !mongoose.Types.ObjectId.isValid(data.category) ? data.category.trim() : 'Deluxe Suite');
      
      let cat = await RoomCategory.findOne({ name: catName, villa: data.villa });
      if (!cat) {
        cat = await RoomCategory.create({
          name: catName,
          villa: data.villa,
          basePrice: Number(data.basePrice) || 12000,
          weekendPrice: Number(data.weekendPrice) || 15000,
          maxAdults: Number(data.maxAdults) || 2,
          maxChildren: Number(data.maxChildren) || 1,
          description: data.categoryDescription || `${catName} with premium luxury styling.`
        });
      }
      data.category = cat._id;
    }

    const room = await Room.create(data);
    await createAuditLog({
      req,
      action: 'CREATE_ROOM',
      module: 'Villas & Rooms',
      targetId: room._id,
      details: { roomNumber: room.roomNumber, name: room.name }
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('villa', 'name')
      .populate('propertyLocation', 'name code city')
      .populate('category', 'name basePrice weekendPrice');

    res.status(201).json({ success: true, room: populatedRoom });
  } catch (err) {
    next(err);
  }
};

// @desc Bulk generate rooms (e.g. 101 to 130 in one click)
// @route POST /api/villas/rooms/bulk-generate
export const bulkCreateRooms = async (req, res, next) => {
  try {
    const { 
      villaId, 
      locationId, 
      categoryId, 
      prefix = '', 
      startNumber, 
      endNumber, 
      wing = 'Wing A', 
      floor = 'Ground Floor', 
      bedType = 'King Size Bed',
      basePrice, 
      weekendPrice,
      namingPattern = 'Suite' // e.g. "Deluxe Room" or "Suite"
    } = req.body;

    let finalCategoryId = categoryId;
    if (req.body.newCategoryName || !finalCategoryId || !mongoose.Types.ObjectId.isValid(finalCategoryId)) {
      const catName = req.body.newCategoryName || req.body.categoryName || namingPattern || 'Deluxe Suite';
      let cat = await RoomCategory.findOne({ name: catName, villa: villaId });
      if (!cat) {
        cat = await RoomCategory.create({
          name: catName,
          villa: villaId,
          basePrice: Number(basePrice) || 12000,
          weekendPrice: Number(weekendPrice) || 15000,
          maxAdults: Number(req.body.maxAdults) || 2,
          maxChildren: Number(req.body.maxChildren) || 1,
          description: req.body.categoryDescription || `${catName} room series`
        });
      }
      finalCategoryId = cat._id;
    }

    if (!startNumber || !endNumber || !villaId || !finalCategoryId || !basePrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'startNumber, endNumber, villaId, category, and basePrice are required' 
      });
    }

    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      return res.status(400).json({ success: false, message: 'Invalid startNumber or endNumber range' });
    }

    const createdRooms = [];
    for (let num = start; num <= end; num++) {
      const roomNumStr = `${prefix}${num}`;
      
      // Check if room number already exists for this villa/location
      const existing = await Room.findOne({ roomNumber: roomNumStr, villa: villaId });
      if (!existing) {
        createdRooms.push({
          roomNumber: roomNumStr,
          name: `${namingPattern} ${roomNumStr}`,
          propertyLocation: locationId || undefined,
          villa: villaId,
          category: finalCategoryId,
          wing,
          floor,
          bedType,
          status: 'Available',
          basePrice: Number(basePrice),
          weekendPrice: Number(weekendPrice || basePrice),
          maxAdults: 2,
          maxChildren: 1,
          amenities: ['Private Balcony', 'High Speed Wi-Fi', 'Smart TV', 'Mini Bar', 'Air Conditioning']
        });
      }
    }

    if (createdRooms.length > 0) {
      await Room.insertMany(createdRooms);
    }

    await createAuditLog({
      req,
      action: 'BULK_CREATE_ROOMS',
      module: 'Villas & Rooms',
      details: { count: createdRooms.length, range: `${prefix}${start} - ${prefix}${end}` }
    });

    res.status(201).json({ 
      success: true, 
      message: `Successfully generated ${createdRooms.length} rooms (${prefix}${start} - ${prefix}${end})`,
      count: createdRooms.length 
    });
  } catch (err) {
    next(err);
  }
};

// @desc Bulk update room status (e.g. mark entire wing as Cleaning or Available)
// @route POST /api/villas/rooms/bulk-status
export const bulkUpdateRoomStatus = async (req, res, next) => {
  try {
    const { roomIds, status } = req.body;
    if (!roomIds || !Array.isArray(roomIds) || !status) {
      return res.status(400).json({ success: false, message: 'roomIds array and status are required' });
    }

    await Room.updateMany(
      { _id: { $in: roomIds } },
      { $set: { status } }
    );

    await createAuditLog({
      req,
      action: 'BULK_UPDATE_ROOM_STATUS',
      module: 'Villas & Rooms',
      details: { count: roomIds.length, newStatus: status }
    });

    res.json({ success: true, message: `Updated ${roomIds.length} rooms to ${status}` });
  } catch (err) {
    next(err);
  }
};

// @desc Quick toggle room status (e.g. 1-click update from room grid)
// @route PATCH /api/villas/rooms/:id/quick-status
export const updateRoomStatusQuick = async (req, res, next) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room removed' });
  } catch (err) {
    next(err);
  }
};

// --- AVAILABILITY BLOCKS (MAINTENANCE, OWNER STAY) ---
export const getAvailabilityBlocks = async (req, res, next) => {
  try {
    const blocks = await AvailabilityBlock.find({ isActive: true })
      .populate('villa', 'name')
      .populate('room', 'roomNumber name')
      .sort({ startDate: 1 });
    res.json({ success: true, blocks });
  } catch (err) {
    next(err);
  }
};

export const createAvailabilityBlock = async (req, res, next) => {
  try {
    const block = await AvailabilityBlock.create({
      ...req.body,
      createdBy: req.user?._id
    });
    // If specific room is blocked for maintenance, update room status
    if (block.room) {
      await Room.findByIdAndUpdate(block.room, { status: 'Maintenance' });
    }
    res.status(201).json({ success: true, block });
  } catch (err) {
    next(err);
  }
};

export const deleteAvailabilityBlock = async (req, res, next) => {
  try {
    const block = await AvailabilityBlock.findById(req.params.id);
    if (block && block.room) {
      await Room.findByIdAndUpdate(block.room, { status: 'Available' });
    }
    await AvailabilityBlock.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Block removed' });
  } catch (err) {
    next(err);
  }
};
