import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Bath, Sparkles, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import api from '../../services/api';

const VillasPage = () => {
  const [villas, setVillas] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const [villasRes, locsRes] = await Promise.all([
          api.get('/villas'),
          api.get('/villas/locations/all').catch(() => ({ data: { success: false } }))
        ]);
        if (villasRes.data.success) {
          setVillas(villasRes.data.villas);
        }
        if (locsRes.data?.success) {
          setLocations(locsRes.data.locations);
        }
      } catch (err) {
        console.error('Failed to load villas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillas();
  }, []);

  const filteredVillas = villas.filter(v => {
    if (selectedLocation === 'all') return true;
    const locId = v.propertyLocation?._id || v.propertyLocation;
    return locId === selectedLocation;
  });

  return (
    <div className="py-12 space-y-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-3">
          Luxury Accommodations & Destinations
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-slate-100 mb-4">
          Villas & Luxury Suites
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-light leading-relaxed">
          Reserve entire private estates or book individual luxury rooms across our 3 premier resort locations with 120 operational rooms.
        </p>
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-6" />

        {/* Location Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setSelectedLocation('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedLocation === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Destinations ({villas.length})
          </button>
          {locations.map(loc => (
            <button
              key={loc._id}
              onClick={() => setSelectedLocation(loc._id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedLocation === loc._id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <MapPin className="w-3 h-3" />
              {loc.name.split('-')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Villa Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {filteredVillas.map((villa) => (
          <div
            key={villa._id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row group hover:border-amber-500/30 transition-all duration-300"
          >
            {/* Image Gallery Column */}
            <div className="lg:w-1/2 relative min-h-[340px] sm:min-h-[420px]">
              <img
                src={villa.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'}
                alt={villa.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full">
                Featured Residence
              </div>
            </div>

            {/* Details Column */}
            <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {villa.name}
                  </h2>
                </div>
                <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-4">
                  {villa.tagline}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {villa.description}
                </p>

                {/* Specs Pill List */}
                <div className="flex flex-wrap gap-4 py-4 border-y border-slate-800 text-xs text-slate-300 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-amber-400" />
                    <span>{villa.specs.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-amber-400" />
                    <span>{villa.specs.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Max {villa.specs.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{villa.specs.squareFeet} Sq. Ft.</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mb-8">
                  {villa.amenities?.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Booking CTA */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Nightly Tariff</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-bold text-amber-400">
                      ₹{villa.pricing.basePricePerNight.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">weekday /</span>
                    <span className="text-sm font-semibold text-slate-300">
                      ₹{villa.pricing.weekendPricePerNight.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">weekend</span>
                  </div>
                  <span className="text-[10px] text-slate-500">+18% GST Applicable</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to={`/villas/${villa.slug}`}
                    className="w-1/2 sm:w-auto text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase tracking-wider px-5 py-3 rounded-lg border border-slate-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/booking?villaId=${villa._id}`}
                    className="w-1/2 sm:w-auto text-center gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    Reserve Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VillasPage;
