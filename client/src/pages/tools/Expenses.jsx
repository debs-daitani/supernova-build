import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { accountingExpenses } from '../../services/api';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Software & Tools',
  'Marketing',
  'Travel',
  'Meals & Entertainment',
  'Equipment',
  'Rent',
  'Utilities',
  'Professional Services',
  'Other',
];

export default function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter]);

  const loadExpenses = async () => {
    try {
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await accountingExpenses.list(params);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await accountingExpenses.delete(expenseId);
      toast.success('Expense deleted');
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const grouped = {};
    expenses.forEach((expense) => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = 0;
      }
      grouped[expense.category] += expense.amount;
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const categoryTotals = getExpensesByCategory();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-gray-600">Track and manage your business expenses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add Expense
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-md p-6 text-white mb-6">
        <p className="text-pink-100 text-sm mb-1">Total Expenses</p>
        <p className="text-4xl font-bold">£{getTotalExpenses().toLocaleString()}</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="label">Filter by Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-full md:w-auto"
        >
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
              {categoryTotals[category] && ` (£${categoryTotals[category].toLocaleString()})`}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No expenses found</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Add Your First Expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Deductible
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Expense Modal */}
      {showCreateModal && (
        <CreateExpenseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadExpenses();
          }}
        />
      )}
    </div>
  );
}

function ExpenseRow({ expense, onDelete }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(expense.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
        {expense.receiptUrl && (
          <a
            href={expense.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-600 hover:text-pink-700"
          >
            📎 View Receipt
          </a>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {expense.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
        £{expense.amount.toLocaleString()}
        {expense.vatAmount && expense.vatAmount > 0 && (
          <div className="text-xs text-gray-500">+£{expense.vatAmount} VAT</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {expense.taxDeductible ? (
          <span className="text-green-600">✅ Yes</span>
        ) : (
          <span className="text-gray-400">❌ No</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onDelete(expense.id)}
          className="text-red-600 hover:text-red-700"
          title="Delete"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

function CreateExpenseModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    taxDeductible: true,
    vatAmount: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await accountingExpenses.create({
        ...formData,
        amount: parseFloat(formData.amount),
        vatAmount: formData.vatAmount ? parseFloat(formData.vatAmount) : null,
        date: new Date(formData.date),
      });
      toast.success('Expense added!');
      onSuccess();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Add New Expense</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Adobe Creative Cloud subscription"
                className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (£) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="input w-full"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">VAT Amount (£)</label>
                <input
                  type="number"
                  value={formData.vatAmount}
                  onChange={(e) => setFormData({ ...formData, vatAmount: e.target.value })}
                  placeholder="0.00"
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input w-full"
                  required
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.taxDeductible}
                onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })}
                className="h-4 w-4 text-pink-600 rounded"
              />
              <label className="text-sm text-gray-700">
                This expense is tax deductible
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Adding...' : 'Add Expense'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
