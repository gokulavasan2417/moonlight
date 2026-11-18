import React, { useState, useEffect } from 'react';
import {
  Home,
  Bed,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ShieldCheck,
  MapPin,
  Sparkles,
  Zap,
  Filter,
  Search,
  Layers,
  Clock,
  RefreshCw,
  Building,
  Phone,
  Mail,
  User,
  SlidersHorizontal,
  ChevronRight,
  KeyRound,
  Key,
  Copy,
  Lock
} from 'lucide-react';
import api from '../services/api';

const VillaRoomManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('grid'); // Default to the 120-room visual rack matrix!
  const [locations, setLocations] = useState([]);
  const [villas, setVillas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [roomStats, setRoomStats] = useState({ total: 120, available: 88, occupied: 16, cleaning: 8, maintenance: 4, reserved: 4 });
  const [loading, setLoading] = useState(true);

  // Filters for 120-room visual rack & table
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showVillaModal, setShowVillaModal] = useState(false);
  const [showBulkRoomModal, setShowBulkRoomModal] = useState(false);
  const [showSingleRoomModal, setShowSingleRoomModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Form states
  const [villaForm, setVillaForm] = useState({
    name: '',
    propertyLocation: '',
    isNewLocation: false,
    newLocationName: '',
    newLocationCode: '',
    city: '',
    state: '',
    address: '',
    pincode: '410401',
    tagline: 'Exclusive Private Luxury Estate',
    description: '',
    basePricePerNight: 45000,
    weekendPricePerNight: 60000,
    bedrooms: 5,
    bathrooms: 6,
    maxGuests: 16,
    squareFeet: 8500,
    accessCode: `VLA-${Math.floor(1000 + Math.random() * 9000)}`,
    manager: '',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    amenities: 'Private Heated Pool, Jacuzzi, Chef on Call, Butler Service, Helipad, Mountain View, Barbecue Deck'
  });

  // Form states
  const [locationForm, setLocationForm] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    email: '',
    managerName: '',
    managerPhone: '',
    description: '',
    amenities: 'Infinity Pool, Valley View, Spa, Helipad'
  });

  const [bulkRoomForm, setBulkRoomForm] = useState({
    locationId: '',
    villaId: '',
    categoryId: '',
    prefix: '',
    startNumber: 101,
    endNumber: 130,
    wing: 'Wing A',
    floor: 'Floor 1',
    bedType: 'King Size Bed',
    basePrice: 14000,
    weekendPrice: 17000,
    namingPattern: 'Deluxe Suite'
  });

  const [singleRoomForm, setSingleRoomForm] = useState({
    roomNumber: '',
    name: '',
    propertyLocation: '',
    villa: '',
    category: '',
    wing: 'Wing A',
    floor: 'Floor 1',
    bedType: 'King Size Bed',
    smartLockCode: `*${Math.floor(1000 + Math.random() * 9000)}#`,
    basePrice: 14000,
    weekendPrice: 17000,
    status: 'Available'
  });

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: 'Presidential Suite',
    description: 'Ultra-luxury suite featuring private jacuzzi, panoramic vistas, and bespoke butler service',
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 16000,
    weekendPrice: 20000
  });

  const [blockFormData, setBlockFormData] = useState({
    reason: 'Maintenance',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locsRes, villasRes, catsRes, roomsRes, blocksRes, staffRes] = await Promise.all([
        api.get('/villas/locations/all'),
        api.get('/villas'),
        api.get('/villas/categories/all'),
        api.get('/villas/rooms/all'),
        api.get('/villas/blocks/all'),
        api.get('/staff'),
      ]);

      if (locsRes.data.success) {
        setLocations(locsRes.data.locations);
        if (!bulkRoomForm.locationId && locsRes.data.locations.length > 0) {
          setBulkRoomForm(prev => ({ ...prev, locationId: locsRes.data.locations[0]._id }));
          setSingleRoomForm(prev => ({ ...prev, propertyLocation: locsRes.data.locations[0]._id }));
          setVillaForm(prev => ({ ...prev, propertyLocation: locsRes.data.locations[0]._id }));
        }
      }
      if (villasRes.data.success) {
        setVillas(villasRes.data.villas);
        if (!bulkRoomForm.villaId && villasRes.data.villas.length > 0) {
          setBulkRoomForm(prev => ({ ...prev, villaId: villasRes.data.villas[0]._id }));
          setSingleRoomForm(prev => ({ ...prev, villa: villasRes.data.villas[0]._id }));
        }
      }
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories);
        if (!bulkRoomForm.categoryId && catsRes.data.categories.length > 0) {
          setBulkRoomForm(prev => ({ ...prev, categoryId: catsRes.data.categories[0]._id }));
          setSingleRoomForm(prev => ({ ...prev, category: catsRes.data.categories[0]._id }));
        }
      }
      if (roomsRes.data.success) {
        setRooms(roomsRes.data.rooms);
        if (roomsRes.data.stats) {
          setRoomStats(roomsRes.data.stats);
        }
      }
      if (blocksRes.data.success) setBlocks(blocksRes.data.blocks);
      if (staffRes.data.success) setStaffUsers(staffRes.data.users);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create Villa & Access
  const handleCreateVilla = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = villaForm.amenities.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/villas', {
        name: villaForm.name,
        propertyLocation: !villaForm.isNewLocation ? (villaForm.propertyLocation || locations[0]?._id) : null,
        isNewLocation: villaForm.isNewLocation,
        newLocationName: villaForm.newLocationName,
        newLocationCode: villaForm.newLocationCode,
        city: villaForm.city,
        state: villaForm.state,
        address: villaForm.address,
        pincode: villaForm.pincode,
        tagline: villaForm.tagline,
        description: villaForm.description,
        accessCode: villaForm.accessCode || `VLA-${Math.floor(1000 + Math.random() * 9000)}`,
        manager: villaForm.manager || null,
        specs: {
          bedrooms: Number(villaForm.bedrooms) || 5,
          bathrooms: Number(villaForm.bathrooms) || 6,
          maxGuests: Number(villaForm.maxGuests) || 16,
          squareFeet: Number(villaForm.squareFeet) || 8500,
          privatePool: true
        },
        pricing: {
          basePricePerNight: Number(villaForm.basePricePerNight) || 45000,
          weekendPricePerNight: Number(villaForm.weekendPricePerNight) || 60000
        },
        images: [{ url: villaForm.imageUrl, isPrimary: true, caption: villaForm.name }],
        amenities: amenitiesArr
      });
      setShowVillaModal(false);
      setVillaForm({
        name: '',
        propertyLocation: locations[0]?._id || '',
        isNewLocation: false,
        newLocationName: '',
        newLocationCode: '',
        city: locations[0]?.city || '',
        state: locations[0]?.state || '',
        address: locations[0]?.address || '',
        pincode: '410401',
        tagline: 'Exclusive Private Luxury Estate',
        description: '',
        basePricePerNight: 45000,
        weekendPricePerNight: 60000,
        bedrooms: 5,
        bathrooms: 6,
        maxGuests: 16,
        squareFeet: 8500,
        accessCode: `VLA-${Math.floor(1000 + Math.random() * 9000)}`,
        manager: '',
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        amenities: 'Private Heated Pool, Jacuzzi, Chef on Call, Butler Service, Helipad, Mountain View, Barbecue Deck'
      });
      fetchData();
      alert('Luxury Villa and Destination details saved successfully!');
    } catch (err) {
      alert('Failed to register villa: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteVilla = async (id) => {
    if (!window.confirm('Are you sure you want to delete this villa? Associated rooms may be impacted.')) return;
    try {
      await api.delete(`/villas/${id}`);
      fetchData();
      alert('Villa deleted successfully');
    } catch (err) {
      alert('Failed to delete villa: ' + err.message);
    }
  };

  const handleRegenerateVillaAccess = async (villa) => {
    const newCode = `VLA-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await api.put(`/villas/${villa._id}`, { accessCode: newCode });
      setVillas(prev => prev.map(v => v._id === villa._id ? { ...v, accessCode: newCode } : v));
      alert(`Villa Gate & Digital Door Access Code updated: ${newCode}`);
    } catch (err) {
      alert('Failed to regenerate access code: ' + err.message);
    }
  };

  const handleSelectLocationInVillaForm = (locId) => {
    const loc = locations.find(l => l._id === locId);
    if (loc) {
      setVillaForm(prev => ({
        ...prev,
        propertyLocation: locId,
        isNewLocation: false,
        city: loc.city || '',
        state: loc.state || '',
        address: loc.address || ''
      }));
    } else {
      setVillaForm(prev => ({ ...prev, propertyLocation: locId, isNewLocation: false }));
    }
  };

  const openNewVillaModal = () => {
    const defaultLoc = locations.find(l => l._id === villaForm.propertyLocation) || locations[0];
    setVillaForm(prev => ({
      ...prev,
      propertyLocation: defaultLoc?._id || prev.propertyLocation || '',
      city: defaultLoc?.city || prev.city || '',
      state: defaultLoc?.state || prev.state || '',
      address: defaultLoc?.address || prev.address || '',
      isNewLocation: false
    }));
    setShowVillaModal(true);
  };

  // Quick 1-click status update from visual room rack
  const handleQuickStatusChange = async (roomId, newStatus) => {
    try {
      await api.patch(`/villas/rooms/${roomId}/quick-status`, { status: newStatus });
      // Optimistic update
      setRooms(prev => prev.map(r => r._id === roomId ? { ...r, status: newStatus } : r));
      // Re-fetch stats
      const statsRes = await api.get('/villas/rooms/all');
      if (statsRes.data.stats) setRoomStats(statsRes.data.stats);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Create Location
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = locationForm.amenities.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/villas/locations', {
        ...locationForm,
        amenities: amenitiesArr
      });
      setShowLocationModal(false);
      setLocationForm({
        name: '', code: '', city: '', state: '', address: '', phone: '', email: '', managerName: '', managerPhone: '', description: '', amenities: ''
      });
      fetchData();
      alert('Location successfully registered!');
    } catch (err) {
      alert('Failed to add location: ' + (err.response?.data?.message || err.message));
    }
  };

  // Bulk Generate Rooms
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/villas/rooms/bulk-generate', bulkRoomForm);
      setShowBulkRoomModal(false);
      fetchData();
      alert(res.data.message || 'Rooms generated successfully!');
    } catch (err) {
      alert('Failed to bulk generate: ' + (err.response?.data?.message || err.message));
    }
  };

  // Create Single Room with Category support
  const handleCreateSingleRoom = async (e) => {
    e.preventDefault();
    try {
      let categoryId = singleRoomForm.category;

      // If user specified a new category or no category exists
      if (isCreatingCategory || !categoryId || categoryId === '__NEW__') {
        const catName = newCategoryForm.name?.trim() || 'Deluxe Suite';
        const catRes = await api.post('/villas/categories', {
          name: catName,
          villa: singleRoomForm.villa || (villas[0]?._id),
          basePrice: Number(singleRoomForm.basePrice) || 14000,
          weekendPrice: Number(singleRoomForm.weekendPrice) || 17000,
          maxAdults: Number(newCategoryForm.maxAdults) || 2,
          maxChildren: Number(newCategoryForm.maxChildren) || 1,
          description: newCategoryForm.description || `${catName} luxury boutique suite`
        });
        if (catRes.data.success) {
          categoryId = catRes.data.category._id;
        }
      }

      await api.post('/villas/rooms', {
        ...singleRoomForm,
        category: categoryId,
        newCategoryName: isCreatingCategory ? newCategoryForm.name : undefined,
        propertyLocation: singleRoomForm.propertyLocation || (locations[0]?._id),
        villa: singleRoomForm.villa || (villas[0]?._id),
        basePrice: Number(singleRoomForm.basePrice) || 14000,
        weekendPrice: Number(singleRoomForm.weekendPrice) || 17000
      });
      setShowSingleRoomModal(false);
      setIsCreatingCategory(false);
      fetchData();
      alert('Room created successfully!');
    } catch (err) {
      alert('Failed to create room: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!newCategoryForm.name?.trim()) {
      alert('Please enter a Category Name');
      return;
    }
    try {
      const res = await api.post('/villas/categories', {
        name: newCategoryForm.name.trim(),
        villa: singleRoomForm.villa || (villas[0]?._id),
        basePrice: Number(singleRoomForm.basePrice) || 14000,
        weekendPrice: Number(singleRoomForm.weekendPrice) || 17000,
        maxAdults: Number(newCategoryForm.maxAdults) || 2,
        maxChildren: Number(newCategoryForm.maxChildren) || 1,
        description: newCategoryForm.description || ''
      });
      if (res.data.success) {
        await fetchData();
        setSingleRoomForm(prev => ({
          ...prev,
          category: res.data.category._id,
          name: prev.name || `${res.data.category.name} ${prev.roomNumber || '101'}`.trim()
        }));
        setIsCreatingCategory(false);
        alert(`Category "${res.data.category.name}" created and selected!`);
      }
    } catch (err) {
      alert('Failed to create category: ' + (err.response?.data?.message || err.message));
    }
  };

  // Create Block
  const handleCreateBlock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/villas/blocks', {
        ...blockFormData,
        villa: blockFormData.villa || villas[0]?._id
      });
      setShowBlockModal(false);
      fetchData();
      alert('Maintenance block created!');
    } catch (err) {
      alert('Failed to create block: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm('Restore availability and remove maintenance lock?')) return;
    try {
      await api.delete(`/villas/blocks/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove block: ' + err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to remove this room?')) return;
    try {
      await api.delete(`/villas/rooms/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove room: ' + err.message);
    }
  };

  // Filtered rooms for the 120-room matrix and table
  const filteredRooms = rooms.filter(room => {
    // Location filter
    if (selectedLocation !== 'all') {
      const locId = typeof room.propertyLocation === 'object' ? room.propertyLocation?._id : room.propertyLocation;
      if (locId !== selectedLocation) return false;
    }
    // Wing filter
    if (selectedWing !== 'all' && room.wing !== selectedWing) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'all' && room.status !== selectedStatus) {
      return false;
    }
    // Search query (number or name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = room.roomNumber?.toLowerCase().includes(q);
      const matchName = room.name?.toLowerCase().includes(q);
      if (!matchNum && !matchName) return false;
    }
    return true;
  });

  // Extract unique wings for filter dropdown
  const uniqueWings = Array.from(new Set(rooms.map(r => r.wing).filter(Boolean)));

  // Color mapper for room status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400', label: 'Available' };
      case 'Occupied':
        return { bg: 'bg-rose-950/70 text-rose-300 border-rose-500/40', dot: 'bg-rose-400', label: 'Occupied' };
      case 'Cleaning':
        return { bg: 'bg-amber-950/70 text-amber-300 border-amber-500/40', dot: 'bg-amber-400', label: 'Cleaning' };
      case 'Maintenance':
        return { bg: 'bg-purple-950/70 text-purple-300 border-purple-500/40', dot: 'bg-purple-400', label: 'Maintenance' };
      case 'Reserved':
        return { bg: 'bg-sky-950/70 text-sky-300 border-sky-500/40', dot: 'bg-sky-400', label: 'Reserved' };
      default:
        return { bg: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400', label: status };
    }
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Module 3: Multi-Location & 120-Room Engine
            </span>
            <span className="text-xs text-slate-400">
              {locations.length} Locations • {rooms.length} Total Rooms
            </span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 flex flex-wrap items-center gap-2 break-words">
            Multi-Location Properties & 120-Room Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise rack view, real-time room status matrix, bulk provisioning, and multi-branch management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <button
            onClick={() => openNewVillaModal()}
            className="gold-button-gradient text-slate-950 font-bold text-xs px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <Home className="w-3.5 h-3.5 fill-slate-950 shrink-0" /> + New Villa / Access
          </button>
          <button
            onClick={() => setShowLocationModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Add Property
          </button>
          <button
            onClick={() => setShowBulkRoomModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-950 shrink-0" /> ⚡ Bulk Generate Rooms
          </button>
          <button
            onClick={() => setShowSingleRoomModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Add Single Room
          </button>
          <button
            onClick={() => setShowBlockModal(true)}
            className="bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold text-xs px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" /> Maintenance Block
          </button>
        </div>
      </div>

      {/* 120-Room Real-Time Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 min-w-0">
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">Total Rooms</p>
            <p className="text-lg sm:text-xl font-bold text-slate-100">{roomStats.total || rooms.length}</p>
          </div>
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 ml-1" />
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-400 tracking-wider truncate">Available</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-200">{roomStats.available || 0}</p>
          </div>
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
        </div>

        <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-rose-400 tracking-wider truncate">Occupied</p>
            <p className="text-lg sm:text-xl font-bold text-rose-200">{roomStats.occupied || 0}</p>
          </div>
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400 shrink-0 ml-1" />
        </div>

        <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-400 tracking-wider truncate">Cleaning</p>
            <p className="text-lg sm:text-xl font-bold text-amber-200">{roomStats.cleaning || 0}</p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-purple-400 tracking-wider truncate">Maintenance</p>
            <p className="text-lg sm:text-xl font-bold text-purple-200">{roomStats.maintenance || 0}</p>
          </div>
          <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 ml-1" />
        </div>

        <div className="bg-sky-950/40 border border-sky-500/30 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-sky-400 tracking-wider truncate">Reserved</p>
            <p className="text-lg sm:text-xl font-bold text-sky-200">{roomStats.reserved || 0}</p>
          </div>
          <Clock className="w-4 h-4 text-sky-400 shrink-0 ml-1" />
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto pb-1 max-w-full">
        {[
          { id: 'grid', label: '🎛️ 120-Room Visual Rack (Matrix)', count: filteredRooms.length },
          { id: 'locations', label: '🏨 Locations (Properties)', count: locations.length },
          { id: 'table', label: '📋 Room Directory & Table', count: rooms.length },
          { id: 'villas', label: '🏡 Villas & Estates', count: villas.length },
          { id: 'categories', label: '🛏️ Suite Categories', count: categories.length },
          { id: 'blocks', label: '🔒 Maintenance Locks', count: blocks.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeSubTab === tab.id
                ? 'border-amber-400 text-amber-400 bg-slate-900/60 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 120-ROOM VISUAL RACK (INTERACTIVE HEATMAP & RACK MATRIX) */}
      {/* ========================================================================= */}
      {activeSubTab === 'grid' && (
        <div className="space-y-4 min-w-0">
          {/* Quick Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* Location selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 max-w-full">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs max-w-[180px] sm:max-w-none truncate"
                >
                  <option value="all" className="bg-slate-900">All Locations (120 Rooms)</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id} className="bg-slate-900">
                      {loc.name} ({loc.totalRooms} Rooms)
                    </option>
                  ))}
                </select>
              </div>

              {/* Wing selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none text-xs"
                >
                  <option value="all" className="bg-slate-900">All Wings</option>
                  {uniqueWings.map(w => (
                    <option key={w} value={w} className="bg-slate-900">{w}</option>
                  ))}
                </select>
              </div>

              {/* Status filter buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 max-w-full">
                {['all', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all ${
                      selectedStatus === st
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Room Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Room (e.g. 104, GOA-301)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 120-Room High-Density Visual Grid */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-800/80 mb-4 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-200">
                  Displaying {filteredRooms.length} of {rooms.length} Rooms
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">• Click status dropdown on any card to update immediately</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /> Cleaning</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" /> Maintenance</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                Loading 120 rooms inventory matrix...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No rooms match the selected location, wing, or status filter.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                {filteredRooms.map((room) => {
                  const badge = getStatusBadge(room.status);
                  return (
                    <div
                      key={room._id}
                      className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/50 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between transition-all group hover:shadow-lg relative overflow-hidden min-w-0"
                    >
                      {/* Top Bar with Number & Category */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                            {room.roomNumber}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate font-medium" title={room.category?.name || room.name}>
                          {room.category?.name || room.name}
                        </p>
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">
                          {room.wing} • {room.floor}
                        </p>
                      </div>

                      {/* Pricing & Quick Status Toggler */}
                      <div className="mt-3 pt-2.5 border-t border-slate-900 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium">₹{room.basePrice?.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500">/night</span>
                        </div>

                        {/* 1-Click Status Toggler */}
                        <select
                          value={room.status}
                          onChange={(e) => handleQuickStatusChange(room._id, e.target.value)}
                          className={`w-full text-[10px] font-bold py-1 px-1.5 rounded border transition-colors focus:outline-none ${badge.bg}`}
                        >
                          <option value="Available" className="bg-slate-900 text-emerald-300">🟢 Available</option>
                          <option value="Occupied" className="bg-slate-900 text-rose-300">🔴 Occupied</option>
                          <option value="Cleaning" className="bg-slate-900 text-amber-300">🟡 Cleaning</option>
                          <option value="Maintenance" className="bg-slate-900 text-purple-300">🟣 Maintenance</option>
                          <option value="Reserved" className="bg-slate-900 text-sky-300">🔵 Reserved</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOCATIONS MANAGEMENT (MULTI-PROPERTY) */}
      {/* ========================================================================= */}
      {activeSubTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Registered Resort Properties & Destinations
            </h2>
            <button
              onClick={() => setShowLocationModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <div
                key={loc._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {loc.code}
                        </span>
                        <span className="text-xs text-slate-400">{loc.city}, {loc.state}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {loc.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {loc.description || 'Exclusive luxury resort and private estate.'}
                  </p>

                  {/* Property Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <p className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-400">
                      <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Manager: <strong className="text-slate-200">{loc.managerName || 'Operations Lead'}</strong> ({loc.managerPhone || loc.phone})</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{loc.email || 'concierge@moonlightvilla.com'}</span>
                    </p>
                  </div>

                  {/* Room Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Total</span>
                      <strong className="text-sm text-slate-100">{loc.totalRooms || 0} Rooms</strong>
                    </div>
                    <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block uppercase">Available</span>
                      <strong className="text-sm text-emerald-200">{loc.availableRooms || 0}</strong>
                    </div>
                    <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                      <span className="text-[10px] text-rose-400 block uppercase">Occupied</span>
                      <strong className="text-sm text-rose-200">{loc.occupiedRooms || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Occupancy: <strong className="text-amber-400">{loc.occupancyRate || 0}%</strong>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(loc._id);
                      setActiveSubTab('grid');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    View Room Matrix <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROOM DIRECTORY TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'table' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                120-Room Master Inventory Table
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkRoomModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" /> Bulk Generate
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Room No.</th>
                    <th className="px-4 py-3">Room Name</th>
                    <th className="px-4 py-3">Location & Villa</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Wing & Floor</th>
                    <th className="px-4 py-3">Tariff (Weekday / Wknd)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRooms.slice(0, 50).map((room) => {
                    const badge = getStatusBadge(room.status);
                    return (
                      <tr key={room._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-amber-400">{room.roomNumber}</td>
                        <td className="px-4 py-3 font-semibold text-slate-100">{room.name}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {room.propertyLocation?.name || room.villa?.name || 'Lonavala Flagship'}
                        </td>
                        <td className="px-4 py-3">{room.category?.name || 'Deluxe Suite'}</td>
                        <td className="px-4 py-3 text-slate-400">{room.wing} • {room.floor}</td>
                        <td className="px-4 py-3 font-medium">
                          ₹{room.basePrice?.toLocaleString()} / ₹{room.weekendPrice?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {room.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRooms.length > 50 && (
              <div className="p-3 bg-slate-950 text-center text-xs text-slate-400 border-t border-slate-800">
                Showing first 50 rooms. Use filters or search above to find specific rooms in the 120-room inventory.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VILLAS & SUITES (VILLA ACCESS & MANAGEMENT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'villas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-200 tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" /> Luxury Villas & Estates Portfolio ({villas.length} Active Estates)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage villa specifications, pricing, manager assignments, and smart digital keypad / gate access codes.
              </p>
            </div>
            <button
              onClick={() => openNewVillaModal()}
              className="gold-button-gradient text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Register New Luxury Villa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {villas.map((villa) => (
              <div key={villa._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                <div>
                  <div className="h-48 relative overflow-hidden group">
                    <img
                      src={villa.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'}
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {villa.propertyLocation?.name || 'Flagship Estate'}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteVilla(villa._id)}
                        className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 p-1.5 rounded-lg transition-colors"
                        title="Delete Villa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-amber-400 text-[10px] uppercase tracking-wider font-semibold block">
                        {villa.tagline || 'Private Luxury Estate'}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-slate-100">{villa.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {villa.description}
                    </p>

                    {/* Specs Row */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Bedrooms</span>
                        <strong className="text-slate-200">{villa.specs?.bedrooms || 5} BHK</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Baths</span>
                        <strong className="text-slate-200">{villa.specs?.bathrooms || 6} Baths</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Guests</span>
                        <strong className="text-slate-200">{villa.specs?.maxGuests || 16} Max</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Area</span>
                        <strong className="text-slate-200">{villa.specs?.squareFeet?.toLocaleString() || '8,500'} sqft</strong>
                      </div>
                    </div>

                    {/* Tariffs */}
                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Weekday Tariff</span>
                        <strong className="text-sm text-amber-400 font-serif">₹{villa.pricing?.basePricePerNight?.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">/night</span></strong>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Weekend Tariff</span>
                        <strong className="text-sm text-amber-400 font-serif">₹{villa.pricing?.weekendPricePerNight?.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">/night</span></strong>
                      </div>
                    </div>

                    {/* Smart Keypad / Gate Access Code Box */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Smart Gate / Keypad Access Code
                          </span>
                          <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
                            {villa.accessCode || 'VLA-8829'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(villa.accessCode || 'VLA-8829');
                            alert(`Passcode ${villa.accessCode || 'VLA-8829'} copied to clipboard!`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-900 border border-slate-800 transition-colors"
                          title="Copy Passcode"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRegenerateVillaAccess(villa)}
                          className="text-[10px] font-semibold text-slate-300 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded border border-slate-800 flex items-center gap-1 transition-colors"
                          title="Generate New Access PIN"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" /> Reset PIN
                        </button>
                      </div>
                    </div>

                    {/* Villa Manager & Staff Credentials */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {villa.manager?.name?.[0] || 'M'}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">Assigned Villa Manager</span>
                          <span className="text-slate-200 font-bold block">{villa.manager?.name || 'Vikram Malhotra (Estate Director)'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{villa.manager?.phone || '+91 98200 44100'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase">Manager PIN</span>
                        <span className="font-mono text-[11px] font-bold text-amber-400">
                          {villa.manager?.smartAccessPin || 'PIN-9412'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SUITE CATEGORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-200 tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> Suite & Room Categories ({categories.length})
              </h2>
              <p className="text-[11px] text-slate-400">Manage room configurations, guest occupancy, and tariff tiering</p>
            </div>
            <button
              onClick={() => {
                setShowSingleRoomModal(true);
                setIsCreatingCategory(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Suite Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No Suite Categories Defined</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create categories like Presidential Suite, Deluxe Valley Room, or Ocean Cabana to assign rooms and tariffs.
              </p>
              <button
                onClick={() => {
                  setShowSingleRoomModal(true);
                  setIsCreatingCategory(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-100">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{cat.description || 'Luxury boutique category'}</p>
                    </div>
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Capacity:</span>
                      <span className="text-slate-200 font-medium">{cat.maxAdults} Adults, {cat.maxChildren} Children</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekday Tariff:</span>
                      <span className="text-amber-400 font-semibold font-mono">₹{cat.basePrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekend Tariff:</span>
                      <span className="text-amber-400 font-semibold font-mono">₹{cat.weekendPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: MAINTENANCE BLOCKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'blocks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              Active Inventory Maintenance Locks
            </h2>
            <button
              onClick={() => setShowBlockModal(true)}
              className="bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Maintenance Lock
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No active maintenance blocks. All rooms operational.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {blocks.map((block) => (
                <div key={block._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-200 block">
                      {block.villa?.name} {block.room ? `• Room ${block.room.roomNumber}` : '• Entire Villa'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(block.startDate).toLocaleDateString()} to {new Date(block.endDate).toLocaleDateString()} • Reason: <span className="text-red-400">{block.reason}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(block._id)}
                    className="text-slate-400 hover:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded border border-slate-800 hover:border-emerald-500/40 transition-colors"
                  >
                    Release Block
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PROPERTY LOCATION */}
      {/* ========================================================================= */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" /> Register New Resort Property / Destination
            </h3>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Moon Light Palms - Alibaug"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Branch Code (3-4 chars) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABG, GOA, LNV"
                    value={locationForm.code}
                    onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono uppercase text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={locationForm.city}
                    onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={locationForm.state}
                    onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Property Address *</label>
                <textarea
                  required
                  rows={2}
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={locationForm.managerName}
                    onChange={(e) => setLocationForm({ ...locationForm, managerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={locationForm.phone}
                    onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Property Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ⚡ BULK GENERATE ROOMS */}
      {/* ========================================================================= */}
      {showBulkRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" /> ⚡ Bulk Generate Rooms (120-Room Scale)
            </h3>
            <p className="text-slate-400">
              Instantly provision room sequences (e.g. 101 to 130) with assigned categories, wing, floor, and pricing.
            </p>

            <form onSubmit={handleBulkGenerate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target Location *</label>
                  <select
                    required
                    value={bulkRoomForm.locationId}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, locationId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    {locations.map(l => (
                      <option key={l._id} value={l._id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Villa / Estate *</label>
                  <select
                    required
                    value={bulkRoomForm.villaId}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, villaId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    {villas.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Room Category *</label>
                <select
                  required
                  value={bulkRoomForm.categoryId}
                  onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, categoryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Prefix</label>
                  <input
                    type="text"
                    placeholder="LNV-, GOA-"
                    value={bulkRoomForm.prefix}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, prefix: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Start No. *</label>
                  <input
                    type="number"
                    required
                    value={bulkRoomForm.startNumber}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, startNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End No. *</label>
                  <input
                    type="number"
                    required
                    value={bulkRoomForm.endNumber}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, endNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Wing / Block Name</label>
                  <input
                    type="text"
                    value={bulkRoomForm.wing}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, wing: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Floor Level</label>
                  <input
                    type="text"
                    value={bulkRoomForm.floor}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, floor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Weekday Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={bulkRoomForm.basePrice}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, basePrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weekend Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={bulkRoomForm.weekendPrice}
                    onChange={(e) => setBulkRoomForm({ ...bulkRoomForm, weekendPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkRoomModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Generate {Math.max(0, (bulkRoomForm.endNumber - bulkRoomForm.startNumber) + 1)} Rooms Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MAINTENANCE BLOCK */}
      {/* ========================================================================= */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Lock Inventory for Maintenance
            </h3>
            <form onSubmit={handleCreateBlock} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Villa *</label>
                <select
                  required
                  value={blockFormData.villa}
                  onChange={(e) => setBlockFormData({ ...blockFormData, villa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  {villas.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Room (Optional)</label>
                <select
                  value={blockFormData.room || ''}
                  onChange={(e) => setBlockFormData({ ...blockFormData, room: e.target.value || undefined })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  <option value="">Entire Villa / Suite</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>{r.roomNumber} - {r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={blockFormData.startDate}
                    onChange={(e) => setBlockFormData({ ...blockFormData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={blockFormData.endDate}
                    onChange={(e) => setBlockFormData({ ...blockFormData, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason *</label>
                <select
                  value={blockFormData.reason}
                  onChange={(e) => setBlockFormData({ ...blockFormData, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Owner Stay">Owner Private Stay</option>
                  <option value="Renovation">Suite Refurbishment</option>
                  <option value="Sanitization">Deep Sanitization</option>
                  <option value="Deep Cleaning">Deep Cleaning Cycle</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Enforce Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD SINGLE ROOM WITH INLINE CATEGORY CREATION */}
      {/* ========================================================================= */}
      {showSingleRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4 my-8 shadow-2xl shadow-emerald-950/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                    Add Single Room
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure room number, destination, category, and tariff</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSingleRoomModal(false)}
                className="text-slate-400 hover:text-slate-200 text-base font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSingleRoom} className="space-y-4">
              {/* Room Number & Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LNV-101 or 201"
                    value={singleRoomForm.roomNumber}
                    onChange={(e) => {
                      const num = e.target.value;
                      setSingleRoomForm({
                        ...singleRoomForm,
                        roomNumber: num,
                        name: singleRoomForm.name || (isCreatingCategory ? `${newCategoryForm.name} ${num}` : `Room ${num}`)
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Royal Moon Suite"
                    value={singleRoomForm.name}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Location & Villa Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> Property Destination *
                  </label>
                  <select
                    value={singleRoomForm.propertyLocation}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, propertyLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  >
                    {locations.length === 0 ? (
                      <option value="">Default Main Sanctuary</option>
                    ) : (
                      locations.map(l => (
                        <option key={l._id} value={l._id}>{l.name} ({l.code})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-amber-400" /> Villa / Estate
                  </label>
                  <select
                    value={singleRoomForm.villa}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, villa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  >
                    {villas.length === 0 ? (
                      <option value="">Auto-Assign to Estate</option>
                    ) : (
                      villas.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* CATEGORY SECTION: SELECT OR ADD NEW CATEGORY ON-THE-FLY */}
              {/* ========================================================================= */}
              <div className="border border-amber-500/30 bg-slate-950/70 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" /> Room Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isCreatingCategory && categories.length > 0 ? '← Choose Existing Category' : '+ Add New Category'}
                  </button>
                </div>

                {/* If Not Creating New Category AND existing categories exist */}
                {!isCreatingCategory && categories.length > 0 ? (
                  <div>
                    <select
                      required={!isCreatingCategory}
                      value={singleRoomForm.category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCreatingCategory(true);
                          return;
                        }
                        const selectedCat = categories.find(c => c._id === e.target.value);
                        setSingleRoomForm({
                          ...singleRoomForm,
                          category: e.target.value,
                          basePrice: selectedCat?.basePrice || singleRoomForm.basePrice,
                          weekendPrice: selectedCat?.weekendPrice || singleRoomForm.weekendPrice,
                          name: singleRoomForm.name || `${selectedCat?.name || 'Suite'} ${singleRoomForm.roomNumber || ''}`.trim()
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-medium focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                    >
                      <option value="">-- Select Suite Category --</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} — Weekday: ₹{c.basePrice?.toLocaleString()} | Weekend: ₹{c.weekendPrice?.toLocaleString()}
                        </option>
                      ))}
                      <option value="__NEW__">➕ + Create New Category...</option>
                    </select>
                  </div>
                ) : (
                  /* INLINE CATEGORY CREATOR */
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {categories.length === 0 ? 'No categories yet. Define your first category below:' : 'Create & Link New Category:'}
                      </span>
                      {categories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingCategory(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                        Quick Category Presets (Click to apply):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Presidential Suite', base: 28000, weekend: 34000, adults: 2, children: 2 },
                          { name: 'Deluxe Valley Suite', base: 14000, weekend: 17000, adults: 2, children: 1 },
                          { name: 'Ocean View Suite', base: 19000, weekend: 23000, adults: 2, children: 1 },
                          { name: 'Private Pool Villa Room', base: 24000, weekend: 29000, adults: 2, children: 2 },
                          { name: 'Executive Garden Suite', base: 12000, weekend: 15000, adults: 2, children: 1 },
                          { name: 'Family Penthouse', base: 35000, weekend: 42000, adults: 4, children: 2 }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewCategoryForm({
                                ...newCategoryForm,
                                name: preset.name,
                                maxAdults: preset.adults,
                                maxChildren: preset.children
                              });
                              setSingleRoomForm(prev => ({
                                ...prev,
                                basePrice: preset.base,
                                weekendPrice: preset.weekend,
                                name: prev.roomNumber ? `${preset.name} ${prev.roomNumber}` : `${preset.name} 101`
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] border transition-all ${
                              newCategoryForm.name === preset.name
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Name & Capacity Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required={isCreatingCategory || categories.length === 0}
                          placeholder="e.g. Royal Horizon Suite"
                          value={newCategoryForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewCategoryForm({ ...newCategoryForm, name: val });
                            if (!singleRoomForm.name || singleRoomForm.name.startsWith(newCategoryForm.name)) {
                              setSingleRoomForm(prev => ({
                                ...prev,
                                name: `${val} ${prev.roomNumber || ''}`.trim()
                              }));
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                          Capacity (Adult / Child)
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            title="Max Adults"
                            value={newCategoryForm.maxAdults}
                            onChange={(e) => setNewCategoryForm({ ...newCategoryForm, maxAdults: Number(e.target.value) })}
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs text-center"
                          />
                          <input
                            type="number"
                            min="0"
                            max="8"
                            title="Max Children"
                            value={newCategoryForm.maxChildren}
                            onChange={(e) => setNewCategoryForm({ ...newCategoryForm, maxChildren: Number(e.target.value) })}
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Description & Quick Save */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. Hilltop valley views with marble jacuzzi)"
                        value={newCategoryForm.description}
                        onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleQuickCreateCategory}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm"
                        title="Save category to database now"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save Category
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tariffs (Weekday & Weekend) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weekday Tariff (₹) *</label>
                  <input
                    type="number"
                    required
                    value={singleRoomForm.basePrice}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, basePrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weekend Tariff (₹) *</label>
                  <input
                    type="number"
                    required
                    value={singleRoomForm.weekendPrice}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, weekendPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Wing, Floor, Bed & Keypad PIN */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Wing / Block</label>
                  <input
                    type="text"
                    value={singleRoomForm.wing}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, wing: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                    placeholder="Wing A"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Floor</label>
                  <input
                    type="text"
                    value={singleRoomForm.floor}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, floor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                    placeholder="Floor 1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={singleRoomForm.bedType}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, bedType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                    placeholder="King Bed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Digital Door PIN</label>
                  <input
                    type="text"
                    value={singleRoomForm.smartLockCode}
                    onChange={(e) => setSingleRoomForm({ ...singleRoomForm, smartLockCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-amber-400 font-mono font-bold text-xs"
                    placeholder="*1042#"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSingleRoomModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save & Register Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REGISTER NEW LUXURY VILLA & ACCESS KEYPAD */}
      {/* ========================================================================= */}
      {showVillaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-xs text-slate-300 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-400" /> Register New Luxury Villa & Keypad Access
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add an exclusive villa to your property inventory with pricing, physical specs, assigned manager, and smart gate access PIN.
              </p>
            </div>

            <form onSubmit={handleCreateVilla} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Villa Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Moon Light Royal Sunset Estate"
                  value={villaForm.name}
                  onChange={(e) => setVillaForm({ ...villaForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-semibold text-sm"
                />
              </div>

              {/* PROPERTY LOCATION / DESTINATION SECTION */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                        Property Location / Destination *
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Assign this villa to an existing resort branch or register a new destination on-the-fly.
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVillaForm(prev => ({ ...prev, isNewLocation: false }))}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                        !villaForm.isNewLocation
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Existing Destination ({locations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVillaForm(prev => ({ ...prev, isNewLocation: true }))}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                        villaForm.isNewLocation
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      + New Destination
                    </button>
                  </div>
                </div>

                {!villaForm.isNewLocation ? (
                  <div className="space-y-2.5">
                    {/* Quick Destination Pills */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                        Quick Select Resort Destination:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {locations.map((loc) => {
                          const isSelected = villaForm.propertyLocation === loc._id;
                          return (
                            <button
                              type="button"
                              key={loc._id}
                              onClick={() => handleSelectLocationInVillaForm(loc._id)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-amber-400 bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/50'
                                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[9px] font-bold uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-400">
                                  {loc.code}
                                </span>
                                <span className="text-[10px] text-slate-400">{loc.city}</span>
                              </div>
                              <span className="font-bold text-xs block truncate text-slate-100">{loc.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{loc.state}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fallback Dropdown & City/State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">Select Destination Branch *</label>
                        <select
                          required={!villaForm.isNewLocation}
                          value={villaForm.propertyLocation}
                          onChange={(e) => handleSelectLocationInVillaForm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-semibold"
                        >
                          <option value="">-- Choose Destination --</option>
                          {locations.map((loc) => (
                            <option key={loc._id} value={loc._id}>
                              {loc.name} ({loc.city}, {loc.state})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">Destination City & State</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={villaForm.city}
                            onChange={(e) => setVillaForm({ ...villaForm, city: e.target.value })}
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={villaForm.state}
                            onChange={(e) => setVillaForm({ ...villaForm, state: e.target.value })}
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Specific Villa Estate Address / Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Plot 14, Tiger Point Hillcrest, Lonavala"
                        value={villaForm.address}
                        onChange={(e) => setVillaForm({ ...villaForm, address: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Registering New Property Location & Destination
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">New Destination / Resort Name *</label>
                        <input
                          type="text"
                          required={villaForm.isNewLocation}
                          placeholder="e.g. Moon Light Lake Palace - Udaipur"
                          value={villaForm.newLocationName}
                          onChange={(e) => setVillaForm({ ...villaForm, newLocationName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">Branch Code (3-4 chars) *</label>
                        <input
                          type="text"
                          required={villaForm.isNewLocation}
                          placeholder="e.g. UDP"
                          value={villaForm.newLocationCode}
                          onChange={(e) => setVillaForm({ ...villaForm, newLocationCode: e.target.value.toUpperCase() })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono uppercase text-slate-100 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">Destination City *</label>
                        <input
                          type="text"
                          required={villaForm.isNewLocation}
                          placeholder="e.g. Udaipur"
                          value={villaForm.city}
                          onChange={(e) => setVillaForm({ ...villaForm, city: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[11px]">State *</label>
                        <input
                          type="text"
                          required={villaForm.isNewLocation}
                          placeholder="e.g. Rajasthan"
                          value={villaForm.state}
                          onChange={(e) => setVillaForm({ ...villaForm, state: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Destination Full Address *</label>
                      <input
                        type="text"
                        required={villaForm.isNewLocation}
                        placeholder="e.g. Lake Pichola Waterfront, City Palace Road, Udaipur"
                        value={villaForm.address}
                        onChange={(e) => setVillaForm({ ...villaForm, address: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="Private Heated Pool & Panoramic Mountain Vista"
                  value={villaForm.tagline}
                  onChange={(e) => setVillaForm({ ...villaForm, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe architectural style, infinity pool, luxury living quarters, and scenic surroundings..."
                  value={villaForm.description}
                  onChange={(e) => setVillaForm({ ...villaForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 leading-relaxed"
                />
              </div>

              {/* Tariffs */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Weekday Tariff (₹ / night) *</label>
                  <input
                    type="number"
                    required
                    value={villaForm.basePricePerNight}
                    onChange={(e) => setVillaForm({ ...villaForm, basePricePerNight: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weekend Tariff (₹ / night) *</label>
                  <input
                    type="number"
                    required
                    value={villaForm.weekendPricePerNight}
                    onChange={(e) => setVillaForm({ ...villaForm, weekendPricePerNight: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* Physical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Bedrooms</label>
                  <input
                    type="number"
                    required
                    value={villaForm.bedrooms}
                    onChange={(e) => setVillaForm({ ...villaForm, bedrooms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Bathrooms</label>
                  <input
                    type="number"
                    required
                    value={villaForm.bathrooms}
                    onChange={(e) => setVillaForm({ ...villaForm, bathrooms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Max Guests</label>
                  <input
                    type="number"
                    required
                    value={villaForm.maxGuests}
                    onChange={(e) => setVillaForm({ ...villaForm, maxGuests: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Area (Sq Ft)</label>
                  <input
                    type="number"
                    required
                    value={villaForm.squareFeet}
                    onChange={(e) => setVillaForm({ ...villaForm, squareFeet: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
              </div>

              {/* Access Code & Manager Assignment */}
              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Villa Access & Smart Keypad Configuration
                  </span>
                  <button
                    type="button"
                    onClick={() => setVillaForm({ ...villaForm, accessCode: `VLA-${Math.floor(1000 + Math.random() * 9000)}` })}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Gate / Keypad Access Code *</label>
                    <input
                      type="text"
                      required
                      value={villaForm.accessCode}
                      onChange={(e) => setVillaForm({ ...villaForm, accessCode: e.target.value })}
                      placeholder="VLA-8829"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-amber-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Assigned Villa Manager</label>
                    <select
                      value={villaForm.manager}
                      onChange={(e) => setVillaForm({ ...villaForm, manager: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                    >
                      <option value="">-- Select Staff Manager --</option>
                      {staffUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role}) - {u.smartAccessPin || 'PIN'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Cover Image URL *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVillaForm({ ...villaForm, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80' })}
                      className="text-[10px] text-slate-400 hover:text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      Preset: Mountain
                    </button>
                    <button
                      type="button"
                      onClick={() => setVillaForm({ ...villaForm, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' })}
                      className="text-[10px] text-slate-400 hover:text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      Preset: Coastal
                    </button>
                    <button
                      type="button"
                      onClick={() => setVillaForm({ ...villaForm, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80' })}
                      className="text-[10px] text-slate-400 hover:text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      Preset: Estate
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  required
                  value={villaForm.imageUrl}
                  onChange={(e) => setVillaForm({ ...villaForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={villaForm.amenities}
                  onChange={(e) => setVillaForm({ ...villaForm, amenities: e.target.value })}
                  placeholder="Private Heated Pool, Jacuzzi, Chef on Call, Helipad, Butler Service"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVillaModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg gold-button-gradient text-slate-950 font-bold shadow-lg"
                >
                  Register Luxury Villa & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillaRoomManagement;
