import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Printer,
  Download,
  Phone,
  ArrowRight,
  ShieldCheck,
  Moon,
  Loader2
} from 'lucide-react';
import api from '../../services/api';

const BookingConfirmationPage = () => {
  const { reference } = useParams();
  const [reservation, setReservation] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice?._id) return;
    try {
      setDownloadingPdf(true);
      const res = await api.get(`/invoices/${invoice._id}/download-pdf?ref=${reference}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = invoice.invoiceNumber ? `${invoice.invoiceNumber}.pdf` : `invoice-${invoice._id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
      alert('Failed to download invoice PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await api.get(`/reservations/${reference}`);
        if (res.data.success) {
          setReservation(res.data.reservation);
          setInvoice(res.data.invoice);
        }
      } catch (err) {
        console.error('Failed to load reservation confirmation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [reference]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-amber-400 text-sm">Retrieving your confirmed reservation voucher...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-serif text-slate-100">Reservation Reference Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          We could not locate reference #{reference}. Please verify the code or contact our concierge.
        </p>
        <Link to="/home" className="text-amber-400 text-xs mt-4 inline-block hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Success Banner */}
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold block">
          Booking Confirmed & Guaranteed
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-100">
          We Look Forward To Welcoming You
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Your reservation voucher and confirmation details have been recorded.
        </p>
      </div>

      {/* Luxury Printable Voucher Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl printable-area">
        {/* Voucher Header */}
        <div className="bg-slate-950 p-4 sm:p-6 md:p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Moon className="w-5 h-5 fill-amber-400/20 text-amber-400" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-slate-100 block">
                MOON LIGHT VILLA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-medium block">
                Official Reservation Voucher
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
              Booking Reference
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-amber-400 tracking-wider">
              {reservation.bookingReference}
            </span>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Key Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 bg-slate-950/60 border border-slate-800 p-4 sm:p-6 rounded-2xl text-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Check-In</span>
              <strong className="text-sm sm:text-base font-serif text-slate-100 block">
                {new Date(reservation.checkIn).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
              <span className="text-[10px] text-amber-400">2:00 PM Check-In</span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Check-Out</span>
              <strong className="text-sm sm:text-base font-serif text-slate-100 block">
                {new Date(reservation.checkOut).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
              <span className="text-[10px] text-amber-400">11:00 AM Check-Out</span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Duration & Guests</span>
              <strong className="text-sm sm:text-base font-serif text-slate-100 block">
                {reservation.totalNights} {reservation.totalNights === 1 ? 'Night' : 'Nights'}
              </strong>
              <span className="text-[10px] text-slate-400">
                {reservation.guests?.adults} Adults, {reservation.guests?.children || 0} Children
              </span>
            </div>
          </div>

          {/* Accommodation & Guest Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                Accommodation Details
              </h3>
              <div className="space-y-2 text-slate-300">
                <p><strong>Residence:</strong> {reservation.villa?.name || 'Moon Light Villa Estate'}</p>
                <p><strong>Booking Type:</strong> {reservation.bookingType}</p>
                <p><strong>Booking Source:</strong> {reservation.bookingSource}</p>
                <p><strong>Status:</strong> <span className="text-emerald-400 font-semibold uppercase">{reservation.status}</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                Primary Guest Information
              </h3>
              <div className="space-y-2 text-slate-300">
                <p><strong>Guest Name:</strong> {reservation.guestDetails?.fullName}</p>
                <p><strong>Email:</strong> {reservation.guestDetails?.email}</p>
                <p><strong>Phone:</strong> {reservation.guestDetails?.phone}</p>
                {reservation.guestDetails?.specialRequests && (
                  <p><strong>Special Requests:</strong> {reservation.guestDetails.specialRequests}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3 text-xs">
            <h3 className="font-semibold text-slate-200 text-sm mb-3">
              Payment & Settlement Status
            </h3>
            <div className="flex justify-between text-slate-300">
              <span>Total Tariff (Inclusive of GST & Deposit):</span>
              <strong className="text-slate-100">₹{reservation.pricing?.totalAmount?.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Advance Paid (Razorpay Online):</span>
              <span>₹{reservation.pricing?.advancePaid?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-amber-400 font-bold border-t border-slate-800 pt-2">
              <span>Balance Due at Check-In:</span>
              <span>₹{reservation.pricing?.balanceDue?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Voucher Footer & Actions */}
        <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Govt. Photo ID required at check-in for all adult guests.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2.5 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Voucher
            </button>
            {invoice?._id && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex-1 sm:flex-none gold-button-gradient text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-opacity"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Tax Invoice PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helpful links */}
      <div className="text-center pt-4">
        <Link to="/home" className="text-amber-400 text-xs hover:underline inline-flex items-center gap-1">
          Return to Home Page <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
