import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Users,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../../services/api';

const VillaDetailPage = () => {
  const { slug } = useParams();
  const [villa, setVilla] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillaDetail = async () => {
      try {
        const res = await api.get(`/villas/${slug}`);
        if (res.data.success) {
          setVilla(res.data.villa);
          setCategories(res.data.categories || []);
          setRooms(res.data.rooms || []);
        }
      } catch (err) {
        console.error('Failed to load villa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillaDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-amber-400 text-sm">Loading residence details...</p>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-serif text-slate-100">Villa Not Found</h2>
        <Link to="/villas" className="text-amber-400 text-sm mt-4 inline-block hover:underline">
          Return to Villas Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 overflow-x-hidden">
      {/* Villa Header Title */}
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
          {villa.tagline}
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-2 sm:mb-3">
          {villa.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
          <span>{villa.location?.address}, {villa.location?.city}</span>
        </p>
      </div>

      {/* Gallery Showcase */}
      <div className="space-y-3 sm:space-y-4">
        <div className="h-64 sm:h-96 md:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <img
            src={villa.images?.[activeImage]?.url || villa.images?.[0]?.url}
            alt={villa.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          {villa.images?.[activeImage]?.caption && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs text-slate-200 border border-slate-800">
              {villa.images[activeImage].caption}
            </div>
          )}
        </div>

        {/* Thumbnail Row */}
        <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
          {villa.images?.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-20 h-16 sm:w-24 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activeImage === idx ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={img.caption || 'Thumbnail'} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Descriptions & Details */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          {/* Key Specs Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div>
              <Bed className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="text-[11px] sm:text-xs text-slate-400 block">Bedrooms</span>
              <strong className="text-xs sm:text-sm text-slate-200">{villa.specs.bedrooms} Luxury Suites</strong>
            </div>
            <div>
              <Bath className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="text-[11px] sm:text-xs text-slate-400 block">Bathrooms</span>
              <strong className="text-xs sm:text-sm text-slate-200">{villa.specs.bathrooms} En-Suite Baths</strong>
            </div>
            <div>
              <Users className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="text-[11px] sm:text-xs text-slate-400 block">Capacity</span>
              <strong className="text-xs sm:text-sm text-slate-200">Up to {villa.specs.maxGuests} Guests</strong>
            </div>
            <div>
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="text-[11px] sm:text-xs text-slate-400 block">Estate Area</span>
              <strong className="text-xs sm:text-sm text-slate-200">{villa.specs.squareFeet} Sq. Ft.</strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4">About The Residence</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
              {villa.description}
            </p>
          </div>

          {/* Amenities & Inclusions */}
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4">Estate Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs text-slate-300">
              {villa.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-800/80 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Penthouse Suite Categories (If available) */}
          {categories.length > 0 && (
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4">Suite Configurations</h2>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{cat.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                      <div className="flex gap-4 text-[11px] text-amber-400/90 mt-2">
                        <span>Adults: {cat.maxAdults}</span>
                        <span>Children: {cat.maxChildren}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">Individual Suite Tariff</span>
                      <span className="text-base font-bold text-amber-400">₹{cat.basePrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400"> / night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stay Rules & Policies */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 text-xs text-slate-400">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" /> Check-in & Estate Policies
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              {villa.rules?.map((rule, idx) => (
                <li key={idx} className="text-slate-300">{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Reservation Action Card */}
        <div>
          <div className="lg:sticky lg:top-28 glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-500/20 space-y-5 sm:space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-semibold">
                Nightly Tariff
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-3xl font-bold text-amber-400">
                  ₹{villa.pricing.basePricePerNight.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">weekday</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                <span>Weekend Tariff: </span>
                <strong className="text-slate-100">₹{villa.pricing.weekendPricePerNight.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Cleaning & Hospitality:</span>
                <span className="text-slate-100">₹{villa.pricing.cleaningFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Refundable Security Deposit:</span>
                <span className="text-slate-100">₹{villa.pricing.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax Rate:</span>
                <span className="text-slate-100">{villa.pricing.taxPercentage}%</span>
              </div>
            </div>

            <Link
              to={`/booking?villaId=${villa._id}`}
              className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 block text-center"
            >
              <Calendar className="w-4 h-4" /> Reserve This Villa
            </Link>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>50% advance to confirm your dates.</p>
              <p className="text-amber-400/90 font-medium">Free cancellation up to 7 days prior.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillaDetailPage;
