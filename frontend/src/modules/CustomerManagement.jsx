import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Star,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  History,
  CreditCard,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { downloadExcelReport } from '../utils/exportToExcel';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterVip, setFilterVip] = useState(false);
  const [filterRepeat, setFilterRepeat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    idType: 'Aadhaar',
    idNumber: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?search=${search}&vipOnly=${filterVip}&repeatOnly=${filterRepeat}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, filterVip, filterRepeat]);

  const handleViewCustomer = async (id) => {
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomerDetail(res.data);
      }
    } catch (err) {
      alert('Failed to load customer profile: ' + err.message);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: { city: formData.city },
        idProof: { idType: formData.idType, idNumber: formData.idNumber }
      });
      setShowAddModal(false);
      fetchCustomers();
    } catch (err) {
      alert('Error creating customer: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport('customers');
    } catch (err) {
      alert(err.message || 'Failed to export customers');
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
            Module 5: Guest Directory
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Customer Profiles & History
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
                <span>Export Customers</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Customer
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={filterVip}
              onChange={(e) => setFilterVip(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-amber-500"
            />
            <span>VIP Guests Only</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={filterRepeat}
              onChange={(e) => setFilterRepeat(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-amber-500"
            />
            <span>Repeat Guests</span>
          </label>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Guest Name</th>
              <th className="py-3 px-4">Contact Information</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Bookings</th>
              <th className="py-3 px-4">Lifetime Spend</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => (
              <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-100">{c.fullName}</strong>
                    {c.vipStatus && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-slate-200 block">{c.phone}</span>
                  <span className="text-slate-500 text-[11px] block">{c.email}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{c.address?.city || 'N/A'}</td>
                <td className="py-3.5 px-4 font-bold text-slate-200">{c.totalBookingsCount || 0}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400">
                  ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex gap-1">
                    {c.isRepeatGuest && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-semibold border border-blue-500/30">
                        Repeat Guest
                      </span>
                    )}
                    {c.vipStatus && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-semibold border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleViewCustomer(c._id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition-colors"
                    title="View Full Profile & Stay History"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Drawer Modal */}
      {customerDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 text-xs space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                  {customerDetail.customer.fullName}
                  {customerDetail.customer.vipStatus && <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">VIP</span>}
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {customerDetail.customer.phone} • {customerDetail.customer.email}
                </p>
              </div>
              <button
                onClick={() => setCustomerDetail(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Close
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl text-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Lifetime Stays</span>
                <strong className="text-sm text-slate-100 block mt-0.5">{customerDetail.customer.totalBookingsCount} Bookings</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Lifetime Revenue</span>
                <strong className="text-sm text-emerald-400 block mt-0.5">₹{(customerDetail.customer.totalSpent || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">ID Verification</span>
                <strong className="text-sm text-blue-400 block mt-0.5">{customerDetail.customer.idProof?.idType || 'Aadhaar'}</strong>
              </div>
            </div>

            {/* Stay History Table */}
            <div>
              <h4 className="font-bold text-slate-200 mb-2">Reservation History</h4>
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Ref</th>
                      <th className="p-2.5">Villa</th>
                      <th className="p-2.5">Check-In</th>
                      <th className="p-2.5">Total Amount</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customerDetail.reservations?.map((r) => (
                      <tr key={r._id}>
                        <td className="p-2.5 font-mono text-amber-400">{r.bookingReference}</td>
                        <td className="p-2.5">{r.villa?.name}</td>
                        <td className="p-2.5">{new Date(r.checkIn).toLocaleDateString()}</td>
                        <td className="p-2.5 font-bold">₹{r.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-emerald-400">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Add Customer Profile</h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
