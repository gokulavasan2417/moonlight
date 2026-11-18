import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Menu, 
  X, 
  Moon, 
  Instagram, 
  Facebook, 
  Youtube, 
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const location = useLocation();
  const currentOutlet = useOutlet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/website/public-data');
        if (res.data.success) {
          setWebsiteSettings(res.data.settings);
        }
      } catch (err) {
        console.warn('Could not load website settings:', err.message);
      }
    };
    fetchSettings();
  }, []);

  // Close mobile menu on page change (scroll to top is handled during curtain wipe via onExitComplete)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Villas & Suites', path: '/villas' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reservation', path: '/booking' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 text-[11px] sm:text-xs text-slate-400 py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2">
          <div className="flex items-center text-center sm:text-left">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Direct Booking Privilege: Guaranteed Best Rates & Flexible Check-in
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <a href="tel:+919820012345" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-amber-400 shrink-0" /> +91 98200 12345
            </a>
            <span className="text-slate-700">|</span>
            <Link to="/erp/login" className="hover:text-amber-300 transition-colors flex items-center gap-1">
              ERP Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-amber-900/20 py-2.5 sm:py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-slate-950/90 to-transparent py-3 sm:py-4 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-500/20 transition-all duration-300 shrink-0">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400/20 text-amber-400" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-widest text-slate-100 group-hover:text-amber-300 transition-colors block leading-tight">
                MOON LIGHT
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-amber-400 font-semibold block">
                Villa & Estate
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm tracking-wide transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-amber-400 font-medium'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/booking"
              className="gold-button-gradient text-slate-950 font-semibold text-xs uppercase tracking-wider px-5 sm:px-6 py-2.5 rounded-full shadow-lg shadow-amber-900/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" /> Reserve Villa
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-amber-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/98 border-b border-amber-900/30 px-5 sm:px-6 py-5 sm:py-6 space-y-3 sm:space-y-4 backdrop-blur-xl animate-fadeIn max-h-[calc(100vh-80px)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-200 hover:text-amber-400 py-2 border-b border-slate-800 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center gold-button-gradient text-slate-950 font-semibold text-xs sm:text-sm uppercase tracking-wider py-3 rounded-lg block mt-4 shadow-lg shadow-amber-900/40"
            >
              Reserve Villa Online
            </Link>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <PageTransition key={location.pathname}>
            {currentOutlet}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Luxury Hospitality Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Brand Ethos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Moon className="w-4 h-4 fill-amber-400/20 text-amber-400" />
                </div>
                <span className="font-serif text-xl font-bold tracking-widest text-slate-100">
                  MOON LIGHT VILLA
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                An architectural sanctuary nestled along the mist-draped ridgeline of Lonavala. Private heated infinity pool, five-star private culinary concierge, and uncompromised serenity.
              </p>
              <div className="flex items-center gap-3 text-slate-400 pt-2">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-serif text-base font-semibold text-slate-200 tracking-wider uppercase mb-4">
                Explore The Estate
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/villas" className="hover:text-amber-400 transition-colors">Villas & Penthouse Suites</Link></li>
                <li><Link to="/about" className="hover:text-amber-400 transition-colors">Private Chef & Dining</Link></li>
                <li><Link to="/gallery" className="hover:text-amber-400 transition-colors">Visual Tour & Gallery</Link></li>
                <li><Link to="/booking" className="hover:text-amber-400 transition-colors">Check Live Availability</Link></li>
                <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Concierge & Enquiries</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div>
              <h3 className="font-serif text-base font-semibold text-slate-200 tracking-wider uppercase mb-4">
                Private Concierge
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Plot 42, Moon Light Valley, Whispering Pines Hill, Old Khandala Road, Lonavala, MH 410401</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="tel:+919820012345" className="hover:text-amber-300">+91 98200 12345</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href="mailto:reservations@moonlightvilla.com" className="hover:text-amber-300">reservations@moonlightvilla.com</a>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-amber-400/90">
                  <ShieldCheck className="w-4 h-4 shrink-0" /> Certified Safe Hospitality Estate
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Privileges */}
            <div>
              <h3 className="font-serif text-base font-semibold text-slate-200 tracking-wider uppercase mb-4">
                VIP Private Privileges
              </h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Receive confidential private invitations, seasonal holiday packages, and preferential booking privileges.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Moon Light Villa Privileges.'); }} className="space-y-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email address"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full gold-button-gradient text-slate-950 font-semibold text-xs uppercase tracking-wider py-2 rounded-lg"
                >
                  Join VIP Club
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="border-t border-slate-800/80 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} MOON LIGHT VILLA & ESTATE. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Stay</Link>
              <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link to="/erp/login" className="hover:text-amber-400 transition-colors">Admin ERP Login</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Concierge Button */}
      <a
        href="https://wa.me/919820012345?text=Hello%20Moon%20Light%20Villa%20Concierge,%20I%20would%20like%20to%20inquire%20about%20villa%20availability."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3 sm:p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold px-0 group-hover:px-2">
          Concierge WhatsApp
        </span>
      </a>
    </div>
  );
};

export default PublicLayout;
