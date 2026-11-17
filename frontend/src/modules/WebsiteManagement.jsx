import React, { useState, useEffect } from 'react';
import {
  Globe,
  Image,
  MessageSquare,
  BadgePercent,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const WebsiteManagement = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState(null);
  const [banners, setBanners] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Modal forms state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    try {
      const [pubRes, bannerRes, gallRes, testRes, offRes, coupRes] = await Promise.all([
        api.get('/website/public-data'),
        api.get('/website/banners'),
        api.get('/website/gallery'),
        api.get('/website/testimonials'),
        api.get('/website/offers'),
        api.get('/website/coupons'),
      ]);

      if (pubRes.data.success) setSettings(pubRes.data.settings);
      if (bannerRes.data.success) setBanners(bannerRes.data.banners);
      if (gallRes.data.success) setGallery(gallRes.data.gallery);
      if (testRes.data.success) setTestimonials(testRes.data.testimonials);
      if (offRes.data.success) setOffers(offRes.data.offers);
      if (coupRes.data.success) setCoupons(coupRes.data.coupons);
    } catch (err) {
      console.error('Failed to load website management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/website/settings', settings);
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: 'Website settings and SEO metadata updated successfully!' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update settings.' });
    }
  };

  const handleDeleteItem = async (endpoint, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleOpenAddModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'banner') {
        await api.post('/website/banners', formData);
      } else if (modalType === 'gallery') {
        await api.post('/website/gallery', formData);
      } else if (modalType === 'testimonial') {
        await api.post('/website/testimonials', formData);
      } else if (modalType === 'offer') {
        await api.post('/website/offers', formData);
      } else if (modalType === 'coupon') {
        await api.post('/website/coupons', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating item: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 1: CMS Engine
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Website Content & SEO Management
          </h1>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-red-950/80 border border-red-500/40 text-red-300'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'settings', label: 'Settings & SEO', icon: Globe },
          { id: 'banners', label: 'Hero Banners', icon: Image },
          { id: 'gallery', label: 'Photo Gallery', icon: Image },
          { id: 'testimonials', label: 'Guest Reviews', icon: MessageSquare },
          { id: 'offers', label: 'Special Offers', icon: BadgePercent },
          { id: 'coupons', label: 'Coupon Codes', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-amber-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Website Settings & SEO */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Website Brand Name</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tagline / Motto</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Official Contact Phone</label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Official Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Full Physical Address</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* SEO Section */}
            <div className="sm:col-span-2 pt-4 border-t border-slate-800">
              <h3 className="font-serif text-sm font-bold text-slate-100 mb-4">SEO & Metadata Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">SEO Meta Title</label>
                  <input
                    type="text"
                    value={settings.seo?.metaTitle || ''}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">SEO Meta Description</label>
                  <textarea
                    rows="2"
                    value={settings.seo?.metaDescription || ''}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="gold-button-gradient text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" /> Save Website Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab Content 2: Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Homepage Hero Banners</h2>
            <button
              onClick={() => handleOpenAddModal('banner')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <img src={b.imageUrl} alt={b.title} className="w-full h-44 object-cover" />
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100">{b.title}</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">{b.subtitle}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">
                      {b.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('/website/banners', b._id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Gallery */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Visual Gallery Items</h2>
            <button
              onClick={() => handleOpenAddModal('gallery')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Gallery Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {gallery.map((g) => (
              <div key={g._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group">
                <img src={g.imageUrl} alt={g.title} className="w-full h-36 object-cover" />
                <div className="p-2.5">
                  <p className="font-semibold text-slate-200 truncate">{g.title}</p>
                  <span className="text-[10px] text-amber-400">{g.category}</span>
                </div>
                <button
                  onClick={() => handleDeleteItem('/website/gallery', g._id)}
                  className="absolute top-2 right-2 bg-red-950/80 text-red-300 p-1.5 rounded-md hover:bg-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Guest Testimonials</h2>
            <button
              onClick={() => handleOpenAddModal('testimonial')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Testimonial
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {testimonials.map((t) => (
              <div key={t._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-100">{t.guestName}</h4>
                  <p className="text-[11px] text-amber-400">{t.location} • {t.stayDate}</p>
                  <p className="text-slate-300 mt-2 text-[11px] italic">"{t.reviewText}"</p>
                </div>
                <button
                  onClick={() => handleDeleteItem('/website/testimonials', t._id)}
                  className="text-red-400 hover:text-red-300 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 5: Special Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Special Offers & Packages</h2>
            <button
              onClick={() => handleOpenAddModal('offer')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Offer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {offers.map((o) => (
              <div key={o._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{o.discountText}</span>
                    <h3 className="font-bold text-slate-100 text-sm mt-0.5">{o.title}</h3>
                    <p className="text-slate-300 mt-2">{o.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Code: <strong className="text-amber-400 font-mono">{o.couponCode || 'N/A'}</strong></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 6: Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Promotional Coupons</h2>
            <button
              onClick={() => handleOpenAddModal('coupon')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {coupons.map((c) => (
              <div key={c._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-base font-bold text-amber-400 block tracking-wider">{c.code}</span>
                    <span className="text-slate-300 font-medium block mt-0.5">{c.title}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                    {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{c.description}</p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                  <span>Min Booking: ₹{c.minBookingAmount || 0}</span>
                  <span>Times Used: {c.usedCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reusable Simple Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Add New {modalType.toUpperCase()}
            </h3>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              {modalType === 'gallery' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Photo Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.category || 'Architecture & Exterior'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    >
                      <option value="Architecture & Exterior">Architecture & Exterior</option>
                      <option value="Infinity Pool">Infinity Pool</option>
                      <option value="Master Suites">Master Suites</option>
                      <option value="Living & Lounge">Living & Lounge</option>
                      <option value="Dining & Bar">Dining & Bar</option>
                      <option value="Scenic Horizons">Scenic Horizons</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'coupon' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Discount Type</label>
                      <select
                        value={formData.discountType || 'Percentage'}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={formData.discountValue || ''}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Min Booking Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.minBookingAmount || 0}
                      onChange={(e) => setFormData({ ...formData, minBookingAmount: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                </>
              )}

              {modalType === 'banner' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Banner Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                </>
              )}

              {modalType === 'testimonial' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Guest Name</label>
                    <input
                      type="text"
                      required
                      value={formData.guestName || ''}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Review Text</label>
                    <textarea
                      rows="3"
                      required
                      value={formData.reviewText || ''}
                      onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManagement;
