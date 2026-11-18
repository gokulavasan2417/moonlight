import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    estimatedBudget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/crm/leads', {
        ...formData,
        source: 'Website Direct'
      });
      if (res.data.success) {
        setIsSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          city: '',
          estimatedBudget: '',
          message: ''
        });
      }
    } catch (err) {
      console.error('Failed to submit contact enquiry:', err);
      setErrorMessage(err.response?.data?.message || 'Could not send enquiry. Please try again or call concierge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-16 overflow-x-hidden">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-2 sm:mb-3">
          Concierge & Guest Relations
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-slate-100 mb-3 sm:mb-4">
          Connect With Moon Light Villa
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-400 font-light leading-relaxed px-2">
          Our dedicated hospitality desk is available 24/7 to assist with estate bookings, corporate retreats, celebratory packages, and bespoke culinary requests.
        </p>
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4 sm:mt-6" />
      </div>

      {/* Grid: Details on Left, Form on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Details */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">Estate Address & Directions</h2>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block mb-0.5">Physical Location:</strong>
                    <span>Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road, Lonavala, Maharashtra 410401</span>
                    <span className="text-slate-400 text-[11px] block mt-1">(Approx. 90 minutes scenic drive from Mumbai & 65 minutes from Pune)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-slate-100 block mb-0.5">Direct Tele-Reservations:</strong>
                    <a href="tel:+919820012345" className="hover:text-amber-400">+91 98200 12345</a> / <a href="tel:+919820012346" className="hover:text-amber-400">+91 98200 12346</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-slate-100 block mb-0.5">Official Guest Email:</strong>
                    <a href="mailto:reservations@moonlightvilla.com" className="hover:text-amber-400">reservations@moonlightvilla.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-slate-100 block mb-0.5">Concierge Operating Hours:</strong>
                    <span>24 Hours / 7 Days a week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Card */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-emerald-400 text-sm">Need Instant Assistance?</h3>
                <p className="text-xs text-slate-300 mt-0.5">Connect immediately with our duty manager on WhatsApp.</p>
              </div>
              <a
                href="https://wa.me/919820012345?text=Hello%20Moon%20Light%20Villa%20Concierge"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" /> Chat Now
              </a>
            </div>
          </div>

          {/* Contact & Enquiry Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mb-2">Send Private Stay Enquiry</h2>
            <p className="text-xs text-slate-400 mb-5 sm:mb-6">
              Our reservation team responds within 60 minutes with personalized tariff sheets and availability.
            </p>

            {isSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-slate-100 text-sm">Thank You for Your Enquiry</h3>
                <p className="text-xs text-slate-300">
                  Your enquiry has been assigned to our senior guest relations executive. You will receive a bespoke quotation and call shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-3 text-xs text-amber-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Vikram Singhania"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98200 00000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai, Pune"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Budget (Optional)</label>
                    <input
                      type="number"
                      value={formData.estimatedBudget}
                      onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                      placeholder="₹ Budget in INR"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enquiry Details / Dates *</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Specify proposed dates, guest count, celebration requirements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Transmitting Enquiry...' : 'Submit Enquiry to Concierge'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
