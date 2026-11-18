import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Phone,
  Lock
} from 'lucide-react';
import api from '../../services/api';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const initialVillaId = searchParams.get('villaId') || '';
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = searchParams.get('guests') || '2';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [villas, setVillas] = useState([]);
  const [selectedVillaId, setSelectedVillaId] = useState(initialVillaId);
  const [checkIn, setCheckIn] = useState(initialCheckIn || tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(initialCheckOut || dayAfter.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(parseInt(initialGuests, 10) || 2);
  const [children, setChildren] = useState(0);
  const [bookingType, setBookingType] = useState('Full Villa');

  // Guest details form state
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    idProofType: 'Aadhaar',
    specialRequests: ''
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Pricing & Availability state
  const [pricing, setPricing] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch villas
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await api.get('/villas');
        if (res.data.success && res.data.villas.length > 0) {
          setVillas(res.data.villas);
          if (!selectedVillaId) {
            setSelectedVillaId(res.data.villas[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching villas:', err);
      }
    };
    fetchVillas();
  }, []);

  // Recalculate price whenever dates, villa, or coupon change
  useEffect(() => {
    if (!selectedVillaId || !checkIn || !checkOut) return;

    const calcPrice = async () => {
      setIsCalculating(true);
      setErrorMessage('');
      try {
        const res = await api.post('/reservations/calculate-price', {
          villaId: selectedVillaId,
          checkIn,
          checkOut,
          adults,
          children,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        });

        if (res.data.success) {
          setPricing(res.data.pricing);
        }
      } catch (err) {
        console.error('Price calculation failed:', err);
        setErrorMessage(err.response?.data?.message || 'Error calculating price');
      } finally {
        setIsCalculating(false);
      }
    };

    calcPrice();
  }, [selectedVillaId, checkIn, checkOut, adults, children, appliedCoupon]);

  // Handle coupon validation
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;

    try {
      const res = await api.post('/reservations/validate-coupon', {
        code: couponCode,
        bookingAmount: pricing?.roomCharges || 50000
      });
      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Submit Reservation & Process Payment
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create online checkout reservation & Razorpay / Sandbox order
      const res = await api.post('/reservations/online-checkout', {
        villaId: selectedVillaId,
        checkIn,
        checkOut,
        bookingType,
        guests: { adults: Number(adults), children: Number(children) },
        guestDetails,
        couponCode: appliedCoupon?.code
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Booking initiation failed');
      }

      const { reservationId, bookingReference, order } = res.data;

      // 2. Mock payment confirmation or Razorpay Handler
      // If mock payment sandbox order:
      const verifyRes = await api.post('/reservations/verify-payment', {
        reservationId,
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: `sig_mock_${Date.now()}`
      });

      if (verifyRes.data.success) {
        navigate(`/booking-confirmation/${bookingReference}`);
      } else {
        throw new Error(verifyRes.data.message || 'Payment confirmation failed');
      }
    } catch (err) {
      console.error('Reservation submission error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to complete reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVilla = villas.find((v) => v._id === selectedVillaId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 overflow-x-hidden">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2">
          Direct Luxury Reservation
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100">
          Reserve Moon Light Villa
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 px-2">
          Best Rate Guarantee • Instant Booking Voucher • Secure SSL Transaction
        </p>
      </div>

      {/* Main Reservation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Left 2 Columns: Dates, Accommodations & Guest Form */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Step 1: Accommodation & Dates Selection */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6">
            <h2 className="text-xs sm:text-sm uppercase tracking-widest font-bold text-amber-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" /> 1. Select Accommodation & Stay Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Villa Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Villa / Residence
                </label>
                <select
                  value={selectedVillaId}
                  onChange={(e) => setSelectedVillaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {villas.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.specs.bedrooms} Bedrooms • Up to {v.specs.maxGuests} Guests)
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Check-In Date (2:00 PM)
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Check-Out */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Check-Out Date (11:00 AM)
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Adults */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adult Guests
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {[...Array(selectedVilla?.specs?.maxGuests || 16)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Children */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Children (Below 12 yrs)
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Guest Information Form */}
          <form id="booking-form" onSubmit={handleSubmitBooking} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6">
            <h2 className="text-xs sm:text-sm uppercase tracking-widest font-bold text-amber-400 flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" /> 2. Primary Guest Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name (As per Govt. ID) *
                </label>
                <input
                  type="text"
                  required
                  value={guestDetails.fullName}
                  onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })}
                  placeholder="e.g. Vikram Singhania"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (For Voucher & Invoice) *
                </label>
                <input
                  type="email"
                  required
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                  placeholder="+91 98200 00000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  City of Residence
                </label>
                <input
                  type="text"
                  value={guestDetails.city}
                  onChange={(e) => setGuestDetails({ ...guestDetails, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Special Requests / Dietary Preferences (Optional)
                </label>
                <textarea
                  rows="2"
                  value={guestDetails.specialRequests}
                  onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                  placeholder="e.g. Jain or Vegan meal preferences, anniversary surprise setup, early check-in request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Summary, Coupon & Advance Payment */}
        <div>
          <div className="lg:sticky lg:top-28 space-y-6">
            {/* Price Breakdown Card */}
            <div className="glass-panel p-5 sm:p-8 rounded-2xl shadow-2xl border border-amber-500/20 space-y-5 sm:space-y-6">
              <h3 className="font-serif text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                Tariff Summary
              </h3>

              {isCalculating ? (
                <div className="py-6 text-center text-xs text-amber-400">
                  Calculating real-time rates...
                </div>
              ) : pricing ? (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Accommodation ({pricing.totalNights} {pricing.totalNights === 1 ? 'Night' : 'Nights'}):</span>
                    <span className="font-semibold text-slate-100">₹{pricing.roomCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Cleaning & Sanitation:</span>
                    <span>₹{pricing.cleaningFee.toLocaleString('en-IN')}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Coupon Discount ({pricing.couponCode}):</span>
                      <span>- ₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>GST ({pricing.gstPercentage}%):</span>
                    <span>₹{pricing.gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Refundable Security Deposit:</span>
                    <span>₹{pricing.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-bold text-slate-100">
                    <span>Grand Total:</span>
                    <span className="text-amber-400 font-serif text-base">₹{pricing.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Advance vs Balance */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5 mt-3">
                    <div className="flex justify-between text-xs font-bold text-amber-400">
                      <span>Advance Payable Now (50%):</span>
                      <span>₹{pricing.advanceRequired.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Balance Due at Check-In:</span>
                      <span>₹{pricing.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Coupon Code Input */}
              <div className="border-t border-slate-800 pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400 mt-1">{couponError}</p>}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                form="booking-form"
                disabled={isSubmitting || !pricing}
                className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                {isSubmitting ? 'Confirming Reservation...' : `Pay Advance ₹${pricing?.advanceRequired?.toLocaleString('en-IN') || ''} & Confirm`}
              </button>

              <div className="text-[10px] text-slate-400 text-center space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  256-bit Encrypted Razorpay Sandbox & SSL Guarantee
                </p>
                <p>No double-booking policy. Real-time calendar inventory update.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
