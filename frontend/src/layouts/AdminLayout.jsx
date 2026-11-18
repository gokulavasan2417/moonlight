import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  CalendarCheck,
  Home,
  Users2,
  UserCheck,
  Receipt,
  Truck,
  Send,
  CreditCard,
  ShieldAlert,
  BarChart3,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Moon,
  Plus,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!user) {
      navigate('/erp/login');
    }
  }, [user, navigate]);

  // Fetch locations and notifications
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [locRes] = await Promise.all([
          api.get('/villas/locations/all').catch(() => ({ data: { success: false } })),
        ]);
        if (locRes.data?.success) {
          setLocations(locRes.data.locations);
        }
        setNotifications([
          { id: 1, title: 'New Booking Confirmed', message: 'Vikram Oberoi confirmed MLV-2026-X89K2', time: '10m ago' },
          { id: 2, title: '120 Rooms Operational', message: 'Inventory synced across 3 luxury resort locations', time: 'Just now' }
        ]);
      } catch (err) {
        console.warn('Initial layout fetch error:', err.message);
      }
    };
    if (user) fetchInitData();
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/erp/dashboard', icon: LayoutDashboard },
    { name: 'Website CMS', path: '/erp/website', icon: Globe },
    { name: 'Reservations', path: '/erp/reservations', icon: CalendarCheck },
    { name: 'Villas & Rooms', path: '/erp/villas', icon: Home },
    { name: 'CRM & Leads', path: '/erp/crm', icon: Users2 },
    { name: 'Customers', path: '/erp/customers', icon: UserCheck },
    { name: 'Billing & Invoices', path: '/erp/billing', icon: Receipt },
    { name: 'Vendors', path: '/erp/vendors', icon: Truck },
    { name: 'Payouts', path: '/erp/payouts', icon: Send },
    { name: 'Expenses', path: '/erp/expenses', icon: CreditCard },
    { name: 'Staff & Roles', path: '/erp/staff', icon: ShieldAlert },
    { name: 'Reports & Analytics', path: '/erp/reports', icon: BarChart3 },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* ERP Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 z-30 fixed top-0 bottom-0 left-0`}
      >
        {/* Brand Logo & Minimize */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/erp/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Moon className="w-4 h-4 fill-amber-400/20 text-amber-400" />
            </div>
            {sidebarOpen && (
              <div className="whitespace-nowrap">
                <span className="font-serif text-sm font-bold tracking-wider text-slate-100 block">
                  MOON LIGHT
                </span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold block">
                  ERP Platform
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <span className="inline-block text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded font-medium">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/erp/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/home"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
            title="Open Live Public Website"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>View Public Site</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full flex flex-col z-10 p-4 border-r border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-serif text-lg font-bold text-amber-400">MOON LIGHT ERP</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg mt-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main ERP Layout Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 w-full max-w-full transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Top ERP Header Bar */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-300 hover:text-amber-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                MOON LIGHT VILLA MANAGEMENT SYSTEM
              </h1>
              <p className="text-[10px] text-slate-400">Integrated PMS, CRM & Financial ERP Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-Location Property Switcher */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">📍 All Properties (120 Rooms)</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id} className="bg-slate-900">
                    {loc.name} ({loc.totalRooms} Rooms)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick action: New Reservation */}
            <Link
              to="/erp/reservations"
              className="hidden sm:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3.5 py-1.5 rounded-md shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Booking
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-200">System Notifications</span>
                    <span className="text-[10px] text-amber-400">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-800/60 mt-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5">
                        <p className="font-medium text-slate-200">{n.title}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Public Link */}
            <Link
              to="/home"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Website
            </Link>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 w-full max-w-full p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
