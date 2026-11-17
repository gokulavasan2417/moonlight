import express from 'express';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getVillas,
  getVilla,
  createVilla,
  updateVilla,
  deleteVilla,
  getRoomCategories,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
  getRooms,
  createRoom,
  bulkCreateRooms,
  bulkUpdateRoomStatus,
  updateRoomStatusQuick,
  updateRoom,
  deleteRoom,
  getAvailabilityBlocks,
  createAvailabilityBlock,
  deleteAvailabilityBlock
} from '../controllers/villaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Property Locations (Multi-Location Support)
router.get('/locations/all', getLocations);
router.get('/locations/:id', getLocation);
router.post('/locations', protect, authorize('Super Admin', 'Administrator', 'Manager'), createLocation);
router.put('/locations/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateLocation);
router.delete('/locations/:id', protect, authorize('Super Admin', 'Administrator'), deleteLocation);

// Public routes for Villas
router.get('/', getVillas);

// Room Categories
router.get('/categories/all', getRoomCategories);
router.post('/categories', protect, authorize('Super Admin', 'Administrator', 'Manager'), createRoomCategory);
router.put('/categories/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateRoomCategory);
router.delete('/categories/:id', protect, authorize('Super Admin', 'Administrator'), deleteRoomCategory);

// Rooms & 120-Room Bulk Operations
router.get('/rooms/all', getRooms);
router.post('/rooms', protect, authorize('Super Admin', 'Administrator', 'Manager'), createRoom);
router.post('/rooms/bulk-generate', protect, authorize('Super Admin', 'Administrator', 'Manager'), bulkCreateRooms);
router.post('/rooms/bulk-status', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Housekeeping Staff'), bulkUpdateRoomStatus);
router.patch('/rooms/:id/quick-status', protect, authorize('Super Admin', 'Administrator', 'Manager', 'Housekeeping Staff', 'Receptionist'), updateRoomStatusQuick);
router.put('/rooms/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateRoom);
router.delete('/rooms/:id', protect, authorize('Super Admin', 'Administrator'), deleteRoom);

// Availability Blocks
router.get('/blocks/all', getAvailabilityBlocks);
router.post('/blocks', protect, authorize('Super Admin', 'Administrator', 'Manager'), createAvailabilityBlock);
router.delete('/blocks/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), deleteAvailabilityBlock);

// Individual Villa by ID or Slug (keep after specific sub-paths)
router.get('/:idOrSlug', getVilla);
router.post('/', protect, authorize('Super Admin', 'Administrator', 'Manager'), createVilla);
router.put('/:id', protect, authorize('Super Admin', 'Administrator', 'Manager'), updateVilla);
router.delete('/:id', protect, authorize('Super Admin', 'Administrator'), deleteVilla);

export default router;
