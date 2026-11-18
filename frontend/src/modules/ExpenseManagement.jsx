import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, DollarSign, Tag, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { downloadExcelReport } from '../utils/exportToExcel';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    categoryName: 'Electricity & Utilities',
    amount: 12000,
    paidTo: '',
    paymentMethod: 'UPI',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        api.get(`/finance/expenses?category=${selectedCategory}`),
        api.get('/finance/expense-categories')
      ]);
      if (expRes.data.success) setExpenses(expRes.data.expenses);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        ...formData,
        amount: Number(formData.amount)
      });
      setShowModal(false);
      setFormData({
        title: '',
        categoryName: 'Electricity & Utilities',
        amount: 12000,
        paidTo: '',
        paymentMethod: 'UPI',
        notes: ''
      });
      fetchData();
    } catch (err) {
      alert('Failed to record expense: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadExcelReport('expenses');
    } catch (err) {
      alert(err.message || 'Failed to export expenses');
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
            Module 9: Cost Operations
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-100">
            Expense Management & Tracking
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
                <span>Export Expenses</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="gold-button-gradient text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Record Expense
          </button>
        </div>
      </div>

      {/* Top Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Filtered Total Outflow</span>
          <h3 className="text-2xl font-serif font-bold text-red-400 mt-2">
            ₹{totalExpenseSum.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">{expenses.length} Expense vouchers recorded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Largest Operating Cost</span>
          <h3 className="text-xl font-bold text-slate-100 mt-2">Staff Salaries & Butlers</h3>
          <span className="text-[11px] text-amber-400 mt-1 block">Monthly budget: ₹1,50,000</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 uppercase tracking-wider block">Utility & Maintenance</span>
          <h3 className="text-xl font-bold text-slate-100 mt-2">MSEDCL Power & Pool</h3>
          <span className="text-[11px] text-emerald-400 mt-1 block">Monthly budget: ₹1,00,000</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          All Categories
        </button>
        {[
          'Electricity & Utilities',
          'Maintenance & Pool Chemicals',
          'Staff Salaries & Butler Team',
          'Kitchen & Gourmet Provisions',
          'Housekeeping Supplies'
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Voucher #</th>
              <th className="py-3 px-4">Expense Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Paid To</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500">
                  No expense records found.
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{e.expenseNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{e.title}</td>
                  <td className="py-3 px-4 text-slate-400">{e.categoryName}</td>
                  <td className="py-3 px-4 text-slate-200">{e.paidTo}</td>
                  <td className="py-3 px-4 font-bold text-red-400">₹{e.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-400">{e.paymentMethod}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] uppercase">
                      {e.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Record Operational Expense
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. MSEDCL Commercial Electricity Bill"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                    <option value="Maintenance & Pool Chemicals">Maintenance & Pool Chemicals</option>
                    <option value="Staff Salaries & Butler Team">Staff Salaries & Butler Team</option>
                    <option value="Kitchen & Gourmet Provisions">Kitchen & Gourmet Provisions</option>
                    <option value="Housekeeping Supplies">Housekeeping Supplies</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Paid To / Payee *</label>
                  <input
                    type="text"
                    required
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    placeholder="Company or Person name"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Remarks / Voucher Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button-gradient text-slate-950 font-bold rounded"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
