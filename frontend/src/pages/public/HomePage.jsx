// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Calendar,
//   Users,
//   Moon,
//   Sparkles,
//   ArrowRight,
//   ShieldCheck,
//   CheckCircle2,
//   Star,
//   Compass,
//   Coffee,
//   Waves,
//   Tv,
//   Flame,
//   PhoneCall,
//   Search,
//   BadgePercent
// } from 'lucide-react';
// import api from '../../services/api';
// import ctaVideo from '../../../assets/IMG_0739.mp4';
// import heroImg1 from '../../../assets/Tropical Infinity Pool Paradise.png';
// import heroImg2 from '../../../assets/Tropical Modern House with Garden Walkway.png';
// import heroImg3 from '../../../assets/Tropical Sunset Villa Overlooking the Sea.png';

// const HERO_IMAGES = [
//   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
//   heroImg1,
//   heroImg2,
//   heroImg3
// ];

// const SpecialOfferCard = ({ offer }) => {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [isHovered, setIsHovered] = useState(false);

//   const handleMouseMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     setMousePosition({
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//     });
//   };

//   return (
//     <div
//       onMouseMove={handleMouseMove}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-8 sm:p-12 transition-all duration-300"
//     >
//       {/* Dynamic Cursor Spotlight Glow within the card */}
//       <div
//         className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
//         style={{
//           opacity: isHovered ? 1 : 0,
//           background: `
//             radial-gradient(220px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(253, 230, 138, 0.25) 0%, transparent 70%),
//             radial-gradient(480px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.15) 35%, transparent 75%)
//           `,
//         }}
//       />

//       <div className="relative z-10 max-w-xl">
//         <span className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">
//           <BadgePercent className="w-4 h-4" /> Limited Seasonal Privilege
//         </span>
//         <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
//           {offer.title}
//         </h3>
//         <p className="text-sm text-slate-300 leading-relaxed mb-6">
//           {offer.description} Use coupon code <strong className="text-amber-400 font-mono tracking-wider">{offer.couponCode || 'WELCOME10'}</strong> during checkout.
//         </p>
//         <Link
//           to="/booking"
//           className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
//         >
//           Claim This Offer <ArrowRight className="w-4 h-4" />
//         </Link>
//       </div>
//     </div>
//   );
// };

// const HomePage = () => {
//   const navigate = useNavigate();
//   const [villas, setVillas] = useState([]);
//   const [banners, setBanners] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);
//   const [specialOffers, setSpecialOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

//   // Auto-advance hero background image every 2 seconds
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
//     }, 2000);
//     return () => clearInterval(timer);
//   }, []);

//   // Availability search state
//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   const dayAfter = new Date(tomorrow);
//   dayAfter.setDate(dayAfter.getDate() + 2);

//   const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
//   const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
//   const [guests, setGuests] = useState('2');
//   const [selectedVilla, setSelectedVilla] = useState('');
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState('all');
//   const [availabilityMessage, setAvailabilityMessage] = useState(null);
//   const [isChecking, setIsChecking] = useState(false);

//   useEffect(() => {
//     const fetchHomeData = async () => {
//       try {
//         const [villasRes, webDataRes, locsRes] = await Promise.all([
//           api.get('/villas'),
//           api.get('/website/public-data'),
//           api.get('/villas/locations/all').catch(() => ({ data: { success: false } }))
//         ]);

//         if (locsRes.data?.success) {
//           setLocations(locsRes.data.locations);
//         }
//         if (villasRes.data.success) {
//           setVillas(villasRes.data.villas);
//           if (villasRes.data.villas.length > 0) {
//             setSelectedVilla(villasRes.data.villas[0]._id);
//           }
//         }
//         if (webDataRes.data.success) {
//           setBanners(webDataRes.data.banners || []);
//           setTestimonials(webDataRes.data.testimonials || []);
//           setSpecialOffers(webDataRes.data.specialOffers || []);
//         }
//       } catch (err) {
//         console.error('Failed to load homepage data:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchHomeData();
//   }, []);

//   const handleCheckAvailability = async (e) => {
//     e.preventDefault();
//     setIsChecking(true);
//     setAvailabilityMessage(null);
//     try {
//       const res = await api.post('/reservations/check-availability', {
//         villaId: selectedVilla,
//         checkIn,
//         checkOut
//       });

//       if (res.data.isAvailable) {
//         setAvailabilityMessage({ type: 'success', text: 'Estate is available for selected dates! Proceeding to reservation...' });
//         setTimeout(() => {
//           navigate(`/booking?villaId=${selectedVilla}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
//         }, 1000);
//       } else {
//         setAvailabilityMessage({ type: 'error', text: 'Villa is already reserved or blocked for these dates. Please select other dates.' });
//       }
//     } catch (err) {
//       setAvailabilityMessage({ type: 'error', text: err.response?.data?.message || 'Error checking availability' });
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   return (
//     <div className="space-y-24 pb-20">
//       {/* Hero Banner Section */}
//       <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
//         {/* Background luxury photo slideshow with gradient overlay */}
//         <div className="absolute inset-0 z-0">
//           {HERO_IMAGES.map((imgSrc, index) => (
//             <img
//               key={index}
//               src={imgSrc}
//               alt={`Moon Light Villa Exterior ${index + 1}`}
//               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
//                 currentHeroIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
//               }`}
//             />
//           ))}
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
//         </div>

//         {/* Hero Content */}
//         <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16 pb-28">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-[0.25em] font-medium mb-6 backdrop-blur-md">
//             <Sparkles className="w-3.5 h-3.5" /> Lonavala's Premier Private Sanctuary
//           </div>
//           <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-100 leading-[1.1] mb-6">
//             Where Timeless Elegance <br />
//             <span className="gold-gradient-text">Meets Serene Horizons</span>
//           </h1>
//           <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-10">
//             An exclusive hilltop retreat featuring a heated infinity glass pool, 5 lavish master suites, bespoke culinary concierge, and panoramic mist-covered valley vistas.
//           </p>
//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link
//               to="/booking"
//               className="w-full sm:w-auto gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl shadow-amber-950/60 hover:scale-105 transition-all flex items-center justify-center gap-2"
//             >
//               Reserve The Estate <ArrowRight className="w-4 h-4" />
//             </Link>
//             <Link
//               to="/villas"
//               className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-xs uppercase tracking-wider px-8 py-4 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2"
//             >
//               View Villa Suites
//             </Link>
//           </div>
//         </div>

//         {/* Ambient Bottom Fade */}
//         <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
//       </section>

//       {/* Floating Availability & Booking Search Bar */}
//       <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-24 relative z-20">
//         <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-amber-500/20">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400 flex items-center gap-2">
//               <Calendar className="w-4 h-4" /> Check Real-time Estate Availability & Pricing
//             </h2>
//             <span className="text-[11px] text-slate-400">Best Rate Guarantee • Instant Confirmation</span>
//           </div>

//           <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
//             {/* Destination / Location Picker */}
//             <div>
//               <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
//                 Destination
//               </label>
//               <select
//                 value={selectedLocation}
//                 onChange={(e) => {
//                   const locId = e.target.value;
//                   setSelectedLocation(locId);
//                   if (locId !== 'all') {
//                     const filtered = villas.filter(v => (v.propertyLocation?._id || v.propertyLocation) === locId);
//                     if (filtered.length > 0) setSelectedVilla(filtered[0]._id);
//                   }
//                 }}
//                 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
//               >
//                 <option value="all">All Destinations (3)</option>
//                 {locations.map((loc) => (
//                   <option key={loc._id} value={loc._id}>
//                     {loc.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Villa Picker */}
//             <div>
//               <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
//                 Accommodation
//               </label>
//               <select
//                 value={selectedVilla}
//                 onChange={(e) => setSelectedVilla(e.target.value)}
//                 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
//               >
//                 {villas
//                   .filter(v => selectedLocation === 'all' || (v.propertyLocation?._id || v.propertyLocation) === selectedLocation)
//                   .map((v) => (
//                     <option key={v._id} value={v._id}>
//                       {v.name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Check-In Date */}
//             <div>
//               <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
//                 Check-In Date
//               </label>
//               <input
//                 type="date"
//                 value={checkIn}
//                 min={new Date().toISOString().split('T')[0]}
//                 onChange={(e) => setCheckIn(e.target.value)}
//                 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
//                 required
//               />
//             </div>

//             {/* Check-Out Date */}
//             <div>
//               <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
//                 Check-Out Date
//               </label>
//               <input
//                 type="date"
//                 value={checkOut}
//                 min={checkIn}
//                 onChange={(e) => setCheckOut(e.target.value)}
//                 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
//                 required
//               />
//             </div>

//             {/* Guests */}
//             <div>
//               <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
//                 Guests
//               </label>
//               <select
//                 value={guests}
//                 onChange={(e) => setGuests(e.target.value)}
//                 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
//               >
//                 <option value="2">2 Guests (Couple)</option>
//                 <option value="4">4 Guests</option>
//                 <option value="6">6 Guests</option>
//                 <option value="10">10 Guests</option>
//                 <option value="16">16 Guests (Full Villa)</option>
//               </select>
//             </div>

//             {/* Submit Button */}
//             <div className="flex items-end">
//               <button
//                 type="submit"
//                 disabled={isChecking}
//                 className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
//               >
//                 <Search className="w-3.5 h-3.5" />
//                 {isChecking ? 'Checking...' : 'Check Dates'}
//               </button>
//             </div>
//           </form>

//           {/* Feedback message */}
//           {availabilityMessage && (
//             <div
//               className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
//                 availabilityMessage.type === 'success'
//                   ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
//                   : 'bg-red-950/80 border border-red-500/40 text-red-300'
//               }`}
//             >
//               <CheckCircle2 className="w-4 h-4 shrink-0" />
//               <span>{availabilityMessage.text}</span>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Featured Villas & Estate Showcase */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-14">
//           <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
//             Private Sanctuaries
//           </span>
//           <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100">
//             Featured Residences
//           </h2>
//           <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4" />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           {villas.map((villa) => (
//             <div
//               key={villa._id}
//               className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col group"
//             >
//               {/* Image Carousel / Photo */}
//               <div className="relative h-72 sm:h-80 overflow-hidden">
//                 <img
//                   src={villa.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'}
//                   alt={villa.name}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
//                 />
//                 <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
//                   {villa.specs.bedrooms} Bedrooms • Up to {villa.specs.maxGuests} Guests
//                 </div>
//                 <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs">
//                   <span className="text-slate-400">From </span>
//                   <span className="text-amber-400 font-bold text-sm">₹{villa.pricing.basePricePerNight.toLocaleString('en-IN')}</span>
//                   <span className="text-slate-400"> / night</span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
//                 <div>
//                   <h3 className="font-serif text-2xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
//                     {villa.name}
//                   </h3>
//                   <p className="text-xs text-amber-400/90 font-medium tracking-wider uppercase mb-3">
//                     {villa.tagline}
//                   </p>
//                   <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-6">
//                     {villa.shortDescription || villa.description}
//                   </p>

//                   {/* Highlights Grid */}
//                   <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 mb-6">
//                     {villa.amenities?.slice(0, 4).map((amenity, idx) => (
//                       <div key={idx} className="flex items-center gap-2">
//                         <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
//                         <span className="truncate">{amenity}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
//                   <Link
//                     to={`/villas/${villa.slug}`}
//                     className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
//                   >
//                     Explore Residence <ArrowRight className="w-3.5 h-3.5" />
//                   </Link>
//                   <Link
//                     to={`/booking?villaId=${villa._id}`}
//                     className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md hover:shadow-amber-500/30 transition-all"
//                   >
//                     Reserve Dates
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Signature Experiences & Amenities */}
//       <section className="bg-slate-900/60 border-y border-slate-800/80 py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
//               Curated Indulgence
//             </span>
//             <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
//               World-Class Estate Amenities
//             </h2>
//             <p className="text-sm text-slate-400 mt-3">
//               Crafted for absolute privacy, bespoke relaxation, and unforgettable celebratory stays.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <Waves className="w-6 h-6 transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Heated Infinity Pool</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 Temperature-controlled glass infinity pool suspended over whispering valleys with automated mood illumination for sunset swims.
//               </p>
//             </div>

//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <Coffee className="w-6 h-6 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Private Executive Chef</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 Tailored 5-course gourmet dining, coastal barbecues, and wood-fired oven delights prepared live by our private culinary masters.
//               </p>
//             </div>

//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <Flame className="w-6 h-6 transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Sunset Firepit & Lawn</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 Expansive manicured lawns, natural stone bonfires, and stargazing telescopes under unobstructed night skies.
//               </p>
//             </div>

//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <Tv className="w-6 h-6 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Dolby Atmos Cinema</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 120-inch 4K laser projector and reclining velvet theater seats for intimate movie nights and sporting screenings.
//               </p>
//             </div>

//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <Compass className="w-6 h-6 transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">24/7 Butler & Concierge</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 Discrete and personalized service attending to luggage, local trekking excursions, champagne service, and itinerary planning.
//               </p>
//             </div>

//             <div className="group bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
//               <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
//                 <ShieldCheck className="w-6 h-6 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" />
//               </div>
//               <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Absolute Seclusion</h3>
//               <p className="text-xs text-slate-400 leading-relaxed">
//                 Private gated hill crest estate with biometric security, backup power generation, and total protection of your privacy.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Special Privileges / Offers */}
//       {specialOffers.length > 0 && (
//         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SpecialOfferCard offer={specialOffers[0]} />
//         </section>
//       )}

//       {/* Guest Testimonials */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-14">
//           <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
//             Verified Experiences
//           </span>
//           <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
//             Words From Our Esteemed Guests
//           </h2>
//           <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4" />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {testimonials.map((t, idx) => (
//             <div
//               key={idx}
//               className="bg-slate-900/70 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
//             >
//               <div>
//                 <div className="flex items-center gap-1 text-amber-400 mb-4">
//                   {[...Array(t.rating || 5)].map((_, i) => (
//                     <Star key={i} className="w-4 h-4 fill-amber-400" />
//                   ))}
//                 </div>
//                 <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
//                   "{t.reviewText}"
//                 </p>
//               </div>
//               <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
//                 <img
//                   src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'}
//                   alt={t.guestName}
//                   className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
//                 />
//                 <div>
//                   <h4 className="text-xs font-bold text-slate-100">{t.guestName}</h4>
//                   <p className="text-[10px] text-slate-400">{t.location} • {t.stayDate}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Call to Action Banner */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 p-10 sm:p-16 text-center">
//           <div className="absolute inset-0 z-0">
//             <video
//               src={ctaVideo}
//               autoPlay
//               loop
//               muted
//               playsInline
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 bg-slate-950/65" />
//           </div>

//           <div className="relative z-10 max-w-2xl mx-auto">
//             <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100 mb-4">
//               Your Private Hilltop Escape Awaits
//             </h2>
//             <p className="text-sm text-slate-300 font-light mb-8 leading-relaxed">
//               Experience the pinnacle of hospitality. Reserve directly online or connect with our concierge for bespoke celebration packages.
//             </p>
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//               <Link
//                 to="/booking"
//                 className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl"
//               >
//                 Reserve Your Stay Online
//               </Link>
//               <a
//                 href="tel:+919820012345"
//                 className="bg-slate-900 border border-slate-700 text-slate-200 text-xs uppercase tracking-wider px-8 py-4 rounded-full hover:border-amber-400 transition-colors flex items-center gap-2"
//               >
//                 <PhoneCall className="w-4 h-4 text-amber-400" /> Speak With Concierge
//               </a>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Star,
  Compass,
  Coffee,
  Waves,
  Tv,
  Flame,
  PhoneCall,
  Search,
  BadgePercent
} from 'lucide-react';
import api from '../../services/api';
import ctaVideo from '../../../assets/IMG_0739.mp4';
import heroImg1 from '../../../assets/Tropical Infinity Pool Paradise.png';
import heroImg2 from '../../../assets/Tropical Modern House with Garden Walkway.png';
import heroImg3 from '../../../assets/Tropical Sunset Villa Overlooking the Sea.png';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
  heroImg1,
  heroImg2,
  heroImg3
];

/* ------------------------------------------------------------------ */
/*  Scroll fade-in (runs once, when the element enters the viewport)   */
/* ------------------------------------------------------------------ */
/**
 * - as:       element/tag to render (default 'div', e.g. 'section')
 * - delay:    ms before the fade starts (use to stagger siblings)
 * - rise:     px the content travels upward while fading (0 = pure fade)
 * - duration: ms the fade takes
 * Respects prefers-reduced-motion (content is simply shown).
 */
const FadeIn = ({
  children,
  as: Tag = 'div',
  delay = 0,
  rise = 16,
  duration = 800,
  className = '',
  ...rest
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect(); // run once
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : `translate3d(0, ${rise}px, 0)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/* ------------------------------------------------------------------ */
/*  Fan reveal animation (curved-arc sweep -> settle into the grid)    */
/* ------------------------------------------------------------------ */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Cards sweep in along a curved arc, hold for a moment, then glide into
 * their normal grid positions. Starts when the grid scrolls into view
 * and runs once.
 */
const useFanReveal = (containerRef, count, onDone) => {
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || count === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (onDone) onDone();
      return;
    }

    const cards = Array.from(el.children);
    const n = cards.length;

    // ---- Tunable settings ----
    const SWEEP_MS = 1300;   // phase 1: cards travel along the arc
    const HOLD_MS = 350;     // pause while fanned out
    const SETTLE_MS = 1200;  // phase 2: fly into grid
    const STAGGER_MS = 70;   // delay between cards in phase 2
    const START_SHIFT = 38;  // degrees the fan starts rotated off to the side
    const STEP_DEG = n > 6 ? 9 : 15; // angle between neighbouring cards
    const FAN_SCALE_DESKTOP = 0.72;  // size of cards while fanned (1 = full size)
    const FAN_SCALE_MOBILE = 0.52;
    const HEADER_OFFSET = 100;       // keep the fan below the fixed navbar
    // --------------------------

    // Hide immediately (before paint) so there is no flash of the normal grid
    cards.forEach((c) => {
      c.style.opacity = '0';
      c.style.transition = 'none';
      c.style.willChange = 'transform, opacity';
    });

    let raf = 0;
    let started = false;

    const reset = () => {
      cards.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '';
        c.style.transition = '';
        c.style.willChange = '';
        c.style.zIndex = '';
        c.style.pointerEvents = '';
      });
    };

    const run = () => {
      const isMobile = window.innerWidth < 640;
      const scale = isMobile ? FAN_SCALE_MOBILE : FAN_SCALE_DESKTOP;
      const mid = (n - 1) / 2;

      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      // Anchor the arc to the visible part of the grid
      let ay =
        (Math.max(box.top, 0) + Math.min(box.bottom, window.innerHeight)) / 2;
      const R = box.width * 0.9;
      const thetaMax = Math.abs(mid * STEP_DEG) * (Math.PI / 180);
      const sag = (R * (1 - Math.cos(thetaMax))) / 2;

      // Push the arc down if it would slide under the navbar
      const tallest = Math.max(...cards.map((c) => c.offsetHeight)) * scale;
      ay = Math.max(ay, HEADER_OFFSET + sag + tallest / 2 + 24);

      // Natural (grid) center of each card
      const base = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });

      // Pose of card i on the arc, given extra rotation "shift" in degrees
      const arcPose = (i, shift) => {
        const deg = (i - mid) * STEP_DEG + shift;
        const rad = (deg * Math.PI) / 180;
        return {
          dx: cx + R * Math.sin(rad) - base[i].x,
          dy: ay + R * (1 - Math.cos(rad)) - sag - base[i].y,
          rot: deg,
          s: scale,
        };
      };

      const settleStart = SWEEP_MS + HOLD_MS;
      const total = settleStart + (n - 1) * STAGGER_MS + SETTLE_MS;

      cards.forEach((c, i) => {
        c.style.zIndex = String(100 - Math.round(Math.abs(i - mid) * 10));
        c.style.pointerEvents = 'none';
      });

      const t0 = performance.now();

      const frame = (now) => {
        const t = now - t0;

        cards.forEach((c, i) => {
          let pose;
          let opacity = 1;

          if (t < settleStart) {
            // Phase 1: sweep along the arc, decelerating smoothly
            const p = clamp01(t / SWEEP_MS);
            pose = arcPose(i, START_SHIFT * (1 - easeOutCubic(p)));
            opacity = clamp01(p * 2.2);
          } else {
            // Phase 2: arc -> normal grid position (staggered)
            const p = clamp01((t - settleStart - i * STAGGER_MS) / SETTLE_MS);
            const e = easeInOutCubic(p);
            const a = arcPose(i, 0);
            pose = {
              dx: a.dx * (1 - e),
              dy: a.dy * (1 - e),
              rot: a.rot * (1 - e),
              s: a.s + (1 - a.s) * e,
            };
          }

          c.style.opacity = String(opacity);
          c.style.transform = `translate3d(${pose.dx}px, ${pose.dy}px, 0) rotate(${pose.rot}deg) scale(${pose.s})`;
        });

        if (t < total) {
          raf = requestAnimationFrame(frame);
        } else {
          reset(); // restores hover effects, z-index, etc.
          if (onDone) onDone(); // animation finished
        }
      };

      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          io.disconnect();
          run();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, count]);
};

const SpecialOfferCard = ({ offer }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-8 sm:p-12 transition-all duration-300"
    >
      {/* Dynamic Cursor Spotlight Glow within the card */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(220px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(253, 230, 138, 0.25) 0%, transparent 70%),
            radial-gradient(480px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.15) 35%, transparent 75%)
          `,
        }}
      />

      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">
          <BadgePercent className="w-4 h-4" /> Limited Seasonal Privilege
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
          {offer.title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {offer.description} Use coupon code <strong className="text-amber-400 font-mono tracking-wider">{offer.couponCode || 'WELCOME10'}</strong> during checkout.
        </p>
        <Link
          to="/booking"
          className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          Claim This Offer <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

/* Amenity cards (kept as data so the markup lives in one place).
   Class names are written out in full so Tailwind can detect them. */
const AMENITIES = [
  {
    Icon: Waves,
    iconHover: 'group-hover:-rotate-12',
    title: 'Heated Infinity Pool',
    text: 'Temperature-controlled glass infinity pool suspended over whispering valleys with automated mood illumination for sunset swims.',
  },
  {
    Icon: Coffee,
    iconHover: 'group-hover:rotate-12',
    title: 'Private Executive Chef',
    text: 'Tailored 5-course gourmet dining, coastal barbecues, and wood-fired oven delights prepared live by our private culinary masters.',
  },
  {
    Icon: Flame,
    iconHover: 'group-hover:-rotate-12',
    title: 'Sunset Firepit & Lawn',
    text: 'Expansive manicured lawns, natural stone bonfires, and stargazing telescopes under unobstructed night skies.',
  },
  {
    Icon: Tv,
    iconHover: 'group-hover:rotate-12',
    title: 'Dolby Atmos Cinema',
    text: '120-inch 4K laser projector and reclining velvet theater seats for intimate movie nights and sporting screenings.',
  },
  {
    Icon: Compass,
    iconHover: 'group-hover:-rotate-12',
    title: '24/7 Butler & Concierge',
    text: 'Discrete and personalized service attending to luggage, local trekking excursions, champagne service, and itinerary planning.',
  },
  {
    Icon: ShieldCheck,
    iconHover: 'group-hover:rotate-12',
    title: 'Absolute Seclusion',
    text: 'Private gated hill crest estate with biometric security, backup power generation, and total protection of your privacy.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [villas, setVillas] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Fan reveal for the Featured Residences cards
  const villaGridRef = useRef(null);
  const [revealDone, setRevealDone] = useState(false);
  useFanReveal(villaGridRef, villas.length, () => setRevealDone(true));
  // Heading stays hidden until the card animation is finished
  // (also shown if there are no villas to animate)
  const showHeading = revealDone || (!loading && villas.length === 0);

  // Auto-advance hero background image every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Availability search state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
  const [guests, setGuests] = useState('2');
  const [selectedVilla, setSelectedVilla] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [villasRes, webDataRes, locsRes] = await Promise.all([
          api.get('/villas'),
          api.get('/website/public-data'),
          api.get('/villas/locations/all').catch(() => ({ data: { success: false } }))
        ]);

        if (locsRes.data?.success) {
          setLocations(locsRes.data.locations);
        }
        if (villasRes.data.success) {
          setVillas(villasRes.data.villas);
          if (villasRes.data.villas.length > 0) {
            setSelectedVilla(villasRes.data.villas[0]._id);
          }
        }
        if (webDataRes.data.success) {
          setBanners(webDataRes.data.banners || []);
          setTestimonials(webDataRes.data.testimonials || []);
          setSpecialOffers(webDataRes.data.specialOffers || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    setAvailabilityMessage(null);
    try {
      const res = await api.post('/reservations/check-availability', {
        villaId: selectedVilla,
        checkIn,
        checkOut
      });

      if (res.data.isAvailable) {
        setAvailabilityMessage({ type: 'success', text: 'Estate is available for selected dates! Proceeding to reservation...' });
        setTimeout(() => {
          navigate(`/booking?villaId=${selectedVilla}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
        }, 1000);
      } else {
        setAvailabilityMessage({ type: 'error', text: 'Villa is already reserved or blocked for these dates. Please select other dates.' });
      }
    } catch (err) {
      setAvailabilityMessage({ type: 'error', text: err.response?.data?.message || 'Error checking availability' });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Banner Section (visible on load, so no scroll fade) */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background luxury photo slideshow with gradient overlay */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              alt={`Moon Light Villa Exterior ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                currentHeroIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16 pb-28">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-[0.25em] font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Lonavala's Premier Private Sanctuary
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-100 leading-[1.1] mb-6">
            Where Timeless Elegance <br />
            <span className="gold-gradient-text">Meets Serene Horizons</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-10">
            An exclusive hilltop retreat featuring a heated infinity glass pool, 5 lavish master suites, bespoke culinary concierge, and panoramic mist-covered valley vistas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="w-full sm:w-auto gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl shadow-amber-950/60 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Reserve The Estate <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/villas"
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-xs uppercase tracking-wider px-8 py-4 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              View Villa Suites
            </Link>
          </div>
        </div>

        {/* Ambient Bottom Fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* Floating Availability & Booking Search Bar */}
      <FadeIn as="section" className="max-w-6xl mx-auto px-4 sm:px-6 -mt-24 relative z-20">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-amber-500/20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Check Real-time Estate Availability & Pricing
            </h2>
            <span className="text-[11px] text-slate-400">Best Rate Guarantee • Instant Confirmation</span>
          </div>

          <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Destination / Location Picker */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Destination
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  const locId = e.target.value;
                  setSelectedLocation(locId);
                  if (locId !== 'all') {
                    const filtered = villas.filter(v => (v.propertyLocation?._id || v.propertyLocation) === locId);
                    if (filtered.length > 0) setSelectedVilla(filtered[0]._id);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">All Destinations (3)</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Villa Picker */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Accommodation
              </label>
              <select
                value={selectedVilla}
                onChange={(e) => setSelectedVilla(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {villas
                  .filter(v => selectedLocation === 'all' || (v.propertyLocation?._id || v.propertyLocation) === selectedLocation)
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Check-In Date */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Check-In Date
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Check-Out Date
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="2">2 Guests (Couple)</option>
                <option value="4">4 Guests</option>
                <option value="6">6 Guests</option>
                <option value="10">10 Guests</option>
                <option value="16">16 Guests (Full Villa)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isChecking}
                className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {isChecking ? 'Checking...' : 'Check Dates'}
              </button>
            </div>
          </form>

          {/* Feedback message */}
          {availabilityMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                availabilityMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/80 border border-red-500/40 text-red-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{availabilityMessage.text}</span>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Featured Villas & Estate Showcase (uses the fan reveal, not FadeIn) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center max-w-2xl mx-auto mb-14 transition-opacity duration-1000 ease-out ${
            showHeading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
            Private Sanctuaries
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100">
            Featured Residences
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4" />
        </div>

        {/* ref drives the fan reveal animation; direct children are the cards */}
        <div ref={villaGridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {villas.map((villa) => (
            <div
              key={villa._id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col group"
            >
              {/* Image Carousel / Photo */}
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={villa.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'}
                  alt={villa.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  {villa.specs.bedrooms} Bedrooms • Up to {villa.specs.maxGuests} Guests
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400">From </span>
                  <span className="text-amber-400 font-bold text-sm">₹{villa.pricing.basePricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400"> / night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                    {villa.name}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium tracking-wider uppercase mb-3">
                    {villa.tagline}
                  </p>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-6">
                    {villa.shortDescription || villa.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 mb-6">
                    {villa.amenities?.slice(0, 4).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <Link
                    to={`/villas/${villa.slug}`}
                    className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    Explore Residence <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/booking?villaId=${villa._id}`}
                    className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md hover:shadow-amber-500/30 transition-all"
                  >
                    Reserve Dates
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Experiences & Amenities */}
      <FadeIn as="section" className="bg-slate-900/60 border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
              Curated Indulgence
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              World-Class Estate Amenities
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Crafted for absolute privacy, bespoke relaxation, and unforgettable celebratory stays.
            </p>
          </div>

          {/* Each card is wrapped in FadeIn (outer) so the inner card keeps its own hover lift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {AMENITIES.map(({ Icon, iconHover, title, text }, i) => (
              <FadeIn key={title} delay={(i % 3) * 120} className="h-full">
                <div className="group h-full bg-slate-950/70 border border-slate-800 p-8 rounded-xl hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-950/40 transition-all duration-300 ease-out cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:border-amber-500/60 group-hover:bg-amber-500/20 transition-colors duration-300">
                    <Icon className={`w-6 h-6 transition-transform duration-300 ease-out ${iconHover} group-hover:scale-110`} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Special Privileges / Offers */}
      {specialOffers.length > 0 && (
        <FadeIn as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpecialOfferCard offer={specialOffers[0]} />
        </FadeIn>
      )}

      {/* Guest Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
            Verified Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Words From Our Esteemed Guests
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4" />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <FadeIn key={idx} delay={(idx % 3) * 150} className="h-full">
              <div className="h-full bg-slate-900/70 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                    "{t.reviewText}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'}
                    alt={t.guestName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{t.guestName}</h4>
                    <p className="text-[10px] text-slate-400">{t.location} • {t.stayDate}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <FadeIn as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 p-10 sm:p-16 text-center">
          <div className="absolute inset-0 z-0">
            <video
              src={ctaVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/65" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100 mb-4">
              Your Private Hilltop Escape Awaits
            </h2>
            <p className="text-sm text-slate-300 font-light mb-8 leading-relaxed">
              Experience the pinnacle of hospitality. Reserve directly online or connect with our concierge for bespoke celebration packages.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/booking"
                className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl"
              >
                Reserve Your Stay Online
              </Link>
              <a
                href="tel:+919820012345"
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs uppercase tracking-wider px-8 py-4 rounded-full hover:border-amber-400 transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" /> Speak With Concierge
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default HomePage;
