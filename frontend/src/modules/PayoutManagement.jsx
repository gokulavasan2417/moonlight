import React, { useState, useEffect } from 'react';
import { Send, Plus, CheckCircle, Clock, XCircle, DollarSign, Download } from 'lucide-react';
import api from '../services/api';

const PayoutManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    payoutType: 'Vendor Payout',
    recipientName: '',
    amount: 15000,
    paymentMethod: 'Bank Transfer (NEFT/IMPS)',
    transactionReference: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [payRes, venRes] = await Promise.all([
        api.get('/finance/payouts'),
        api.get('/finance/vendors')
      ]);
      if (payRes.data.success) setPayouts(payRes.data.payouts);
      if (venRes.data.success) setVendors(venRes.data.vendors);
    } catch (err) {
      console.error('Failed to load payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/payouts', {
        ...payoutForm,
        amount: Number(payoutForm.amount)
      });
      setShowPayoutModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating payout: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/finance/payouts/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Module 8: Disbursements
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Payout Management & Approvals
          </h1>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Create Payout Request
        </button>
      </div>

      {/* Payouts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Ref #</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method & Trans. ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Approval Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500">
                  No payouts recorded yet.
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{p.payoutReference}</td>
                  <td className="py-3.5 px-4 text-slate-300">{p.payoutType}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{p.recipientName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span>{p.paymentMethod}</span>
                    {p.transactionReference && <span className="block text-[10px] text-slate-500 font-mono">{p.transactionReference}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        p.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'Approved'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    {p.status === 'Pending Approval' && (
                      <button
                        onClick={() => handleUpdateStatus(p._id, 'Approved')}
                        className="px-2 py-1 bg-blue-500/15 text-blue-400 rounded text-[10px] font-semibold hover:bg-blue-500/25"
                      >
                        Approve
                      </button>
                    )}
                    {p.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateStatus(p._id, 'Paid')}
                        className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded text-[10px] font-semibold hover:bg-emerald-500/25"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create Payout */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Issue Payout Record
            </h3>

            <form onSubmit={handleCreatePayout} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Payout Category</label>
                <select
                  value={payoutForm.payoutType}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payoutType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Vendor Payout">Vendor Payout</option>
                  <option value="Owner Payout">Owner Payout</option>
                  <option value="Employee Salary">Employee Salary</option>
                  <option value="Commission">Commission / Agent</option>
                  <option value="Maintenance Contract">Maintenance Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={payoutForm.recipientName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, recipientName: e.target.value })}
                  placeholder="e.g. Aquaclear Pool Services or Staff Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Payout Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={payoutForm.paymentMethod}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={payoutForm.transactionReference}
                  onChange={(e) => setPayoutForm({ ...payoutForm, transactionReference: e.target.value })}
                  placeholder="e.g. UTR / NEFT Reference"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Submit Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutManagement;
