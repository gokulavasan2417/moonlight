import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, DollarSign, FileText, Phone, Mail, Download } from 'lucide-react';
import api from '../services/api';

const VendorManagement = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Maintenance',
    gstNumber: ''
  });

  const [billForm, setBillForm] = useState({
    vendor: '',
    billNumber: '',
    description: '',
    subTotal: 15000,
    gstAmount: 2700,
    totalAmount: 17700
  });

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        api.get('/finance/vendors'),
        api.get('/finance/vendor-bills'),
      ]);
      if (vRes.data.success) {
        setVendors(vRes.data.vendors);
        if (vRes.data.vendors.length > 0 && !billForm.vendor) {
          setBillForm((prev) => ({ ...prev, vendor: vRes.data.vendors[0]._id }));
        }
      }
      if (bRes.data.success) setBills(bRes.data.bills);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/vendors', vendorForm);
      setShowVendorModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating vendor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      const sub = Number(billForm.subTotal);
      const gst = Number(billForm.gstAmount);
      const total = sub + gst;

      await api.post('/finance/vendor-bills', {
        ...billForm,
        subTotal: sub,
        gstAmount: gst,
        totalAmount: total,
        paidAmount: 0,
        balanceDue: total
      });
      setShowBillModal(false);
      fetchData();
    } catch (err) {
      alert('Error recording bill: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 7: Supply Chain
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Vendor Directory & Bills
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVendorModal(true)}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Vendor
          </button>
          <button
            onClick={() => setShowBillModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Record Vendor Bill
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'vendors' ? 'border-amber-400 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400'
          }`}
        >
          Vendors Directory ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'bills' ? 'border-amber-400 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400'
          }`}
        >
          Vendor Invoices / Bills ({bills.length})
        </button>
      </div>

      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {vendors.map((v) => (
            <div key={v._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{v.companyName}</h3>
                  <span className="text-amber-400 text-[11px] font-medium">{v.category}</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {v.gstNumber || 'Unregistered'}
                </span>
              </div>

              <div className="space-y-1 text-slate-400 text-[11px]">
                <p>Contact: <strong className="text-slate-200">{v.contactPerson}</strong></p>
                <p>Phone: <strong className="text-slate-200">{v.phone}</strong></p>
                {v.email && <p>Email: {v.email}</p>}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Outstanding</span>
                  <strong className="text-amber-400">₹{(v.outstandingBalance || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Total Paid</span>
                  <strong className="text-emerald-400">₹{(v.totalPaid || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bill No</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bills.map((b) => (
                <tr key={b._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.billNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{b.vendor?.companyName}</td>
                  <td className="py-3 px-4 text-slate-400">{b.description}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">₹{b.balanceDue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold text-[10px] uppercase">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Add New Vendor</h3>

            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.companyName}
                  onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Pool Maintenance">Pool Maintenance</option>
                    <option value="Food & Provisions">Food & Provisions</option>
                    <option value="Laundry & Linen">Laundry & Linen</option>
                    <option value="IT & Security">IT & Security</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={vendorForm.gstNumber}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Create Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Record Vendor Bill</h3>

            <form onSubmit={handleCreateBill} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Select Vendor *</label>
                <select
                  value={billForm.vendor}
                  onChange={(e) => setBillForm({ ...billForm, vendor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>{v.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Vendor Bill / Invoice # *</label>
                <input
                  type="text"
                  required
                  value={billForm.billNumber}
                  onChange={(e) => setBillForm({ ...billForm, billNumber: e.target.value })}
                  placeholder="e.g. INV-OCT-092"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={billForm.description}
                  onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                  placeholder="e.g. Monthly chemical & filtration maintenance"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Subtotal (₹)</label>
                  <input
                    type="number"
                    required
                    value={billForm.subTotal}
                    onChange={(e) => setBillForm({ ...billForm, subTotal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">GST Amount (₹)</label>
                  <input
                    type="number"
                    value={billForm.gstAmount}
                    onChange={(e) => setBillForm({ ...billForm, gstAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Record Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
