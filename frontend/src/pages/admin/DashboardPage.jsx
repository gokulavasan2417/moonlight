import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Users2,
  Home,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { MapPin, Building, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { downloadExcelReport } from '../../utils/exportToExcel';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport('reservations');
    } catch (err) {
      alert(err.message || 'Failed to export Excel report');
    } finally {
      setExporting(false);
    }
  };

  const fetchDashboardStats = async (locId = selectedLocation) => {
    try {
      setLoading(true);
      const url = locId && locId !== 'all' ? `/dashboard/stats?locationId=${locId}` : '/dashboard/stats';
      const [statsRes, locsRes] = await Promise.all([
        api.get(url),
        api.get('/villas/locations/all').catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data);
      }
      if (locsRes.data?.success) {
        setLocations(locsRes.data.locations);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedLocation);
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-amber-400 text-xs">Loading live ERP analytics...</p>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const monthlyRevenue = stats?.monthlyRevenue || [];
  const sourceBreakdown = stats?.sourceBreakdown || [];
  const recentReservations = stats?.recentReservations || [];

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7'];

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 max-w-full">
      {/* Header with Title & Quick Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Executive Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            ERP Command Center & KPIs
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Location Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs max-w-full">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-none truncate"
            >
              <option value="all" className="bg-slate-900">All Locations (120 Rooms)</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id} className="bg-slate-900">
                  {loc.name} ({loc.totalRooms} Rooms)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto cursor-pointer disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Export All Bookings (Excel)</span>
              </>
            )}
          </button>
          <Link
            to="/erp/reservations"
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md w-full sm:w-auto text-center"
          >
            + New Reservation
          </Link>
        </div>
      </div>

      {/* Row 1: Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-0">
        {/* Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-serif font-bold text-slate-100">
              ₹{(kpis.totalRevenue || 0).toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> Real-time payment ledger
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-serif font-bold text-emerald-400">
              ₹{(kpis.netProfit || 0).toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              After ₹{(kpis.totalExpenses || 0).toLocaleString('en-IN')} operating expenses
            </p>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confirmed Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-serif font-bold text-slate-100">
              {kpis.confirmedBookings || 0}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              {kpis.todayBookings || 0} booked today • {kpis.pendingBookings || 0} pending
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-serif font-bold text-amber-400">
              ₹{(kpis.pendingPayments || 0).toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Outstanding balances due at check-in
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Operational KPIs (120-Room Inventory Focus) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Inventory</span>
          <strong className="text-base text-slate-100 block mt-1">{kpis.totalRooms || 120} Rooms</strong>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl">
          <span className="text-emerald-400 block text-[10px] uppercase font-semibold">Available (Clean)</span>
          <strong className="text-base text-emerald-200 block mt-1">{kpis.availableRooms || 0} Rooms</strong>
        </div>

        <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl">
          <span className="text-rose-400 block text-[10px] uppercase font-semibold">Occupied Rooms</span>
          <strong className="text-base text-rose-200 block mt-1">{kpis.occupiedRooms || 0} Rooms</strong>
        </div>

        <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl">
          <span className="text-amber-400 block text-[10px] uppercase font-semibold">Cleaning (Housekeeping)</span>
          <strong className="text-base text-amber-200 block mt-1">{kpis.cleaningRooms || 0} Rooms</strong>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-xl">
          <span className="text-purple-400 block text-[10px] uppercase font-semibold">Maintenance Block</span>
          <strong className="text-base text-purple-200 block mt-1">{kpis.maintenanceRooms || 0} Rooms</strong>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Occupancy Rate</span>
          <strong className="text-base text-amber-400 block mt-1">{kpis.occupancyRate || 0}%</strong>
        </div>
      </div>

      {/* Row 3: Interactive Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Expenses Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Monthly Revenue & Expense Performance</h2>
              <p className="text-[11px] text-slate-400">Comparative financial inflow vs operations</p>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">Last 6 Months</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`]}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Sources Pie Chart (1 Col) */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Reservation Channels</h2>
            <p className="text-[11px] text-slate-400">Distribution by booking origin</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val) => [`${val}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-2 border-t border-slate-800">
            {sourceBreakdown.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Bookings Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Recent Online & Direct Reservations</h2>
            <p className="text-[11px] text-slate-400">Latest reservations recorded in MongoDB</p>
          </div>
          <Link to="/erp/reservations" className="text-xs text-amber-400 hover:underline">
            View All Reservations →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Villa</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    No reservations recorded yet.
                  </td>
                </tr>
              ) : (
                recentReservations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {r.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {r.guestDetails?.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.villa?.name || 'Moon Light Villa'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(r.checkIn).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      ₹{r.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
