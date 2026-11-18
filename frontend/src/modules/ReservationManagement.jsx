import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  UserCheck,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { downloadExcelReport } from '../utils/exportToExcel';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResv, setSelectedResv] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Manual creation form
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [manualForm, setManualForm] = useState({
    villaId: '',
    checkIn: tomorrow.toISOString().split('T')[0],
    checkOut: dayAfter.toISOString().split('T')[0],
    fullName: '',
    email: '',
    phone: '',
    adults: 2,
    children: 0,
    roomCharges: 45000,
    advancePaid: 25000,
    bookingSource: 'Call / WhatsApp'
  });

  const fetchReservations = async () => {
    try {
      const res = await api.get(`/reservations?status=${statusFilter}&search=${search}`);
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await api.get('/villas');
        if (res.data.success) {
          setVillas(res.data.villas);
          if (res.data.villas.length > 0) {
            setManualForm((prev) => ({ ...prev, villaId: res.data.villas[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching villas:', err);
      }
    };
    fetchVillas();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/reservations/${id}/status`, { status: newStatus });
      fetchReservations();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedResv || !paymentAmount) return;

    try {
      await api.post(`/reservations/${selectedResv._id}/payments`, {
        amount: Number(paymentAmount),
        paymentMethod,
        paymentType: 'Final Settlement'
      });
      setShowPaymentModal(false);
      setSelectedResv(null);
      setPaymentAmount('');
      fetchReservations();
    } catch (err) {
      alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateManualReservation = async (e) => {
    e.preventDefault();
    try {
      const totalNights = Math.max(1, Math.round((new Date(manualForm.checkOut) - new Date(manualForm.checkIn)) / (1000 * 60 * 60 * 24)));
      const roomCharges = Number(manualForm.roomCharges);
      const taxableAmount = roomCharges;
      const gstAmount = Math.round((taxableAmount * 18) / 100);
      const totalAmount = taxableAmount + gstAmount;
      const advancePaid = Number(manualForm.advancePaid);
      const balanceDue = Math.max(0, totalAmount - advancePaid);

      const res = await api.post('/reservations/manual', {
        villaId: manualForm.villaId,
        checkIn: manualForm.checkIn,
        checkOut: manualForm.checkOut,
        guestDetails: {
          fullName: manualForm.fullName,
          email: manualForm.email,
          phone: manualForm.phone
        },
        guests: {
          adults: Number(manualForm.adults),
          children: Number(manualForm.children)
        },
        pricing: {
          roomCharges,
          taxableAmount,
          gstPercentage: 18,
          gstAmount,
          totalAmount,
          advanceRequired: Math.round(totalAmount * 0.5),
          advancePaid,
          balanceDue
        },
        bookingSource: manualForm.bookingSource
      });

      if (res.data.success) {
        setShowCreateModal(false);
        fetchReservations();
      }
    } catch (err) {
      alert('Failed to create reservation: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport('reservations');
    } catch (err) {
      alert(err.message || 'Failed to export reservations');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 2: Reservation Management
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Reservations & Real-Time Calendar
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Excel</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Manual Booking
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by reference, guest name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Confirmed', 'Checked-in', 'Checked-out', 'Pending', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Guest Info</th>
                <th className="py-3 px-4">Villa</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Advance Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    No reservations matching current filter.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {r.bookingReference}
                      <span className="block text-[9px] text-slate-500 font-sans">{r.bookingSource}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-100 block">{r.guestDetails?.fullName}</strong>
                      <span className="text-slate-400 text-[11px] block">{r.guestDetails?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {r.villa?.name || 'Moon Light Villa'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{new Date(r.checkIn).toLocaleDateString()}</span>
                      <span className="text-slate-500"> → </span>
                      <span>{new Date(r.checkOut).toLocaleDateString()}</span>
                      <span className="block text-[10px] text-slate-500">({r.totalNights} Nights)</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ₹{r.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">
                      ₹{r.pricing?.advancePaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      ₹{r.pricing?.balanceDue?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          r.status === 'Confirmed'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : r.status === 'Checked-in'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'Checked-out'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'Checked-in')}
                            className="p-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded"
                            title="Guest Check-In"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.status === 'Checked-in' && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'Checked-out')}
                            className="p-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded"
                            title="Guest Check-Out"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.pricing?.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setSelectedResv(r);
                              setPaymentAmount(r.pricing.balanceDue);
                              setShowPaymentModal(true);
                            }}
                            className="p-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded"
                            title="Record Balance Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.status !== 'Cancelled' && r.status !== 'Checked-out' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Cancel this reservation?')) {
                                handleStatusUpdate(r._id, 'Cancelled');
                              }
                            }}
                            className="p-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedResv && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100">
              Record Payment - #{selectedResv.bookingReference}
            </h3>
            <p className="text-slate-400">
              Guest: <strong>{selectedResv.guestDetails?.fullName}</strong> • Balance Due: <strong className="text-amber-400">₹{selectedResv.pricing?.balanceDue?.toLocaleString('en-IN')}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Payment Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-xs space-y-4 my-8">
            <h3 className="font-serif text-base font-bold text-slate-100">
              Create Manual Reservation (Front Desk / Call)
            </h3>

            <form onSubmit={handleCreateManualReservation} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Accommodation</label>
                <select
                  value={manualForm.villaId}
                  onChange={(e) => setManualForm({ ...manualForm, villaId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  {villas.map((v) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Guest Phone</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Guest Email</label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Total Room Charges (₹)</label>
                  <input
                    type="number"
                    required
                    value={manualForm.roomCharges}
                    onChange={(e) => setManualForm({ ...manualForm, roomCharges: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Advance Received (₹)</label>
                  <input
                    type="number"
                    value={manualForm.advancePaid}
                    onChange={(e) => setManualForm({ ...manualForm, advancePaid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
